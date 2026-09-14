# AeroCast NCR (SIH26082) 🌬️🏭

**Air Pollution-Weather Coupled Forecasting & Regional Smoke Transport Risk System (Delhi NCR Focus)**

> **Smart India Hackathon 2026 Submission**  
> **Theme:** Clean & Green Technology | **Category:** Software  
> **Sponsor:** Ministry of Earth Sciences (MoES) / NCMRWF  

---

## 📌 Scientific Framing & Benchmark
AeroCast NCR is a lightweight, fully data-driven prototype inspired by the operational **IITM/IMD 400m-resolution WRF-Chem system** with aerosol data assimilation (*Scientific Reports*, 2021). 

While high-performance chemical transport models (like WRF-Chem) require massive supercomputing resources to numerically simulate 3D fluid dynamics and atmospheric chemistry, AeroCast NCR leverages **data-driven observational fusion, machine learning, and meteorological diagnostics** to provide fast, interpretable, 72-hour air quality forecasts and regional stubble transport risk evaluations for Delhi NCR.

---

## 🎯 Core Capabilities (The 4 Questions)
1. **WHAT**: Multi-horizon predictions ($1\text{h}$ to $72\text{h}$) for $\text{PM}_{2.5}$, $\text{PM}_{10}$, $\text{NO}_2$, $\text{O}_3$, and official CPCB Indian AQI.
2. **WHY**: Meteorological driver diagnostics featuring proxy calculations for Boundary Layer Ventilation Index and Temperature Inversion Index.
3. **WHERE FROM**: Regional Smoke Transport Risk Engine combining NASA VIIRS/MODIS fire radiative power (FRP) with spatial wind vector alignment from upwind agricultural regions (Punjab, Haryana, Western UP).
4. **WHAT NEXT**: 72-hour temporal dynamics visualization with confidence bounds and severity alerts.

---

## 🏛 System Architecture
- **Frontend**: Next.js / React, TypeScript, Tailwind CSS, Leaflet / MapLibre GL, Recharts.
- **Backend**: Python, FastAPI, GeoPandas, NumPy, Pandas.
- **Machine Learning**: Scikit-Learn, XGBoost, PyTorch (evaluated for sequence modeling).
- **Data Tier 1**: OpenAQ (Pollution), Open-Meteo (Meteorology & Reanalysis), NASA FIRMS (Active Fire Detections).
- **Data Tier 2**: CPCB Station Records (Ground Truth Validation), Copernicus ERA5 (High-resolution atmospheric profiles).

---

## 📜 Documentation Index
- 📑 [Architecture Overview](docs/ARCHITECTURE.md)
- 📊 [Data Dictionary & Fusion Schema](docs/DATA_DICTIONARY.md)
- 🧪 [Model Card & Evaluation Metrics](docs/MODEL_CARD.md)
- ✅ [Validation Protocol](docs/VALIDATION.md)
- ⚠️ [Scientific Limitations & Proxies](docs/LIMITATIONS.md)

---

## ⚙️ Quick Start

### Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---
*Disclaimer: AeroCast NCR is a data-driven forecasting prototype designed for research and decision-support demonstration during SIH 2026. All derived indices (Inversion/Ventilation) are explicitly labeled as Proxy indicators.*
