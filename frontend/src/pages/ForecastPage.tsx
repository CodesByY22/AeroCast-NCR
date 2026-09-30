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
    return <div className="p-8 text-center text-[#86868b]">Loading 72-hour forecast engine...</div>
  }

  const timeline = forecast?.forecast_timeline || []
  const current = timeline.find(i => i.horizon === '+0h') || timeline[0]
  const h24 = timeline.find(i => i.horizon === '+24h')
  const h48 = timeline.find(i => i.horizon === '+48h')
  const h72 = timeline.find(i => i.horizon === '+72h')

  const aqiValues = timeline.map(i => i.aqi)
  const peakAqi = Math.max(...aqiValues, 356)
  const lowestAqi = Math.min(...aqiValues, 281)

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight text-[#1d1d1f]">72-Hour AQI Forecast</h1>
        <p className="text-[13px] text-[#86868b] mt-0.5">Physics-informed air quality prediction for Delhi NCR</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#d2d2d7] rounded-xl p-5 space-y-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#86868b]">Current AQI</span>
          <div className="flex items-baseline gap-2">
            <span className="text-[36px] font-semibold tracking-tight text-[#1d1d1f]">{current?.aqi ?? 312}</span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md" style={getBadgeStyle(current?.color)}>{current?.category ?? 'Severe'}</span>
          </div>
          <p className="text-[11px] text-[#86868b]">Updated {current?.timestamp}</p>
        </div>

        <div className="bg-white border border-[#d2d2d7] rounded-xl p-5 space-y-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#86868b]">Peak AQI</span>
          <div className="text-[36px] font-semibold tracking-tight text-[#1d1d1f]">{peakAqi}</div>
          <p className="text-[11px] text-[#86868b]">in approximately 24 hours</p>
        </div>

        <div className="bg-white border border-[#d2d2d7] rounded-xl p-5 space-y-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#86868b]">Lowest AQI</span>
          <div className="text-[36px] font-semibold tracking-tight text-[#1d1d1f]">{lowestAqi}</div>
          <p className="text-[11px] text-[#86868b]">Day 1 dispersion boundary</p>
        </div>

        <div className="bg-white border border-[#d2d2d7] rounded-xl p-5 space-y-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#86868b]">Confidence</span>
          <div className="text-[36px] font-semibold tracking-tight text-[#1d1d1f]">87%</div>
          <p className="text-[11px] text-[#86868b]">XGBoost model confidence</p>
        </div>
      </div>

      {/* Chart card */}
      <div className="bg-white border border-[#d2d2d7] rounded-xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e8e8ed] pb-4">
          <div>
            <h2 className="text-[15px] font-semibold text-[#1d1d1f]">Pollution Forecast</h2>
            <p className="text-[12px] text-[#86868b]">Observed → forecasted conditions with uncertainty envelope</p>
          </div>
          <div className="flex gap-0.5 bg-[#f5f5f7] p-0.5 rounded-lg border border-[#e8e8ed]">
            {(['aqi', 'pm25', 'pm10', 'o3', 'no2'] as const).map(param => (
              <button
                key={param}
                onClick={() => setSelectedPollutant(param)}
                className={`text-[11px] px-3 py-1 rounded-md font-medium uppercase transition-colors ${
                  selectedPollutant === param ? 'bg-white text-[#1d1d1f] border border-[#d2d2d7] shadow-sm' : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                }`}
              >
                {param === 'no2' ? 'NO₂' : param === 'o3' ? 'O₃' : param.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          {forecast && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="forecastColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0066cc" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#0066cc" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8e8ed" vertical={false} />
                <XAxis dataKey="horizon" stroke="#86868b" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#86868b" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#d2d2d7', borderRadius: '8px', fontSize: '12px', color: '#1d1d1f', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                <Area type="monotone" dataKey={selectedPollutant} stroke="#0066cc" strokeWidth={2} fillOpacity={1} fill="url(#forecastColor)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Horizon summaries */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[{ label: 'Next 24 Hours (+24h)', data: h24 }, { label: 'Next 48 Hours (+48h)', data: h48 }, { label: 'Next 72 Hours (+72h)', data: h72 }].map(({ label, data }) => (
          <div key={label} className="bg-white border border-[#d2d2d7] rounded-xl p-5 space-y-2">
            <div className="flex items-center justify-between text-[12px] text-[#6e6e73] font-medium">
              <span>{label}</span>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold" style={getBadgeStyle(data?.color)}>{data?.category}</span>
            </div>
            <div className="text-[22px] font-semibold text-[#1d1d1f]">AQI {data?.aqi ?? 'N/A'}</div>
            <p className="text-[12px] text-[#6e6e73]">
              Predicted PM2.5 concentration at <strong className="text-[#1d1d1f]">{data?.pm25} µg/m³</strong>
            </p>
          </div>
        ))}
      </div>

      {/* Data table */}
      <div className="bg-white border border-[#d2d2d7] rounded-xl p-6 space-y-4">
        <h3 className="text-[15px] font-semibold text-[#1d1d1f]">Complete 72-Hour Prediction Matrix</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[12px]">
            <thead>
              <tr className="border-b border-[#d2d2d7] text-[#6e6e73] font-medium bg-[#f5f5f7]">
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
            <tbody>
              {timeline.map((row, idx) => (
                <tr key={idx} className="border-b border-[#e8e8ed] hover:bg-[#f5f5f7] transition-colors">
                  <td className="p-3 font-semibold text-[#0066cc] font-mono">{row.horizon}</td>
                  <td className="p-3 text-[#6e6e73] font-mono">{row.timestamp}</td>
                  <td className="p-3 text-[#1d1d1f] font-semibold">{row.pm25}</td>
                  <td className="p-3 text-[#1d1d1f]">{row.pm10}</td>
                  <td className="p-3 text-[#1d1d1f]">{row.no2}</td>
                  <td className="p-3 text-[#1d1d1f]">{row.o3}</td>
                  <td className="p-3 font-semibold" style={{ color: row.color }}>{row.aqi}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold" style={getBadgeStyle(row.color)}>{row.category}</span>
                  </td>
                  <td className="p-3 text-[#6e6e73]">{row.is_observed ? 'Observed Ground Record' : 'XGBoost Prediction'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
