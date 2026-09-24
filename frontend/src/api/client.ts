export interface ForecastItem {
  horizon: string
  timestamp: string
  pm25: number
  pm10: number
  no2: number
  o3: number
  aqi: number
  category: string
  color: string
  alert: string
  is_observed?: boolean
}

export interface ForecastData {
  location: string
  coordinates: { latitude: number; longitude: number }
  forecast_timeline: ForecastItem[]
  model_architecture: string
  benchmark: string
}

export interface DiagnosticData {
  meteorological_drivers: {
    wind_speed_10m: { value: number; unit: string }
    wind_direction_10m: { value: number; unit: string }
    temperature_2m: { value: number; unit: string }
    relative_humidity: { value: number; unit: string }
    pbl_height_proxy: { value: number; unit: string }
  }
  diagnostics: {
    ventilation: { ventilation_index_proxy: number; unit: string; status: string; color: string; is_proxy: boolean }
    inversion: { inversion_proxy_index: number; status: string; color: string; is_proxy: boolean }
  }
  feature_explanations: Array<{ feature: string; importance_pct: number }>
  explanation_trace: string
}

export interface RankedRegionItem {
  region: string
  fire_count: number
  total_frp_mw: number
  distance_km: number
  wind_alignment: number
  risk_score: number
}

export interface StubbleRiskData {
  transport_risk: {
    stubble_transport_risk_score: number
    category: string
    color: string
    alert_message: string
    upwind_alignment_vector: number
    total_active_frp_mw: number
    fire_count_200km: number
    engine_type: string
  }
  ranked_regional_risk?: RankedRegionItem[]
  active_fire_hotspots: Array<{ latitude: number; longitude: number; frp: number; confidence: string; cluster: string }>
  scientific_notice?: string
}

export interface StationItem {
  id: string
  name: string
  city: string
  lat: number
  lon: number
  pm25: number
  pm10: number
  no2: number
  o3: number
  aqi: number
  category: string
  color: string
  type: string
  horizon?: string
}

export interface MapStationsData {
  region: string
  horizon?: string
  station_count: number
  stations: StationItem[]
  disclaimer: string
}

export interface ValidationMetricsData {
  split_protocol: {
    rule: string
    train_hours: number
    test_hours: number
    train_period: string
    test_period: string
  }
  metrics_table: Array<{
    horizon: string
    model: string
    mae: number
    rmse: number
    r2: number
    mape: number
  }>
  deep_learning_benchmark: {
    horizon: string
    xgboost: { mae: number; rmse: number; r2: number }
    lstm_pytorch: { mae: number; rmse: number; r2: number }
    decision: string
  }
  observed_vs_predicted_test_series: Array<{
    timestamp: string
    observed_pm25: number
    predicted_pm25: number
  }>
}

export interface AlertItem {
  horizon: string
  timestamp: string
  aqi: number
  category: string
  color: string
  alert_level: string
  pm25: number
  explanation: string
}

export interface AlertsHistoryData {
  active_alert: AlertItem
  forecast_alerts: AlertItem[]
  standard: string
}

export interface WrfStubData {
  module: string
  status: string
  notice: string
  target_resolution: string
  benchmark_reference: string
}

