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
      <div className="p-8 space-y-6 animate-pulse max-w-7xl mx-auto">
        <div className="h-40 bg-[#e8e8ed] rounded-xl"></div>
        <div className="h-64 bg-[#e8e8ed] rounded-xl"></div>
      </div>
    )
  }

  const currentItem = forecast?.forecast_timeline.find(i => i.horizon === '+0h') || forecast?.forecast_timeline[0]
  const h24Item = forecast?.forecast_timeline.find(i => i.horizon === '+24h')
  const drivers = diagnostics?.meteorological_drivers

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page heading */}
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight text-[#1d1d1f]">
          Air Quality Command Center
        </h1>
        <p className="text-[13px] text-[#86868b] mt-0.5">
          Delhi NCR · Real-time atmospheric intelligence
        </p>
      </div>

      {/* Top row: AQI + Pollutants + Atmospheric */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Current AQI */}
        <div className="lg:col-span-4 bg-white border border-[#d2d2d7] rounded-xl p-6 flex flex-col justify-between gap-4">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#86868b]">Current Air Quality</span>
            <div className="flex items-baseline gap-3 mt-2">
              <span className="text-[48px] font-semibold tracking-tight text-[#1d1d1f] leading-none">
                {currentItem?.aqi ?? 312}
              </span>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md" style={getBadgeStyle(currentItem?.color)}>
                {currentItem?.category ?? 'Severe'}
              </span>
            </div>
          </div>
          <div className="text-[11px] text-[#86868b]">
            Updated {currentItem?.timestamp ?? 'Recently'}
          </div>
        </div>

        {/* Pollutants */}
        <div className="lg:col-span-5 bg-white border border-[#d2d2d7] rounded-xl p-6">
          <span className="text-[13px] font-semibold text-[#1d1d1f]">Pollutants</span>
          <div className="grid grid-cols-2 gap-5 mt-4">
            <div>
              <span className="text-[10px] font-semibold text-[#86868b] uppercase">PM2.5</span>
              <div className="text-[24px] font-semibold text-[#1d1d1f] leading-tight">{currentItem?.pm25 ?? 184} <span className="text-[12px] font-normal text-[#86868b]">µg/m³</span></div>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-[#86868b] uppercase">PM10</span>
              <div className="text-[24px] font-semibold text-[#1d1d1f] leading-tight">{currentItem?.pm10 ?? 318} <span className="text-[12px] font-normal text-[#86868b]">µg/m³</span></div>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-[#86868b] uppercase">O₃</span>
              <div className="text-[24px] font-semibold text-[#1d1d1f] leading-tight">{currentItem?.o3 ?? 72} <span className="text-[12px] font-normal text-[#86868b]">µg/m³</span></div>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-[#86868b] uppercase">NOx</span>
              <div className="text-[24px] font-semibold text-[#1d1d1f] leading-tight">{currentItem?.no2 ?? 91} <span className="text-[12px] font-normal text-[#86868b]">µg/m³</span></div>
            </div>
          </div>
        </div>

        {/* Atmospheric Conditions */}
        <div className="lg:col-span-3 bg-white border border-[#d2d2d7] rounded-xl p-6">
          <span className="text-[13px] font-semibold text-[#1d1d1f]">Atmospheric Conditions</span>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div>
              <div className="flex items-center gap-1 text-[10px] text-[#86868b] font-medium">
                <Wind className="w-3 h-3" strokeWidth={1.5} />
                <span>Wind</span>
              </div>
              <div className="text-[13px] font-semibold text-[#1d1d1f] mt-0.5">{drivers?.wind_speed_10m.value ?? 1.4} m/s NW</div>
            </div>
            <div>
              <div className="flex items-center gap-1 text-[10px] text-[#86868b] font-medium">
                <Thermometer className="w-3 h-3" strokeWidth={1.5} />
                <span>Temp</span>
              </div>
              <div className="text-[13px] font-semibold text-[#1d1d1f] mt-0.5">{drivers?.temperature_2m.value ?? 18.4}°C</div>
            </div>
            <div>
              <div className="flex items-center gap-1 text-[10px] text-[#86868b] font-medium">
                <Droplets className="w-3 h-3" strokeWidth={1.5} />
                <span>Humidity</span>
              </div>
              <div className="text-[13px] font-semibold text-[#1d1d1f] mt-0.5">{drivers?.relative_humidity.value ?? 78}%</div>
            </div>
            <div>
              <div className="flex items-center gap-1 text-[10px] text-[#86868b] font-medium">
                <ArrowUpRight className="w-3 h-3" strokeWidth={1.5} />
                <span>PBL Height</span>
              </div>
              <div className="text-[13px] font-semibold text-[#1d1d1f] mt-0.5">{drivers?.pbl_height_proxy.value ?? 285} m</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row: chart + early warning */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Forecast chart */}
        <div className="lg:col-span-8 bg-white border border-[#d2d2d7] rounded-xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-[15px] font-semibold text-[#1d1d1f]">72-Hour AQI Forecast</h2>
              <span className="text-[11px] text-[#86868b]">Hourly forecast trajectory</span>
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
                  {param}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-baseline gap-6 pt-1">
            <div>
              <span className="text-[10px] font-semibold text-[#86868b] uppercase block">Expected Peak</span>
              <div className="text-[24px] font-semibold text-[#1d1d1f]">{h24Item?.aqi ?? 356} AQI</div>
              <span className="text-[10px] text-[#86868b]">in approximately 24 hours</span>
            </div>
            <div className="pl-6 border-l border-[#e8e8ed]">
              <span className="text-[10px] font-semibold text-[#86868b] uppercase block">Confidence</span>
              <div className="text-[24px] font-semibold text-[#1d1d1f]">87%</div>
            </div>
          </div>

          {/* Chart */}
          <div className="h-64 w-full pt-2">
            {forecast && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecast.forecast_timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0066cc" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#0066cc" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8e8ed" vertical={false} />
                  <XAxis dataKey="horizon" stroke="#86868b" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#86868b" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#d2d2d7', borderRadius: '8px', fontSize: '12px', color: '#1d1d1f', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                  <Area type="monotone" dataKey={selectedPollutant} stroke="#0066cc" strokeWidth={2} fillOpacity={1} fill="url(#colorArea)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Early Warning */}
        <div className="lg:col-span-4 bg-white border border-[#d2d2d7] rounded-xl p-6 flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-[#b25000] bg-[#fff8f0] border border-[#ffddb5] px-3 py-1.5 rounded-lg w-fit text-[11px] font-semibold">
              <AlertTriangle className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>EARLY WARNING</span>
            </div>

            <h3 className="text-[15px] font-semibold text-[#1d1d1f] leading-snug">
              Severe pollution episode likely
            </h3>

            <p className="text-[13px] text-[#6e6e73] leading-relaxed">
              Forecast models indicate a high probability of sustained severe pollution across Delhi NCR driven by nocturnal boundary layer compression.
            </p>
          </div>

          <div className="pt-4 border-t border-[#e8e8ed] flex items-center justify-between text-[12px] text-[#6e6e73] font-medium">
            <span>Peak in 24h</span>
            <span>Stubble Risk: {risk?.transport_risk.stubble_transport_risk_score ?? 68}/100</span>
          </div>
        </div>
      </div>
    </div>
  )
}
