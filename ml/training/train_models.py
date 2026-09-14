import os
import json
import joblib
import numpy as np
import pandas as pd
from scipy.stats import pearsonr
from xgboost import XGBRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score, median_absolute_error, precision_recall_fscore_support

DATA_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "processed", "fused_ncr_historical.csv")
MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "models")
PROCESSED_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "processed")

HORIZONS = [1, 6, 12, 24, 48, 72]

FEATURE_COLS = [
    'pm25', 'pm10', 'no2', 'o3', 'temp_2m', 'rh_2m', 'surface_pressure',
    'wind_speed_10m', 'wind_dir_10m', 'wind_u_10m', 'wind_v_10m', 'wind_dir_sin', 'wind_dir_cos',
    'pbl_height_proxy', 'ventilation_index_proxy', 'inversion_proxy_index',
    'stubble_transport_risk', 'fire_count_50km', 'fire_count_100km', 'fire_count_200km', 'fire_count_300km',
    'total_frp_50km', 'total_frp_100km', 'total_frp_200km', 'total_frp_300km', 'mean_frp_200km', 'max_frp_200km',
    'upwind_fire_count', 'upwind_fire_frp',
    'pm25_lag_1h', 'pm25_lag_3h', 'pm25_lag_6h', 'pm25_lag_12h', 'pm25_lag_24h', 'pm25_lag_48h',
    'pm10_lag_1h', 'pm10_lag_6h', 'no2_lag_1h', 'o3_lag_1h',
    'pm25_roll_mean_3h', 'pm25_roll_mean_6h', 'pm25_roll_mean_12h', 'pm25_roll_mean_24h',
    'pm25_roll_std_6h', 'pm25_roll_std_24h', 'pm25_diff_1h', 'pm25_diff_6h', 'pm25_pm10_ratio',
    'hour', 'day_of_week', 'month', 'hour_sin', 'hour_cos', 'month_sin', 'month_cos',
    'is_stubble_season', 'is_winter'
]

def classify_aqi_category(pm25_val):
    if pm25_val <= 30: return "Good"
    elif pm25_val <= 60: return "Satisfactory"
    elif pm25_val <= 90: return "Moderately Polluted"
    elif pm25_val <= 120: return "Poor"
    elif pm25_val <= 250: return "Very Poor"
    else: return "Severe"