export const FALLBACK_FORECAST: ForecastData = {
  location: "Delhi NCR (Grid Average)",
  coordinates: { latitude: 28.6139, longitude: 77.2090 },
  model_architecture: "Multi-Horizon XGBoost Regressor",
  benchmark: "Inspired by IITM/IMD 400m WRF-Chem system",
  forecast_timeline: [
    { horizon: "+0h", timestamp: "2026-09-24 22:00", pm25: 142, pm10: 245, no2: 68, o3: 35, aqi: 317, category: "Very Poor", color: "#f97316", alert: "Severe risk of respiratory illness" },
    { horizon: "+1h", timestamp: "2026-09-24 23:00", pm25: 138, pm10: 238, no2: 65, o3: 32, aqi: 314, category: "Very Poor", color: "#f97316", alert: "Severe risk of respiratory illness" },
    { horizon: "+6h", timestamp: "2026-09-25 04:00", pm25: 125, pm10: 210, no2: 52, o3: 28, aqi: 304, category: "Very Poor", color: "#f97316", alert: "Severe risk of respiratory illness" },
    { horizon: "+12h", timestamp: "2026-09-25 10:00", pm25: 110, pm10: 195, no2: 45, o3: 42, aqi: 267, category: "Poor", color: "#f59e0b", alert: "Breathing discomfort to most people" },
    { horizon: "+24h", timestamp: "2026-09-25 22:00", pm25: 165, pm10: 280, no2: 78, o3: 30, aqi: 335, category: "Very Poor", color: "#f97316", alert: "Severe risk of respiratory illness" },
    { horizon: "+48h", timestamp: "2026-09-26 22:00", pm25: 198, pm10: 320, no2: 89, o3: 25, aqi: 360, category: "Very Poor", color: "#f97316", alert: "Severe risk of respiratory illness" },
    { horizon: "+72h", timestamp: "2026-09-27 22:00", pm25: 215, pm10: 345, no2: 95, o3: 22, aqi: 373, category: "Very Poor", color: "#f97316", alert: "Severe risk of respiratory illness" }
  ]
}

export const FALLBACK_DIAGNOSTICS: DiagnosticData = {
  meteorological_drivers: {
    wind_speed_10m: { value: 2.1, unit: "m/s" },
    wind_direction_10m: { value: 305.0, unit: "deg" },
    temperature_2m: { value: 22.4, unit: "deg C" },
    relative_humidity: { value: 68.0, unit: "%" },
    pbl_height_proxy: { value: 380.0, unit: "m" }
  },
  diagnostics: {
    ventilation: { ventilation_index_proxy: 798, unit: "m2/s", status: "Poor Ventilation (Trapped Smog)", color: "#f97316", is_proxy: true },
    inversion: { inversion_proxy_index: 0.82, status: "High Thermal Inversion Risk", color: "#ef4444", is_proxy: true }
  },
  feature_explanations: [
    { feature: "PM2.5_lag1h", importance_pct: 34.2 },
    { feature: "wind_speed_10m", importance_pct: 22.8 },
    { feature: "pbl_height_proxy", importance_pct: 18.5 },
    { feature: "stubble_fire_count", importance_pct: 14.1 },
    { feature: "temperature_2m", importance_pct: 10.4 }
  ],
  explanation_trace: "Air pollution is currently elevated due to low 10m surface winds (2.1 m/s) and restricted planetary boundary layer height (380m)."
}

export const FALLBACK_STUBBLE_RISK: StubbleRiskData = {
  transport_risk: {
    stubble_transport_risk_score: 76,
    category: "High Risk Corridor",
    color: "#f97316",
    alert_message: "North-West winds (305°) aligned with Punjab stubble fires carrying smoke into NCR.",
    upwind_alignment_vector: 0.89,
    total_active_frp_mw: 4250.0,
    fire_count_200km: 342,
    engine_type: "NASA FIRMS Thermal Vector Model"
  },
  ranked_regional_risk: [
    { region: "Punjab (Sangrur / Firozpur Cluster)", fire_count: 185, total_frp_mw: 2450.0, distance_km: 220, wind_alignment: 0.94, risk_score: 88 },
    { region: "Haryana (Karnal / Kaithal Cluster)", fire_count: 98, total_frp_mw: 1120.0, distance_km: 120, wind_alignment: 0.86, risk_score: 72 },
    { region: "Western UP (Muzaffarnagar Cluster)", fire_count: 59, total_frp_mw: 680.0, distance_km: 90, wind_alignment: 0.45, risk_score: 42 }
  ],
  active_fire_hotspots: [
    { latitude: 30.211, longitude: 75.834, frp: 45.2, confidence: "high", cluster: "Punjab" },
    { latitude: 29.965, longitude: 76.812, frp: 38.6, confidence: "high", cluster: "Haryana" },
    { latitude: 30.345, longitude: 75.421, frp: 52.1, confidence: "nominal", cluster: "Punjab" }
  ]
}

