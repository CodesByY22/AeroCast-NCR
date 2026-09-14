import { useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { Cpu, Activity, Wind, Flame, AlertCircle } from 'lucide-react'
import { ForecastData, DiagnosticData, StubbleRiskData } from '../api/client'
import { getBadgeStyle } from '../utils/colors'

interface Props {
  forecast: ForecastData | null
  diagnostics: DiagnosticData | null
  risk: StubbleRiskData | null
  loading: boolean
}

export default function OverviewPage({ forecast, diagnostics, risk, loading }: Props) {
  const [selectedPollutant, setSelectedPollutant] = useState<'pm25' | 'pm10' | 'no2' | 'o3' | 'aqi'>('pm25')

  if (loading && !forecast) {
    return (
      <div className="p-8 space-y-4 animate-pulse">
        <div className="h-28 bg-slate-900 rounded-2xl"></div>
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-slate-900 rounded-2xl"></div>)}
        </div>
      </div>
    )
  }

  const currentItem = forecast?.forecast_timeline.find(i => i.horizon === '+0h') || forecast?.forecast_timeline[0]
  const h24Item = forecast?.forecast_timeline.find(i => i.horizon === '+24h')

  return (
    <div className="p-6 space-y-6">
      {/* Domain Benchmark Framing Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-cyan-800/40 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1 max-w-3xl">
            <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
              <Cpu className="w-4 h-4" />
              <span>Domain Benchmark Framing</span>
            </div>
            <h2 className="text-md font-bold text-slate-100">
              Inspired by the IITM/IMD 400m WRF-Chem Operational System
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              AeroCast NCR is a lightweight, data-driven prototype inspired by the 400m-resolution WRF-Chem aerosol data assimilation model (*Scientific Reports*, 2021). It uses real observational data fusion (OpenAQ, Open-Meteo, NASA FIRMS) to emit 72-hour AQI forecasts, driver diagnostics, and upwind stubble transport risk.
            </p>
          </div>
          <div className="text-right bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2 text-xs font-mono shrink-0">
            <span className="text-slate-400 block text-[10px]">OPERATIONAL STATUS</span>
            <span className="text-emerald-400 font-bold">XGBoost Engine Online</span>
          </div>
        </div>
      </div>

      {/* Top Pollutant & AQI Highlight Cards Grid */}
      {currentItem && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Current Ground AQI */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-2">
            <span className="text-xs text-slate-400 font-medium">Current Ground AQI (+0h)</span>
            <div className="flex items-baseline space-x-3">
              <span className="text-4xl font-extrabold tracking-tight" style={{ color: currentItem.color }}>
                {currentItem.aqi}
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded shadow-sm" style={getBadgeStyle(currentItem.color)}>
                {currentItem.category}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Timestamp: {currentItem.timestamp}</p>
          </div>

          {/* PM2.5 Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-1">
            <span className="text-xs text-slate-400 font-semibold uppercase">PM2.5</span>
            <div className="text-2xl font-bold text-amber-400">{currentItem.pm25} <span className="text-xs text-slate-400 font-normal">µg/m³</span></div>
            <p className="text-[11px] text-slate-400">Target +24h: <strong className="text-slate-200">{h24Item?.pm25 ?? 'N/A'} µg/m³</strong></p>
          </div>

          {/* PM10 Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-1">
            <span className="text-xs text-slate-400 font-semibold uppercase">PM10</span>
            <div className="text-2xl font-bold text-rose-400">{currentItem.pm10} <span className="text-xs text-slate-400 font-normal">µg/m³</span></div>
            <p className="text-[11px] text-slate-400">Target +24h: <strong className="text-slate-200">{h24Item?.pm10 ?? 'N/A'} µg/m³</strong></p>
          </div>

          {/* NO2 Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-1">
            <span className="text-xs text-slate-400 font-semibold uppercase">NO2</span>
            <div className="text-2xl font-bold text-sky-400">{currentItem.no2} <span className="text-xs text-slate-400 font-normal">µg/m³</span></div>
            <p className="text-[11px] text-slate-400">Target +24h: <strong className="text-slate-200">{h24Item?.no2 ?? 'N/A'} µg/m³</strong></p>
          </div>

          {/* O3 Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-1">
            <span className="text-xs text-slate-400 font-semibold uppercase">O3 (Ozone)</span>
            <div className="text-2xl font-bold text-emerald-400">{currentItem.o3} <span className="text-xs text-slate-400 font-normal">µg/m³</span></div>
            <p className="text-[11px] text-slate-400">Target +24h: <strong className="text-slate-200">{h24Item?.o3 ?? 'N/A'} µg/m³</strong></p>
          </div>
        </div>
      )}

      {/* 72-Hour Interactive Mini Forecast Section */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-md font-bold text-slate-100 flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              <span>72-Hour Mini Forecast Curve (Delhi NCR)</span>
            </h3>
            <p className="text-xs text-slate-400">Multi-horizon predictions (+1h, +6h, +12h, +24h, +48h, +72h)</p>
          </div>

          {/* Selector Tabs */}
          <div className="flex space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {(['pm25', 'pm10', 'no2', 'o3', 'aqi'] as const).map(param => (
              <button
                key={param}
                onClick={() => setSelectedPollutant(param)}
                className={`text-xs px-3 py-1 rounded-lg font-semibold uppercase transition ${
                  selectedPollutant === param ? 'bg-cyan-500 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {param}
              </button>
            ))}
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          {forecast && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart key={`overview_chart_${selectedPollutant}`} data={forecast.forecast_timeline} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="horizon" stroke="#64748b" tick={{ fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 12 }} label={{ value: selectedPollutant === 'aqi' ? 'AQI Index' : 'µg/m³', angle: -90, position: 'insideLeft', fill: '#64748b' }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                <Legend />
                <Line
                  key={`overview_line_${selectedPollutant}`}
                  type="monotone"
                  dataKey={selectedPollutant}
                  name={`${selectedPollutant.toUpperCase()} (${selectedPollutant === 'aqi' ? 'AQI' : 'µg/m³'})`}
                  stroke={selectedPollutant === 'pm25' ? '#06b6d4' : selectedPollutant === 'pm10' ? '#f43f5e' : selectedPollutant === 'no2' ? '#38bdf8' : selectedPollutant === 'o3' ? '#10b981' : '#a855f7'}
                  strokeWidth={3.5}
                  isAnimationActive={true}
                  animationDuration={900}
                  animationEasing="ease-in-out"
                  dot={{ r: 5, fill: selectedPollutant === 'pm25' ? '#06b6d4' : selectedPollutant === 'pm10' ? '#f43f5e' : selectedPollutant === 'no2' ? '#38bdf8' : selectedPollutant === 'o3' ? '#10b981' : '#a855f7' }}
                  activeDot={{ r: 8, stroke: '#0f172a', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Dynamic Pollution Risk Summary Card */}
      {diagnostics && risk && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-md font-bold text-slate-100 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              <span>Current Pollution Risk Summary</span>
            </h3>
            <span className="text-xs font-extrabold px-3 py-1 rounded-lg shadow-sm" style={getBadgeStyle(currentItem?.color)}>
              {currentItem?.category.toUpperCase()} RISK
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/80 border border-slate-800 p-4 rounded-xl font-sans">
            “Pollution accumulation risk is currently <strong className="text-amber-400">{diagnostics.diagnostics.ventilation.status}</strong> because 10m surface wind speed is {diagnostics.meteorological_drivers.wind_speed_10m.value} m/s and ventilation proxy indicates {diagnostics.diagnostics.ventilation.ventilation_index_proxy} m²/s. Upwind biomass burning transport risk is scored at {risk.transport_risk.stubble_transport_risk_score}/100 based on {risk.transport_risk.fire_count_200km} satellite fire hotspots.”
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl space-y-1">
              <span className="text-[10px] text-slate-400 font-semibold uppercase flex items-center gap-1">
                <Wind className="w-3.5 h-3.5 text-cyan-400" /> Ventilation Index <span className="text-[9px] px-1 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">PROXY</span>
              </span>
              <div className="text-lg font-bold text-slate-100">{diagnostics.diagnostics.ventilation.ventilation_index_proxy} m²/s</div>
            </div>

            <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl space-y-1">
              <span className="text-[10px] text-slate-400 font-semibold uppercase flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-400" /> Stubble Transport Risk <span className="text-[9px] px-1 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">PROXY</span>
              </span>
              <div className="text-lg font-bold text-slate-100">{risk.transport_risk.stubble_transport_risk_score} / 100</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
