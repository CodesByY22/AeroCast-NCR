import os
import httpx
import pandas as pd
from datetime import datetime, timedelta

RAW_DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "raw")

def fetch_openmeteo_data(start_date: str = "2023-01-01", end_date: str = "2026-09-14"):
    """
    Fetch real multi-year hourly ERA5 reanalysis weather for Delhi NCR (28.61N, 77.21E) from Open-Meteo Historical Archive API.
    Covers temperature, humidity, surface pressure, wind speed, wind direction, precipitation, boundary layer height for 2023-2026.
    """
    os.makedirs(RAW_DATA_DIR, exist_ok=True)
    print(f"[Open-Meteo Ingestion] Requesting real ERA5 historical reanalysis weather ({start_date} to {end_date})...")
    
    url = "https://archive-api.open-meteo.com/v1/archive"
    params = {
        "latitude": 28.6139,
        "longitude": 77.2090,
        "start_date": start_date,
        "end_date": end_date,
        "hourly": [
            "temperature_2m",
            "relative_humidity_2m",
            "surface_pressure",
            "wind_speed_10m",
            "wind_direction_10m",
            "precipitation",
            "boundary_layer_height"
        ],
        "timezone": "Asia/Kolkata"
    }
    
    records = []
    try:
        with httpx.Client(timeout=60.0) as client:
            resp = client.get(url, params=params)
            if resp.status_code == 200:
                data = resp.json()
                hourly = data.get("hourly", {})
                times = hourly.get("time", [])
                
                print(f"[Open-Meteo Ingestion] Received {len(times)} real hourly timesteps from ERA5 Archive API.")
                temps = hourly.get("temperature_2m", [])
                rhs = hourly.get("relative_humidity_2m", [])
                pressures = hourly.get("surface_pressure", [])
                winds = hourly.get("wind_speed_10m", [])
                wind_dirs = hourly.get("wind_direction_10m", [])
                precip = hourly.get("precipitation", [])
                pbl = hourly.get("boundary_layer_height", [])
                
                for i, t in enumerate(times):
                    records.append({
                        "timestamp": t,
                        "latitude": 28.6139,
                        "longitude": 77.2090,
                        "temp_2m": temps[i] if i < len(temps) else None,
                        "rh_2m": rhs[i] if i < len(rhs) else None,
                        "surface_pressure": pressures[i] if i < len(pressures) else None,
                        "wind_speed_10m": winds[i] if i < len(winds) else None,
                        "wind_dir_10m": wind_dirs[i] if i < len(wind_dirs) else None,
                        "precipitation": precip[i] if i < len(precip) else 0.0,
                        "pbl_height": pbl[i] if i < len(pbl) else None
                    })
            else:
                print(f"[Open-Meteo Ingestion] Archive API returned HTTP {resp.status_code}: {resp.text[:200]}")
    except Exception as e:
        print(f"[Open-Meteo Ingestion] Live API fetch exception: {e}")

    if not records:
        print("[Open-Meteo Ingestion] ERROR: SOURCE UNAVAILABLE. No real weather records retrieved.")
        return pd.DataFrame()

    df = pd.DataFrame(records)
    output_file = os.path.join(RAW_DATA_DIR, "openmeteo_raw.csv")
    df.to_csv(output_file, index=False)
    print(f"[Open-Meteo Ingestion] Saved {len(df)} real historical records to {output_file}")
    
    # Sanity Check Output
    print("\n--- OPEN-METEO INGESTION SANITY CHECK ---")
    print(f"Total Rows: {len(df)}")
    print(f"Columns: {df.columns.tolist()}")
    print(f"Time Range: {df['timestamp'].min()} to {df['timestamp'].max()}")
    print(f"Mean Temp: {df['temp_2m'].mean():.2f}°C, Mean Wind Speed: {df['wind_speed_10m'].mean():.2f} m/s")
    print(f"Missing Values:\n{df.isnull().sum()}")
    print("-----------------------------------------\n")
    return df

if __name__ == "__main__":
    fetch_openmeteo_data()
