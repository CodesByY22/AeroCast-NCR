# AeroCast NCR - Model Card & Multi-Year Evaluation Metrics

## Model Details
- **Developer**: AeroCast NCR Team (SIH26082)
- **Model Architecture**: Multi-horizon Gradient Boosted Decision Trees (XGBoost Regressor) & PyTorch LSTM sequence models.
- **Dataset Scope**: 3.7 Years (2023-01-01 to 2026-09-14), 162,360 station-level records / 32,472 hourly timesteps across 5 Delhi NCR stations (RK Puram, Anand Vihar, Punjabi Bagh, Gurugram, Noida).
- **Target Variables**: $\text{PM}_{2.5}$ & $\text{PM}_{10}$ concentrations ($\mu\text{g/m}^3$).
- **Horizons**: $+1\text{h}, +6\text{h}, +12\text{h}, +24\text{h}, +48\text{h}, +72\text{h}$.

## Training & Evaluation Constraints
- **Chronological Time-Series Splitting**:
  - **Train Period**: 2023-01-01 to 2024-12-31 (17,544 hours / 2 full years)
  - **Validation Period**: 2025-01-01 to 2025-12-31 (8,760 hours / 1 full year)
  - **Test / Holdout Period**: 2026-01-01 to 2026-09-14 (6,168 hours / ~8.5 months)
- **Rule Verification**: Non-overlapping chronological time split enforced. Random K-Fold Cross-Validation is strictly prohibited to prevent temporal leakage.

---

## Multi-Horizon Performance Metrics (2026 Test Holdout)

| Horizon | Model | MAE ($\mu\text{g/m}^3$) | RMSE ($\mu\text{g/m}^3$) | $R^2$ Score | MedAE ($\mu\text{g/m}^3$) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **+1h** | **Persistence Baseline** | 9.85 | 17.84 | 0.8937 | 5.44 |
| **+1h** | **Diurnal Persistence** | 36.04 | 51.39 | 0.1177 | 24.50 |
| **+1h** | **XGBoost Regressor** | **8.91** | **18.77** | **0.8823** | **4.05** |
| **+6h** | **Persistence Baseline** | 32.92 | 46.80 | 0.2688 | 23.30 |
| **+6h** | **Diurnal Persistence** | 43.60 | 59.15 | -0.1681 | 32.50 |
| **+6h** | **XGBoost Regressor** | **27.95** | **43.21** | **0.3767** | **17.25** |
| **+12h** | **Persistence Baseline** | 39.56 | 54.92 | -0.0064 | 29.09 |
| **+12h** | **Diurnal Persistence** | 46.11 | 62.17 | -0.2898 | 35.95 |
| **+12h** | **XGBoost Regressor** | **30.34** | **45.25** | **0.3166** | **20.06** |
| **+24h** | **Persistence Baseline** | 34.96 | 50.44 | 0.1447 | 23.58 |
| **+24h** | **Diurnal Persistence** | 40.96 | 57.13 | -0.0975 | 29.08 |
| **+24h** | **XGBoost Regressor** | **35.53** | **52.46** | **0.0748** | **22.61** |
| **+48h** | **Persistence Baseline** | 40.89 | 57.08 | -0.0970 | 29.00 |
| **+48h** | **XGBoost Regressor** | 41.74 | 60.78 | -0.2439 | 26.60 |
| **+72h** | **Persistence Baseline** | 44.06 | 60.36 | -0.2245 | 31.66 |
| **+72h** | **XGBoost Regressor** | 46.29 | 65.86 | -0.4578 | 30.61 |

---

## Seasonal Evaluation Breakdown (+24h Horizon)

| Season | Test Hours | $R^2$ Score | MAE ($\mu\text{g/m}^3$) | RMSE ($\mu\text{g/m}^3$) |
| :--- | :--- | :--- | :--- | :--- |
| **Winter (Nov–Feb)** | 1,416 | **0.4554** | **26.03** | **35.72** |
| **Monsoon (Jun–Sep)** | 2,520 | **0.1654** | **31.31** | **49.44** |
| **Summer (Mar–May)** | 2,208 | -0.4382 | 46.43 | 63.63 |

---

## Severe Pollution Event Classification (+24h Horizon)

| CPCB AQI Category | Precision | Recall | F1-Score |
| :--- | :--- | :--- | :--- |
| **Very Poor (121–250 $\mu\text{g/m}^3$)** | **0.5961** | **0.1934** | **0.2920** |
| **Severe (> 250 $\mu\text{g/m}^3$)** | 0.0000 | 0.0000 | 0.0000 |

---

## Model Limitations & Operational Distinction

> [!IMPORTANT]
> **Retrospective Reanalysis vs Operational Forecast Architecture**
> * **Current Setup (Retrospective Evaluation)**: Models are trained and evaluated using ERA5 reanalysis meteorology and historical CAMS air quality observations.
> * **Operational Setup**: In a live operational deployment, future meteorology inputs at $T+24\text{h}$ must be sourced from an NWP model forecast (e.g., IMD GFS or ECMWF deterministic forecast) rather than observed reanalysis.
> * **Error Growth**: Predictive uncertainty increases beyond 24 hours ($R^2 < 0$ at +48h/+72h) due to the absence of active numerical atmospheric chemistry propagation. Statistical lag-driven models capture short-range persistence and diurnal shifts effectively up to 12–24 hours.

