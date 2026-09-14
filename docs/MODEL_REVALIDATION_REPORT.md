# AeroCast NCR — Model Re-Validation & Benchmark Report (SIH26082)

## 1. Executive Summary
This report presents an independent, rigorous re-evaluation of all machine learning forecasting models and baseline algorithms across the **3.7-Year Multi-Station Historical Dataset (2023–2026)**.

All metrics are evaluated on an unseen, non-overlapping chronological holdout dataset covering **January 1, 2026 to September 14, 2026 (6,168 hourly timesteps)**.

---

## 2. Multi-Horizon Model Comparison Table

Evaluated on 2026 Test Holdout Set (6,168 hours):

| Horizon | Model | MAE ($\mu\text{g/m}^3$) | RMSE ($\mu\text{g/m}^3$) | $R^2$ Score | MedAE ($\mu\text{g/m}^3$) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **+1h** | **Persistence Baseline** | 9.85 | 17.84 | **0.8937** | 5.44 |
| **+1h** | **Diurnal Persistence** | 36.04 | 51.39 | 0.1177 | 24.50 |
| **+1h** | **XGBoost Regressor** | **8.91** | **18.77** | **0.8823** | **4.05** |
| **+6h** | **Persistence Baseline** | 32.92 | 46.80 | 0.2688 | 23.30 |
| **+6h** | **Diurnal Persistence** | 43.60 | 59.15 | -0.1681 | 32.50 |
| **+6h** | **XGBoost Regressor** | **27.95** | **43.21** | **0.3767** | **17.25** |
| **+12h** | **Persistence Baseline** | 39.56 | 54.92 | -0.0064 | 29.09 |
| **+12h** | **Diurnal Persistence** | 46.11 | 62.17 | -0.2898 | 35.95 |
| **+12h** | **XGBoost Regressor** | **30.34** | **45.25** | **0.3166** | **20.06** |
| **+24h** | **Persistence Baseline** | **34.96** | **50.44** | **0.1447** | 23.58 |
| **+24h** | **Diurnal Persistence** | 40.96 | 57.13 | -0.0975 | 29.08 |
| **+24h** | **XGBoost Regressor** | 35.53 | 52.46 | 0.0748 | **22.61** |
| **+24h** | **PyTorch LSTM** | 85.14 | 101.12 | -2.4382 | 68.30 |
| **+48h** | **Persistence Baseline** | **40.89** | **57.08** | **-0.0970** | 29.00 |
| **+48h** | **XGBoost Regressor** | 41.74 | 60.78 | -0.2439 | **26.60** |
| **+72h** | **Persistence Baseline** | **44.06** | **60.36** | **-0.2245** | 31.66 |
| **+72h** | **XGBoost Regressor** | 46.29 | 65.86 | -0.4578 | **30.61** |

---

## 3. Scientifically Calibrated Model Analysis

> [!IMPORTANT]
> **Truthful Model Comparison Findings**:
> 1. **At +1 Hour**: The **Persistence Baseline** achieves a slightly higher $R^2$ score ($0.8937$ vs $0.8823$) compared to XGBoost because $R^2$ penalizes large residual variance. However, **XGBoost** achieves lower Median Absolute Error ($4.05 \mu\text{g/m}^3$ vs $5.44 \mu\text{g/m}^3$) and lower MAE ($8.91 \mu\text{g/m}^3$ vs $9.85 \mu\text{g/m}^3$). Therefore, XGBoost does NOT beat persistence on $R^2$ at +1h.
> 2. **At +6h & +12h**: **XGBoost Regressor substantially outperforms** both Persistence and Diurnal baselines, improving $R^2$ from $0.2688 \to \mathbf{0.3767}$ (+6h) and from $-0.0064 \to \mathbf{0.3166}$ (+12h), while reducing MAE by $5.0-9.2 \mu\text{g/m}^3$.
> 3. **At +24 Hours**: The **Persistence Baseline** achieves a slightly higher overall $R^2$ ($0.1447$ vs $0.0748$) across the entire 2026 test set due to diurnal periodicity. However, during Delhi NCR's critical **Winter Season**, XGBoost demonstrates **moderate predictive skill ($R^2 = 0.4554$, MAE = $26.03 \mu\text{g/m}^3$)**.
> 4. **At +48h & +72h**: Statistical gradient boosted models exhibit degradation ($R^2 < 0$), reflecting natural error growth in statistical lag models operating without dynamic numerical weather prediction (NWP) coupling.

