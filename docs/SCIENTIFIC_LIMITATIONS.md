# AeroCast NCR — Technical & Scientific Limitations Document (SIH26082)

## 1. Operational Status of WRF-Chem
* **Current Status**: **WRF-Chem integration is NOT yet operational.**
* **Current Implementation**: The `/api/wrf-chem/stub` endpoint is a research interface stub intended for future API integration with coupled 3D numerical weather-chemistry models.
* **Judicial Framing**: Do NOT claim that AeroCast NCR currently runs an operational 400m-resolution WRF-Chem fluid dynamics simulation. Frame it as a statistical machine learning platform designed to interface with operational NWP chemistry outputs.

---

## 2. Atmospheric & Meteorological Indicators (Surface Proxies)

| Indicator | Implementation Logic | Technical Limitation | Correct Scientific Label |
| :--- | :--- | :--- | :--- |
| **Boundary Layer Height ($H_{\text{PBL}}$)** | Surface lapse rate proxy: $120 \times (T_{\text{2m}} - 10) + 150 \times U_{10\text{m}}$ clipped to $200-2500\text{ m}$ (when ERA5 direct PBL is unavailable). | Not a direct 3D atmospheric radiosonde / Lidar sounding. | **Boundary Layer Height Proxy** |
| **Ventilation Index ($V_c$)** | $V_c = U_{10\text{m}} \times H_{\text{PBL}}$ ($\text{m}^2/\text{s}$). | Surface wind speed multiplied by PBL height proxy. | **Ventilation Index Proxy** |
| **Thermal Inversion Index** | Stagnation + Humidity + Nocturnal cooling score ($0-100$). | Surface-derived indicator of atmospheric trapping potential. | **Thermal Inversion Proxy Index** |

---

## 3. NASA FIRMS Stubble & Smoke Transport Engine

* **Data Sources**: NASA FIRMS S-NPP VIIRS (375m) and MODIS active thermal fire detections.
* **Spatial Aggregations**: Compute active fire counts and Fire Radiative Power (FRP in MW) within $50\text{ km}$, $100\text{ km}$, and $200\text{ km}$ radii of Delhi NCR.
* **Upwind Alignment Rule**:
  $$\text{Upwind Wind Factor} = \max\left(0, \cos\left(\theta_{\text{wind}} - 315^\circ\right)\right)$$
  where $\theta_{\text{wind}}$ is the 10m wind direction (vector coming FROM North-West towards Delhi).
* **Transport Risk Score**:
  $$\text{Risk Score} = \frac{\ln(1 + \text{FRP}_{200\text{km}})}{8.0} \times \text{Upwind Wind Factor} \times \left(\frac{1}{1 + U_{10\text{m}}/10}\right) \times 100$$
* **Technical Limitation**: This metric evaluates geometric wind alignment and thermal fire intensity. It does NOT perform 3D Eulerian chemical transport modeling, Lagrangian particle dispersion, or isotopic chemical source apportionment.
* **Correct Scientific Label**: **Physics-Guided Smoke Transport Risk Proxy**.

---

## 4. Retrospective Evaluation vs Operational Deployment

> [!IMPORTANT]
> **Input Meteorology Distinction**:
> * **Retrospective Evaluation (Current System)**: The models evaluated in `fused_ncr_historical.csv` use historical **ECMWF ERA5 reanalysis meteorology** for timestamps $T$ through $T+24\text{h}$.
> * **Operational Deployment (Live System)**: In actual real-time operations, meteorology inputs at $T+24\text{h}$ must be ingested from **Numerical Weather Prediction (NWP) model forecasts** (such as IMD GFS or ECMWF deterministic forecast) rather than observed reanalysis.

---

## 5. Forecast Degradation Beyond 24 Hours
* **Short-Range Competence (+1h to +12h)**: Statistical gradient boosted decision trees capture short-range persistence and diurnal shifts, outperforming baseline models significantly.
* **Long-Range Error Growth (+48h to +72h)**: Predictive skill degrades ($R^2 < 0$) due to the absence of active numerical atmospheric chemistry propagation. Long-range multi-day forecasting requires dynamic chemical transport model (CTM) coupling.
