import { Cpu, Info } from 'lucide-react'
import { DiagnosticData, ForecastData } from '../api/client'

interface Props {
  diagnostics: DiagnosticData | null
  forecast: ForecastData | null
  loading: boolean
}

export default function ExplainabilityPage({ diagnostics, forecast, loading }: Props) {
  if (loading && !diagnostics) {
    return <div className="p-8 text-center text-[#86868b]">Loading Explainable AI model feature importances...</div>
  }

  const features = diagnostics?.feature_explanations || []
  const currentItem = forecast?.forecast_timeline.find(i => i.horizon === '+0h')
  const h24 = forecast?.forecast_timeline.find(i => i.horizon === '+24h')

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-[#d2d2d7] rounded-xl p-6">
        <h2 className="text-[18px] font-semibold text-[#1d1d1f] flex items-center gap-2">
          <Cpu className="w-5 h-5 text-[#0066cc]" strokeWidth={1.5} />
          Explainable AI (XAI) Model Drivers & Feature Breakdown
        </h2>
        <p className="text-[13px] text-[#86868b] mt-1">Model interpretability engine extracting feature gain & SHAP importances directly from trained XGBoost regressors.</p>
      </div>

      {/* Forecast Explanation */}
      <div className="bg-white border border-[#d2d2d7] rounded-xl p-6 space-y-4">
        <h3 className="text-[15px] font-semibold text-[#1d1d1f] flex items-center gap-2">
          <Info className="w-4 h-4 text-[#0066cc]" strokeWidth={1.5} />
          Forecast Outlook Explanation Trace
        </h3>

        <div className="p-4 bg-[#f5f5f7] border border-[#e8e8ed] rounded-lg text-[13px] text-[#424245] leading-relaxed space-y-2">
          <span className="text-[#0066cc] font-semibold block text-[14px]">
            "PM2.5 concentration is expected to transition from {currentItem?.pm25 ?? 'N/A'} µg/m³ (+0h) to {h24?.pm25 ?? 'N/A'} µg/m³ (+24h)."
          </span>
          <p>{diagnostics?.explanation_trace}</p>
        </div>

        {/* Driver cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-1">
          <div className="p-4 bg-[#f5f5f7] border border-[#e8e8ed] rounded-lg space-y-1">
            <span className="text-[10px] text-[#0066cc] font-semibold uppercase">1. Reduced Ventilation</span>
            <p className="text-[12px] text-[#6e6e73]">Surface wind velocity is insufficient to flush PM2.5 boundary mass.</p>
          </div>
          <div className="p-4 bg-[#f5f5f7] border border-[#e8e8ed] rounded-lg space-y-1">
            <span className="text-[10px] text-[#b25000] font-semibold uppercase">2. Elevated Baseline Lag</span>
            <p className="text-[12px] text-[#6e6e73]">High antecedent PM2.5 lag (pm25_lag_24h) creates heavy residual inertia.</p>
          </div>
          <div className="p-4 bg-[#f5f5f7] border border-[#e8e8ed] rounded-lg space-y-1">
            <span className="text-[10px] text-[#6e3fc7] font-semibold uppercase">3. Thermal Inversion Trap</span>
            <p className="text-[12px] text-[#6e6e73]">Strong nocturnal lapse rate suppresses vertical boundary mixing.</p>
          </div>
          <div className="p-4 bg-[#f5f5f7] border border-[#e8e8ed] rounded-lg space-y-1">
            <span className="text-[10px] text-[#d32f2f] font-semibold uppercase">4. Regional Fire Activity</span>
            <p className="text-[12px] text-[#6e6e73]">Upwind agricultural fire emissions contributing to background loading.</p>
          </div>
        </div>
      </div>

      {/* Feature Importance */}
      <div className="bg-white border border-[#d2d2d7] rounded-xl p-6 space-y-4">
        <h3 className="text-[15px] font-semibold text-[#1d1d1f] flex items-center justify-between">
          <span>XGBoost Feature Importance Ranking (Gain % Contribution)</span>
          <span className="text-[12px] text-[#86868b] font-normal">Trained Model (+24h Horizon)</span>
        </h3>

        <div className="space-y-3 text-[12px]">
          {features.map((feat, idx) => {
            const impactCategory = feat.importance_pct > 30 ? 'HIGH IMPACT' : feat.importance_pct > 5 ? 'MEDIUM IMPACT' : 'LOW IMPACT'
            const categoryColor = feat.importance_pct > 30
              ? 'text-[#d32f2f] bg-[#fff0f0] border-[#f7c5c5]'
              : feat.importance_pct > 5
                ? 'text-[#b25000] bg-[#fff8f0] border-[#ffddb5]'
                : 'text-[#6e6e73] bg-[#f5f5f7] border-[#e8e8ed]'
            
            return (
              <div key={feat.feature} className="p-4 bg-[#f5f5f7] border border-[#e8e8ed] rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-[#86868b] font-semibold">#{idx + 1}</span>
                    <span className="text-[#1d1d1f] font-semibold">{feat.feature}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-md border font-semibold ${categoryColor}`}>
                      {impactCategory}
                    </span>
                    <span className="text-[#0066cc] font-semibold text-[14px]">{feat.importance_pct}%</span>
                  </div>
                </div>

                <div className="h-1.5 w-full bg-[#e8e8ed] rounded-full overflow-hidden">
                  <div className="h-full bg-[#0066cc] rounded-full transition-all duration-500" style={{ width: `${Math.min(100, feat.importance_pct * 1.3)}%` }}></div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
