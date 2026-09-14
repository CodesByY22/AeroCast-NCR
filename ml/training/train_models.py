import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.linear_model import Ridge
from sklearn.ensemble import RandomForestRegressor
from xgboost import XGBRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score, median_absolute_error, precision_recall_fscore_support

DATA_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "processed", "fused_ncr_historical.csv")
MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "models")
PROCESSED_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "processed")

HORIZONS = [1, 6, 12, 24, 48, 72]

FEATURE_COLS = [
    'pm25', 'pm10', 'no2', 'o3', 'temp_2m', 'rh_2m', 'surface_pressure',
    'wind_speed_10m', 'wind_dir_10m', 'pbl_height_proxy', 'fire_count_200km',
    'total_frp_200km', 'ventilation_index_proxy', 'inversion_proxy_index',
    'stubble_transport_risk', 'upwind_fire_count', 'upwind_fire_frp',
    'pm25_lag_1h', 'pm25_lag_6h', 'pm25_lag_12h', 'pm25_lag_24h', 'pm25_lag_48h',
    'temp_lag_1h', 'wind_lag_1h', 'hour', 'day_of_week', 'month'
]

def classify_aqi_category(pm25_val):
    """Categorize PM2.5 into official CPCB AQI bands."""
    if pm25_val <= 30: return "Good"
    elif pm25_val <= 60: return "Satisfactory"
    elif pm25_val <= 90: return "Moderately Polluted"
    elif pm25_val <= 120: return "Poor"
    elif pm25_val <= 250: return "Very Poor"
    else: return "Severe"

