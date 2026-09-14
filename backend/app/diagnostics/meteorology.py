"""
Meteorological Diagnostic Proxy Engine
Computes derived indicators for boundary layer dispersion and thermal inversion.
Note: Explicitly labeled as PROXY indicators as full atmospheric sounding profiles are unavailable.
"""

def compute_ventilation_index_proxy(wind_speed_10m: float, pbl_height_m: float) -> dict:
    """
    Ventilation Index Proxy (m²/s) = Surface Wind Speed (m/s) * Planetary Boundary Layer Height (m)
    Thresholds:
      - < 2000 m²/s: Stagnant / Extremely Poor Dispersion
      - 2000 - 6000 m²/s: Moderate Dispersion
      - > 6000 m²/s: Good Atmospheric Ventilation
    """
    val = round(float(wind_speed_10m) * float(pbl_height_m), 1)
    if val < 2000:
        status = "Critical Stagnation (Severe Trap)"
        color = "#ef4444"
    elif val < 6000:
        status = "Moderate Ventilation"
        color = "#f59e0b"
    else:
        status = "Optimal Atmospheric Dispersion"
        color = "#10b981"
        
    return {
        "ventilation_index_proxy": val,
        "unit": "m²/s",
        "status": status,
        "color": color,
        "is_proxy": True,
        "label": "Ventilation Index (Proxy)"
    }

def compute_inversion_proxy_index(temp_2m: float, rh_2m: float, wind_speed_10m: float, hour_ist: int) -> dict:
    """
    Thermal Inversion Proxy Index (0 - 100):
    Estimates atmospheric trap stability based on surface temperature, humidity, low wind speed, and nocturnal cooling.
    """
    is_night = 1.0 if (hour_ist < 7 or hour_ist > 19) else 0.0
    stagnation = max(0.0, 10.0 - float(wind_speed_10m)) / 10.0
    humidity_factor = float(rh_2m) / 100.0
    
    score = (stagnation * 0.5 + humidity_factor * 0.3 + is_night * 0.2) * 100.0
    score = round(min(100.0, max(0.0, score)), 1)
    
    if score >= 70:
        status = "Strong Surface Inversion (High Pollution Accumulation)"
        color = "#dc2626"
    elif score >= 40:
        status = "Moderate Thermal Inversion"
        color = "#f59e0b"
    else:
        status = "Weak / Unstable Atmosphere (Normal Mixing)"
        color = "#10b981"
        
    return {
        "inversion_proxy_index": score,
        "status": status,
        "color": color,
        "is_proxy": True,
        "label": "Thermal Inversion Strength (Proxy)"
    }
