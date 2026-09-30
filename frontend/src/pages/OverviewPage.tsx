import { useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { Wind, Thermometer, Droplets, ArrowUpRight, AlertTriangle } from 'lucide-react'
import { ForecastData, DiagnosticData, StubbleRiskData } from '../api/client'
import { getBadgeStyle } from '../utils/colors'

interface Props {
  forecast: ForecastData | null
  diagnostics: DiagnosticData | null
  risk: StubbleRiskData | null
  loading: boolean
}

export default function OverviewPage({ forecast, diagnostics, risk, loading }: Props) {
  const [selectedPollutant, setSelectedPollutant] = useState<'aqi' | 'pm25' | 'pm10' | 'o3' | 'no2'>('aqi')

  if (loading && !forecast) {
    return (
      <div className="p-8 space-y-6 animate-pulse font-sans max-w-7xl mx-auto">
        <div className="h-40 bg-slate-100 rounded-2xl"></div>
        <div className="h-64 bg-slate-100 rounded-2xl"></div>
      </div>
    )
  }

  const currentItem = forecast?.forecast_timeline.find(i => i.horizon === '+0h') || forecast?.forecast_timeline[0]
  const h24Item = forecast?.forecast_timeline.find(i => i.horizon === '+24h')
  const drivers = diagnostics?.meteorological_drivers

  return (
    <div className="p-8 space-y-8 font-sans max-w-7xl mx-auto">
      {/* Top Header Section */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Air Quality Command Center
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Delhi NCR • Real-time atmospheric intelligence
        </p>
      </div>

      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CURRENT AIR QUALITY Card */}
        <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">CURRENT AIR QUALITY</span>
            <div className="flex items-baseline space-x-3 pt-1">
              <span className="text-5xl font-extrabold tracking-tight text-slate-900">
                {currentItem?.aqi ?? 312}
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded shadow-2xs" style={getBadgeStyle(currentItem?.color)}>
                {currentItem?.category ?? 'Severe'}
              </span>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 font-medium">
            Updated {currentItem?.timestamp ?? 'Recently'}
          </div>
        </div>

        {/* Pollutants Breakdown Grid (4 Columns) */}
        <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
          <span className="text-xs font-bold text-slate-700">Pollutants</span>
          <div className="grid grid-cols-2 gap-4 pt-1">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase">PM2.5</span>
              <div className="text-2xl font-bold text-slate-900">{currentItem?.pm25 ?? 184} <span className="text-xs font-normal text-slate-400">µg/m³</span></div>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase">PM10</span>
              <div className="text-2xl font-bold text-slate-900">{currentItem?.pm10 ?? 318} <span className="text-xs font-normal text-slate-400">µg/m³</span></div>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase">O₃</span>
              <div className="text-2xl font-bold text-slate-900">{currentItem?.o3 ?? 72} <span className="text-xs font-normal text-slate-400">µg/m³</span></div>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase">NOx</span>
              <div className="text-2xl font-bold text-slate-900">{currentItem?.no2 ?? 91} <span className="text-xs font-normal text-slate-400">µg/m³</span></div>
            </div>
          </div>
        </div>

        {/* Atmospheric Conditions Summary */}
        <div className="lg:col-span-3 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
          <span className="text-xs font-bold text-slate-700">Atmospheric Conditions</span>
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 font-semibold">
                <Wind className="w-3.5 h-3.5" />
                <span>Wind</span>
              </div>
              <div className="text-xs font-bold text-slate-800">{drivers?.wind_speed_10m.value ?? 1.4} m/s NW</div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 font-semibold">
                <Thermometer className="w-3.5 h-3.5" />
                <span>Temp</span>
              </div>
              <div className="text-xs font-bold text-slate-800">{drivers?.temperature_2m.value ?? 18.4}°C</div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 font-semibold">
                <Droplets className="w-3.5 h-3.5" />
                <span>Humidity</span>
              </div>
              <div className="text-xs font-bold text-slate-800">{drivers?.relative_humidity.value ?? 78}%</div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 font-semibold">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>PBL Height</span>
              </div>
              <div className="text-xs font-bold text-slate-800">{drivers?.pbl_height_proxy.value ?? 285} m</div>
            </div>
          </div>
        </div>
      </div>

      {/* 72-Hour AQI Forecast Curve & Early Warning Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Main 72-Hour Curve (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-900">72-Hour AQI Forecast</h2>
              <span className="text-[11px] text-slate-400">Hourly forecast trajectory</span>
            </div>

            <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl">
              {(['aqi', 'pm25', 'pm10', 'o3', 'no2'] as const).map(param => (
                <button
                  key={param}
                  onClick={() => setSelectedPollutant(param)}
                  className={`text-[11px] px-3 py-1 rounded-lg font-bold uppercase transition ${
                    selectedPollutant === param ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {param}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-baseline space-x-4 pt-2">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">EXPECTED PEAK</span>
              <div className="text-2xl font-bold text-slate-900">{h24Item?.aqi ?? 356} AQI</div>
              <span className="text-[10px] text-slate-400">in approximately 24 hours</span>
            </div>

            <div className="pl-6 border-l border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">CONFIDENCE</span>
              <div className="text-2xl font-bold text-slate-900">87%</div>
            </div>
          </div>

          {/* Area Chart */}
          <div className="h-64 w-full pt-4">
            {forecast && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecast.forecast_timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0284c7" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="horizon" stroke="#94a3b8" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px', color: '#0f172a' }} />
                  <Area type="monotone" dataKey={selectedPollutant} stroke="#0284c7" strokeWidth={3} fillOpacity={1} fill="url(#colorArea)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Early Warning Card (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl w-fit text-xs font-bold">
              <AlertTriangle className="w-4 h-4" />
              <span>EARLY WARNING</span>
            </div>

            <h3 className="text-base font-bold text-slate-900 leading-tight">
              Severe pollution episode likely
            </h3>

            <p className="text-xs text-slate-500 leading-relaxed font-sans">
              Forecast models indicate a high probability of sustained severe pollution across Delhi NCR driven by nocturnal boundary layer compression.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
            <span>Peak in 24h</span>
            <span>Stubble Risk: {risk?.transport_risk.stubble_transport_risk_score ?? 68}/100</span>
          </div>
        </div>
      </div>
    </div>
  )
}
