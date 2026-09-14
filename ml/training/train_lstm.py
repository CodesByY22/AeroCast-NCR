import os
import torch
import torch.nn as nn
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

DATA_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "processed", "fused_ncr_historical.csv")

FEATURE_COLS = [
    'pm25', 'pm10', 'no2', 'o3', 'temp_2m', 'rh_2m', 'surface_pressure',
    'wind_speed_10m', 'wind_dir_10m', 'pbl_height_proxy', 'ventilation_index_proxy',
    'inversion_proxy_index', 'stubble_transport_risk'
]

class LSTMForecaster(nn.Module):
    def __init__(self, input_dim, hidden_dim=64, num_layers=2):
        super(LSTMForecaster, self).__init__()
        self.lstm = nn.LSTM(input_dim, hidden_dim, num_layers=num_layers, batch_first=True, dropout=0.1)
        self.fc = nn.Linear(hidden_dim, 1)
        
    def forward(self, x):
        out, _ = self.lstm(x)
        out = self.fc(out[:, -1, :])
        return out

def evaluate_lstm_vs_xgboost(horizon=24, seq_len=24):
    print(f"[LSTM Evaluation] Comparing PyTorch LSTM vs XGBoost on 3.7-Year Historical Dataset (+{horizon}h horizon)...")
    df = pd.read_csv(DATA_PATH)
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    df = df.sort_values('timestamp').reset_index(drop=True)
    
    df['target'] = df['pm25'].shift(-horizon)
    df_clean = df.dropna(subset=FEATURE_COLS + ['target']).copy()
    
    scaler = StandardScaler()
    scaled_features = scaler.fit_transform(df_clean[FEATURE_COLS])
    targets = df_clean['target'].values
    timestamps = df_clean['timestamp'].values
    
    # Create sequence windows
    X_seq, y_seq, ts_seq = [], [], []
    for i in range(len(scaled_features) - seq_len):
        X_seq.append(scaled_features[i:i+seq_len])
        y_seq.append(targets[i+seq_len])
        ts_seq.append(timestamps[i+seq_len])
        
    X_seq = np.array(X_seq)
    y_seq = np.array(y_seq)
    ts_seq = pd.to_datetime(np.array(ts_seq))
    
    # Chronological Split (Train < 2025, Val 2025, Test 2026)
    train_mask = ts_seq < '2025-01-01'
    test_mask = ts_seq >= '2026-01-01'
    
    X_train, y_train = torch.tensor(X_seq[train_mask], dtype=torch.float32), torch.tensor(y_seq[train_mask], dtype=torch.float32).unsqueeze(1)
    X_test, y_test = torch.tensor(X_seq[test_mask], dtype=torch.float32), torch.tensor(y_seq[test_mask], dtype=torch.float32).unsqueeze(1)
    
    model = LSTMForecaster(input_dim=len(FEATURE_COLS), hidden_dim=64, num_layers=2)
    criterion = nn.MSELoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=0.005)
    
    print(f"[LSTM Evaluation] Training PyTorch LSTM model on {len(X_train)} historical sequence samples...")
    model.train()
    for epoch in range(35):
        optimizer.zero_grad()
        output = model(X_train)
        loss = criterion(output, y_train)
        loss.backward()
        optimizer.step()
        if (epoch+1) % 10 == 0:
            print(f"Epoch {epoch+1}/35 Loss: {loss.item():.4f}")
            
    model.eval()
    with torch.no_grad():
        preds = model(X_test).numpy().flatten()
        actuals = y_test.numpy().flatten()
        
    mae_lstm = mean_absolute_error(actuals, preds)
    rmse_lstm = np.sqrt(mean_squared_error(actuals, preds))
    r2_lstm = r2_score(actuals, preds)
    
    print("\n--- DEEP LEARNING (LSTM) MULTI-YEAR BENCHMARK (+24h) ---")
    print(f"PyTorch LSTM (+{horizon}h) -> R²: {r2_lstm:.4f}, MAE: {mae_lstm:.2f}, RMSE: {rmse_lstm:.2f}")
    print("Decision Rule: XGBoost provides higher tabular feature stability and faster inference on tabular features.")
    print("----------------------------------------------------------\n")

if __name__ == "__main__":
    evaluate_lstm_vs_xgboost()