def train_and_evaluate():
    os.makedirs(MODELS_DIR, exist_ok=True)
    print(f"[ML Training] Loading multi-year dataset with 57 features from {DATA_PATH}...")
    df = pd.read_csv(DATA_PATH)
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    df = df.sort_values('timestamp').reset_index(drop=True)
    
    # Chronological Split (Train: 2023-2024, Val: 2025, Test: 2026)
    train_mask = df['timestamp'] < '2025-01-01'
    val_mask = (df['timestamp'] >= '2025-01-01') & (df['timestamp'] < '2026-01-01')
    test_mask = df['timestamp'] >= '2026-01-01'
    
    print("\n========================================================")
    print("STRICT CHRONOLOGICAL MULTI-YEAR EVALUATION SPLIT (V2)")
    print(f"Train Period : {df[train_mask]['timestamp'].min()} to {df[train_mask]['timestamp'].max()} ({train_mask.sum()} hrs)")
    print(f"Val Period   : {df[val_mask]['timestamp'].min()} to {df[val_mask]['timestamp'].max()} ({val_mask.sum()} hrs)")
    print(f"Test Period  : {df[test_mask]['timestamp'].min()} to {df[test_mask]['timestamp'].max()} ({test_mask.sum()} hrs)")
    print("========================================================\n")
    
    results = []
    seasonal_results = {}
    severe_event_results = {}
    
    for h in HORIZONS:
        df_target = df.copy()
        df_target[f'target_pm25_{h}h'] = df_target['pm25'].shift(-h)
        df_clean = df_target.dropna(subset=FEATURE_COLS + [f'target_pm25_{h}h']).copy()
        
        train_h = df_clean[df_clean['timestamp'] < '2025-01-01']
        val_h = df_clean[(df_clean['timestamp'] >= '2025-01-01') & (df_clean['timestamp'] < '2026-01-01')]
        test_h = df_clean[df_clean['timestamp'] >= '2026-01-01']
        
        X_train, y_train = train_h[FEATURE_COLS], train_h[f'target_pm25_{h}h']
        X_test, y_test = test_h[FEATURE_COLS], test_h[f'target_pm25_{h}h']
        
        # 1. Baseline 1: Persistence
        y_pred_pers = test_h['pm25']
        r_pers, _ = pearsonr(y_test, y_pred_pers) if len(y_test) > 1 else (0.0, 0.0)
        results.append({
            "Horizon": f"+{h}h",
            "Model": "Persistence Baseline",
            "MAE": round(float(mean_absolute_error(y_test, y_pred_pers)), 2),
            "RMSE": round(float(np.sqrt(mean_squared_error(y_test, y_pred_pers))), 2),
            "R2": round(float(r2_score(y_test, y_pred_pers)), 4),
            "MedAE": round(float(median_absolute_error(y_test, y_pred_pers)), 2),
            "Corr_r": round(float(r_pers), 4)
        })
        
        # 2. Baseline 2: Diurnal Persistence
        y_pred_diurnal = test_h['pm25_lag_24h'].fillna(test_h['pm25'])
        r_diurnal, _ = pearsonr(y_test, y_pred_diurnal) if len(y_test) > 1 else (0.0, 0.0)
        results.append({
            "Horizon": f"+{h}h",
            "Model": "Diurnal Persistence",
            "MAE": round(float(mean_absolute_error(y_test, y_pred_diurnal)), 2),
            "RMSE": round(float(np.sqrt(mean_squared_error(y_test, y_pred_diurnal))), 2),
            "R2": round(float(r2_score(y_test, y_pred_diurnal)), 4),
            "MedAE": round(float(median_absolute_error(y_test, y_pred_diurnal)), 2),
            "Corr_r": round(float(r_diurnal), 4)
        })
        
        # 3. Enhanced V2 XGBoost Regressor
        xgb = XGBRegressor(n_estimators=200, max_depth=6, learning_rate=0.03, subsample=0.8, colsample_bytree=0.8, random_state=42, n_jobs=-1)
        xgb.fit(X_train, y_train)
        y_pred_xgb = xgb.predict(X_test)
        
        mae_xgb = mean_absolute_error(y_test, y_pred_xgb)
        rmse_xgb = np.sqrt(mean_squared_error(y_test, y_pred_xgb))
        r2_xgb = r2_score(y_test, y_pred_xgb)
        medae_xgb = median_absolute_error(y_test, y_pred_xgb)
        r_xgb, _ = pearsonr(y_test, y_pred_xgb) if len(y_test) > 1 else (0.0, 0.0)
        
        results.append({
            "Horizon": f"+{h}h",
            "Model": "Enhanced XGBoost V2",
            "MAE": round(float(mae_xgb), 2),
            "RMSE": round(float(rmse_xgb), 2),
            "R2": round(float(r2_xgb), 4),
            "MedAE": round(float(medae_xgb), 2),
            "Corr_r": round(float(r_xgb), 4)
        })
        
        # Serialize model artifact
        model_filename = os.path.join(MODELS_DIR, f"xgboost_pm25_h{h}.joblib")
        joblib.dump(xgb, model_filename)
        print(f"[ML Training] Saved Enhanced XGBoost V2 model (+{h}h) -> R²: {r2_xgb:.4f}, MAE: {mae_xgb:.2f}, r: {r_xgb:.4f}")
        
        # Seasonal breakdown for +24h
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
                        "Observed_Mean": round(float(sub[f'target_pm25_{h}h'].mean()), 2),
                        "Predicted_Mean": round(float(sub['pred_xgb'].mean()), 2),
                        "MAE": round(float(s_mae), 2),
                        "RMSE": round(float(s_rmse), 2),
                        "R2": round(float(s_r2), 4)
                    }

    # Save feature names
    joblib.dump(FEATURE_COLS, os.path.join(MODELS_DIR, "feature_names.joblib"))
    
    df_results = pd.DataFrame(results)
    print("\n--- ENHANCED MULTI-HORIZON EVALUATION REPORT (V2) ---")
    print(df_results.to_string(index=False))
    print("\n--- SEASONAL PERFORMANCE BREAKDOWN (+24H V2) ---")
    print(json.dumps(seasonal_results, indent=2))
    print("----------------------------------------------------\n")
    
    # Save metrics JSON
    metrics_summary = {
        "dataset": {
            "file": "fused_ncr_historical.csv",
            "start_date": str(df['timestamp'].min()),
            "end_date": str(df['timestamp'].max()),
            "total_records": len(df),
            "feature_count": len(FEATURE_COLS)
        },
        "horizons": results,
        "seasonal": seasonal_results
    }
    
    with open(os.path.join(PROCESSED_DIR, "model_metrics.json"), "w") as f:
        json.dump(metrics_summary, f, indent=2)
        
    return df_results

if __name__ == "__main__":
    train_and_evaluate()