def train_and_evaluate():
    os.makedirs(MODELS_DIR, exist_ok=True)
    print(f"[ML Training] Loading multi-year dataset from {DATA_PATH}...")
    df = pd.read_csv(DATA_PATH)
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    df = df.sort_values('timestamp').reset_index(drop=True)
    
    # 1. Chronological Split (Train: 2023-2024, Val: 2025, Test: 2026)
    train_mask = df['timestamp'] < '2025-01-01'
    val_mask = (df['timestamp'] >= '2025-01-01') & (df['timestamp'] < '2026-01-01')
    test_mask = df['timestamp'] >= '2026-01-01'
    
    print("\n========================================================")
    print("STRICT CHRONOLOGICAL MULTI-YEAR EVALUATION SPLIT")
    print(f"Train Period : {df[train_mask]['timestamp'].min()} to {df[train_mask]['timestamp'].max()} ({train_mask.sum()} hrs)")
    print(f"Val Period   : {df[val_mask]['timestamp'].min()} to {df[val_mask]['timestamp'].max()} ({val_mask.sum()} hrs)")
    print(f"Test Period  : {df[test_mask]['timestamp'].min()} to {df[test_mask]['timestamp'].max()} ({test_mask.sum()} hrs)")
    print("Rule Verification: Strict time-ordered non-overlapping evaluation.")
    print("========================================================\n")
    
    results = []
    seasonal_results = {}
    severe_event_results = {}
    baseline_comparison = {}
    
    for h in HORIZONS:
        df_target = df.copy()
        df_target[f'target_pm25_{h}h'] = df_target['pm25'].shift(-h)
        df_clean = df_target.dropna(subset=FEATURE_COLS + [f'target_pm25_{h}h']).copy()
        
        train_h = df_clean[df_clean['timestamp'] < '2025-01-01']
        val_h = df_clean[(df_clean['timestamp'] >= '2025-01-01') & (df_clean['timestamp'] < '2026-01-01')]
        test_h = df_clean[df_clean['timestamp'] >= '2026-01-01']
        
        # Combine Train + Val for final model fit if preferred, or fit on Train
        X_train, y_train = train_h[FEATURE_COLS], train_h[f'target_pm25_{h}h']
        X_test, y_test = test_h[FEATURE_COLS], test_h[f'target_pm25_{h}h']
        
        # 1. Baseline 1: Persistence (y_pred = current PM2.5)
        y_pred_pers = test_h['pm25']
        mae_pers = mean_absolute_error(y_test, y_pred_pers)
        rmse_pers = np.sqrt(mean_squared_error(y_test, y_pred_pers))
        r2_pers = r2_score(y_test, y_pred_pers)
        medae_pers = median_absolute_error(y_test, y_pred_pers)
        
        results.append({
            "Horizon": f"+{h}h",
            "Model": "Persistence Baseline",
            "MAE": round(float(mae_pers), 2),
            "RMSE": round(float(rmse_pers), 2),
            "R2": round(float(r2_pers), 4),
            "MedAE": round(float(medae_pers), 2)
        })
        
        # 2. Baseline 2: Diurnal Persistence (y_pred = PM2.5 at T-24)
        y_pred_diurnal = test_h['pm25_lag_24h'].fillna(test_h['pm25'])
        results.append({
            "Horizon": f"+{h}h",
            "Model": "Diurnal Persistence",
            "MAE": round(float(mean_absolute_error(y_test, y_pred_diurnal)), 2),
            "RMSE": round(float(np.sqrt(mean_squared_error(y_test, y_pred_diurnal))), 2),
            "R2": round(float(r2_score(y_test, y_pred_diurnal)), 4),
            "MedAE": round(float(median_absolute_error(y_test, y_pred_diurnal)), 2)
        })
        
        # 3. XGBoost Regressor (Primary Operational Engine)
        xgb = XGBRegressor(n_estimators=150, max_depth=5, learning_rate=0.04, random_state=42, n_jobs=-1)
        xgb.fit(X_train, y_train)
        y_pred_xgb = xgb.predict(X_test)
        
        mae_xgb = mean_absolute_error(y_test, y_pred_xgb)
        rmse_xgb = np.sqrt(mean_squared_error(y_test, y_pred_xgb))
        r2_xgb = r2_score(y_test, y_pred_xgb)
        medae_xgb = median_absolute_error(y_test, y_pred_xgb)
        
        results.append({
            "Horizon": f"+{h}h",
            "Model": "XGBoost Regressor",
            "MAE": round(float(mae_xgb), 2),
            "RMSE": round(float(rmse_xgb), 2),
            "R2": round(float(r2_xgb), 4),
            "MedAE": round(float(medae_xgb), 2)
        })
        
        # Save serialized model artifact
        model_filename = os.path.join(MODELS_DIR, f"xgboost_pm25_h{h}.joblib")
        joblib.dump(xgb, model_filename)
        print(f"[ML Training] Saved multi-year XGBoost model (+{h}h) -> R²: {r2_xgb:.4f}, MAE: {mae_xgb:.2f}")
        
        # 4. Seasonal Performance Evaluation on Test Set (+24h horizon example)
        if h == 24:
            test_h_season = test_h.copy()
            test_h_season['pred_xgb'] = y_pred_xgb
            for season_name in ['Winter', 'Summer', 'Monsoon', 'Post-Monsoon']:
                sub = test_h_season[test_h_season['season'] == season_name]
                if len(sub) > 10:
                    s_r2 = r2_score(sub[f'target_pm25_{h}h'], sub['pred_xgb'])
                    s_mae = mean_absolute_error(sub[f'target_pm25_{h}h'], sub['pred_xgb'])
                    s_rmse = np.sqrt(mean_squared_error(sub[f'target_pm25_{h}h'], sub['pred_xgb']))
                    seasonal_results[season_name] = {
                        "Hours": len(sub),
                        "R2": round(float(s_r2), 4),
                        "MAE": round(float(s_mae), 2),
                        "RMSE": round(float(s_rmse), 2)
                    }
                    
            # 5. Severe Pollution Event Classification Evaluation (+24h)
            y_true_cat = [classify_aqi_category(val) for val in y_test]
            y_pred_cat = [classify_aqi_category(val) for val in y_pred_xgb]
            
            p, r, f1, _ = precision_recall_fscore_support(y_true_cat, y_pred_cat, labels=["Very Poor", "Severe"], zero_division=0)
            severe_event_results = {
                "Very Poor": {"Precision": round(float(p[0]), 4), "Recall": round(float(r[0]), 4), "F1": round(float(f1[0]), 4)},
                "Severe": {"Precision": round(float(p[1]), 4), "Recall": round(float(r[1]), 4), "F1": round(float(f1[1]), 4)}
            }

    # Save feature names
    joblib.dump(FEATURE_COLS, os.path.join(MODELS_DIR, "feature_names.joblib"))
    
    df_results = pd.DataFrame(results)
    print("\n--- MULTI-YEAR MULTI-HORIZON EVALUATION REPORT ---")
    print(df_results.to_string(index=False))
    print("\n--- SEASONAL PERFORMANCE BREAKDOWN (+24H) ---")
    print(json.dumps(seasonal_results, indent=2))
    print("\n--- SEVERE POLLUTION CLASSIFICATION PERFORMANCE (+24H) ---")
    print(json.dumps(severe_event_results, indent=2))
    print("-----------------------------------------------------------\n")
    
    # Save metrics JSON
    metrics_summary = {
        "dataset": {
            "file": "fused_ncr_historical.csv",
            "start_date": str(df['timestamp'].min()),
            "end_date": str(df['timestamp'].max()),
            "total_records": len(df),
            "train_records": int(train_mask.sum()),
            "val_records": int(val_mask.sum()),
            "test_records": int(test_mask.sum())
        },
        "horizons": results,
        "seasonal": seasonal_results,
        "severe_events": severe_event_results
    }
    
    with open(os.path.join(PROCESSED_DIR, "model_metrics.json"), "w") as f:
        json.dump(metrics_summary, f, indent=2)
        
    return df_results

if __name__ == "__main__":
    train_and_evaluate()
