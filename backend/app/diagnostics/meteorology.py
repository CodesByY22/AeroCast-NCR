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

def generate_driver_explanation(wind_speed_10m: float, pbl_height_m: float, rh_2m: float, temp_2m: float, pm25_diff_6h: float = 0.0) -> list:
    """
    Generates structured, dynamic natural language bullet points explaining WHY pollution is expected to build or clear.
    """
    reasons = []
    
    if wind_speed_10m < 3.0:
        reasons.append(f"Wind speed is low ({wind_speed_10m:.1f} m/s), causing atmospheric stagnation.")
    else:
        reasons.append(f"Wind speed is active ({wind_speed_10m:.1f} m/s), aiding horizontal transport.")
        
    if pbl_height_m < 500:
        reasons.append(f"Planetary Boundary Layer is shallow ({pbl_height_m:.0f} m), trapping pollutants near ground level.")
    elif pbl_height_m > 1200:
        reasons.append(f"Planetary Boundary Layer is deep ({pbl_height_m:.0f} m), enabling vertical dilution.")
        
    v_c = wind_speed_10m * pbl_height_m
    if v_c < 2000:
        reasons.append(f"Atmospheric ventilation is weak ({v_c:.0f} m²/s), preventing pollutant dispersion.")
        
    if rh_2m > 75:
        reasons.append(f"Relative humidity is elevated ({rh_2m:.0f}%), promoting secondary aerosol formation.")
        
    if pm25_diff_6h > 15:
        reasons.append(f"PM2.5 concentration has increased significantly (+{pm25_diff_6h:.1f} µg/m³) over the past 6 hours.")
    elif pm25_diff_6h < -15:
        reasons.append(f"PM2.5 concentration has decreased (-{abs(pm25_diff_6h):.1f} µg/m³) over the past 6 hours.")
        
    return reasons
