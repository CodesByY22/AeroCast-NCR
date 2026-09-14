# AeroCast NCR - Multi-Year Validation & Baseline Protocol

## 1. Scientific Validation Standards
1. **Multi-Year Chronological Split**: Evaluation uses a 3.7-year dataset (2023-01-01 to 2026-09-14) covering 162,360 station-level records across 5 NCR stations.
   * **Train**: 2023-01-01 to 2024-12-31 (17,544 hours)
   * **Validation**: 2025-01-01 to 2025-12-31 (8,760 hours)
   * **Test / Holdout**: 2026-01-01 to 2026-09-14 (6,168 hours)
2. **Zero Temporal Leakage Verification**: Features at time $T$ use strictly observations at or before $T$ ($T-1h$, $T-6h$, $T-12h$, $T-24h$, $T-48h$). Rolling statistics use only past windows. Random K-fold cross-validation is strictly forbidden.
3. **Horizon-Specific Degradation Tracking**: Evaluated across 6 horizons (+1h, +6h, +12h, +24h, +48h, +72h) against two baselines:
   * **Persistence Baseline**: $\hat{y}(T+h) = y(T)$
   * **Diurnal Persistence Baseline**: $\hat{y}(T+24) = y(T-24)$

---

## 2. Multi-Year Benchmark Summary (2026 Unseen Test Set)

| Horizon | Persistence MAE | XGBoost MAE | XGBoost $R^2$ | Winter $R^2$ (+24h) |
| :--- | :--- | :--- | :--- | :--- |
| **+1h** | 9.85 $\mu\text{g/m}^3$ | **8.91 $\mu\text{g/m}^3$** | **0.8823** | — |
| **+6h** | 32.92 $\mu\text{g/m}^3$ | **27.95 $\mu\text{g/m}^3$** | **0.3767** | — |
| **+12h** | 39.56 $\mu\text{g/m}^3$ | **30.34 $\mu\text{g/m}^3$** | **0.3166** | — |
| **+24h** | 34.96 $\mu\text{g/m}^3$ | **35.53 $\mu\text{g/m}^3$** | **0.0748** | **0.4554** |
| **+48h** | 40.89 $\mu\text{g/m}^3$ | 41.74 $\mu\text{g/m}^3$ | -0.2439 | — |
| **+72h** | 44.06 $\mu\text{g/m}^3$ | 46.29 $\mu\text{g/m}^3$ | -0.4578 | — |

---

## 3. CPCB AQI Calculation Validation
Indian AQI is computed using the official CPCB 8-sub-index breakpoint algorithm:
- Pollutants considered: $\text{PM}_{2.5}$ (24h avg), $\text{PM}_{10}$ (24h avg), $\text{NO}_2$ (24h avg), $\text{O}_3$ (8h avg), $\text{SO}_2$ (24h avg), $\text{CO}$ (8h avg).
- AQI value = $\max(\text{Sub-Index}_i)$.
- CPCB Breakpoints:
  - Good ($0-50$)
  - Satisfactory ($51-100$)
  - Moderate ($101-200$)
  - Poor ($201-300$)
  - Very Poor ($301-400$)
  - Severe ($401-500$)
  - Severe+ ($>500$)
