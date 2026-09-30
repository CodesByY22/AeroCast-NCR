# AeroCast NCR — SIH 2026 Official Demo Video Guide & Voiceover Script
**Problem Statement ID:** SIH26082  
**Project Title:** AeroCast NCR — Air Pollution–Weather Coupled Forecasting System (Delhi NCR Focus)  
**Target Video Duration:** 3 Minutes 30 Seconds (Ideal SIH Hackathon Demo Length)  

---

## 🛠️ PART 1: Technical Recording Setup (How to Do That)

### 1. Recommended Screen Recording Tools
* **OBS Studio (Free & Open Source - Recommended)**:
  * Resolution: **1920x1080 (1080p, 60 FPS)**.
  * Audio: Noise suppression enabled for clear voiceover.
* **Loom / Clipchamp (Easy Alternative)**:
  * Capture browser window in full screen (F11 or maximize).v

### 2. Audio & Environment Guidelines
* Use a quiet room without fan noise or echo.
* Speak clearly at a moderate, confident pace.
* Keep your microphone ~15 cm from your mouth.

### 3. Screen Setup Before Recording
1. Open your browser in fullscreen (`F11`).
2. Hide bookmarks bar (`Ctrl + Shift + B`).
3. Open `http://localhost:3000/` or your live Vercel URL.
4. Ensure tabs are organized:
   - Tab 1: `/` (Overview Dashboard)
   - Tab 2: `/map` (NCR Interactive Map)
   - Tab 3: `/atmosphere` (Atmospheric Diagnostics)
   - Tab 4: `/stubble` (Stubble Transport Risk)
   - Tab 5: `/alerts` (CPCB GRAP Alerts)
   - Tab 6: `/validation` (Model Benchmark)

---

## 🎬 PART 2: Scene-by-Scene Script & Action Guide

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            VIDEO TIMELINE (3:30)                            │
├────────────┬──────────────────────────────┬─────────────────────────────────┤
│ Timestamp  │ Screen Action / Page         │ Voiceover Focus                 │
├────────────┼──────────────────────────────┼─────────────────────────────────┤
│ 0:00 - 0:35│ Overview Dashboard (Home)    │ Problem Statement & Innovation  │
│ 0:35 - 1:15│ Dashboard Metrics & Forecast │ 4-Pillar Model & 72h AQI Curve  │
│ 1:15 - 1:50│ Interactive Map (`/map`)     │ Streamlines & NASA FIRMS Fires  │
│ 1:50 - 2:25│ Atmosphere (`/atmosphere`)   │ Ventilation Index & Inversion   │
│ 2:25 - 2:55│ Stubble Risk (`/stubble`)    │ Upwind Smoke Transport Vector   │
│ 2:55 - 3:20│ Alerts (`/alerts`) & Metrics │ GRAP Actions & 2026 Holdout     │
│ 3:20 - 3:30│ Final Screen (GitHub & Live) │ Conclusion & Open-Source Link   │
└────────────┴──────────────────────────────┴─────────────────────────────────┘
```

---

### SCENE 1: Introduction & Problem Statement
* **Time:** 0:00 - 0:35 (35 Seconds)
* **Page on Screen:** `http://localhost:3000/` (Overview Dashboard)
* **Screen Action:**
  * Start recording on the main header card showing **"AeroCast NCR"**, **"Problem Statement: SIH26082"**, and current AQI status.
  * Slowly move cursor over the hero metrics (Ground AQI, Wind Speed, Ventilation Index).

🎙️ **WORD-FOR-WORD VOICE-OVER SCRIPT:**
> "Hello Judges! Welcome to our demonstration of **AeroCast NCR**, developed for Smart India Hackathon 2026, Problem Statement SIH26082.  
> Every winter, the National Capital Region faces severe air pollution due to a complex combination of stubble burning, trapped emissions, and stagnant weather. Traditional atmospheric models like WRF-Chem are computationally heavy, while pure ML models ignore weather physics.  
> AeroCast NCR solves this by coupling machine learning with 3.7 years of high-resolution meteorological and atmospheric data to deliver real-time, physics-informed AQI forecasts up to 72 hours ahead."

---

### SCENE 2: Overview Dashboard & 72-Hour Forecast
* **Time:** 0:35 - 1:15 (40 Seconds)
* **Page on Screen:** `http://localhost:3000/` (Overview Dashboard)
* **Screen Action:**
  * Scroll down smoothly to the **"72-Hour Forecast Horizon"** line chart.
  * Hover over the data points on the line chart showing $+1\text{h}$, $+6\text{h}$, $+24\text{h}$, and $+72\text{h}$ predictions.
  * Hover over the **4-Pillar System Architecture** cards (Ground AQI, ERA5 Weather, CAMS Atmospheric, NASA FIRMS).

🎙️ **WORD-FOR-WORD VOICE-OVER SCRIPT:**
> "Here on our main dashboard, you see real-time conditions coupled with our 72-hour forecast horizon.  
> Our system ingests four critical data streams: live CPCB station data, ERA5 reanalysis weather metrics, Copernicus CAMS atmospheric chemistry, and NASA FIRMS satellite thermal anomaly data.  
> By feeding these physical features into optimized gradient boosting ensembles, our model predicts PM2.5 concentrations and AQI trajectories from 1 hour to 3 days in advance with high accuracy."

