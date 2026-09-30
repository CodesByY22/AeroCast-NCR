import { DiagnosticData, ForecastData } from '../api/client'

interface Props {
  diagnostics: DiagnosticData | null
  forecast: ForecastData | null
  loading: boolean
}

export default function ExplainabilityPage({ diagnostics, forecast, loading }: Props) {
  if (loading && !diagnostics) {
    return <div className="p-8 text-center text-[#6e6e73] font-sans">Loading Explainable AI model feature importances...</div>
  }

  const features = diagnostics?.feature_explanations || []
  const currentItem = forecast?.forecast_timeline.find(i => i.horizon === '+0h')
  const h24 = forecast?.forecast_timeline.find(i => i.horizon === '+24h')

  return (
    <div className="p-8 space-y-8 font-sans max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-[#e5e5ea] rounded-2xl p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-[#1d1d1f] tracking-tight">
          Explainable AI (XAI) Model Drivers & Feature Breakdown
        </h1>
        <p className="text-xs text-[#6e6e73] mt-1">Model interpretability engine extracting feature gain & SHAP importances directly from trained XGBoost regressors.</p>
      </div>

      {/* Forecast Explanation Trace Card */}
      <div className="bg-white border border-[#e5e5ea] rounded-2xl p-6 space-y-4 shadow-sm">
        <h2 className="text-base font-semibold text-[#1d1d1f]">
          Forecast Trajectory Explanation Trace
        </h2>

        <div className="p-4 bg-[#f5f5f7] border border-[#e5e5ea] rounded-xl text-xs text-[#424245] leading-relaxed font-sans space-y-2">
          <span className="text-[#0066cc] font-semibold block text-sm">
            “PM2.5 concentration is expected to transition from {currentItem?.pm25 ?? 'N/A'} µg/m³ (+0h) to {h24?.pm25 ?? 'N/A'} µg/m³ (+24h).”
          </span>
          <p>{diagnostics?.explanation_trace}</p>
        </div>

        {/* Primary Contributing Drivers List */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
          <div className="p-4 bg-[#f5f5f7] border border-[#e5e5ea] rounded-xl space-y-1">
            <span className="text-[11px] text-[#0066cc] font-semibold uppercase">1. Reduced Ventilation</span>
            <p className="text-xs text-[#6e6e73]">Surface wind velocity is insufficient to flush PM2.5 boundary mass.</p>
          </div>

          <div className="p-4 bg-[#f5f5f7] border border-[#e5e5ea] rounded-xl space-y-1">
            <span className="text-[11px] text-amber-700 font-semibold uppercase">2. Elevated Baseline Lag</span>
            <p className="text-xs text-[#6e6e73]">High antecedent PM2.5 lag (pm25_lag_24h) creates heavy residual inertia.</p>
          </div>

          <div className="p-4 bg-[#f5f5f7] border border-[#e5e5ea] rounded-xl space-y-1">
            <span className="text-[11px] text-purple-700 font-semibold uppercase">3. Thermal Inversion Trap</span>
            <p className="text-xs text-[#6e6e73]">Strong nocturnal lapse rate suppresses vertical boundary mixing.</p>
          </div>

          <div className="p-4 bg-[#f5f5f7] border border-[#e5e5ea] rounded-xl space-y-1">
            <span className="text-[11px] text-rose-700 font-semibold uppercase">4. Upwind Biomass Vector</span>
            <p className="text-xs text-[#6e6e73]">North-westerly alignment transports upwind fire smoke into NCR bowl.</p>
          </div>
        </div>
      </div>

      {/* Feature Importance Rankings Table */}
      <div className="bg-white border border-[#e5e5ea] rounded-2xl p-6 space-y-4 shadow-sm">
        <h2 className="text-base font-semibold text-[#1d1d1f]">XGBoost Feature Importance & Relative Weighting</h2>
        <div className="space-y-4">
          {features.map(f => (
            <div key={f.feature} className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono text-[#1d1d1f]">
                <span className="font-semibold">{f.feature}</span>
                <span className="text-[#6e6e73] font-bold">{f.importance_pct}%</span>
              </div>
              <div className="h-2 w-full bg-[#f5f5f7] rounded-full overflow-hidden border border-[#e5e5ea]">
                <div
                  className="h-full bg-[#0066cc] rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(f.importance_pct, 100)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
