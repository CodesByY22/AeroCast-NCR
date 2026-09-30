import { useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { TrendingUp, Calendar } from 'lucide-react'
import { ForecastData } from '../api/client'
import { getBadgeStyle } from '../utils/colors'

interface Props {
  forecast: ForecastData | null
  loading: boolean
}

export default function ForecastPage({ forecast, loading }: Props) {
  const [selectedPollutant, setSelectedPollutant] = useState<'pm25' | 'pm10' | 'no2' | 'o3' | 'aqi'>('pm25')

  if (loading && !forecast) {
    return <div className="p-8 text-center text-slate-500 font-sans">Loading coupled forecast engine...</div>
  }

  const timeline = forecast?.forecast_timeline || []
  const h24 = timeline.find(i => i.horizon === '+24h')
  const h48 = timeline.find(i => i.horizon === '+48h')
  const h72 = timeline.find(i => i.horizon === '+72h')

  return (
    <div className="p-8 space-y-8 font-sans max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#0066cc]" />
            Coupled 72-Hour Pollution Forecast Engine
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Multi-horizon prediction output (+1h to +72h) powered by Multi-Horizon XGBoost Regressors.
          </p>
        </div>

        {/* Pollutant Filter Selector */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          {(['pm25', 'pm10', 'no2', 'o3', 'aqi'] as const).map(p => (
            <button
              key={p}
              onClick={() => setSelectedPollutant(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition ${
                selectedPollutant === p
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {p === 'no2' ? 'NO₂' : p === 'o3' ? 'O₃' : p.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Main Forecast Chart */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            72-Hour Concentration Timeline ({selectedPollutant.toUpperCase()})
          </h3>
          <span className="text-xs font-mono text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
            Delhi NCR Average Projection
          </span>
        </div>

        <div className="h-[340px] w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart key={`forecast_chart_${selectedPollutant}`} data={timeline} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="horizon" stroke="#64748b" tick={{ fill: '#475569', fontSize: 12 }} />
              <YAxis stroke="#64748b" tick={{ fill: '#475569', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px', color: '#0f172a', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                itemStyle={{ color: '#0284c7' }}
              />
              <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
              <Line
                key={`forecast_line_${selectedPollutant}`}
                type="monotone"
                dataKey={selectedPollutant}
                name={`${selectedPollutant.toUpperCase()} Concentration`}
                stroke={selectedPollutant === 'pm25' ? '#0066cc' : selectedPollutant === 'pm10' ? '#dc2626' : selectedPollutant === 'no2' ? '#0284c7' : selectedPollutant === 'o3' ? '#059669' : '#7c3aed'}
                strokeWidth={3}
                isAnimationActive={true}
                animationDuration={900}
                animationEasing="ease-in-out"
                dot={{ r: 5, fill: selectedPollutant === 'pm25' ? '#0066cc' : selectedPollutant === 'pm10' ? '#dc2626' : selectedPollutant === 'no2' ? '#0284c7' : selectedPollutant === 'o3' ? '#059669' : '#7c3aed' }}
                activeDot={{ r: 8, stroke: '#ffffff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Model Forecast Summaries (24h, 48h, 72h) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 24 Hours */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-[#0066cc]" /> Next 24 Hours (+24h)</span>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold shadow-2xs" style={getBadgeStyle(h24?.color)}>{h24?.category}</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">AQI {h24?.aqi ?? 'N/A'}</div>
          <p className="text-xs text-slate-600">
            Predicted PM2.5 concentration is expected to reach <strong className="text-slate-900">{h24?.pm25} µg/m³</strong> under projected boundary layer conditions.
          </p>
        </div>

        {/* 48 Hours */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-[#0066cc]" /> Next 48 Hours (+48h)</span>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold shadow-2xs" style={getBadgeStyle(h48?.color)}>{h48?.category}</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">AQI {h48?.aqi ?? 'N/A'}</div>
          <p className="text-xs text-slate-600">
            Predicted PM2.5 concentration is expected at <strong className="text-slate-900">{h48?.pm25} µg/m³</strong> with prevailing wind transport.
          </p>
        </div>

        {/* 72 Hours */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-[#0066cc]" /> Next 72 Hours (+72h)</span>
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
                  <td className="p-3 font-bold text-[#0066cc] font-mono">{row.horizon}</td>
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
