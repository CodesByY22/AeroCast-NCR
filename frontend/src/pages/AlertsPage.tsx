import { AlertsHistoryData } from '../api/client'
import { getBadgeStyle } from '../utils/colors'

interface Props {
  alerts: AlertsHistoryData | null
  loading: boolean
}

export default function AlertsPage({ alerts, loading }: Props) {
  if (loading && !alerts) {
    return <div className="p-8 text-center text-[#6e6e73] font-sans">Loading CPCB alert matrix...</div>
  }

  const active = alerts?.active_alert
  const forecasts = alerts?.forecast_alerts || []

  return (
    <div className="p-8 space-y-8 font-sans max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-[#e5e5ea] rounded-2xl p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-[#1d1d1f] tracking-tight">
          Dynamic CPCB Air Quality Advisory & Alert Centre
        </h1>
        <p className="text-xs text-[#6e6e73] mt-1">Automated CPCB-compliant statutory warning triggers based on multi-horizon model predictions.</p>
      </div>

      {/* Current Active Alert Hero Banner */}
      {active && (
        <div className="bg-white border border-[#e5e5ea] rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#e5e5ea] pb-4">
            <div>
              <span className="text-xs text-[#6e6e73] uppercase font-semibold">Active Warning (+0h Ground AQI)</span>
              <h2 className="text-2xl font-semibold tracking-tight" style={{ color: active.color }}>
                {active.category.toUpperCase()} ADVISORY — AQI {active.aqi}
              </h2>
            </div>
            <span className="px-3 py-1 rounded-md text-xs font-semibold uppercase shadow-2xs" style={getBadgeStyle(active.color)}>
              {active.alert_level}
            </span>
          </div>

          <div className="p-4 bg-[#f5f5f7] border border-[#e5e5ea] rounded-xl text-xs text-[#424245] leading-relaxed font-sans">
            <strong className="text-[#1d1d1f] block mb-1 font-semibold">Trigger Rationale:</strong>
            {active.explanation}
          </div>
        </div>
      )}

      {/* Horizon Alert Matrix */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-[#1d1d1f]">
          72-Hour Warning Forecast Timeline
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {forecasts.map(f => (
            <div key={f.horizon} className="bg-white border border-[#e5e5ea] rounded-2xl p-6 space-y-3 shadow-sm">
              <div className="flex justify-between items-center border-b border-[#e5e5ea] pb-3">
                <span className="text-xs font-semibold text-[#0066cc] font-mono">{f.horizon} HORIZON</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded shadow-2xs" style={getBadgeStyle(f.color)}>
                  {f.category}
                </span>
              </div>
              <div className="text-3xl font-semibold text-[#1d1d1f]">
                {f.aqi} <span className="text-xs font-normal text-[#86868b]">Predicted AQI</span>
              </div>
              <p className="text-xs text-[#6e6e73]">{f.explanation}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
