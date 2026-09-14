import os
import httpx
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

RAW_DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "raw")

# Punjab, Haryana, Western UP, Rajasthan bounding box for stubble burning detection
UPWIND_FIRE_BBOX = {
    "min_lat": 27.5,
    "max_lat": 32.5,
    "min_lon": 74.0,
    "max_lon": 79.0
}

def fetch_firms_fire_data():
    """
    Fetch real active biomass fire detections from NASA FIRMS (VIIRS / MODIS) open satellite feeds.
    Filters to agricultural stubble burning regions upwind of Delhi NCR (Punjab, Haryana, UP, Rajasthan).
    """
    os.makedirs(RAW_DATA_DIR, exist_ok=True)
    print(f"[NASA FIRMS Ingestion] Fetching real satellite active fire detections for upwind NCR...")
    
    urls = [
        "https://firms.modaps.eosdis.nasa.gov/data/active_fire/suomi-viirs-c2/csv/SUOMI_VIIRS_C2_South_Asia_7d.csv",
        "https://firms.modaps.eosdis.nasa.gov/data/active_fire/modis-c6.1/csv/MODIS_C6_1_South_Asia_7d.csv"
    ]
    
    records = []
    with httpx.Client(timeout=30.0) as client:
        for url in urls:
            try:
                resp = client.get(url)
                if resp.status_code == 200 and "latitude" in resp.text:
                    import io
                    df_feed = pd.read_csv(io.StringIO(resp.text))
                    # Filter to upwind fire bounding box (27.5N-32.5N, 74.0E-79.0E)
                    df_ncr_upwind = df_feed[
                        (df_feed["latitude"] >= UPWIND_FIRE_BBOX["min_lat"]) &
                        (df_feed["latitude"] <= UPWIND_FIRE_BBOX["max_lat"]) &
                        (df_feed["longitude"] >= UPWIND_FIRE_BBOX["min_lon"]) &
                        (df_feed["longitude"] <= UPWIND_FIRE_BBOX["max_lon"])
                    ]
                    print(f"[NASA FIRMS Ingestion] Fetched {len(df_ncr_upwind)} real upwind fire detections from {url.split('/')[-1]}.")
                    for _, row in df_ncr_upwind.iterrows():
                        records.append({
                            "latitude": row.get("latitude"),
                            "longitude": row.get("longitude"),
                            "bright_ti4": row.get("bright_ti4", row.get("brightness")),
                            "acq_date": str(row.get("acq_date")),
                            "acq_time": f"{int(row.get('acq_time', 0)):04d}",
                            "satellite": str(row.get("satellite")),
                            "confidence": str(row.get("confidence")),
                            "frp": float(row.get("frp", 0.0)),
                            "daynight": str(row.get("daynight"))
                        })
            except Exception as e:
                print(f"[NASA FIRMS Ingestion] Error fetching {url}: {e}")

    if not records:
        print("[NASA FIRMS Ingestion] Note: Regional satellite feed yielded 0 active fires in 7d window. Creating clean 0-fire schema baseline.")
        output_file = os.path.join(RAW_DATA_DIR, "firms_raw.csv")
        pd.DataFrame(columns=["latitude", "longitude", "bright_ti4", "acq_date", "acq_time", "satellite", "confidence", "frp", "daynight"]).to_csv(output_file, index=False)
        return pd.DataFrame()

    df = pd.DataFrame(records)
    output_file = os.path.join(RAW_DATA_DIR, "firms_raw.csv")
    df.to_csv(output_file, index=False)
    print(f"[NASA FIRMS Ingestion] Saved {len(df)} real fire detections to {output_file}")
    
    # Sanity Check Output
    print("\n--- NASA FIRMS INGESTION SANITY CHECK ---")
    print(f"Total Active Fire Detections: {len(df)}")
    print(f"Acquisition Date Range: {df['acq_date'].min()} to {df['acq_date'].max()}")
    print(f"Mean FRP: {df['frp'].mean():.2f} MW, Max FRP: {df['frp'].max():.2f} MW")
    print("-----------------------------------------\n")
    return df

if __name__ == "__main__":
    fetch_firms_fire_data()
