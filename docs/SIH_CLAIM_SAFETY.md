# AeroCast NCR — SIH Claim Safety & Presentation Guidelines (SIH26082)

## 1. SAFE TO CLAIM (Defensible Facts for SIH Evaluators)

When presenting AeroCast NCR to SIH judges, you may confidently state the following:

1. **Multi-Year Historical Foundation**:
   *"AeroCast NCR is built on a 3.7-year multi-station historical dataset (2023–2026) containing 162,360 station-level records across Delhi, Gurugram, and Noida."*

2. **Chronological Time-Series Validation**:
   *"All models are evaluated on strict non-overlapping chronological train/val/test splits (Train: 2023–2024, Val: 2025, Test: 2026 holdout) with zero random cross-validation to prevent temporal data leakage."*

3. **Short & Medium Horizon Data-Driven Forecasting**:
   *"Multi-horizon XGBoost models provide data-driven predictions up to 24 hours, substantially outperforming persistence baselines at +6h ($R^2 = 0.3767$) and +12h ($R^2 = 0.3166$)."*

4. **Winter Smog Performance**:
   *"During Delhi NCR's critical winter pollution season (Nov–Feb), the model demonstrates moderate predictive skill ($R^2 = 0.4554$, MAE = $26.03 \mu\text{g/m}^3$) on unseen 2026 holdout test data."*

5. **Official CPCB AQI Alert Engine**:
   *"AQI categories and dynamic warning alerts are calculated using the official CPCB 8-sub-index breakpoint methodology."*

6. **Physics-Guided Atmospheric & Transport Proxies**:
   *"Atmospheric dispersion proxies (Ventilation Index $V_c$, Thermal Inversion Index) and satellite fire-informed upwind smoke transport risk scores (NASA FIRMS VIIRS/MODIS) provide interpretable environmental diagnostics."*

---

## 2. DO NOT CLAIM (Scientifically Unsupported Statements)

To maintain absolute credibility and avoid disqualification during cross-examination, **DO NOT state any of the following**:

1. ❌ **Do NOT claim live operational 3D WRF-Chem simulation**:
   * *Correct Framing*: *"WRF-Chem integration is currently a research interface stub designed for future API coupling."*

2. ❌ **Do NOT claim direct CPCB ground sensor telemetry for historical training**:
   * *Correct Framing*: *"Air quality historical training data is extracted from Copernicus CAMS European Reanalysis grid-points at CPCB station coordinates."*

3. ❌ **Do NOT claim chemical source apportionment**:
   * *Correct Framing*: *"Stubble transport risk is a physics-guided geometric vector alignment proxy combining satellite Fire Radiative Power with 10m wind direction."*

4. ❌ **Do NOT claim high 72-hour forecast accuracy or universally high $R^2$**:
   * *Correct Framing*: *"Predictive skill degrades beyond 24 hours ($R^2 < 0$ at +48h/+72h), reflecting natural error growth in statistical models operating without dynamic numerical weather prediction."*

5. ❌ **Do NOT claim XGBoost outperforms persistence by $R^2$ at +1h**:
   * *Correct Framing*: *"At +1h, persistence achieves a slightly higher $R^2$ ($0.8937$ vs $0.8823$), while XGBoost achieves lower Median Absolute Error ($4.05 \mu\text{g/m}^3$ vs $5.44 \mu\text{g/m}^3$)."*

---

## 3. RECOMMENDED FINAL SIH POSITIONING (PPT Script)

> **"Respected Judges, AeroCast NCR is a data-driven environmental intelligence and 72-hour multi-horizon air pollution forecasting prototype engineered specifically for Delhi NCR.**
>
> **Trained on 3.7 years of continuous historical air-quality reanalysis, ERA5 meteorology, and NASA FIRMS active fire satellite data across 5 NCR locations, our system evaluates models on strict unseen chronological test splits.**
>
> **AeroCast NCR solves 4 critical questions for regional air quality managers:**
> 1. **WHAT**: Data-driven multi-horizon pollutant forecast curves (+1h to +72h).
> 2. **WHY**: Surface-derived atmospheric dispersion proxies—including Ventilation Index ($V_c$) and Thermal Inversion indices—explaining boundary layer trapping.
> 3. **WHERE FROM**: Physics-guided upwind satellite fire transport risk scores combining NASA FIRMS active fire intensity with 10m wind vectors.
> 4. **WHAT NEXT**: CPCB sub-index dynamic warning matrix triggering GRAP Stage I–IV alert protocols.
>
> **Our validation demonstrates moderate predictive skill during winter smog ($R^2 = 0.4554$, MAE = $26.03 \mu\text{g/m}^3$) and significant improvements over persistence at 6 to 12 hours."**
