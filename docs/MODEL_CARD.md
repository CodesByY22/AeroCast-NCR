# AeroCast NCR - Model Card & Evaluation Metrics

## Model Details
- **Developer**: AeroCast NCR Team (SIH26082)
- **Model Architecture**: Multi-horizon Gradient Boosted Decision Trees (XGBoost Regressor) & LSTM sequence models.
- **Target Variables**: $\text{PM}_{2.5}$ & $\text{PM}_{10}$ concentrations ($\mu\text{g/m}^3$).
- **Horizons**: $+1\text{h}, +6\text{h}, +12\text{h}, +24\text{h}, +48\text{h}, +72\text{h}$.

## Training & Evaluation Constraints
- **Chronological Time-Series Splitting Rule**: Strict non-random time-series train/test split.
  - **Train Dataset**: Historical window (e.g., Oct 2022 – Mar 2024).
  - **Validation / Test Dataset**: Most recent unseen period (e.g., Oct 2024 – Mar 2025).
  - **Rule**: Random K-Fold Cross-Validation is strictly prohibited to prevent data leakage.

## Performance Metrics Table (Updated during training milestones)

| Horizon   | Model                |      MAE |     RMSE |        R2 |     MAPE |
|:----------|:---------------------|---------:|---------:|----------:|---------:|
| +1h       | Persistence Baseline | 10.0364  | 12.2092  |  0.794076 |  8.33535 |
| +1h       | Ridge Regression     |  6.37852 |  8.19071 |  0.907323 |  5.29274 |
| +1h       | Random Forest        |  6.65389 |  8.56187 |  0.898733 |  5.44447 |
| +1h       | XGBoost Regressor    |  7.04794 |  8.88925 |  0.890841 |  5.71436 |
| +6h       | Persistence Baseline | 34.4025  | 38.1998  | -1.01935  | 28.5169  |
| +6h       | Ridge Regression     |  5.73293 |  7.73186 |  0.917271 |  4.78848 |
| +6h       | Random Forest        |  6.14647 |  7.79669 |  0.915878 |  5.23189 |
| +6h       | XGBoost Regressor    |  6.14899 |  7.45502 |  0.92309  |  5.19847 |
| +12h      | Persistence Baseline | 49.1091  | 55.0437  | -3.20617  | 40.8038  |
| +12h      | Ridge Regression     |  6.24045 |  7.86653 |  0.914091 |  5.11636 |
| +12h      | Random Forest        |  6.31254 |  7.80281 |  0.915477 |  5.27131 |
| +12h      | XGBoost Regressor    |  6.3302  |  8.49461 |  0.899825 |  5.28101 |
| +24h      | Persistence Baseline |  6.04252 |  8.21555 |  0.900225 |  5.35789 |
| +24h      | Ridge Regression     |  6.57866 |  7.73712 |  0.911507 |  5.55388 |
| +24h      | Random Forest        |  5.86947 |  7.41051 |  0.91882  |  4.96618 |
| +24h      | XGBoost Regressor    |  6.32974 |  7.88068 |  0.908192 |  5.37676 |
| +48h      | Persistence Baseline |  6.73256 |  8.33237 |  0.906718 |  5.58712 |
| +48h      | Ridge Regression     |  6.07319 |  7.44055 |  0.925617 |  5.25996 |
| +48h      | Random Forest        |  6.03702 |  7.56621 |  0.923083 |  5.18484 |
| +48h      | XGBoost Regressor    |  7.35924 |  8.65333 |  0.899393 |  6.40006 |
| +72h      | Persistence Baseline |  7.89526 | 10.592   |  0.799502 |  6.44209 |
| +72h      | Ridge Regression     |  8.55306 | 10.9983  |  0.783829 |  6.79176 |
| +72h      | Random Forest        |  8.5634  |  9.81124 |  0.827973 |  6.85647 |
| +72h      | XGBoost Regressor    |  9.12431 | 10.8105  |  0.791146 |  7.36939 |

| Target Horizon | Model | MAE ($\mu\text{g/m}^3$) | RMSE ($\mu\text{g/m}^3$) | $R^2$ Score | MAPE (%) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **+1h** | Persistence Baseline | TBD | TBD | TBD | TBD |
| **+1h** | XGBoost | TBD | TBD | TBD | TBD |
| **+24h** | Persistence Baseline | TBD | TBD | TBD | TBD |
| **+24h** | XGBoost | TBD | TBD | TBD | TBD |
| **+48h** | XGBoost | TBD | TBD | TBD | TBD |
| **+72h** | XGBoost | TBD | TBD | TBD | TBD |
