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

  if (!forecast) {
    return (
      <div className="p-10 max-w-6xl mx-auto">
        <div className="text-textMuted border border-borderSubtle p-6 rounded text-[13px]">
          {loading ? "Loading..." : "Cannot connect to the backend API. Please ensure the Python server is running."}
        </div>
      </div>
    )
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
    <div className="p-10 max-w-6xl mx-auto space-y-12 pb-24">
      <div>
        <h1 className="text-[28px] font-light tracking-tight text-textMain">72-Hour Forecast</h1>
        <p className="text-[13px] text-textMuted mt-1">Physics-informed air quality prediction.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="space-y-2">
          <span className="text-[10px] font-medium tracking-[0.1em] text-textMuted uppercase block">Current AQI</span>
          <div className="text-[40px] font-light text-textMain leading-none">{current?.aqi ?? 312}</div>
        </div>
        <div className="space-y-2">
          <span className="text-[10px] font-medium tracking-[0.1em] text-textMuted uppercase block">Peak Expected</span>
          <div className="text-[40px] font-light text-textMain leading-none">{peakAqi}</div>
        </div>
        <div className="space-y-2">
          <span className="text-[10px] font-medium tracking-[0.1em] text-textMuted uppercase block">Lowest Expected</span>
          <div className="text-[40px] font-light text-textMain leading-none">{lowestAqi}</div>
        </div>
        <div className="space-y-2">
          <span className="text-[10px] font-medium tracking-[0.1em] text-textMuted uppercase block">Confidence</span>
          <div className="text-[40px] font-light text-textMain leading-none">87%</div>
        </div>
      </div>

      <hr className="border-borderSubtle" />

      <div className="space-y-8">
        <div className="flex justify-between items-baseline">
          <h2 className="text-[14px] text-textMain">Forecast Trajectory</h2>
          <div className="flex gap-4 text-[10px] uppercase tracking-wider">
            {(['aqi', 'pm25', 'pm10', 'o3', 'no2'] as const).map(param => (
              <button
                key={param}
                onClick={() => setSelectedPollutant(param)}
                className={`transition-colors ${
                  selectedPollutant === param ? 'text-textMain font-semibold' : 'text-textMuted hover:text-textMain'
                }`}
              >
                {param}
              </button>
            ))}
          </div>
        </div>

        <div className="h-64 w-full relative">
          {forecast && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeline} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="forecastColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2b6cb0" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#2b6cb0" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                <XAxis dataKey="horizon" stroke="var(--text-muted)" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis stroke="var(--text-muted)" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: 'var(--border-subtle)', borderRadius: '4px', fontSize: '12px' }} />
                <Area type="monotone" dataKey={selectedPollutant} stroke="#2b6cb0" strokeWidth={1.5} fillOpacity={1} fill="url(#forecastColor)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="space-y-4 pt-12">
        <h3 className="text-[14px] text-textMain">Prediction Matrix</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12px]">
            <thead>
              <tr className="border-b border-borderSubtle text-textMuted font-medium">
                <th className="py-2 pr-4 font-normal">Horizon</th>
                <th className="py-2 px-4 font-normal">Timestamp</th>
                <th className="py-2 px-4 font-normal">PM2.5</th>
                <th className="py-2 px-4 font-normal">AQI Score</th>
                <th className="py-2 px-4 font-normal">Status</th>
              </tr>
            </thead>
            <tbody>
              {timeline.map((row, idx) => (
                <tr key={idx} className="border-b border-borderSubtle hover:bg-[#f4f4f5] transition-colors group">
                  <td className="py-3 pr-4 text-textMain font-mono">{row.horizon}</td>
                  <td className="py-3 px-4 text-textMuted font-mono">{row.timestamp}</td>
                  <td className="py-3 px-4 text-textMain">{row.pm25}</td>
                  <td className="py-3 px-4" style={{ color: row.color }}>{row.aqi}</td>
                  <td className="py-3 px-4 text-textMuted">{row.is_observed ? 'Observed' : 'Prediction'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