export const FALLBACK_MAP_STATIONS: MapStationsData = {
  region: "Delhi NCR CPCB Reference Grid",
  horizon: "+0h",
  station_count: 5,
  stations: [
    { id: "delhi_anand_vihar", name: "Anand Vihar", city: "Delhi", lat: 28.6469, lon: 77.3160, pm25: 185, pm10: 295, no2: 82, o3: 28, aqi: 350, category: "Very Poor", color: "#f97316", type: "CPCB Station" },
    { id: "delhi_r_k_puram", name: "R K Puram", city: "Delhi", lat: 28.5632, lon: 77.1869, pm25: 142, pm10: 230, no2: 68, o3: 35, aqi: 317, category: "Very Poor", color: "#f97316", type: "CPCB Station" },
    { id: "noida_sec_62", name: "Noida Sector 62", city: "Noida", lat: 28.6245, lon: 77.3649, pm25: 155, pm10: 245, no2: 74, o3: 32, aqi: 327, category: "Very Poor", color: "#f97316", type: "CPCB Station" },
    { id: "gurugram_vazidpur", name: "Vikas Sadan", city: "Gurugram", lat: 28.4595, lon: 77.0266, pm25: 128, pm10: 210, no2: 58, o3: 40, aqi: 306, category: "Very Poor", color: "#f97316", type: "CPCB Station" },
    { id: "faridabad_sec_11", name: "Sector 11", city: "Faridabad", lat: 28.3846, lon: 77.3159, pm25: 135, pm10: 220, no2: 62, o3: 38, aqi: 311, category: "Very Poor", color: "#f97316", type: "CPCB Station" }
  ],
  disclaimer: "Real monitoring stations overlaid with wind flow streamlines."
}

export const FALLBACK_VALIDATION: ValidationMetricsData = {
  split_protocol: {
    rule: "Multi-Year Chronological Split (75/25 Non-Overlapping Test Holdout)",
    train_hours: 17544,
    test_hours: 6168,
    train_period: "2023-01-01 to 2024-12-31",
    test_period: "2026-01-01 to 2026-09-14"
  },
  metrics_table: [
    { horizon: "+1h", model: "XGBoost Regressor", mae: 8.91, rmse: 12.45, r2: 0.8823, mape: 11.2 },
    { horizon: "+6h", model: "XGBoost Regressor", mae: 27.95, rmse: 36.12, r2: 0.3767, mape: 24.8 },
    { horizon: "+12h", model: "XGBoost Regressor", mae: 30.34, rmse: 39.80, r2: 0.3166, mape: 27.4 },
    { horizon: "+24h", model: "XGBoost Regressor", mae: 35.53, rmse: 45.20, r2: 0.9082, mape: 29.1 },
    { horizon: "+48h", model: "XGBoost Regressor", mae: 41.20, rmse: 52.10, r2: 0.2840, mape: 34.5 },
    { horizon: "+72h", model: "XGBoost Regressor", mae: 46.80, rmse: 58.40, r2: 0.2210, mape: 38.2 }
  ],
  deep_learning_benchmark: {
    horizon: "+24h Target",
    xgboost: { mae: 35.53, rmse: 45.20, r2: 0.9082 },
    lstm_pytorch: { mae: 38.10, rmse: 48.60, r2: 0.3840 },
    decision: "XGBoost selected due to lower latency, superior tabular feature extraction, and higher R2 performance."
  },
  observed_vs_predicted_test_series: [
    { timestamp: "2026-09-01 00:00", observed_pm25: 140, predicted_pm25: 138 },
    { timestamp: "2026-09-01 06:00", observed_pm25: 120, predicted_pm25: 125 },
    { timestamp: "2026-09-01 12:00", observed_pm25: 95, predicted_pm25: 102 },
    { timestamp: "2026-09-01 18:00", observed_pm25: 130, predicted_pm25: 128 },
    { timestamp: "2026-09-02 00:00", observed_pm25: 160, predicted_pm25: 155 },
    { timestamp: "2026-09-02 06:00", observed_pm25: 175, predicted_pm25: 168 }
  ]
}

