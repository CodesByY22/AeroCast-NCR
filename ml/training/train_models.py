import os
import joblib
import numpy as np
import pandas as pd
from sklearn.linear_model import Ridge
from sklearn.ensemble import RandomForestRegressor
from xgboost import XGBRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

DATA_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "processed", "fused_ncr_dataset.csv")
MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "models")
MODEL_CARD_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "docs", "MODEL_CARD.md")

HORIZONS = [1, 6, 12, 24, 48, 72]

FEATURE_COLS = [
    'pm25', 'pm10', 'no2', 'o3', 'temp_2m', 'rh_2m', 'surface_pressure',
    'wind_speed_10m', 'wind_dir_10m', 'pbl_height_proxy', 'fire_count_200km',
    'total_frp_200km', 'ventilation_index_proxy', 'inversion_proxy_index',
    'stubble_transport_risk', 'pm25_lag_1h', 'pm25_lag_6h', 'pm25_lag_24h',
    'temp_lag_1h', 'wind_lag_1h'
]

def calculate_mape(y_true, y_pred):
    y_true, y_pred = np.array(y_true), np.array(y_pred)
    non_zero_mask = y_true != 0
    return np.mean(np.abs((y_true[non_zero_mask] - y_pred[non_zero_mask]) / y_true[non_zero_mask])) * 100.0

def train_and_evaluate():
    os.makedirs(MODELS_DIR, exist_ok=True)
    print(f"[ML Training] Loading dataset from {DATA_PATH}...")
    df = pd.read_csv(DATA_PATH)
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    df = df.sort_values('timestamp').reset_index(drop=True)
    
    # 1. Enforce Chronological Train/Test Split (75% Train, 25% Test)
    split_idx = int(len(df) * 0.75)
    train_df = df.iloc[:split_idx].copy()
    test_df = df.iloc[split_idx:].copy()
    
    print("\n========================================================")
    print("STRICT TIME-SERIES CHRONOLOGICAL SPLIT VALIDATION")
    print(f"Train Period : {train_df['timestamp'].min()} to {train_df['timestamp'].max()} ({len(train_df)} hrs)")
    print(f"Test Period  : {test_df['timestamp'].min()} to {test_df['timestamp'].max()} ({len(test_df)} hrs)")
    print("Rule Verification: Non-overlapping chronological order enforced. Zero random cross-validation.")
    print("========================================================\n")
    
    results = []
    
    for h in HORIZONS:
        # Build target shifted by horizon h
        df_target = df.copy()
        df_target[f'target_pm25_{h}h'] = df_target['pm25'].shift(-h)
        df_clean = df_target.dropna(subset=FEATURE_COLS + [f'target_pm25_{h}h']).copy()
        
        # Chronological split on cleaned data
        split_point = int(len(df_clean) * 0.75)
        train_h = df_clean.iloc[:split_point]
        test_h = df_clean.iloc[split_point:]
        
        X_train, y_train = train_h[FEATURE_COLS], train_h[f'target_pm25_{h}h']
        X_test, y_test = test_h[FEATURE_COLS], test_h[f'target_pm25_{h}h']
        
        # 1. Persistence Baseline: y_pred = current pm25
        y_pred_pers = test_h['pm25']
        mae_pers = mean_absolute_error(y_test, y_pred_pers)
        rmse_pers = np.sqrt(mean_squared_error(y_test, y_pred_pers))
        r2_pers = r2_score(y_test, y_pred_pers)
        mape_pers = calculate_mape(y_test, y_pred_pers)
        
        results.append({
            "Horizon": f"+{h}h",
            "Model": "Persistence Baseline",
            "MAE": mae_pers,
            "RMSE": rmse_pers,
            "R2": r2_pers,
            "MAPE": mape_pers
        })
        
        # 2. Ridge Linear Regression
        ridge = Ridge(alpha=1.0)
        ridge.fit(X_train, y_train)
        y_pred_ridge = ridge.predict(X_test)
        results.append({
            "Horizon": f"+{h}h",
            "Model": "Ridge Regression",
            "MAE": mean_absolute_error(y_test, y_pred_ridge),
            "RMSE": np.sqrt(mean_squared_error(y_test, y_pred_ridge)),
            "R2": r2_score(y_test, y_pred_ridge),
            "MAPE": calculate_mape(y_test, y_pred_ridge)
        })
        
        # 3. Random Forest Regressor
        rf = RandomForestRegressor(n_estimators=100, max_depth=8, random_state=42)
        rf.fit(X_train, y_train)
        y_pred_rf = rf.predict(X_test)
        results.append({
            "Horizon": f"+{h}h",
            "Model": "Random Forest",
            "MAE": mean_absolute_error(y_test, y_pred_rf),
            "RMSE": np.sqrt(mean_squared_error(y_test, y_pred_rf)),
            "R2": r2_score(y_test, y_pred_rf),
            "MAPE": calculate_mape(y_test, y_pred_rf)
        })
        
        # 4. XGBoost Regressor (Primary Production Model)
        xgb = XGBRegressor(n_estimators=100, max_depth=4, learning_rate=0.05, random_state=42)
        xgb.fit(X_train, y_train)
        y_pred_xgb = xgb.predict(X_test)
        
        mae_xgb = mean_absolute_error(y_test, y_pred_xgb)
        rmse_xgb = np.sqrt(mean_squared_error(y_test, y_pred_xgb))
        r2_xgb = r2_score(y_test, y_pred_xgb)
        mape_xgb = calculate_mape(y_test, y_pred_xgb)
        
        results.append({
            "Horizon": f"+{h}h",
            "Model": "XGBoost Regressor",
            "MAE": mae_xgb,
            "RMSE": rmse_xgb,
            "R2": r2_xgb,
            "MAPE": mape_xgb
        })
        
        # Serialize trained XGBoost model
        model_filename = os.path.join(MODELS_DIR, f"xgboost_pm25_h{h}.joblib")
        joblib.dump(xgb, model_filename)
        print(f"[ML Training] Saved serialized XGBoost model for horizon +{h}h -> {model_filename}")
        
    # Save feature columns metadata
    joblib.dump(FEATURE_COLS, os.path.join(MODELS_DIR, "feature_names.joblib"))
    
    df_results = pd.DataFrame(results)
    print("\n--- MULTI-HORIZON EVALUATION METRICS REPORT ---")
    print(df_results.to_string(index=False))
    print("------------------------------------------------\n")
    
    # Update MODEL_CARD.md
    update_model_card(df_results)
    return df_results

def update_model_card(df_results):
    markdown_table = df_results.to_markdown(index=False)
    with open(MODEL_CARD_PATH, "r", encoding="utf-8") as f:
        content = f.read()
        
    updated_content = content.replace("## Performance Metrics Table (Updated during training milestones)", f"## Performance Metrics Table (Updated during training milestones)\n\n{markdown_table}")
    with open(MODEL_CARD_PATH, "w", encoding="utf-8") as f:
        f.write(updated_content)
    print(f"[ML Training] Successfully updated {MODEL_CARD_PATH}")

if __name__ == "__main__":
    train_and_evaluate()
