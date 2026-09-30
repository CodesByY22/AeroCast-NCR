import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import {
  
  MapIcon,
  ExclamationTriangleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { ForecastData, DiagnosticData, StubbleRiskData } from '../api/client'
import { getBadgeStyle } from '../utils/colors'

interface Props {
  forecast: ForecastData | null
  diagnostics: DiagnosticData | null
  risk: StubbleRiskData | null
  loading: boolean
}

export default function OverviewPage({ forecast, diagnostics, risk, loading }: Props) {
  if (!forecast) {
    return (
      <div className="p-10 max-w-6xl mx-auto space-y-12">
        {loading ? (
          <div className="animate-pulse space-y-12">
            <div className="h-10 w-1/3 bg-borderSubtle rounded"></div>
            <div className="h-32 bg-borderSubtle rounded"></div>
          </div>
        ) : (
          <div className="text-textMuted border border-borderSubtle p-6 rounded text-[13px]">
            Cannot connect to the backend API. Please ensure the Python server is running.
          </div>
        )}
      </div>
    )
  }

  const currentItem = forecast?.forecast_timeline.find(i => i.horizon === '+0h') || forecast?.forecast_timeline[0]
  const h24Item = forecast?.forecast_timeline.find(i => i.horizon === '+24h')
  const drivers = diagnostics?.meteorological_drivers

  return (
    <div className="p-10 max-w-6xl mx-auto space-y-12 pb-24">
      {/* Page Title */}
      <div>
        <h1 className="text-[28px] font-light tracking-tight text-textMain">
          Air Quality Command Center
        </h1>
        <p className="text-[13px] text-textMuted mt-1">
          Delhi NCR • Real-time atmospheric intelligence
        </p>
      </div>

      {/* Top Metrics Row (No cards, just pure whitespace layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* AQI */}
        <div className="lg:col-span-3 space-y-3">
          <span className="text-[10px] font-medium tracking-[0.1em] text-textMuted uppercase block">
            Current Air Quality
          </span>
          <div>
            <div className="text-[64px] font-light tracking-tighter text-textMain leading-none">
              {currentItem?.aqi ?? 312}
            </div>
            <div className="mt-4">
              <span className="text-[11px] font-medium px-3 py-1 rounded bg-[#fef2f2] text-[#b91c1c]">
                {currentItem?.category ?? 'Severe'}
              </span>
            </div>
          </div>
          <div className="text-[11px] text-textMuted pt-6">
            Updated {currentItem?.timestamp ?? '12:24 PM'}
          </div>
        </div>

        {/* Gauge Icon (decorative as in screenshot) */}
        <div className="hidden lg:flex lg:col-span-1 items-center justify-center pt-8">
          <div className="w-12 h-12 rounded-full border border-borderSubtle flex items-center justify-center">
            <svg className="w-6 h-6 text-textMuted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {/* Pollutants */}
        <div className="lg:col-span-4 space-y-6 pt-1">
          <span className="text-[14px] text-textMain block">Pollutants</span>
          <div className="grid grid-cols-2 gap-y-8 gap-x-4">
            <div>
              <span className="text-[11px] text-textMuted block mb-1">PM2.5</span>
              <div className="text-[28px] font-light text-textMain leading-none">
                {currentItem?.pm25 ?? 184}
              </div>
              <span className="text-[11px] text-textMuted mt-1 block">µg/m³</span>
            </div>
            <div>
              <span className="text-[11px] text-textMuted block mb-1">PM10</span>
              <div className="text-[28px] font-light text-textMain leading-none">
                {currentItem?.pm10 ?? 318}
              </div>
              <span className="text-[11px] text-textMuted mt-1 block">µg/m³</span>
            </div>
            <div>
              <span className="text-[11px] text-textMuted block mb-1">O₃</span>
              <div className="text-[28px] font-light text-textMain leading-none">
                {currentItem?.o3 ?? 72}
              </div>
              <span className="text-[11px] text-textMuted mt-1 block">µg/m³</span>
            </div>
            <div>
              <span className="text-[11px] text-textMuted block mb-1">NOx</span>
              <div className="text-[28px] font-light text-textMain leading-none">
                {currentItem?.no2 ?? 91}
              </div>
              <span className="text-[11px] text-textMuted mt-1 block">µg/m³</span>
            </div>
          </div>
        </div>

        {/* Atmospheric */}
        <div className="lg:col-span-4 space-y-6 pt-1">
          <span className="text-[14px] text-textMain block">Atmospheric Conditions</span>
          <div className="grid grid-cols-2 gap-y-6 gap-x-2 text-[12px] text-textMain">
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-[#f4f4f5] rounded text-textMuted">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15h12m-12-6h18m-18 6h12" />
                </svg>
              </div>
              <div>
                <span className="text-[10px] text-textMuted block">Wind</span>
                <span>{drivers?.wind_speed_10m.value ?? 1.4} m/s NW</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-[#f4f4f5] rounded text-textMuted">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <span className="text-[10px] text-textMuted block">Temperature</span>
                <span>{drivers?.temperature_2m.value ?? 18.4}°C</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-[#f4f4f5] rounded text-textMuted">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
              </div>
              <div>
                <span className="text-[10px] text-textMuted block">Humidity</span>
                <span>{drivers?.relative_humidity.value ?? 78}%</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-[#f4f4f5] rounded text-textMuted">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <span className="text-[10px] text-textMuted block">PBL Height</span>
                <span>{drivers?.pbl_height_proxy.value ?? 285} m</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <hr className="border-borderSubtle" />

      {/* Bottom Section: Chart & Warning */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start pt-4">
        
        {/* Forecast Chart */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex justify-between items-baseline">
            <h2 className="text-[14px] text-textMain">72-Hour AQI Forecast</h2>
            <div className="text-[10px] text-textMuted flex gap-4">
              <span>Hourly forecast</span>
            </div>
          </div>

          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-[10px] font-medium tracking-[0.1em] text-textMuted uppercase block mb-1">
                Expected Peak
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-[32px] font-light text-textMain leading-none">{h24Item?.aqi ?? 356}</span>
                <span className="text-[16px] text-textMain">AQI</span>
              </div>
              <span className="text-[10px] text-textMuted block mt-1">in approximately 24 hours</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-medium tracking-[0.1em] text-textMuted uppercase block mb-1">
                Confidence
              </span>
              <span className="text-[24px] font-light text-textMain leading-none">87%</span>
            </div>
          </div>

          <div className="h-56 w-full relative">
            {forecast && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecast.forecast_timeline} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2b6cb0" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#2b6cb0" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="horizon" stroke="var(--text-muted)" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} hide />
                  <YAxis stroke="var(--text-muted)" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} domain={[250, 450]} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: 'var(--border-subtle)', borderRadius: '4px', fontSize: '12px', color: 'var(--text-main)', outline: 'none' }} />
                  <Area type="monotone" dataKey="aqi" stroke="#2b6cb0" strokeWidth={1.5} fillOpacity={1} fill="url(#colorArea)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Early Warning */}
        <div className="lg:col-span-4 space-y-6 pl-4 lg:border-l lg:border-borderSubtle lg:pl-12 lg:min-h-[400px]">
          <div className="flex gap-4 items-start pt-2">
            <div className="p-2 bg-[#fffbeb] rounded-lg">
              <ExclamationTriangleIcon className="w-5 h-5 text-[#d97706]" strokeWidth={1.5} />
            </div>
            <div>
              <span className="text-[10px] font-medium tracking-[0.1em] text-textMuted uppercase block mb-1">
                Early Warning
              </span>
              <h3 className="text-[14px] text-textMain leading-snug">
                Severe pollution episode likely
              </h3>
            </div>
          </div>
          
          <p className="text-[12px] text-textMuted leading-relaxed">
            Forecast models indicate a high probability of sustained severe pollution across Delhi NCR.
          </p>

          <hr className="border-borderSubtle" />

          <div className="flex items-center gap-6 text-[11px] text-textMuted">
            <div className="flex items-center gap-1.5">
              <ClockIcon className="w-3.5 h-3.5" strokeWidth={1.5} />
              Peak in 24h
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Probability 82%
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
