"""
Official CPCB Indian Air Quality Index (AQI) Calculator
Reference: Central Pollution Control Board, Ministry of Environment, Forest and Climate Change, Govt of India.
"""

BREAKPOINTS = {
    'pm25': [
        (0, 30, 0, 50),
        (31, 60, 51, 100),
        (61, 90, 101, 200),
        (91, 120, 201, 300),
        (121, 250, 301, 400),
        (251, 500, 401, 500)
    ],
    'pm10': [
        (0, 50, 0, 50),
        (51, 100, 51, 100),
        (101, 250, 101, 200),
        (251, 350, 201, 300),
        (351, 430, 301, 400),
        (431, 600, 401, 500)
    ],
    'no2': [
        (0, 40, 0, 50),
        (41, 80, 51, 100),
        (81, 180, 101, 200),
        (181, 280, 201, 300),
        (281, 400, 301, 400),
        (401, 800, 401, 500)
    ],
    'o3': [
        (0, 50, 0, 50),
        (51, 100, 51, 100),
        (101, 168, 101, 200),
        (169, 208, 201, 300),
        (209, 748, 301, 400),
        (749, 1000, 401, 500)
    ]
}

def calculate_sub_index(param: str, value: float) -> float:
    if param not in BREAKPOINTS or value is None or np_isnan(value):
        return 0.0
    
    val = float(value)
    for (b_low, b_high, i_low, i_high) in BREAKPOINTS[param]:
        if b_low <= val <= b_high:
            sub_idx = ((i_high - i_low) / (b_high - b_low)) * (val - b_low) + i_low
            return round(sub_idx, 1)
            
    # Handle values exceeding top breakpoint
    top_b_low, top_b_high, top_i_low, top_i_high = BREAKPOINTS[param][-1]
    if val > top_b_high:
        return float(top_i_high)
    return 0.0

def np_isnan(val):
    try:
        import math
        return math.isnan(val)
    except:
        return False

def get_aqi_category(aqi_val: float) -> dict:
    val = round(aqi_val)
    if val <= 50:
        return {"category": "Good", "color": "#00E400", "level": 1, "alert": "GREEN"}
    elif val <= 100:
        return {"category": "Satisfactory", "color": "#9CFF00", "level": 2, "alert": "YELLOW"}
    elif val <= 200:
        return {"category": "Moderate", "color": "#FFFF00", "level": 3, "alert": "ORANGE"}
    elif val <= 300:
        return {"category": "Poor", "color": "#FF7E00", "level": 4, "alert": "ORANGE"}
    elif val <= 400:
        return {"category": "Very Poor", "color": "#FF0000", "level": 5, "alert": "RED"}
    elif val <= 500:
        return {"category": "Severe", "color": "#99004C", "level": 6, "alert": "RED"}
    else:
        return {"category": "Severe+", "color": "#7E0023", "level": 7, "alert": "EMERGENCY_RED"}

def compute_cpcb_aqi(pm25: float, pm10: float = None, no2: float = None, o3: float = None) -> dict:
    sub_indices = {
        "pm25": calculate_sub_index("pm25", pm25),
        "pm10": calculate_sub_index("pm10", pm10) if pm10 is not null_or_none(pm10) else 0.0,
        "no2": calculate_sub_index("no2", no2) if no2 is not null_or_none(no2) else 0.0,
        "o3": calculate_sub_index("o3", o3) if o3 is not null_or_none(o3) else 0.0
    }
    
    max_param = max(sub_indices, key=sub_indices.get)
    overall_aqi = sub_indices[max_param]
    meta = get_aqi_category(overall_aqi)
    
    return {
        "aqi": overall_aqi,
        "dominant_pollutant": max_param.upper(),
        "sub_indices": sub_indices,
        "category": meta["category"],
        "color": meta["color"],
        "alert": meta["alert"]
    }

def null_or_none(v):
    return v is None or np_isnan(v)
