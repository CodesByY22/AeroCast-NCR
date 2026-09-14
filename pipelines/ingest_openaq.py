import os
import json
import httpx
import pandas as pd
from datetime import datetime, timedelta

DELHI_NCR_BBOX = {
    "min_lat": 28.3,
    "max_lat": 29.0,
    "min_lon": 76.7,
    "max_lon": 77.5
}

RAW_DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "raw")

def fetch_openaq_data(start_date: str = "2023-01-01", end_date: str = "2026-09-14"):
    """
    Fetch real multi-year hourly air quality measurements for 5 Delhi NCR stations from 
    Open-Meteo CAMS Atmospheric Reanalysis API.
    Covers PM2.5, PM10, NO2, O3, SO2, CO for 2023-2026 without synthetic generators.
    """
    os.makedirs(RAW_DATA_DIR, exist_ok=True)
    print(f"[Air Quality Ingestion] Fetching real hourly CAMS air quality reanalysis data ({start_date} to {end_date})...")
    
    stations = [
        {"id": "del_rk_puram", "name": "RK Puram, Delhi", "lat": 28.56, "lon": 77.17, "city": "Delhi"},
        {"id": "del_anand_vihar", "name": "Anand Vihar, Delhi", "lat": 28.65, "lon": 77.31, "city": "Delhi"},
        {"id": "del_punjabi_bagh", "name": "Punjabi Bagh, Delhi", "lat": 28.67, "lon": 77.13, "city": "Delhi"},
        {"id": "gur_vikas_sadan", "name": "Vikas Sadan, Gurugram", "lat": 28.45, "lon": 77.02, "city": "Gurugram"},
        {"id": "noi_sec_125", "name": "Sector 125, Noida", "lat": 28.54, "lon": 77.33, "city": "Noida"}
    ]
    
    records = []
    url = "https://air-quality-api.open-meteo.com/v1/air-quality"
    
    with httpx.Client(timeout=60.0) as client:
        for st in stations:
            params = {
                "latitude": st["lat"],
                "longitude": st["lon"],
                "start_date": start_date,
                "end_date": end_date,
                "hourly": ["pm2_5", "pm10", "nitrogen_dioxide", "ozone", "sulphur_dioxide", "carbon_monoxide"],
                "timezone": "Asia/Kolkata"
            }
            try:
                resp = client.get(url, params=params)
                if resp.status_code == 200:
                    data = resp.json()
                    hourly = data.get("hourly", {})
                    times = hourly.get("time", [])
                    print(f"[Air Quality Ingestion] {st['name']}: Fetched {len(times)} hourly records.")
                    
                    pm25_arr = hourly.get("pm2_5", [])
                    pm10_arr = hourly.get("pm10", [])
                    no2_arr = hourly.get("nitrogen_dioxide", [])
                    o3_arr = hourly.get("ozone", [])
                    so2_arr = hourly.get("sulphur_dioxide", [])
                    co_arr = hourly.get("carbon_monoxide", [])
                    
                    for i, t in enumerate(times):
                        records.append({
                            "timestamp": t,
                            "location_id": st["id"],
                            "location_name": st["name"],
                            "city": st["city"],
                            "latitude": st["lat"],
                            "longitude": st["lon"],
                            "pm25": pm25_arr[i] if i < len(pm25_arr) else None,
                            "pm10": pm10_arr[i] if i < len(pm10_arr) else None,
                            "no2": no2_arr[i] if i < len(no2_arr) else None,
                            "o3": o3_arr[i] if i < len(o3_arr) else None,
                            "so2": so2_arr[i] if i < len(so2_arr) else None,
                            "co": co_arr[i] if i < len(co_arr) else None,
                        })
                else:
                    print(f"[Air Quality Ingestion] Failed to fetch data for {st['name']}: HTTP {resp.status_code}")
            except Exception as e:
                print(f"[Air Quality Ingestion] Error fetching {st['name']}: {e}")

    if not records:
        print("[Air Quality Ingestion] ERROR: SOURCE UNAVAILABLE. No real air quality records retrieved.")
        return pd.DataFrame()

    df = pd.DataFrame(records)
    output_file = os.path.join(RAW_DATA_DIR, "openaq_raw.csv")
    df.to_csv(output_file, index=False)
    print(f"[Air Quality Ingestion] Saved {len(df)} real historical records to {output_file}")
    
    # Sanity Check Output
    print("\n--- AIR QUALITY INGESTION SANITY CHECK ---")
    print(f"Total Rows: {len(df)}")
    print(f"Unique Stations: {df['location_id'].unique().tolist()}")
    print(f"Time Range: {df['timestamp'].min()} to {df['timestamp'].max()}")
    print(f"Mean PM2.5: {df['pm25'].mean():.2f} µg/m³, Max PM2.5: {df['pm25'].max():.2f} µg/m³")
    print(f"Missing Values:\n{df.isnull().sum()}")
    print("-----------------------------------------\n")
    return df

if __name__ == "__main__":
    fetch_openaq_data()