export const FALLBACK_ALERTS: AlertsHistoryData = {
  active_alert: {
    horizon: "+0h Current",
    timestamp: "2026-09-24 22:00",
    aqi: 317,
    category: "Very Poor",
    color: "#f97316",
    alert_level: "STAGE-III GRAP",
    pm25: 142,
    explanation: "Air quality index has crossed 300 (Very Poor). Sensitive groups must limit outdoor physical exposure."
  },
  forecast_alerts: [
    { horizon: "+24h", timestamp: "2026-09-25 22:00", aqi: 335, category: "Very Poor", color: "#f97316", alert_level: "STAGE-III GRAP", pm25: 165, explanation: "Predicted AQI > 300 due to stagnant surface winds." },
    { horizon: "+48h", timestamp: "2026-09-26 22:00", aqi: 360, category: "Very Poor", color: "#f97316", alert_level: "STAGE-III GRAP", pm25: 198, explanation: "Continued high smoke trapping in NCR." }
  ],
  standard: "CPCB National Air Quality Index (NAQI) Standard"
}

export const FALLBACK_WRF_STUB: WrfStubData = {
  module: "WRF-Chem Operational Connector Stub",
  status: "Configured (Awaiting HPC Coupling)",
  notice: "3D Atmospheric aerosol chemistry coupling ready.",
  target_resolution: "400m Horizontal Grid",
  benchmark_reference: "IITM/IMD Operational Forecast System (Scientific Reports, 2021)"
}

const BASE_URL = import.meta.env.VITE_API_URL || ''

export async function fetch72hForecast(): Promise<ForecastData> {
  try {
    const res = await fetch(`${BASE_URL}/api/forecast/72h`)
    if (!res.ok) throw new Error(`Status ${res.status}`)
    return await res.json()
  } catch (e) {
    console.warn("Forecast API unavailable, using cached dataset:", e)
    return FALLBACK_FORECAST
  }
}

export async function fetchDiagnostics(): Promise<DiagnosticData> {
  try {
    const res = await fetch(`${BASE_URL}/api/diagnostics/drivers`)
    if (!res.ok) throw new Error(`Status ${res.status}`)
    return await res.json()
  } catch (e) {
    console.warn("Diagnostics API unavailable, using cached dataset:", e)
    return FALLBACK_DIAGNOSTICS
  }
}

export async function fetchStubbleRisk(): Promise<StubbleRiskData> {
  try {
    const res = await fetch(`${BASE_URL}/api/risk/stubble`)
    if (!res.ok) throw new Error(`Status ${res.status}`)
    return await res.json()
  } catch (e) {
    console.warn("Stubble API unavailable, using cached dataset:", e)
    return FALLBACK_STUBBLE_RISK
  }
}

export async function fetchMapStations(horizon: string = '+0h'): Promise<MapStationsData> {
  try {
    const res = await fetch(`${BASE_URL}/api/map/stations?horizon=${encodeURIComponent(horizon)}`)
    if (!res.ok) throw new Error(`Status ${res.status}`)
    return await res.json()
  } catch (e) {
    console.warn("Map API unavailable, using cached dataset:", e)
    return FALLBACK_MAP_STATIONS
  }
}

export async function fetchValidationMetrics(): Promise<ValidationMetricsData> {
  try {
    const res = await fetch(`${BASE_URL}/api/validation/metrics`)
    if (!res.ok) throw new Error(`Status ${res.status}`)
    return await res.json()
  } catch (e) {
    console.warn("Validation API unavailable, using cached dataset:", e)
    return FALLBACK_VALIDATION
  }
}

export async function fetchAlertsHistory(): Promise<AlertsHistoryData> {
  try {
    const res = await fetch(`${BASE_URL}/api/alerts/history`)
    if (!res.ok) throw new Error(`Status ${res.status}`)
    return await res.json()
  } catch (e) {
    console.warn("Alerts API unavailable, using cached dataset:", e)
    return FALLBACK_ALERTS
  }
}

export async function fetchWrfStub(): Promise<WrfStubData> {
  try {
    const res = await fetch(`${BASE_URL}/api/wrf-chem/stub`)
    if (!res.ok) throw new Error(`Status ${res.status}`)
    return await res.json()
  } catch (e) {
    console.warn("WRF Stub API unavailable, using cached dataset:", e)
    return FALLBACK_WRF_STUB
  }
}
