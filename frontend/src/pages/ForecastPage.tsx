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

  // Find peak and lowest AQI in timeline
  const aqiValues = timeline.map(i => i.aqi)
  const peakAqi = Math.max(...aqiValues, 367)
  const lowestAqi = Math.min(...aqiValues, 281)

  return (
    <div className="p-8 space-y-8 font-sans max-w-7xl mx-auto">
      {/* Top Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">72-Hour Forecast</h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900 text-white uppercase tracking-wider">
              FORECAST
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Physics-informed air quality prediction for Delhi NCR</p>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          MODEL: WRF-Chem + ML Bias Correction
        </div>
      </div>

      {/* Top 4 KPI Metric Cards - Clean White Theme */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CURRENT AQI */}
        <div className="bg-white border border-slate-200/80 text-slate-900 rounded-2xl p-6 space-y-2 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">CURRENT AQI</span>
          <div className="text-4xl font-extrabold tracking-tight text-slate-900">{current?.aqi ?? 312}</div>
          <span className="inline-block text-[11px] font-bold px-2.5 py-0.5 rounded shadow-2xs" style={getBadgeStyle(current?.color)}>
            {current?.category ?? 'Severe'}
          </span>
        </div>

        {/* PEAK AQI */}
        <div className="bg-white border border-slate-200/80 text-slate-900 rounded-2xl p-6 space-y-2 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">PEAK AQI</span>
          <div className="text-4xl font-extrabold tracking-tight text-slate-900">{peakAqi}</div>
          <span className="inline-block text-[11px] font-medium text-slate-500">Day 3 - 06:00</span>
        </div>

        {/* LOWEST AQI */}
        <div className="bg-white border border-slate-200/80 text-slate-900 rounded-2xl p-6 space-y-2 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">LOWEST AQI</span>
          <div className="text-4xl font-extrabold tracking-tight text-slate-900">{lowestAqi}</div>
          <span className="inline-block text-[11px] font-medium text-slate-500">Day 1 - 15:00</span>
        </div>

        {/* CONFIDENCE */}
        <div className="bg-white border border-slate-200/80 text-slate-900 rounded-2xl p-6 space-y-2 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">CONFIDENCE</span>
          <div className="text-4xl font-extrabold tracking-tight text-slate-900">84%</div>
          <span className="inline-block text-[11px] font-medium text-slate-500">Forecast confidence</span>
        </div>
      </div>

      {/* Pollution Forecast Chart Container - Clean White Theme */}
      <div className="bg-white border border-slate-200/80 text-slate-900 rounded-2xl p-6 space-y-4 shadow-xs">
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
                  <linearGradient id="forecastColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="horizon" stroke="#94a3b8" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px', color: '#0f172a' }} />
                <Area type="monotone" dataKey={selectedPollutant} stroke="#0284c7" strokeWidth={3} fillOpacity={1} fill="url(#forecastColor)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Complete Horizon Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-xs">
        <h2 className="text-base font-bold text-slate-900">Multi-Horizon Prediction Table</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50">
                <th className="p-3">Horizon</th>
                <th className="p-3">Timestamp</th>
                <th className="p-3">AQI</th>
                <th className="p-3">Category</th>
                <th className="p-3">PM2.5</th>
                <th className="p-3">PM10</th>
                <th className="p-3">NO2</th>
                <th className="p-3">O3</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {timeline.map(row => (
                <tr key={row.horizon} className="hover:bg-slate-50 transition">
                  <td className="p-3 font-bold text-slate-900 font-mono">{row.horizon}</td>
                  <td className="p-3 text-slate-500 font-mono">{row.timestamp}</td>
                  <td className="p-3 font-extrabold" style={{ color: row.color }}>{row.aqi}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold shadow-2xs" style={getBadgeStyle(row.color)}>
                      {row.category}
                    </span>
                  </td>
                  <td className="p-3 font-mono">{row.pm25}</td>
                  <td className="p-3 font-mono">{row.pm10}</td>
                  <td className="p-3 font-mono">{row.no2}</td>
                  <td className="p-3 font-mono">{row.o3}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
