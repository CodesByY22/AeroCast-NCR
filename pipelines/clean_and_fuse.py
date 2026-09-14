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
    print("[Cleaning & Fusion] Loading raw datasets...")
    os.makedirs(PROCESSED_DIR, exist_ok=True)
    
    openaq_path = os.path.join(RAW_DIR, "openaq_raw.csv")
    openmeteo_path = os.path.join(RAW_DIR, "openmeteo_raw.csv")
    firms_path = os.path.join(RAW_DIR, "firms_raw.csv")
    
    if not (os.path.exists(openaq_path) and os.path.exists(openmeteo_path) and os.path.exists(firms_path)):
        raise FileNotFoundError("Raw files missing. Run ingestion scripts first.")
        
    df_pol = pd.read_csv(openaq_path)
    df_met = pd.read_csv(openmeteo_path)
    df_firms = pd.read_csv(firms_path)
    
    # 1. Standardize Timestamps to IST / top-of-hour
    df_pol['timestamp'] = pd.to_datetime(df_pol['timestamp']).dt.floor('h')
    df_met['timestamp'] = pd.to_datetime(df_met['timestamp']).dt.floor('h')
    
    # 2. Pivot OpenAQ pollution values
    df_pol_pivoted = df_pol.pivot_table(
        index=['timestamp', 'location_id', 'location_name', 'latitude', 'longitude'],
        columns='parameter',
        values='value',
        aggfunc='mean'
    ).reset_index()
    
    df_pol_pivoted.columns.name = None
    for param in ['pm25', 'pm10', 'no2', 'o3']:
        if param not in df_pol_pivoted.columns:
            df_pol_pivoted[param] = np.nan
            
    # Forward fill short missing pollutant gaps (<= 3 hours) per station
    df_pol_pivoted = df_pol_pivoted.sort_values(['location_id', 'timestamp'])
    for col in ['pm25', 'pm10', 'no2', 'o3']:
        df_pol_pivoted[col] = df_pol_pivoted.groupby('location_id')[col].transform(lambda group: group.ffill(limit=3))
        
    # Aggregate across Delhi NCR stations to create hourly representative NCR benchmark
    df_ncr_pol = df_pol_pivoted.groupby('timestamp').agg({
        'pm25': 'mean',
        'pm10': 'mean',
        'no2': 'mean',
        'o3': 'mean'
    }).reset_index()
    
    # 3. Process Open-Meteo Meteorology
    df_met_clean = df_met.drop_duplicates(subset=['timestamp']).copy()
    
    # Compute PBL Height Proxy if not direct: Proxy derived from lapse rate & wind shear
    # PBL Proxy (m) approx: 120 * (temp_2m - 10) + 150 * wind_speed_10m (clipped 200..2500m)
    pbl_proxy = 120.0 * np.maximum(df_met_clean['temp_2m'] - 10, 1) + 150.0 * df_met_clean['wind_speed_10m']
    df_met_clean['pbl_height_proxy'] = np.clip(pbl_proxy, 200.0, 2500.0)
    
    # 4. Process NASA FIRMS Fire Detections
    df_firms['acq_date'] = pd.to_datetime(df_firms['acq_date'])
    # Calculate fire bearing relative to Delhi NCR center
    df_firms['fire_to_delhi_bearing'] = calculate_bearing(
        df_firms['latitude'], df_firms['longitude'], DELHI_LAT, DELHI_LON
    )
    
    # Daily fire summary
    daily_fires = df_firms.groupby(df_firms['acq_date'].dt.date).agg(
        fire_count_200km=('frp', 'count'),
        total_frp_200km=('frp', 'sum'),
        mean_fire_lat=('latitude', 'mean'),
        mean_fire_lon=('longitude', 'mean')
    ).reset_index()
    daily_fires['acq_date'] = pd.to_datetime(daily_fires['acq_date'])
    
    # 5. Merge Pollution + Meteorology
    df_fused = pd.merge(df_ncr_pol, df_met_clean, on='timestamp', how='inner')
    
    # Merge Fire activity on Date
    df_fused['date_only'] = pd.to_datetime(df_fused['timestamp'].dt.date)
    df_fused = pd.merge(df_fused, daily_fires, left_on='date_only', right_on='acq_date', how='left')
    df_fused['fire_count_200km'] = df_fused['fire_count_200km'].fillna(0)
    df_fused['total_frp_200km'] = df_fused['total_frp_200km'].fillna(0.0)
    df_fused.drop(columns=['date_only', 'acq_date'], errors='ignore', inplace=True)
    
    # 6. Compute Derived Meteorological & Transport Risk Proxies
    # Ventilation Index Proxy (m²/s) = Wind Speed (m/s) * PBL Height Proxy (m)
    df_fused['ventilation_index_proxy'] = df_fused['wind_speed_10m'] * df_fused['pbl_height_proxy']
    
    # Inversion Proxy Index (0..100): High when wind is low, humidity high, and night/morning solar radiation zero
    hour = df_fused['timestamp'].dt.hour
    is_night = (hour < 7) | (hour > 19)
    stagnation = np.maximum(0, 10.0 - df_fused['wind_speed_10m']) / 10.0
    humidity_factor = df_fused['rh_2m'] / 100.0
    inversion_raw = (stagnation * 0.5 + humidity_factor * 0.3 + (is_night.astype(int) * 0.2)) * 100.0
    df_fused['inversion_proxy_index'] = np.clip(inversion_raw, 0.0, 100.0)
    
    # Stubble Transport Risk Score (0..100):
    # Upwind Alignment: Wind blowing FROM NW (290°..340°) towards Delhi NCR (110°..160°)
    # Wind direction theta_wind = wind_dir_10m (where wind is coming FROM)
    # Stubble fire region is NW of Delhi (bearing ~315°)
    wind_from_nw = np.maximum(0, np.cos(np.radians(df_fused['wind_dir_10m'] - 315.0)))
    fire_magnitude = np.log1p(df_fused['total_frp_200km']) / 8.0 # Normalizer
    stubble_risk = fire_magnitude * wind_from_nw * (1.0 / (1.0 + df_fused['wind_speed_10m'] / 10.0)) * 100.0
    df_fused['stubble_transport_risk'] = np.clip(stubble_risk, 0.0, 100.0)
    
    # 7. Compute Lag Features (for ML forecasting)
    df_fused = df_fused.sort_values('timestamp').reset_index(drop=True)
    df_fused['pm25_lag_1h'] = df_fused['pm25'].shift(1)
    df_fused['pm25_lag_6h'] = df_fused['pm25'].shift(6)
    df_fused['pm25_lag_24h'] = df_fused['pm25'].shift(24)
    df_fused['temp_lag_1h'] = df_fused['temp_2m'].shift(1)
    df_fused['wind_lag_1h'] = df_fused['wind_speed_10m'].shift(1)
    
    output_fused_file = os.path.join(PROCESSED_DIR, "fused_ncr_dataset.csv")
    df_fused.to_csv(output_fused_file, index=False)
    
    print(f"\n[Cleaning & Fusion] Cleaned and fused dataset successfully created!")
    print(f"File Path: {output_fused_file}")
    print(f"Total Timesteps (Hours): {len(df_fused)}")
    print(f"Columns ({len(df_fused.columns)}): {df_fused.columns.tolist()}")
    print("\nSample Fused Metrics (First 3 Rows):")
    print(df_fused[['timestamp', 'pm25', 'temp_2m', 'wind_speed_10m', 'ventilation_index_proxy', 'inversion_proxy_index', 'stubble_transport_risk']].head(3))
    print("--------------------------------------------------\n")

if __name__ == "__main__":
    run_cleaning_and_fusion()
