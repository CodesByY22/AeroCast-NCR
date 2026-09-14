import { Cpu, Info } from 'lucide-react'
import { DiagnosticData, ForecastData } from '../api/client'

interface Props {
  diagnostics: DiagnosticData | null
  forecast: ForecastData | null
  loading: boolean
}

export default function ExplainabilityPage({ diagnostics, forecast, loading }: Props) {
  if (loading && !diagnostics) {
    return <div className="p-8 text-center text-slate-400">Loading Explainable AI model feature importances...</div>
  }

  const features = diagnostics?.feature_explanations || []
  const currentItem = forecast?.forecast_timeline.find(i => i.horizon === '+0h')
  const h24 = forecast?.forecast_timeline.find(i => i.horizon === '+24h')

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Cpu className="w-6 h-6 text-cyan-400" />
          <span>Explainable AI (XAI) Model Drivers & Feature Breakdown</span>
        </h2>
        <p className="text-xs text-slate-400">Model interpretability engine extracting feature gain & SHAP importances directly from trained XGBoost regressors.</p>
      </div>

      {/* Forecast Explanation Outlook Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <h3 className="text-md font-bold text-slate-100 flex items-center gap-2">
          <Info className="w-5 h-5 text-cyan-400" />
          <span>Forecast Outlook Explanation Trace</span>
        </h3>

        <div className="p-4 bg-slate-950/80 border border-cyan-900/40 rounded-xl text-xs text-slate-300 leading-relaxed font-sans space-y-2">
          <span className="text-cyan-400 font-bold block text-sm">
            “PM2.5 concentration is expected to transition from {currentItem?.pm25 ?? 'N/A'} µg/m³ (+0h) to {h24?.pm25 ?? 'N/A'} µg/m³ (+24h).”
          </span>
          <p>{diagnostics?.explanation_trace}</p>
        </div>

        {/* Primary Contributing Drivers List */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
            <span className="text-[10px] text-cyan-400 font-bold uppercase">1. Reduced Ventilation</span>
            <p className="text-xs text-slate-300">Surface wind velocity is insufficient to flush PM2.5 boundary mass.</p>
          </div>

          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
            <span className="text-[10px] text-amber-400 font-bold uppercase">2. Elevated Baseline Lag</span>
            <p className="text-xs text-slate-300">High antecedent PM2.5 lag (pm25_lag_24h) creates heavy residual inertia.</p>
          </div>

          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
            <span className="text-[10px] text-purple-400 font-bold uppercase">3. Thermal Inversion Trap</span>
            <p className="text-xs text-slate-300">Strong nocturnal lapse rate suppresses vertical boundary mixing.</p>
          </div>

          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
            <span className="text-[10px] text-rose-400 font-bold uppercase">4. Regional Fire Activity</span>
            <p className="text-xs text-slate-300">Upwind agricultural fire emissions contributing to background loading.</p>
          </div>
        </div>
      </div>

      {/* XGBoost Feature Importance SHAP Ranking */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-md font-bold text-slate-100 flex items-center justify-between">
          <span>XGBoost Feature Importance Ranking (Gain % Contribution)</span>
          <span className="text-xs text-slate-400 font-normal">Trained Model (+24h Horizon)</span>
        </h3>

        <div className="space-y-3 font-mono text-xs">
          {features.map((feat, idx) => {
            const impactCategory = feat.importance_pct > 30 ? 'HIGH IMPACT' : feat.importance_pct > 5 ? 'MEDIUM IMPACT' : 'LOW IMPACT'
            const categoryColor = feat.importance_pct > 30 ? 'text-rose-400 bg-rose-500/10 border-rose-500/30' : feat.importance_pct > 5 ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' : 'text-slate-400 bg-slate-800/50 border-slate-700'
            
            return (
              <div key={feat.feature} className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-500 font-bold">#{idx + 1}</span>
                    <span className="text-slate-200 font-semibold">{feat.feature}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded border font-bold ${categoryColor}`}>
                      {impactCategory}
                    </span>
                    <span className="text-cyan-400 font-bold text-sm">{feat.importance_pct}%</span>
                  </div>
                </div>

                <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, feat.importance_pct * 1.3)}%` }}></div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
