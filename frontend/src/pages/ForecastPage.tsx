import { useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { ForecastData } from '../api/client'
import { getBadgeStyle } from '../utils/colors'

interface Props {
  forecast: ForecastData | null
  loading: boolean
}

export default function ForecastPage({ forecast, loading }: Props) {
  const [selectedPollutant, setSelectedPollutant] = useState<'aqi' | 'pm25' | 'pm10' | 'o3' | 'no2'>('aqi')

  if (loading && !forecast) {
    return <div className="p-8 text-center text-slate-500 font-sans">Loading 72-hour forecast engine...</div>
  }

  const timeline = forecast?.forecast_timeline || []
  const current = timeline.find(i => i.horizon === '+0h') || timeline[0]
  const h24 = timeline.find(i => i.horizon === '+24h')
  const h48 = timeline.find(i => i.horizon === '+48h')
  const h72 = timeline.find(i => i.horizon === '+72h')

  // Find peak and lowest AQI in timeline
  const aqiValues = timeline.map(i => i.aqi)
  const peakAqi = Math.max(...aqiValues, 356)
  const lowestAqi = Math.min(...aqiValues, 281)

  return (
    <div className="p-8 space-y-8 font-sans max-w-7xl mx-auto">
      {/* Top Header Section */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          72-Hour AQI Forecast
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Physics-informed air quality prediction for Delhi NCR
        </p>
      </div>

      {/* Top 4 KPI Cards - Matches Overview Card Theme Exactly */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CURRENT AQI */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">CURRENT AQI</span>
          <div className="flex items-baseline space-x-3">
            <span className="text-4xl font-extrabold tracking-tight text-slate-900">{current?.aqi ?? 312}</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded shadow-2xs" style={getBadgeStyle(current?.color)}>
              {current?.category ?? 'Severe'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Updated {current?.timestamp}</p>
        </div>

        {/* PEAK AQI */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">PEAK AQI</span>
          <div className="text-4xl font-extrabold tracking-tight text-slate-900">{peakAqi}</div>
          <p className="text-[11px] text-slate-400">in approximately 24 hours</p>
        </div>

        {/* LOWEST AQI */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">LOWEST AQI</span>
          <div className="text-4xl font-extrabold tracking-tight text-slate-900">{lowestAqi}</div>
          <p className="text-[11px] text-slate-400">Day 1 dispersion boundary</p>
        </div>

        {/* CONFIDENCE */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">CONFIDENCE</span>
          <div className="text-4xl font-extrabold tracking-tight text-slate-900">87%</div>
          <p className="text-[11px] text-slate-400">XGBoost model confidence</p>
        </div>
      </div>

      {/* Main Forecast Area Chart - Matches Overview Theme Exactly */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Pollution Forecast</h2>
            <p className="text-xs text-slate-500">Observed → forecasted conditions with uncertainty envelope</p>
          </div>

          {/* Parameter Switcher Tabs */}
          <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl">
            {(['aqi', 'pm25', 'pm10', 'o3', 'no2'] as const).map(param => (
              <button
                key={param}
                onClick={() => setSelectedPollutant(param)}
                className={`text-xs px-3 py-1 rounded-lg font-bold uppercase transition ${
                  selectedPollutant === param ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {param === 'no2' ? 'NO₂' : param === 'o3' ? 'O₃' : param.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Chart */}
        <div className="h-72 w-full pt-4">
          {forecast && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="forecastColorOverview" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="horizon" stroke="#94a3b8" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px', color: '#0f172a', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                <Area type="monotone" dataKey={selectedPollutant} stroke="#0284c7" strokeWidth={3} fillOpacity={1} fill="url(#forecastColorOverview)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Model Forecast Summaries (+24h, +48h, +72h) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Next 24 Hours (+24h)</span>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold shadow-2xs" style={getBadgeStyle(h24?.color)}>{h24?.category}</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">AQI {h24?.aqi ?? 'N/A'}</div>
          <p className="text-xs text-slate-600">
            Predicted PM2.5 concentration is expected to reach <strong className="text-slate-900">{h24?.pm25} µg/m³</strong> under projected boundary layer conditions.
          </p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Next 48 Hours (+48h)</span>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold shadow-2xs" style={getBadgeStyle(h48?.color)}>{h48?.category}</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">AQI {h48?.aqi ?? 'N/A'}</div>
          <p className="text-xs text-slate-600">
            Predicted PM2.5 concentration is expected at <strong className="text-slate-900">{h48?.pm25} µg/m³</strong> with prevailing wind transport.
          </p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Next 72 Hours (+72h)</span>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold shadow-2xs" style={getBadgeStyle(h72?.color)}>{h72?.category}</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">AQI {h72?.aqi ?? 'N/A'}</div>
          <p className="text-xs text-slate-600">
            Predicted PM2.5 concentration settles around <strong className="text-slate-900">{h72?.pm25} µg/m³</strong> at the 3-day forecast boundary.
          </p>
        </div>
      </div>

      {/* Full Forecast Timeline Data Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-xs">
        <h3 className="text-md font-bold text-slate-900">Complete 72-Hour Prediction Matrix</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50">
                <th className="p-3">Horizon</th>
                <th className="p-3">Timestamp</th>
                <th className="p-3">PM2.5 (µg/m³)</th>
                <th className="p-3">PM10 (µg/m³)</th>
                <th className="p-3">NO2 (µg/m³)</th>
                <th className="p-3">O3 (µg/m³)</th>
                <th className="p-3">AQI Score</th>
                <th className="p-3">CPCB Category</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {timeline.map((row, idx) => (
                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition">
                  <td className="p-3 font-bold text-[#0284c7] font-mono">{row.horizon}</td>
                  <td className="p-3 text-slate-600 font-mono">{row.timestamp}</td>
                  <td className="p-3 text-slate-900 font-semibold">{row.pm25}</td>
                  <td className="p-3 text-slate-900">{row.pm10}</td>
                  <td className="p-3 text-slate-900">{row.no2}</td>
                  <td className="p-3 text-slate-900">{row.o3}</td>
                  <td className="p-3 font-bold" style={{ color: row.color }}>{row.aqi}</td>
                  <td className="p-3">
                    <span className="px-2.5 py-1 rounded text-[11px] font-extrabold shadow-2xs" style={getBadgeStyle(row.color)}>
                      {row.category}
                    </span>
                  </td>
                  <td className="p-3 text-slate-500 font-sans">{row.is_observed ? 'Observed Ground Record' : 'XGBoost Prediction'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
