# AeroCast NCR - System Architecture

## Overview
AeroCast NCR decouples data ingestion, feature engineering, machine learning inference, meteorological proxy calculation, and visual rendering into modular microservices.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       AeroCast NCR Next.js Frontend                         │
│ ┌──────────────────────┐ ┌─────────────────────────┐ ┌────────────────────┐ │
│ │  72h Forecast Chart  │ │ Interactive Risk Map    │ │ Driver / Explain UI│ │
│ │ (Recharts/ECharts)   │ │ (Leaflet / MapLibre GL) │ │ (SHAP/Feature View)│ │
│ └──────────────────────┘ └─────────────────────────┘ └────────────────────┘ │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ REST API (JSON)
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                            FastAPI Python Backend                           │
│ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐ ┌──────────┐ │
│ │ Inference Engine │ │ Diagnostic Proxy │ │ Smoke Transport  │ │ WRF-Chem │ │
│ │ (XGBoost / DL)   │ │ Engine           │ │ Risk Engine      │ │ Stub API │ │
│ └──────────────────┘ └──────────────────┘ └──────────────────┘ └──────────┘ │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Data Pipeline Layer
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                         Data Layer & Storage                                │
│  OpenAQ API (Pollution) │ Open-Meteo API (Weather) │ NASA FIRMS API (Fires)   │
│  PostgreSQL / SQLite + GeoPandas Feature Store & Model Registry            │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Modular Layers
1. **Inference Engine (`backend/app/ml/`)**: Loads serialized trained XGBoost/PyTorch models to output $1\text{h}$ to $72\text{h}$ pollutant predictions ($\text{PM}_{2.5}, \text{PM}_{10}, \text{NO}_2, \text{O}_3$).
2. **Diagnostic Proxy Engine (`backend/app/diagnostics/`)**: Calculates proxy ventilation scores ($V_c = U_{10\text{m}} \times H_{\text{PBL}}$) and proxy inversion intensity scores.
3. **Regional Smoke Transport Risk Engine (`backend/app/services/smoke_risk.py`)**: Evaluates spatial upwind active fires (NASA FIRMS) against wind direction vectors ($\theta_{\text{wind}}$).
4. **CPCB AQI Calculator (`backend/app/core/aqi_calculator.py`)**: Standardizes raw pollutant concentrations into official Indian AQI values and warning levels (Good to Severe+).
5. **Coupled WRF-Chem Interface Stub (`backend/app/api/wrf_stub.py`)**: Research stub exposing standard schemas for operational WRF-Chem model integration when HPC compute is attached.
