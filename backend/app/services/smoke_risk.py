"""
Regional Smoke Transport Risk Engine
Combines spatial active fire clusters (NASA FIRMS) with 10m wind direction vectors upwind of Delhi NCR.
Note: Explicitly named Regional Smoke Transport Risk Engine — NOT a full chemical transport model.
"""
import math
import numpy as np

DELHI_LAT = 28.6139
DELHI_LON = 77.2090

def compute_smoke_transport_risk(wind_dir_10m: float, wind_speed_10m: float, total_frp_200km: float, fire_count: int) -> dict:
    """
    Evaluates vector alignment between 10m surface wind direction and upwind agricultural fire hotspots in Punjab/Haryana.
    Stubble fires are predominantly Northwest (315° bearing) of Delhi NCR.
    """
    # Wind direction theta is direction wind comes FROM.
    # NW wind = ~315 degrees
    wind_from_nw = max(0.0, math.cos(math.radians(float(wind_dir_10m) - 315.0)))
    
    frp_normalized = math.log1p(float(total_frp_200km)) / 8.0
    wind_advection = 1.0 / (1.0 + float(wind_speed_10m) / 10.0)
    
    raw_risk = frp_normalized * wind_from_nw * wind_advection * 100.0
    risk_score = round(min(100.0, max(0.0, raw_risk)), 1)
    
    if risk_score >= 65:
        category = "High Regional Smoke Transport Risk"
        color = "#ef4444"
        alert_msg = "Upwind biomass burning smoke is actively transporting into Delhi NCR under favorable NW winds."
    elif risk_score >= 35:
        category = "Moderate Transport Risk"
        color = "#f59e0b"
        alert_msg = "Moderate upwind fire activity detected with partial vector alignment toward NCR."
    else:
        category = "Low Transport Risk"
        color = "#10b981"
        alert_msg = "Low biomass smoke influence; local emissions dominate current atmospheric loading."
        
    return {
        "stubble_transport_risk_score": risk_score,
        "category": category,
        "color": color,
        "alert_message": alert_msg,
        "upwind_alignment_vector": round(wind_from_nw, 3),
        "total_active_frp_mw": round(float(total_frp_200km), 1),
        "fire_count_200km": int(fire_count),
        "engine_type": "Data-Driven Vector Transport Risk Engine (Proxy)"
    }
