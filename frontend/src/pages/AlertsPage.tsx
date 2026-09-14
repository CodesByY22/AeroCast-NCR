import { Bell, ShieldAlert, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { AlertsHistoryData } from '../api/client'
import { getBadgeStyle } from '../utils/colors'

interface Props {
  alerts: AlertsHistoryData | null
  loading: boolean
}

export default function AlertsPage({ alerts, loading }: Props) {
  if (loading && !alerts) {
    return <div className="p-8 text-center text-slate-400">Loading dynamic CPCB alert matrix...</div>
  }

  const active = alerts?.active_alert
  const forecasts = alerts?.forecast_alerts || []

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Bell className="w-6 h-6 text-amber-400" />
          <span>Dynamic CPCB Air Quality Alert Centre</span>
        </h2>
        <p className="text-xs text-slate-400">Automated CPCB-compliant warning triggers based on multi-horizon model predictions.</p>
      </div>

      {/* Current Active Alert Hero Banner */}
      {active && (
        <div className="bg-slate-900/90 border-2 rounded-2xl p-6 space-y-3 shadow-xl" style={{ borderColor: active.color }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ShieldAlert className="w-8 h-8" style={{ color: active.color }} />
              <div>
                <span className="text-xs text-slate-400 uppercase font-semibold">Active Warning (+0h Observation)</span>
                <h3 className="text-2xl font-black" style={{ color: active.color }}>
                  {active.category.toUpperCase()} ALERT — AQI {active.aqi}
                </h3>
              </div>
            </div>
            <span className="px-3 py-1 rounded-xl text-xs font-extrabold uppercase shadow-sm" style={getBadgeStyle(active.color)}>
              {active.alert_level}
            </span>
          </div>

          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-300 leading-relaxed font-sans">
            <strong className="text-slate-100 block mb-1">Trigger Explanation:</strong>
            {active.explanation}
          </div>
        </div>
      )}

      {/* Horizon Alert Matrix (Next 24h, 48h, 72h) */}
      <div className="space-y-4">
        <h3 className="text-md font-bold text-slate-100 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-cyan-400" />
          <span>72-Hour Warning Forecast Timeline</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {forecasts.filter(a => ['+24h', '+48h', '+72h'].includes(a.horizon)).map(alt => (
            <div key={alt.horizon} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-400 uppercase">Horizon {alt.horizon}</span>
                <span className="px-2.5 py-0.5 rounded text-xs font-extrabold shadow-sm" style={getBadgeStyle(alt.color)}>
                  {alt.category}
                </span>
              </div>

              <div className="text-3xl font-extrabold text-slate-100">
                AQI {alt.aqi} <span className="text-xs text-slate-400 font-normal">({alt.pm25} µg/m³ PM2.5)</span>
              </div>

              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-300 leading-relaxed font-sans">
                {alt.explanation}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Standard Reference Info */}
      <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-400 flex items-center justify-between">
        <span>Compliance Standard: {alerts?.standard}</span>
        <span className="flex items-center gap-1 text-emerald-400 font-semibold"><CheckCircle2 className="w-4 h-4" /> Operational</span>
      </div>
    </div>
  )
}
