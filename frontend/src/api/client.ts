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

export async function fetch72hForecast(): Promise<ForecastData> {
  const res = await fetch('/api/forecast/72h')
  if (!res.ok) throw new Error(`Forecast API failed: ${res.statusText}`)
  return res.json()
}

export async function fetchDiagnostics(): Promise<DiagnosticData> {
  const res = await fetch('/api/diagnostics/drivers')
  if (!res.ok) throw new Error(`Diagnostics API failed: ${res.statusText}`)
  return res.json()
}

export async function fetchStubbleRisk(): Promise<StubbleRiskData> {
  const res = await fetch('/api/risk/stubble')
  if (!res.ok) throw new Error(`Stubble API failed: ${res.statusText}`)
  return res.json()
}

export async function fetchMapStations(horizon: string = '+0h'): Promise<MapStationsData> {
  const res = await fetch(`/api/map/stations?horizon=${encodeURIComponent(horizon)}`)
  if (!res.ok) throw new Error(`Map API failed: ${res.statusText}`)
  return res.json()
}

export async function fetchValidationMetrics(): Promise<ValidationMetricsData> {
  const res = await fetch('/api/validation/metrics')
  if (!res.ok) throw new Error(`Validation API failed: ${res.statusText}`)
  return res.json()
}

export async function fetchAlertsHistory(): Promise<AlertsHistoryData> {
  const res = await fetch('/api/alerts/history')
  if (!res.ok) throw new Error(`Alerts API failed: ${res.statusText}`)
  return res.json()
}

export async function fetchWrfStub(): Promise<WrfStubData> {
  const res = await fetch('/api/wrf-chem/stub')
  if (!res.ok) throw new Error(`WRF Stub API failed: ${res.statusText}`)
  return res.json()
}
