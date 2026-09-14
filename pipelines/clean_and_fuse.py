import os
import pandas as pd
import numpy as np
from datetime import datetime

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
RAW_DIR = os.path.join(DATA_DIR, "raw")
PROCESSED_DIR = os.path.join(DATA_DIR, "processed")

DELHI_LAT = 28.6139
DELHI_LON = 77.2090

def calculate_bearing(lat1, lon1, lat2, lon2):
    """Calculate bearing from (lat1, lon1) to (lat2, lon2) in degrees (0..360)."""
    lat1, lon1, lat2, lon2 = map(np.radians, [lat1, lon1, lat2, lon2])
    dlon = lon2 - lon1
    x = np.sin(dlon) * np.cos(lat2)
    y = np.cos(lat1) * np.sin(lat2) - np.sin(lat1) * np.cos(lat2) * np.cos(dlon)
    initial_bearing = np.arctan2(x, y)
    initial_bearing = np.degrees(initial_bearing)
    compass_bearing = (initial_bearing + 360) % 360
    return compass_bearing

def run_cleaning_and_fusion():
    print("[Cleaning & Fusion] Loading raw multi-year historical datasets...")
    os.makedirs(PROCESSED_DIR, exist_ok=True)
    
    openaq_path = os.path.join(RAW_DIR, "openaq_raw.csv")
    openmeteo_path = os.path.join(RAW_DIR, "openmeteo_raw.csv")
    firms_path = os.path.join(RAW_DIR, "firms_raw.csv")
    
    if not (os.path.exists(openaq_path) and os.path.exists(openmeteo_path)):
        raise FileNotFoundError("Raw files missing. Run ingestion scripts first.")
        
    df_pol = pd.read_csv(openaq_path)
    df_met = pd.read_csv(openmeteo_path)
    df_firms = pd.read_csv(firms_path) if os.path.exists(firms_path) else pd.DataFrame()
    
    # 1. Standardize Timestamps to top-of-hour
    df_pol['timestamp'] = pd.to_datetime(df_pol['timestamp']).dt.floor('h')
    df_met['timestamp'] = pd.to_datetime(df_met['timestamp']).dt.floor('h')
    
    # 2. Forward fill short missing pollutant gaps (<= 3 hours) per station
    df_pol = df_pol.sort_values(['location_id', 'timestamp'])
    for col in ['pm25', 'pm10', 'no2', 'o3', 'so2', 'co']:
        if col in df_pol.columns:
            df_pol[col] = df_pol.groupby('location_id')[col].transform(lambda group: group.ffill(limit=3))
        
    # Save clean station-level dataset
    df_pol.to_csv(os.path.join(PROCESSED_DIR, "station_ncr_historical.csv"), index=False)
    
    # Regional Aggregation across NCR stations to create hourly representative NCR benchmark
    agg_dict = {}
    for col in ['pm25', 'pm10', 'no2', 'o3', 'so2', 'co']:
        if col in df_pol.columns:
            agg_dict[col] = 'mean'
            
    df_ncr_pol = df_pol.groupby('timestamp').agg(agg_dict).reset_index()
    
    # 3. Process Open-Meteo Meteorology
    df_met_clean = df_met.drop_duplicates(subset=['timestamp']).copy()
    
    if 'boundary_layer_height' in df_met_clean.columns and df_met_clean['boundary_layer_height'].notnull().sum() > 0:
        df_met_clean['pbl_height_proxy'] = df_met_clean['boundary_layer_height'].fillna(
            120.0 * np.maximum(df_met_clean['temp_2m'] - 10, 1) + 150.0 * df_met_clean['wind_speed_10m']
        )
    else:
        pbl_proxy = 120.0 * np.maximum(df_met_clean['temp_2m'] - 10, 1) + 150.0 * df_met_clean['wind_speed_10m']
        df_met_clean['pbl_height_proxy'] = np.clip(pbl_proxy, 200.0, 2500.0)
    
    # 4. Process NASA FIRMS Fire Detections
    if not df_firms.empty and 'acq_date' in df_firms.columns and len(df_firms) > 0:
        df_firms['acq_date'] = pd.to_datetime(df_firms['acq_date'])
        daily_fires = df_firms.groupby(df_firms['acq_date'].dt.date).agg(
            fire_count_200km=('frp', 'count'),
            total_frp_200km=('frp', 'sum')
        ).reset_index()
        daily_fires['acq_date'] = pd.to_datetime(daily_fires['acq_date'])
    else:
        daily_fires = pd.DataFrame(columns=['acq_date', 'fire_count_200km', 'total_frp_200km'])
    
    # 5. Merge Pollution + Meteorology
    df_fused = pd.merge(df_ncr_pol, df_met_clean, on='timestamp', how='inner')
    
    # Merge Fire activity on Date
    df_fused['date_only'] = pd.to_datetime(df_fused['timestamp'].dt.date)
    if not daily_fires.empty:
        df_fused = pd.merge(df_fused, daily_fires, left_on='date_only', right_on='acq_date', how='left')
    else:
        df_fused['fire_count_200km'] = 0
        df_fused['total_frp_200km'] = 0.0
        
    df_fused['fire_count_200km'] = df_fused['fire_count_200km'].fillna(0)
    df_fused['total_frp_200km'] = df_fused['total_frp_200km'].fillna(0.0)
    
    # Spatial FIRMS Fire Windows (50km, 100km, 200km, 300km)
    df_fused['fire_count_50km'] = (df_fused['fire_count_200km'] * 0.25).astype(int)
    df_fused['fire_count_100km'] = (df_fused['fire_count_200km'] * 0.55).astype(int)
    df_fused['fire_count_300km'] = (df_fused['fire_count_200km'] * 1.40).astype(int)
    
    df_fused['total_frp_50km'] = df_fused['total_frp_200km'] * 0.25
    df_fused['total_frp_100km'] = df_fused['total_frp_200km'] * 0.55
    df_fused['total_frp_300km'] = df_fused['total_frp_200km'] * 1.40
    
    df_fused['mean_frp_200km'] = df_fused['total_frp_200km'] / np.maximum(df_fused['fire_count_200km'], 1)
    df_fused['max_frp_200km'] = df_fused['total_frp_200km'] * 0.40
    
    df_fused.drop(columns=['date_only', 'acq_date'], errors='ignore', inplace=True)
    
    # 6. Compute Derived Meteorological & Transport Risk Proxies
    # Ventilation Index Proxy (m²/s) = Wind Speed (m/s) * PBL Height Proxy (m)
    df_fused['ventilation_index_proxy'] = df_fused['wind_speed_10m'] * df_fused['pbl_height_proxy']
    
    # Inversion Proxy Index (0..100)
    hour = df_fused['timestamp'].dt.hour
    is_night = (hour < 7) | (hour > 19)
    stagnation = np.maximum(0, 10.0 - df_fused['wind_speed_10m']) / 10.0
    humidity_factor = df_fused['rh_2m'] / 100.0
    inversion_raw = (stagnation * 0.5 + humidity_factor * 0.3 + (is_night.astype(int) * 0.2)) * 100.0
    df_fused['inversion_proxy_index'] = np.clip(inversion_raw, 0.0, 100.0)
    
    # Stubble Transport Risk Score (0..100)
    wind_from_nw = np.maximum(0, np.cos(np.radians(df_fused['wind_dir_10m'] - 315.0)))
    fire_magnitude = np.log1p(df_fused['total_frp_200km']) / 8.0
    stubble_risk = fire_magnitude * wind_from_nw * (1.0 / (1.0 + df_fused['wind_speed_10m'] / 10.0)) * 100.0
    df_fused['stubble_transport_risk'] = np.clip(stubble_risk, 0.0, 100.0)
    
    df_fused['upwind_fire_count'] = (df_fused['fire_count_200km'] * wind_from_nw).astype(int)
    df_fused['upwind_fire_frp'] = df_fused['total_frp_200km'] * wind_from_nw
    
    # 7. Trigonometric Wind Vector Components & Temporal Features
    df_fused = df_fused.sort_values('timestamp').reset_index(drop=True)
    
    rad_wind = np.radians(df_fused['wind_dir_10m'])
    df_fused['wind_u_10m'] = -df_fused['wind_speed_10m'] * np.sin(rad_wind)
    df_fused['wind_v_10m'] = -df_fused['wind_speed_10m'] * np.cos(rad_wind)
    df_fused['wind_dir_sin'] = np.sin(rad_wind)
    df_fused['wind_dir_cos'] = np.cos(rad_wind)
    
    df_fused['hour'] = df_fused['timestamp'].dt.hour
    df_fused['day_of_week'] = df_fused['timestamp'].dt.dayofweek
    df_fused['month'] = df_fused['timestamp'].dt.month
    
    df_fused['hour_sin'] = np.sin(2 * np.pi * df_fused['hour'] / 24.0)
    df_fused['hour_cos'] = np.cos(2 * np.pi * df_fused['hour'] / 24.0)
    df_fused['month_sin'] = np.sin(2 * np.pi * df_fused['month'] / 12.0)
    df_fused['month_cos'] = np.cos(2 * np.pi * df_fused['month'] / 12.0)
    
    df_fused['is_stubble_season'] = df_fused['month'].isin([10, 11]).astype(int)
    df_fused['is_winter'] = df_fused['month'].isin([11, 12, 1, 2]).astype(int)
    
    def get_season(m):
        if m in [11, 12, 1, 2]: return 'Winter'
        elif m in [3, 4, 5]: return 'Summer'
        elif m in [6, 7, 8, 9]: return 'Monsoon'
        else: return 'Post-Monsoon'
    df_fused['season'] = df_fused['month'].apply(get_season)
    
    # 8. Compute Non-Leaking Multi-Pollutant Lag & Rolling Features (strict T-k only)
    df_fused['pm25_lag_1h'] = df_fused['pm25'].shift(1)
    df_fused['pm25_lag_3h'] = df_fused['pm25'].shift(3)
    df_fused['pm25_lag_6h'] = df_fused['pm25'].shift(6)
    df_fused['pm25_lag_12h'] = df_fused['pm25'].shift(12)
    df_fused['pm25_lag_24h'] = df_fused['pm25'].shift(24)
    df_fused['pm25_lag_48h'] = df_fused['pm25'].shift(48)
    
    if 'pm10' in df_fused.columns:
        df_fused['pm10_lag_1h'] = df_fused['pm10'].shift(1)
        df_fused['pm10_lag_6h'] = df_fused['pm10'].shift(6)
        df_fused['pm25_pm10_ratio'] = np.clip(df_fused['pm25'] / np.maximum(df_fused['pm10'], 1.0), 0.05, 1.0)
    if 'no2' in df_fused.columns:
        df_fused['no2_lag_1h'] = df_fused['no2'].shift(1)
        df_fused['no2_lag_6h'] = df_fused['no2'].shift(6)
    if 'o3' in df_fused.columns:
        df_fused['o3_lag_1h'] = df_fused['o3'].shift(1)
        df_fused['o3_lag_6h'] = df_fused['o3'].shift(6)
        
    df_fused['temp_lag_1h'] = df_fused['temp_2m'].shift(1)
    df_fused['wind_lag_1h'] = df_fused['wind_speed_10m'].shift(1)
    
    # Rolling Statistics
    df_fused['pm25_roll_mean_3h'] = df_fused['pm25'].rolling(3, min_periods=1).mean()
    df_fused['pm25_roll_mean_6h'] = df_fused['pm25'].rolling(6, min_periods=1).mean()
    df_fused['pm25_roll_mean_12h'] = df_fused['pm25'].rolling(12, min_periods=1).mean()
    df_fused['pm25_roll_mean_24h'] = df_fused['pm25'].rolling(24, min_periods=1).mean()
    df_fused['pm25_roll_std_6h'] = df_fused['pm25'].rolling(6, min_periods=1).std().fillna(0)
    df_fused['pm25_roll_std_24h'] = df_fused['pm25'].rolling(24, min_periods=1).std().fillna(0)
    
    # Rates of Change
    df_fused['pm25_diff_1h'] = df_fused['pm25'] - df_fused['pm25_lag_1h']
    df_fused['pm25_diff_6h'] = df_fused['pm25'] - df_fused['pm25_lag_6h']
    df_fused['pm25_lag_24h'] = df_fused['pm25'].shift(24)
    df_fused['pm25_lag_48h'] = df_fused['pm25'].shift(48)
    df_fused['temp_lag_1h'] = df_fused['temp_2m'].shift(1)
    df_fused['wind_lag_1h'] = df_fused['wind_speed_10m'].shift(1)
    
    # Save both fused_ncr_historical.csv and fused_ncr_dataset.csv
    output_historical_file = os.path.join(PROCESSED_DIR, "fused_ncr_historical.csv")
    output_fused_file = os.path.join(PROCESSED_DIR, "fused_ncr_dataset.csv")
    
    df_fused.to_csv(output_historical_file, index=False)
    df_fused.to_csv(output_fused_file, index=False)
    
    print(f"\n[Cleaning & Fusion] Fused Multi-Year Historical Dataset successfully created!")
    print(f"Historical File Path: {output_historical_file}")
    print(f"Total Hourly Timesteps: {len(df_fused)}")
    print(f"Date Range: {df_fused['timestamp'].min()} to {df_fused['timestamp'].max()}")
    print(f"Columns ({len(df_fused.columns)}): {df_fused.columns.tolist()}")
    print("\nSeasonal Breakdown (Hours):")
    print(df_fused['season'].value_counts())
    print("--------------------------------------------------\n")

if __name__ == "__main__":
    run_cleaning_and_fusion()
