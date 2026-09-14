import os
import json
import joblib
import numpy as np
import pandas as pd
from xgboost import XGBClassifier
from sklearn.metrics import precision_recall_fscore_support, precision_recall_curve, confusion_matrix, auc

DATA_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "processed", "fused_ncr_historical.csv")
MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "models")
PROCESSED_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "processed")

def train_and_evaluate_classifier():
    os.makedirs(MODELS_DIR, exist_ok=True)
    print("[Severe Classifier] Loading multi-year dataset...")
    df = pd.read_csv(DATA_PATH)
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    df = df.sort_values('timestamp').reset_index(drop=True)
    
    feature_cols = joblib.load(os.path.join(MODELS_DIR, "feature_names.joblib"))
    
    # Target shift +24h
    df['target_24h_pm25'] = df['pm25'].shift(-24)
    df['target_very_poor'] = (df['target_24h_pm25'] > 120.0).astype(int)
    df['target_severe'] = (df['target_24h_pm25'] > 250.0).astype(int)
    
    clean = df.dropna(subset=feature_cols + ['target_24h_pm25']).copy()
    
    train = clean[clean['timestamp'] < '2025-01-01']
    val = clean[(clean['timestamp'] >= '2025-01-01') & (clean['timestamp'] < '2026-01-01')]
    test = clean[clean['timestamp'] >= '2026-01-01']
    
    print(f"\n[Severe Classifier] Train Size: {len(train)}, Val Size: {len(val)}, Test Size: {len(test)}")
    
    # 1. Severe Classifier (>250 µg/m³)
    neg_sev = (train['target_severe'] == 0).sum()
    pos_sev = (train['target_severe'] == 1).sum()
    scale_sev = neg_sev / max(pos_sev, 1)
    
    clf_sev = XGBClassifier(n_estimators=150, max_depth=4, learning_rate=0.03, scale_pos_weight=scale_sev, random_state=42, n_jobs=-1)
    clf_sev.fit(train[feature_cols], train['target_severe'])
    
    # Validation Threshold Selection for Severe
    val_probs_sev = clf_sev.predict_proba(val[feature_cols])[:, 1]
    p_sev, r_sev, thresh_sev = precision_recall_curve(val['target_severe'], val_probs_sev)
    f1_sev = 2 * (p_sev * r_sev) / (p_sev + r_sev + 1e-8)
    best_idx_sev = np.argmax(f1_sev)
    best_thresh_sev = float(thresh_sev[best_idx_sev]) if len(thresh_sev) > 0 else 0.5
    
    # Evaluate on Untouched 2026 Test Set
    test_probs_sev = clf_sev.predict_proba(test[feature_cols])[:, 1]
    test_preds_sev = (test_probs_sev >= best_thresh_sev).astype(int)
    
    p_test_sev, r_test_sev, f1_test_sev, _ = precision_recall_fscore_support(test['target_severe'], test_preds_sev, average='binary', zero_division=0)
    cm_sev = confusion_matrix(test['target_severe'], test_preds_sev)
    prauc_sev = auc(r_sev, p_sev)
    
    # 2. Very Poor Classifier (>120 µg/m³)
    neg_vp = (train['target_very_poor'] == 0).sum()
    pos_vp = (train['target_very_poor'] == 1).sum()
    scale_vp = neg_vp / max(pos_vp, 1)
    
    clf_vp = XGBClassifier(n_estimators=150, max_depth=4, learning_rate=0.03, scale_pos_weight=scale_vp, random_state=42, n_jobs=-1)
    clf_vp.fit(train[feature_cols], train['target_very_poor'])
    
    # Validation Threshold Selection for Very Poor
    val_probs_vp = clf_vp.predict_proba(val[feature_cols])[:, 1]
    p_vp, r_vp, thresh_vp = precision_recall_curve(val['target_very_poor'], val_probs_vp)
    f1_vp = 2 * (p_vp * r_vp) / (p_vp + r_vp + 1e-8)
    best_idx_vp = np.argmax(f1_vp)
    best_thresh_vp = float(thresh_vp[best_idx_vp]) if len(thresh_vp) > 0 else 0.5
    
    # Evaluate on Untouched 2026 Test Set
    test_probs_vp = clf_vp.predict_proba(test[feature_cols])[:, 1]
    test_preds_vp = (test_probs_vp >= best_thresh_vp).astype(int)
    
    p_test_vp, r_test_vp, f1_test_vp, _ = precision_recall_fscore_support(test['target_very_poor'], test_preds_vp, average='binary', zero_division=0)
    cm_vp = confusion_matrix(test['target_very_poor'], test_preds_vp)
    prauc_vp = auc(r_vp, p_vp)
    
    # Serialize Models
    joblib.dump(clf_sev, os.path.join(MODELS_DIR, "classifier_severe_h24.joblib"))
    joblib.dump(clf_vp, os.path.join(MODELS_DIR, "classifier_very_poor_h24.joblib"))
    
    thresh_config = {
        "severe_thresh": best_thresh_sev,
        "very_poor_thresh": best_thresh_vp
    }
    with open(os.path.join(MODELS_DIR, "classifier_thresholds.json"), "w") as f:
        json.dump(thresh_config, f, indent=2)
        
    print("\n========================================================")
    print("DEDICATED SEVERE EVENT CLASSIFIER TEST EVALUATION (+24H)")
    print("========================================================")
    print(f"Very Poor (>120 µg/m³) -> Val Thresh: {best_thresh_vp:.4f} | Precision: {p_test_vp:.4f}, Recall: {r_test_vp:.4f}, F1: {f1_test_vp:.4f}, PR-AUC: {prauc_vp:.4f}")
    print(f"Confusion Matrix (Very Poor):\n{cm_vp}")
    print(f"Severe (>250 µg/m³)    -> Val Thresh: {best_thresh_sev:.4f} | Precision: {p_test_sev:.4f}, Recall: {r_test_sev:.4f}, F1: {f1_test_sev:.4f}, PR-AUC: {prauc_sev:.4f}")
    print(f"Confusion Matrix (Severe):\n{cm_sev}")
    print("========================================================\n")

if __name__ == "__main__":
    train_and_evaluate_classifier()