---

### SCENE 3: Interactive NCR Map & Satellite Fire Layer
* **Time:** 1:15 - 1:50 (35 Seconds)
* **Page on Screen:** `http://localhost:3000/map` (Interactive Map)
* **Screen Action:**
  * Click on the **NCR Interactive Map** tab.
  * Zoom in slightly on Delhi NCR.
  * Click on a station pin (e.g., Anand Vihar or Punjabi Bagh) to pop up live AQI stats.
  * Toggle on the **NASA FIRMS Stubble Fire layer** to show red thermal dots in Punjab/Haryana.
  * Show the animated wind streamlines flowing across the map.

🎙️ **WORD-FOR-WORD VOICE-OVER SCRIPT:**
> "Moving to our Interactive NCR Map: here we visualize live CPCB monitoring stations across Delhi, Noida, Gurugram, and Ghaziabad.  
> Clicking any station pin shows current PM2.5 levels alongside station-specific micro-forecasts.  
> Crucially, we overlay real-time satellite fire spots from NASA FIRMS together with animated wind streamlines. This allows environmental officers to visually track how upwind agricultural fires directly impact downstream Delhi air quality."

---

### SCENE 4: Atmospheric Diagnostics (Ventilation Index)
* **Time:** 1:50 - 2:25 (35 Seconds)
* **Page on Screen:** `http://localhost:3000/atmosphere` (Atmospheric Diagnostics)
* **Screen Action:**
  * Click on **Atmospheric Diagnostics** in the top navigation.
  * Hover over the **Ventilation Index ($V_c$)** gauge card.
  * Hover over **Boundary Layer Height ($H_{\text{PBL}}$)** and **Thermal Inversion Proxy** cards.

🎙️ **WORD-FOR-WORD VOICE-OVER SCRIPT:**
> "Next, let's look at Atmospheric Diagnostics. Standard weather apps only report surface temperature and wind speed. AeroCast NCR calculates true atmospheric dispersion capacity through the **Ventilation Index**, defined as 10-meter wind speed multiplied by Planetary Boundary Layer Height.  
> When boundary layer height collapses below 300 meters during winter nights, trapping pollutants near the ground, our system flags a high Thermal Inversion Risk, alerting authorities before AQI spikes occur."

---

### SCENE 5: Stubble Smoke Transport Risk Model
* **Time:** 2:25 - 2:55 (30 Seconds)
* **Page on Screen:** `http://localhost:3000/stubble` (Stubble Risk)
* **Screen Action:**
  * Click on **Stubble Risk** tab.
  * Point cursor to the **Stubble Transport Index** progress bar / indicator.
  * Show the active fire count card and dominant wind vector direction (NW to SE).

🎙️ **WORD-FOR-WORD VOICE-OVER SCRIPT:**
> "Our specialized Stubble Transport Risk module quantifies biomass burning impact.  
> It computes a composite risk score based on active fire counts in Punjab and Haryana, upwind trajectory alignment, and wind velocity.  
> When north-westerly winds align with peak burning activity, the transport index automatically elevates to HIGH or CRITICAL, giving decision-makers a 24-to-48-hour advance window to enforce preventative measures."

---

### SCENE 6: Automated GRAP Alerts & Model Validation
* **Time:** 2:55 - 3:20 (25 Seconds)
* **Page on Screen:** `http://localhost:3000/alerts` then `/validation`
* **Screen Action:**
  * Quick click on **Alerts Centre** (`/alerts`) showing CPCB GRAP Stage-I to Stage-IV advisory cards.
  * Quick click on **Model Validation** (`/validation`) showing the 2026 Chronological Holdout Benchmark charts.

🎙️ **WORD-FOR-WORD VOICE-OVER SCRIPT:**
> "Our Alerts Centre automatically maps predicted AQI levels directly to statutory CPCB GRAP stages—from Stage 1 Moderate up to Stage 4 Severe Plus.  
> Rigorously benchmarked on a untouched 2026 chronological holdout dataset, our model achieves an $R^2$ score of 0.4456 at 6 hours and maintains strong recall for severe pollution events."

---

### SCENE 7: Conclusion & Production Links
* **Time:** 3:20 - 3:30 (10 Seconds)
* **Page on Screen:** Return to Overview Dashboard or GitHub Repository page (`https://github.com/CodesByY22/AeroCast-NCR`)
* **Screen Action:**
  * Show GitHub repository README page or main overview screen.

🎙️ **WORD-FOR-WORD VOICE-OVER SCRIPT:**
> "AeroCast NCR is fully open-source, production-ready, and designed to support sustainable clean air governance for Delhi NCR. Thank you!"

---

## 📌 PART 3: Pro-Tips for SIH Submission

1. **Submission Video Format:**
   * Upload video to **YouTube** as **Unlisted** (or Public).
   * Copy the video link and paste it into the official SIH portal submission field.

2. **Video Title Standard:**
   `SIH26082 — AeroCast NCR Demo | Team [Your Team Name]`

3. **Checklist Before Clicking Submit:**
   - [x] Audio voiceover is clear with no background noise.
   - [x] Video quality is crisp 1080p.
   - [x] All 6 main pages were shown in action.
   - [x] Duration is between 3 to 4 minutes.