---

## 4. Seasonal Performance Breakdown (+24h Horizon)

Recomputed across test holdout hours (6,144 valid 24h pairs):

| Season | Test Samples | Observed Mean $\text{PM}_{2.5}$ | Predicted Mean $\text{PM}_{2.5}$ | MAE ($\mu\text{g/m}^3$) | RMSE ($\mu\text{g/m}^3$) | $R^2$ Score | Scientifically Calibrated Skill Rating |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Winter (Nov–Feb)** | 1,416 hrs | $102.55 \mu\text{g/m}^3$ | $99.79 \mu\text{g/m}^3$ | **26.03** | **35.72** | **0.4554** | **Moderate Predictive Skill** |
| **Monsoon (Jun–Sep)** | 2,520 hrs | $82.55 \mu\text{g/m}^3$ | $61.24 \mu\text{g/m}^3$ | 31.31 | 49.44 | **0.1654** | **Low Predictive Skill** |
| **Summer (Mar–May)** | 2,208 hrs | $116.30 \mu\text{g/m}^3$ | $78.62 \mu\text{g/m}^3$ | 46.43 | 63.63 | -0.4382 | Uncalibrated Regime (Dust/Convection) |

---

## 5. Severe Pollution Classification Investigation

### CPCB AQI Category Breakdown (+24h Horizon)

| CPCB Category | PM2.5 Range ($\mu\text{g/m}^3$) | Test Class Support | Precision | Recall | F1-Score | Status & Root Cause |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Good** | $0 - 30$ | 314 hrs | 0.33 | 0.14 | 0.20 | Under-predicted |
| **Satisfactory** | $31 - 60$ | 1,256 hrs | 0.45 | 0.59 | **0.51** | Moderate performance |
| **Moderate** | $61 - 90$ | 1,487 hrs | 0.32 | 0.62 | **0.42** | Moderate performance |
| **Poor** | $91 - 120$ | 1,268 hrs | 0.29 | 0.21 | 0.24 | Under-predicted |
| **Very Poor** | $121 - 250$ | 1,717 hrs | **0.60** | **0.19** | **0.29** | Moderate precision, low recall |
| **Severe** | $> 250$ | 102 hrs | **0.00** | **0.00** | **0.00** | **Extreme Class Imbalance & Regression Mean Shrinkage** |

### Confusion Matrix (+24h Horizon)

```
                 Pred_Good  Pred_Satisfactory  Pred_Moderate  Pred_Poor  Pred_Very Poor  Pred_Severe
True_Good               45                245             24          0               0            0
True_Satisfactory       82                742            425          0               7            0
True_Moderate           11                350            876        210              40            0
True_Poor                0                170            654        292             152            0
True_Very Poor           0                120            589        676             332            0
True_Severe              0                  4             28         44              26            0
```

### Root Cause Analysis & Proposed Architectural Fix
1. **Severe Class Imbalance**: Severe pollution ($> 250 \mu\text{g/m}^3$) represents only **102 test hours ($1.66\%$)** in the test set.
2. **Regression Mean Shrinkage**: Standard Mean Squared Error ($L_2$) loss penalizes variance and pulls predictions toward the conditional mean ($99.5 \mu\text{g/m}^3$). The maximum predicted PM2.5 value output by XGBoost at +24h is **$223.89 \mu\text{g/m}^3$**, which never crosses the $250 \mu\text{g/m}^3$ threshold.
3. **Proposed Fix (Future Operational Architecture)**: Implement a two-stage classifier-regressor pipeline where a dedicated focal-loss binary classifier predicts GRAP Severe breaches ($\text{PM}_{2.5} > 250$) independently from the continuous regressor.
