# AeroCast NCR — Data Provenance & Source Transparency Report (SIH26082)

## 1. Executive Data Provenance Summary
This report establishes full scientific provenance, origin tracking, and classification taxonomy for all datasets consumed by the **AeroCast NCR** platform. 

> [!IMPORTANT]
> **Data Provenance Rule**:
> To ensure absolute transparency for Smart India Hackathon (SIH26082) judges, air quality records currently stored in `data/raw/openaq_raw.csv` and `data/processed/fused_ncr_historical.csv` represent **Copernicus CAMS European Reanalysis Grid-Point Extractions queried at CPCB Station Coordinates**, NOT direct CPCB ground sensor IoT telemetry.

---

## 2. Location-by-Location Provenance Breakdown

| Location ID | Location Name | City | Latitude | Longitude | Actual Primary API Source | Data Type & Nature | CPCB Station ID Match | Raw Records | Hourly Steps | Missing % | Date Range | Available Pollutants |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `del_rk_puram` | RK Puram, Delhi | Delhi | `28.56` | `77.17` | Open-Meteo CAMS AQ API (`air-quality-api.open-meteo.com`) | CAMS Reanalysis Grid-Point Extraction | `site_142` (CPCB RK Puram) | 32,472 | 32,472 | 0.0% | 2023-01-01 to 2026-09-14 | $\text{PM}_{2.5}, \text{PM}_{10}, \text{NO}_2, \text{O}_3, \text{SO}_2, \text{CO}$ |
| `del_anand_vihar` | Anand Vihar, Delhi | Delhi | `28.65` | `77.31` | Open-Meteo CAMS AQ API (`air-quality-api.open-meteo.com`) | CAMS Reanalysis Grid-Point Extraction | `site_143` (CPCB Anand Vihar) | 32,472 | 32,472 | 0.0% | 2023-01-01 to 2026-09-14 | $\text{PM}_{2.5}, \text{PM}_{10}, \text{NO}_2, \text{O}_3, \text{SO}_2, \text{CO}$ |
| `del_punjabi_bagh` | Punjabi Bagh, Delhi | Delhi | `28.67` | `77.13` | Open-Meteo CAMS AQ API (`air-quality-api.open-meteo.com`) | CAMS Reanalysis Grid-Point Extraction | `site_144` (CPCB Punjabi Bagh) | 32,472 | 32,472 | 0.0% | 2023-01-01 to 2026-09-14 | $\text{PM}_{2.5}, \text{PM}_{10}, \text{NO}_2, \text{O}_3, \text{SO}_2, \text{CO}$ |
| `gur_vikas_sadan` | Vikas Sadan, Gurugram | Gurugram | `28.45` | `77.02` | Open-Meteo CAMS AQ API (`air-quality-api.open-meteo.com`) | CAMS Reanalysis Grid-Point Extraction | `site_501` (CPCB Vikas Sadan) | 32,472 | 32,472 | 0.0% | 2023-01-01 to 2026-09-14 | $\text{PM}_{2.5}, \text{PM}_{10}, \text{NO}_2, \text{O}_3, \text{SO}_2, \text{CO}$ |
| `noi_sec_125` | Sector 125, Noida | Noida | `28.54` | `77.33` | Open-Meteo CAMS AQ API (`air-quality-api.open-meteo.com`) | CAMS Reanalysis Grid-Point Extraction | `site_502` (CPCB Sector 125) | 32,472 | 32,472 | 0.0% | 2023-01-01 to 2026-09-14 | $\text{PM}_{2.5}, \text{PM}_{10}, \text{NO}_2, \text{O}_3, \text{SO}_2, \text{CO}$ |

---

## 3. Four-Tier Data Classification Taxonomy

All inputs consumed by AeroCast NCR are classified into four distinct operational tiers:

```
+-----------------------------------------------------------------------------------+
|                        AEROCAST NCR DATA TAXONOMY                                 |
+-----------------------------------------------------------------------------------+
| Tier 1: GROUND OBSERVATIONS  --> CPCB Physical Sensors (Target for Direct API)    |
| Tier 2: REANALYSIS DATA      --> Copernicus CAMS (AQ) & ERA5 (Meteorology)        |
| Tier 3: SATELLITE FEEDS      --> NASA FIRMS VIIRS 375m & MODIS Active Fires       |
| Tier 4: DERIVED PROXIES      --> Ventilation Index (Vc), Inversion Proxy, Risk    |
+-----------------------------------------------------------------------------------+
```

### 1. Ground Observations (Tier 1)
* **Definition**: Physical telemetry recorded directly by Central Pollution Control Board (CPCB) / CAAQMS continuous ambient air monitoring stations.
* **Current Status**: OpenAQ v2 API endpoints were retired (`410 Gone`), and OpenAQ v3 API required private credentials (`401 Unauthorized`). Consequently, direct live CPCB telemetry streaming is currently an **architectural target for operational production deployment**.

### 2. Reanalysis Data (Tier 2)
* **Definition**: High-resolution atmospheric reanalysis blending numerical weather models with satellite and ground assimilation.
* **Air Quality Reanalysis**: Copernicus Atmosphere Monitoring Service (CAMS / SILAM) global reanalysis fetched via Open-Meteo (`air-quality-api.open-meteo.com`) at $0.1^\circ \times 0.1^\circ$ spatial resolution (~10 km grid).
* **Meteorology Reanalysis**: ECMWF ERA5 reanalysis fetched via Open-Meteo (`archive-api.open-meteo.com`) covering `temperature_2m`, `relative_humidity_2m`, `surface_pressure`, `wind_speed_10m`, `wind_direction_10m`, `precipitation`, and `boundary_layer_height`.

### 3. Satellite Observations (Tier 3)
* **Definition**: Direct space-borne infrared thermal active fire detections.
* **Source**: NASA FIRMS (Fire Information for Resource Management System) S-NPP VIIRS (375 m spatial resolution) and MODIS C6.1 instruments.
* **Coverage**: Upwind bounding box across Punjab, Haryana, Western Uttar Pradesh, and Rajasthan ($27.5^\circ\text{N} - 32.5^\circ\text{N}, 74.0^\circ\text{E} - 79.0^\circ\text{E}$).

### 4. Derived & Proxy Indicators (Tier 4)
* **Ventilation Index Proxy ($V_c$)**: $V_c = U_{10\text{m}} \times H_{\text{PBL}}$ ($\text{m}^2/\text{s}$). Surface meteorology proxy indicating boundary layer pollutant flushing capacity.
* **Thermal Inversion Proxy Index**: Surface stagnation and relative humidity proxy index ($0-100$).
* **Physics-Guided Stubble Transport Risk Proxy**: Vector alignment risk score combining NASA FIRMS Fire Radiative Power (FRP) with 10m wind direction vectors ($\theta_{\text{wind}} \approx 315^\circ$ NW).

---

## 4. Verification Checklist & Data Integrity Audit

- [x] **Date Coverage**: 2023-01-01 00:00 to 2026-09-14 23:00 (Exact 3.7 Years).
- [x] **Timestep Consistency**: Exactly 32,472 hourly steps per location. Zero missing timestamps.
- [x] **Station Duplication**: Verified 0 duplicate station-timestamp rows in `station_ncr_historical.csv` and `fused_ncr_historical.csv`.
- [x] **Timezone Standardization**: Internal ISO strings converted to `Asia/Kolkata` IST.
- [x] **Synthetic Data Audit**: 0% synthetic fallbacks. Forward-fill gap handling strictly capped at **maximum 3 consecutive hours**.
