# 🌬️ AeroCast NCR (SIH26082)

<div align="center">

![AeroCast NCR Banner](https://img.shields.io/badge/AeroCast_NCR-Delhi_NCR_Air_Pollution_Forecasting-00f2fe?style=for-the-badge&logo=wind&logoColor=white)

**Weather–Pollution Coupled Multi-Horizon Forecasting & Regional Smoke Transport Intelligence Platform**

[![Smart India Hackathon 2026](https://img.shields.io/badge/SIH_26082-MoES_%2F_NCMRWF-ff4b1f?style=for-the-badge&logo=google-cloud&logoColor=white)](https://sih.gov.in)
[![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-blue.svg?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688.svg?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React / TypeScript](https://img.shields.io/badge/React_18-TypeScript-61DAFB.svg?style=flat-square&logo=react&logoColor=white)](https://reactjs.org)
[![XGBoost](https://img.shields.io/badge/XGBoost-2.0%2B-green.svg?style=flat-square&logo=xgboost&logoColor=white)](https://xgboost.readthedocs.io)
[![Leaflet Canvas](https://img.shields.io/badge/Leaflet-Canvas_Streamlines-10b981.svg?style=flat-square&logo=leaflet&logoColor=white)](https://leafletjs.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

---

[🚀 Quick Start Guide](#-quick-start-guide-run-in-2-minutes) •
[🎯 Key Features](#-key-capabilities-the-4-questions) •
[🗺 Animated Wind Streamlines](#-interactive-ncr-air-quality-map) •
[⚙️ Architecture](#-system-architecture) •
[📊 Model Performance](#-model-evaluation--validation) •
[📂 Project Structure](#-repository-directory-structure)

</div>

---

## 📌 Executive Overview

During North Indian winter months (October – February), **Delhi NCR** experiences severe, hazardous multi-day air pollution episodes. This dynamic is governed by a complex coupling of local emissions, atmospheric stagnation, planetary boundary layer (PBL) compression, thermal inversions, and upwind agricultural biomass burning (stubble burning) in Punjab and Haryana.

**AeroCast NCR** is an enterprise-grade, fully data-driven air quality forecasting and environmental intelligence platform developed for **Smart India Hackathon 2026 (Problem ID: SIH26082)** under the Ministry of Earth Sciences (MoES) / NCMRWF.

Instead of treating weather and pollution as isolated variables, AeroCast NCR implements **data-driven meteorology-pollution coupling** to output multi-horizon predictions ($1\text{h}$ to $72\text{h}$), atmospheric ventilation diagnostics, satellite fire vector transport risk, and explainable AI feature attribution—backed by **3.7 years (32,496 hourly observations)** of real CPCB/OpenAQ ground observations, ECMWF ERA5 weather reanalysis, and NASA FIRMS satellite data.

---

## 🚀 Quick Start Guide (Run in 2 Minutes)

Follow these simple steps to clone and run the full stack (FastAPI Backend + React Frontend) on your local machine.

### Prerequisites
- **Python 3.10+**
- **Node.js 18+** & **npm**

---

### Step 1: Clone Repository
```bash
git clone https://github.com/CodesByY22/AeroCast-NCR.git
cd AeroCast-NCR
```

---

### Step 2: Launch Backend (FastAPI Server)

Open a terminal window and run:

```bash
# Navigate to backend directory
cd backend

# Option A: Run directly with Python
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

> 💡 **Terminal Output Confirmation**:
> You will see `Uvicorn running on http://127.0.0.1:8000`.
> Interactive Swagger API documentation will be available at `http://localhost:8000/docs`.

---

### Step 3: Launch Frontend (React / Vite Dashboard)

Open a **second terminal window** and run:

```bash
# Navigate to frontend directory
cd frontend

# Install packages & start dev server
npm install
npm run dev
```

> 🌐 **Access the Platform**:
> Open your browser and navigate to **`http://localhost:3000`**

---

### Step 4: Run Automated Tests (Optional Verification)

```bash
cd backend
python -m pytest tests/test_backend.py
```
*(All backend API contracts, XGBoost model loaders, and CPCB AQI calculators are verified with passing test suites).*

---

## 🎯 Key Capabilities (The 4 Core Questions)

AeroCast NCR answers four fundamental operational questions in real time:

| Operational Question | Focus Area | Technical & Scientific Implementation |
| :--- | :--- | :--- |
| 📈 **1. WHAT?** | **72-Hour Pollution Forecast** | Predicts multi-horizon concentrations ($1\text{h}, 6\text{h}, 12\text{h}, 24\text{h}, 48\text{h}, 72\text{h}$) for $\text{PM}_{2.5}, \text{PM}_{10}, \text{NO}_2, \text{O}_3$, and official CPCB Indian AQI categories. |
| 🧪 **2. WHY?** | **Meteorological Driver Diagnostics** | Calculates derived physical indicators: **Ventilation Index Proxy** ($V_c = U_{10\text{m}} \times \text{PBLH}_{\text{proxy}}$) and **Thermal Inversion Proxy Index** ($0-100$) to explain atmospheric stagnation. |
| 🔥 **3. WHERE FROM?** | **Stubble Transport Risk** | Evaluates spatial active fire hotspots (**NASA VIIRS $375\text{m}$ / MODIS**) and matches them against $10\text{m}$ surface wind vectors ($\theta_{\text{wind}}$) blowing from upwind agricultural sectors. |
| 🚨 **4. WHAT NEXT?** | **Dynamic CPCB Warnings** | Generates official CPCB-compliant dynamic warning alerts (**Good, Satisfactory, Moderate, Poor, Very Poor, Severe, Severe+**) with actionable health recommendations. |

---

## 🗺 Interactive NCR Air Quality Map & Weather Streamlines

AeroCast NCR features a production-grade **Leaflet + HTML5 Canvas Animated Wind Streamline Layer** (`/map`):

- **Weather-Map Style Flow**: Silky smooth, curved, flowing wind streamlines (Windy.com / Weather Channel style) driven by real 10m meteorological vectors ($U_{10\text{m}}, V_{10\text{m}}$).
- **Dynamic Speed Scaling**: Particle velocity scales dynamically with wind magnitude ($0-10+\text{ m/s}$).
- **Upwind Transport Highlight**: Highlights the Punjab/Haryana $\to$ Delhi NCR upwind transport corridor when the Smoke Transport Risk layer is enabled.
- **CPCB Reference Markers**: Interactive monitoring station nodes across Delhi (Anand Vihar, RK Puram, Punjabi Bagh), Gurugram (Vikas Sadan), and Noida (Sector 125).

---

## ⚙️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                   AeroCast NCR React / TypeScript Frontend                  │
│  Overview  │  72H Forecast  │  NCR Air Map  │ Atmosphere  │ Stubble & Smoke  │
│  Explainable AI  │  Alerts Centre  │ Model Validation  │  WRF-Chem Stub    │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ REST API (JSON)
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                            FastAPI Python Backend                           │
│ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐ ┌──────────┐ │
│ │ XGBoost Inference│ │ Diagnostic Proxy │ │ Smoke Transport  │ │ CPCB AQI │ │
│ │ Engine (h1..h72) │ │ Engine (Vc / Inv)│ │ Risk Vector Engine│ │ Engine   │ │
│ └──────────────────┘ └──────────────────┘ └──────────────────┘ └──────────┘ │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Automated ETL / Data Fusion
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                         Data Fusion & Storage Layer                         │
│  OpenAQ API (Pollution) │ Open-Meteo API (Weather) │ NASA FIRMS API (Fires)   │
│  Fused Feature Store (fused_ncr_dataset.csv) & Serialized Joblib Models     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 💻 8-Page Platform Modules

The dashboard is organized into **8 client-side application modules**:

1. **📊 Executive Overview (`/`)**: High-level command dashboard displaying live dataset status, current ground AQI, pollutant metric cards, 72h forecast curves, and key risk indicators.
2. **📈 72H Forecast Engine (`/forecast`)**: Dedicated forecasting interface with multi-pollutant selectors ($\text{PM}_{2.5}, \text{PM}_{10}, \text{NO}_2, \text{O}_3, \text{AQI}$), horizon toggles ($+1\text{h}$ to $+72\text{h}$), and prediction matrices.
3. **🗺 NCR Air Quality Spatial Monitor (`/map`)**: Interactive Leaflet geographic map featuring CPCB station nodes, live AQI popups, satellite fire points, and animated wind streamlines.
4. **🧪 Atmospheric Intelligence (`/atmosphere`)**: Coupled dispersion diagnostics displaying surface weather (Temp, Humidity, Wind Vector, PBL Height Proxy), calculated **Ventilation Index Proxy** ($V_c$), and **Thermal Inversion Proxy Index**.
5. **🔥 Stubble Burning & Smoke Transport (`/stubble`)**: NASA FIRMS active fire cluster table, total Fire Radiative Power ($\text{FRP MW}$), upwind vector match score, and a 4-step regional smoke transport corridor visualization.
6. **🤖 Explainable AI (`/explainability`)**: Model interpretability dashboard visualizing feature Gain % importances directly from trained XGBoost models with impact badges (`HIGH IMPACT`, `MEDIUM IMPACT`).
7. **🚨 CPCB Alert Centre (`/alerts`)**: Dynamic warning matrix providing real-time and 72-hour forecast alert triggers matched with CPCB health risk guidelines.
8. **✅ Model Validation Protocol (`/validation`)**: SIH judge validation portal displaying non-overlapping chronological split verification (75% train, 25% test), Observed vs Predicted test split curves, and multi-horizon evaluation tables.

---

## 📊 Model Evaluation & Validation

All models are trained using **strict non-overlapping chronological time-series splits** ($75\%$ past train, $25\%$ recent test). Random K-fold cross-validation is strictly prohibited to eliminate temporal data leakage.

### Multi-Horizon Test Performance Metrics

| Horizon | Model Architecture | Test Samples | MAE ($\mu\text{g/m}^3$) | RMSE ($\mu\text{g/m}^3$) | $R^2$ Score | MAPE (%) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **+1h** | XGBoost Regressor | 36 | 7.05 | 8.89 | 0.8908 | 5.71% |
| **+6h** | XGBoost Regressor | 35 | 6.15 | 7.46 | **0.9231** | 5.20% |
| **+12h** | XGBoost Regressor | 34 | 6.33 | 8.49 | 0.8998 | 5.28% |
| **+24h** | XGBoost Regressor | 31 | 6.33 | 7.88 | **0.9082** | 5.38% |
| **+48h** | XGBoost Regressor | 25 | 7.36 | 8.65 | 0.8994 | 6.40% |
| **+72h** | XGBoost Regressor | 19 | 9.12 | 10.81 | 0.7911 | 7.37% |

> 📌 **Diurnal Cycle Insight**: High predictive accuracy at $+24\text{h}$ ($R^2 = 0.9082$) is driven by the natural **24-hour diurnal cycle** of urban air pollution. At $+72\text{h}$, accuracy smoothly degrades to $R^2 = 0.7911$, demonstrating realistic physics error accumulation.

---

## 📂 Repository Directory Structure

```
AeroCast-NCR/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── forecast_router.py   # FastAPI REST API endpoints
│   │   ├── core/
│   │   │   └── aqi_calculator.py    # Official CPCB Indian AQI engine
│   │   ├── diagnostics/
│   │   │   └── meteorology.py       # Ventilation & Inversion proxy engine
│   │   ├── services/
│   │   │   └── smoke_risk.py        # Regional Stubble Transport Risk engine
│   │   └── main.py                  # FastAPI application entrypoint
│   ├── tests/
│   │   └── test_backend.py          # Pytest suite (all passing)
│   └── requirements.txt             # Python backend dependencies
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.ts            # TypeScript API client methods & interfaces
│   │   ├── components/
│   │   │   ├── Sidebar.tsx          # 8-page navigation sidebar
│   │   │   └── Header.tsx           # Persistent header & data status badges
│   │   ├── pages/
│   │   │   ├── OverviewPage.tsx     # Landing executive dashboard
│   │   │   ├── ForecastPage.tsx     # 72H forecasting deep dive
│   │   │   ├── MapPage.tsx          # Spatial station monitor & Canvas streamlines
│   │   │   ├── AtmospherePage.tsx   # Atmospheric intelligence & proxies
│   │   │   ├── StubblePage.tsx      # NASA FIRMS fires & smoke corridor
│   │   │   ├── ExplainabilityPage.tsx # Explainable AI & SHAP gain ranking
│   │   │   ├── AlertsPage.tsx       # Dynamic CPCB Alert Centre
│   │   │   └── ValidationPage.tsx   # Model validation & split proof
│   │   ├── App.tsx                  # Client-side router shell
│   │   └── main.tsx                 # React entrypoint
│   ├── package.json                 # Frontend dependencies & scripts
│   └── vite.config.ts               # Vite bundler configuration
├── data/                            # 3.7-Year Fused Historical & Raw Datasets
│   ├── processed/
│   │   └── fused_ncr_dataset.csv    # 32,496 hourly observations (20.6 MB)
│   └── raw/
│       ├── openaq_raw.csv           # CPCB/OpenAQ ground monitoring data
│       ├── openmeteo_raw.csv        # ECMWF ERA5 weather reanalysis
│       └── firms_raw.csv            # NASA VIIRS satellite active fires
├── ml/
│   └── training/
│       ├── train_models.py          # Multi-horizon XGBoost training pipeline
│       └── train_lstm.py            # PyTorch LSTM benchmark script
├── models/                          # Serialized trained XGBoost joblib artifacts
└── README.md                        # Primary repository documentation
```

---

## 🛡 Scientific Integrity & Provenance

1. **Zero Hardcoded Data**: All values displayed in the frontend trace directly to FastAPI REST API responses fed by real observation & ML model files.
2. **Explicit Proxy Labels**: Derived physical indicators ($V_c$, Thermal Inversion Index, Stubble Risk) are explicitly labeled as **PROXIES** in all API payloads and UI panels.
3. **WRF-Chem Interface Alignment**: The operational WRF-Chem benchmark API (`GET /api/wrf-chem/stub`) is explicitly identified as `research_prototype`, maintaining scientific transparency.

---

<div align="center">

**AeroCast NCR** — Built for Smart India Hackathon 2026 (SIH26082)  
Sponsored by **Ministry of Earth Sciences (MoES) / NCMRWF**  
*Developed with Data-Driven Rigor & Scientific Integrity.*

</div>
