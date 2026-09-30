import { Bell, ShieldAlert, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { AlertsHistoryData } from '../api/client'
import { getBadgeStyle } from '../utils/colors'

interface Props {
  alerts: AlertsHistoryData | null
  loading: boolean
}

export default function AlertsPage({ alerts, loading }: Props) {
  if (loading && !alerts) {
    return <div className="p-8 text-center text-[#86868b]">Loading dynamic CPCB alert matrix...</div>
  }

  const active = alerts?.active_alert
  const forecasts = alerts?.forecast_alerts || []

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-[#d2d2d7] rounded-xl p-6">
        <h2 className="text-[18px] font-semibold text-[#1d1d1f] flex items-center gap-2">
          <Bell className="w-5 h-5 text-[#b25000]" strokeWidth={1.5} />
          Dynamic CPCB Air Quality Alert Centre
        </h2>
        <p className="text-[13px] text-[#86868b] mt-1">Automated CPCB-compliant warning triggers based on multi-horizon model predictions.</p>
      </div>

      {/* Active alert */}
      {active && (
        <div className="bg-white border-2 rounded-xl p-6 space-y-3" style={{ borderColor: active.color }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-7 h-7" style={{ color: active.color }} strokeWidth={1.5} />
              <div>
                <span className="text-[11px] text-[#86868b] uppercase font-medium">Active Warning (+0h Observation)</span>
                <h3 className="text-[20px] font-semibold" style={{ color: active.color }}>
                  {active.category.toUpperCase()} ALERT — AQI {active.aqi}
                </h3>
              </div>
            </div>
            <span className="px-3 py-1 rounded-lg text-[11px] font-semibold uppercase" style={getBadgeStyle(active.color)}>
              {active.alert_level}
            </span>
          </div>

          <div className="p-4 bg-[#f5f5f7] border border-[#e8e8ed] rounded-lg text-[12px] text-[#424245] leading-relaxed">
            <strong className="text-[#1d1d1f] block mb-1">Trigger Explanation:</strong>
            {active.explanation}
          </div>
        </div>
      )}

      {/* Forecast alerts */}
      <div className="space-y-4">
        <h3 className="text-[15px] font-semibold text-[#1d1d1f] flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[#0066cc]" strokeWidth={1.5} />
          72-Hour Warning Forecast Timeline
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {forecasts.filter(a => ['+24h', '+48h', '+72h'].includes(a.horizon)).map(alt => (
            <div key={alt.horizon} className="bg-white border border-[#d2d2d7] rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold text-[#0066cc] uppercase">Horizon {alt.horizon}</span>
                <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold" style={getBadgeStyle(alt.color)}>
                  {alt.category}
                </span>
              </div>

              <div className="text-[24px] font-semibold text-[#1d1d1f]">
                AQI {alt.aqi} <span className="text-[12px] text-[#86868b] font-normal">({alt.pm25} µg/m³ PM2.5)</span>
              </div>

              <div className="p-3 bg-[#f5f5f7] border border-[#e8e8ed] rounded-lg text-[12px] text-[#6e6e73] leading-relaxed">
                {alt.explanation}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Standard reference */}
      <div className="p-4 bg-white border border-[#d2d2d7] rounded-xl text-[12px] text-[#6e6e73] flex items-center justify-between">
        <span>Compliance Standard: {alerts?.standard}</span>
        <span className="flex items-center gap-1 text-[#2e7d32] font-medium"><CheckCircle2 className="w-4 h-4" strokeWidth={1.5} /> Operational</span>
      </div>
    </div>
  )
}
