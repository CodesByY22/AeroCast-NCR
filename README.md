# 🌬️ AeroCast NCR (SIH26082)

<div align="center">

![AeroCast NCR Banner](https://img.shields.io/badge/AeroCast_NCR-Delhi_NCR_Air_Pollution_Forecasting-00f2fe?style=for-the-badge&logo=wind&logoColor=white)

**Weather–Pollution Coupled Multi-Horizon Forecasting & Regional Smoke Transport Intelligence Platform**

[![Smart India Hackathon 2026](https://img.shields.io/badge/SIH_26082-MoES_%2F_NCMRWF-ff4b1f?style=flat-badge&logo=google-cloud&logoColor=white)](https://sih.gov.in)
[![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-blue.svg?style=flat-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688.svg?style=flat-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React / Next.js](https://img.shields.io/badge/React_/_TypeScript-18.2%2B-61DAFB.svg?style=flat-badge&logo=react&logoColor=white)](https://reactjs.org)
[![XGBoost](https://img.shields.io/badge/XGBoost-2.0%2B-green.svg?style=flat-badge&logo=xgboost&logoColor=white)](https://xgboost.readthedocs.io)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.1%2B-EE4C2C.svg?style=flat-badge&logo=pytorch&logoColor=white)](https://pytorch.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-badge)](LICENSE)

---

[Key Capabilities](#-key-capabilities-the-4-questions) •
[Domain Benchmark](#-domain-benchmark-alignment) •
[System Architecture](#-system-architecture) •
[Platform Modules](#-8-page-platform-modules) •
[Model Performance](#-model-evaluation--performance) •
[Quick Start](#-quick-start-guide)

</div>

---

## 📌 Executive Overview

During North Indian winter months, **Delhi NCR** experiences severe, multi-day air pollution episodes driven by a complex interplay of local emissions, atmospheric stagnation, planetary boundary layer (PBL) compression, thermal inversions, and upwind agricultural biomass burning (stubble burning) in Punjab and Haryana.

**AeroCast NCR** is an enterprise-grade, fully data-driven air quality forecasting and environmental intelligence platform designed for **Smart India Hackathon 2026 (Problem ID: SIH26082)** under the Ministry of Earth Sciences (MoES) / NCMRWF. 

Instead of treating weather and pollution as isolated variables, AeroCast NCR implements **data-driven meteorology-pollution coupling** to output multi-horizon predictions ($1\text{h}$ to $72\text{h}$), atmospheric ventilation diagnostics, satellite fire vector transport risk, and explainable AI feature attribution—all backed by zero fake data and strict chronological validation.

---

## 🎯 Key Capabilities (The 4 Core Questions)

AeroCast NCR answers four fundamental operational questions in real time:

| Question | Focus Area | Technical & Scientific Implementation |
| :--- | :--- | :--- |
| 📈 **1. WHAT?** | **72-Hour Pollution Forecast** | Predicts multi-horizon concentrations ($1\text{h}, 6\text{h}, 12\text{h}, 24\text{h}, 48\text{h}, 72\text{h}$) for $\text{PM}_{2.5}, \text{PM}_{10}, \text{NO}_2, \text{O}_3$, and official CPCB Indian AQI categories. |
| 🧪 **2. WHY?** | **Meteorological Driver Diagnostics** | Calculates derived physical indicators: **Ventilation Index Proxy** ($V_c = U_{10\text{m}} \times H_{\text{PBL\_Proxy}}$) and **Thermal Inversion Proxy Index** ($0-100$) to explain atmospheric stagnation. |
| 🔥 **3. WHERE FROM?** | **Stubble Transport Risk** | Evaluates spatial active fire hotspots (**NASA VIIRS $375\text{m}$ / MODIS**) and matches them against $10\text{m}$ surface wind vectors ($\theta_{\text{wind}}$) blowing from upwind agricultural sectors. |
| 🚨 **4. WHAT NEXT?** | **Dynamic CPCB Warnings** | Generates official CPCB-compliant dynamic warning alerts (**Good, Satisfactory, Moderate, Poor, Very Poor, Severe, Severe+**) with actionable health recommendations. |

---

## 🏛 Domain Benchmark Alignment

> **Domain Anchor**: India's premier atmospheric modeling centers (IITM / IMD) operate a 400m-resolution **WRF-Chem (Weather Research and Forecasting with Chemistry)** aerosol data assimilation system (*Scientific Reports*, 2021).

AeroCast NCR is explicitly framed as a **lightweight, real-time, data-driven prototype inspired by the 400m WRF-Chem system**. While HPC supercomputer models numerically integrate 3D fluid dynamic and chemical transport equations over hours, AeroCast NCR leverages **observational data fusion, machine learning, and physical vector proxies** to deliver instant 72-hour decision support without supercomputing overhead.

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

The frontend is structured into **8 dedicated client-side application modules**:

1. **📊 Executive Overview (`/`)**: High-level command dashboard displaying live dataset connectivity badges, current ground AQI, pollutant metric cards, a 72-hour mini forecast curve, and dynamic risk summaries.
2. **📈 72H Forecast Engine (`/forecast`)**: Dedicated forecasting view with multi-pollutant selectors ($\text{PM}_{2.5}, \text{PM}_{10}, \text{NO}_2, \text{O}_3, \text{AQI}$), horizon toggles ($+1\text{h}$ to $+72\text{h}$), $24\text{h}/48\text{h}/72\text{h}$ outlook summaries, and a complete prediction data matrix.
3. **🗺 NCR Air Quality Spatial Monitor (`/map`)**: Spatial station view across Delhi, Gurugram, Noida, Ghaziabad, and Faridabad featuring observed station markers vs model grid cells, CPCB severity color keys, and parameter filters.
4. **🧪 Atmospheric Intelligence (`/atmosphere`)**: Coupled dispersion diagnostics displaying surface weather (Temp, Humidity, Wind Vector, PBL Height Proxy), calculated **Ventilation Index Proxy** ($V_c$), **Thermal Inversion Proxy Index**, and educational atmospheric physics notes.
5. **🔥 Stubble Burning & Smoke Transport (`/stubble`)**: NASA FIRMS active fire cluster table, total Fire Radiative Power ($\text{FRP MW}$), upwind vector match score, and a 4-step regional smoke transport corridor visualization (Punjab/Haryana Fires $\rightarrow$ NW Wind $\rightarrow$ Transport Corridor $\rightarrow$ Delhi NCR).
6. **🤖 Explainable AI (`/explainability`)**: Model interpretability dashboard visualizing feature Gain % importances directly from trained XGBoost models with impact badges (`HIGH IMPACT`, `MEDIUM IMPACT`, `LOW IMPACT`) and forecast outlook trace explanations.
7. **🚨 CPCB Alert Centre (`/alerts`)**: Dynamic warning matrix providing real-time and 72-hour forecast alert triggers matched with CPCB health risk guidelines.
8. **✅ Model Validation Protocol (`/validation`)**: SIH judge validation portal displaying non-overlapping chronological split verification (75% train, 25% test), Observed vs Predicted test split curves, multi-horizon evaluation tables, and XGBoost vs PyTorch LSTM benchmark decision rules.

---

## 📊 Model Evaluation & Performance

All models are trained using **strict non-overlapping chronological time-series splits** ($75\%$ past train, $25\%$ recent test). Random K-fold cross-validation is strictly prohibited to eliminate temporal data leakage.

### Recomputed Multi-Horizon Test Metrics

| Horizon | Model Architecture | Test Samples | MAE ($\mu\text{g/m}^3$) | RMSE ($\mu\text{g/m}^3$) | $R^2$ Score | MAPE (%) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **+1h** | Ridge Regression | 36 | 6.38 | 8.19 | 0.9073 | 5.29% |
| **+1h** | XGBoost Regressor | 36 | 7.05 | 8.89 | 0.8908 | 5.71% |
| **+6h** | XGBoost Regressor | 35 | 6.15 | 7.46 | **0.9231** | 5.20% |
| **+12h** | XGBoost Regressor | 34 | 6.33 | 8.49 | 0.8998 | 5.28% |
| **+24h** | XGBoost Regressor | 31 | 6.33 | 7.88 | **0.9082** | 5.38% |
| **+48h** | XGBoost Regressor | 25 | 7.36 | 8.65 | 0.8994 | 6.40% |
| **+72h** | XGBoost Regressor | 19 | 9.12 | 10.81 | 0.7911 | 7.37% |

> **Mathematical Note on $+24\text{h}$ $R^2 = 0.9082$**: High predictive accuracy at $24\text{h}$ is driven by the natural **24-hour diurnal cycle** of urban air pollution. At $+72\text{h}$, accuracy naturally degrades to $R^2 = 0.7911$, demonstrating realistic physics error accumulation.

### PyTorch LSTM vs XGBoost Benchmark (+24h)
- **PyTorch LSTM Sequence Model**: $\text{MAE} = 107.16\,\mu\text{g/m}^3, \text{RMSE} = 110.47\,\mu\text{g/m}^3, R^2 = -15.94$
- **XGBoost Regressor**: $\text{MAE} = 6.33\,\mu\text{g/m}^3, \text{RMSE} = 7.88\,\mu\text{g/m}^3, \mathbf{R^2 = 0.9082}$
- **Decision Rule**: XGBoost is retained as the operational inference engine due to superior tabular feature stability on hourly environmental time series.

---

## 🛡 Data Integrity & Scientific Commitments

1. **Zero Hardcoded Data**: Zero hardcoded AQI scores or fake forecast arrays exist in the frontend UI. All numbers trace directly to FastAPI backend inference endpoints and real API data stores.
2. **Explicit Proxy Labels**: All derived indicators ($V_c$, Thermal Inversion, Stubble Risk) are explicitly labeled as **PROXIES** in all API responses and UI cards because direct 3D atmospheric radiosonde soundings are unmeasured.
3. **WRF-Chem Interface Stub**: The operational WRF-Chem API (`GET /api/wrf-chem/stub`) is explicitly tagged as `research_not_yet_operational`, fulfilling the requirement to never pretend a supercomputer model is running when it is not.

---

## 📁 Repository Directory Structure

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
│   │   └── test_backend.py          # Pytest suite (9/9 passing tests)
│   └── requirements.txt             # Python backend dependencies
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.ts            # TypeScript API client methods & interfaces
│   │   ├── components/
│   │   │   ├── Sidebar.tsx          # 8-page navigation sidebar
│   │   │   ├── Header.tsx           # Persistent header & data status badges
│   │   │   └── DataStatusBadge.tsx  # Live/Cached dataset status indicator
│   │   ├── pages/
│   │   │   ├── OverviewPage.tsx     # Landing executive dashboard
│   │   │   ├── ForecastPage.tsx     # 72H forecasting deep dive
│   │   │   ├── MapPage.tsx          # Spatial station monitor
│   │   │   ├── AtmospherePage.tsx   # Atmospheric intelligence & proxies
│   │   │   ├── StubblePage.tsx      # NASA FIRMS fires & smoke corridor
│   │   │   ├── ExplainabilityPage.tsx # Explainable AI & SHAP gain ranking
│   │   │   ├── AlertsPage.tsx       # Dynamic CPCB Alert Centre
│   │   │   └── ValidationPage.tsx   # Model validation & split proof
│   │   ├── App.tsx                  # Client-side router shell
│   │   └── main.tsx                 # React entrypoint
│   ├── package.json                 # Frontend dependencies & scripts
│   └── vite.config.ts               # Vite bundler configuration
├── pipelines/
│   ├── ingest_openaq.py             # OpenAQ ground pollution ETL
│   ├── ingest_openmeteo.py          # Open-Meteo weather ETL
│   ├── ingest_firms.py             # NASA FIRMS satellite fire ETL
│   └── clean_and_fuse.py            # Hourly feature store fusion pipeline
├── ml/
│   ├── training/
│   │   ├── train_models.py          # Multi-horizon XGBoost training script
│   │   └── train_lstm.py            # PyTorch LSTM benchmark script
├── models/                          # Serialized trained XGBoost joblib artifacts
├── docs/                            # Competition documentation & audit logs
│   ├── ARCHITECTURE.md
│   ├── DATA_DICTIONARY.md
│   ├── MODEL_CARD.md
│   ├── VALIDATION.md
│   ├── LIMITATIONS.md
│   └── SCIENTIFIC_AUDIT.md          # Rigorous technical audit report
└── README.md                        # Primary repository documentation
```

---

## ⚡ Quick Start Guide

### Prerequisites
- Python 3.10+
- Node.js v18+ & npm

### 1. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create & activate virtual environment (optional)
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run FastAPI backend server
python -m uvicorn app.main:app --reload --port 8000
```
*Backend API will be live at `http://localhost:8000` (Swagger docs at `http://localhost:8000/docs`).*

### 2. Data Pipelines & Model Training (Optional - Pre-trained artifacts included)
```bash
# Run data ingestion
python pipelines/ingest_openaq.py
python pipelines/ingest_openmeteo.py
python pipelines/ingest_firms.py

# Run cleaning & feature store fusion
python pipelines/clean_and_fuse.py

# Train multi-horizon XGBoost models
python ml/training/train_models.py
```

### 3. Frontend Setup
```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Start Vite React dev server
npm run dev
```
*Frontend UI will be live at `http://localhost:3000`.*

### 4. Running Backend Tests
```bash
cd backend
python -m pytest tests/test_backend.py
```

---

## 📜 Documentation Index

- 📘 [Scientific Audit Report](docs/SCIENTIFIC_AUDIT.md)
- 🏛 [Architecture Overview](docs/ARCHITECTURE.md)
- 📊 [Data Dictionary & Fusion Schema](docs/DATA_DICTIONARY.md)
- 🧪 [Model Card & Metrics](docs/MODEL_CARD.md)
- ✅ [Validation Protocol](docs/VALIDATION.md)
- ⚠️ [Scientific Limitations & Proxies](docs/LIMITATIONS.md)

---

<div align="center">

**AeroCast NCR** — Built for Smart India Hackathon 2026 (SIH26082)  
Sponsored by Ministry of Earth Sciences (MoES) / NCMRWF  
*Developed with Data-Driven Rigor & Scientific Integrity.*

</div>
