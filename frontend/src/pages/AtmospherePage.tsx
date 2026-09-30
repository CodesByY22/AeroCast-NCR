import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { Wind, Thermometer, Droplets, Compass, Layers, AlertCircle, Info } from 'lucide-react'
import { DiagnosticData } from '../api/client'

interface Props {
  diagnostics: DiagnosticData | null
  loading: boolean
}

export default function AtmospherePage({ diagnostics, loading }: Props) {
  if (loading && !diagnostics) {
    return <div className="p-8 text-center text-[#86868b]">Loading atmospheric intelligence...</div>
  }

  const drivers = diagnostics?.meteorological_drivers
  const vent = diagnostics?.diagnostics.ventilation
  const inv = diagnostics?.diagnostics.inversion

  const meteoSeries = [
    { hour: '00:00', temp: 14, wind: 1.8 },
    { hour: '04:00', temp: 12, wind: 1.4 },
    { hour: '08:00', temp: 16, wind: 2.1 },
    { hour: '12:00', temp: 24, wind: 3.8 },
    { hour: '16:00', temp: 22, wind: 3.2 },
    { hour: '20:00', temp: 17, wind: 2.0 },
    { hour: '24:00', temp: 15, wind: 1.6 }
  ]

  const pblSeries = [
    { hour: '00:00', pbl: 250 },
    { hour: '04:00', pbl: 180 },
    { hour: '08:00', pbl: 320 },
    { hour: '12:00', pbl: 850 },
    { hour: '16:00', pbl: 720 },
    { hour: '20:00', pbl: 380 },
    { hour: '24:00', pbl: 280 }
  ]

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight text-[#1d1d1f]">Atmospheric Intelligence</h1>
          <p className="text-[13px] text-[#86868b] mt-0.5">Meteorological and boundary-layer conditions influencing pollution dispersion</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#fff8f0] text-[#b25000] border border-[#ffddb5] text-[11px] font-semibold w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ff9f0a]"></span>
          <span>Stable / Inversion Regime</span>
        </div>
      </div>

      {/* 6 KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white border border-[#d2d2d7] rounded-xl p-4 space-y-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#86868b] flex items-center gap-1">
            <Thermometer className="w-3 h-3" strokeWidth={1.5} /> Temperature
          </span>
          <div className="text-[22px] font-semibold tracking-tight text-[#1d1d1f]">{drivers?.temperature_2m.value ?? 16.2} <span className="text-[12px] font-normal text-[#86868b]">°C</span></div>
          <span className="text-[10px] font-medium text-[#6e6e73]">Cool</span>
        </div>

        <div className="bg-white border border-[#d2d2d7] rounded-xl p-4 space-y-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#86868b] flex items-center gap-1">
            <Droplets className="w-3 h-3" strokeWidth={1.5} /> Humidity
          </span>
          <div className="text-[22px] font-semibold tracking-tight text-[#1d1d1f]">{drivers?.relative_humidity.value ?? 78} <span className="text-[12px] font-normal text-[#86868b]">%</span></div>
          <span className="text-[10px] font-medium text-[#6e6e73]">High</span>
        </div>

        <div className="bg-white border border-[#d2d2d7] rounded-xl p-4 space-y-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#86868b] flex items-center gap-1">
            <Wind className="w-3 h-3" strokeWidth={1.5} /> Wind Speed
          </span>
          <div className="text-[22px] font-semibold tracking-tight text-[#1d1d1f]">{drivers?.wind_speed_10m.value ?? 2.1} <span className="text-[12px] font-normal text-[#86868b]">m/s</span></div>
          <span className="text-[10px] font-medium text-[#6e6e73]">Weak</span>
        </div>

        <div className="bg-white border border-[#d2d2d7] rounded-xl p-4 space-y-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#86868b] flex items-center gap-1">
            <Compass className="w-3 h-3" strokeWidth={1.5} /> Wind Direction
          </span>
          <div className="text-[22px] font-semibold tracking-tight text-[#1d1d1f]">{drivers?.wind_direction_10m.value ?? 18} <span className="text-[12px] font-normal text-[#86868b]">°</span></div>
          <span className="text-[10px] font-medium text-[#6e6e73]">NNE</span>
        </div>

        <div className="bg-white border border-[#d2d2d7] rounded-xl p-4 space-y-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#86868b] flex items-center gap-1">
            <Layers className="w-3 h-3" strokeWidth={1.5} /> PBL Height
          </span>
          <div className="text-[22px] font-semibold tracking-tight text-[#1d1d1f]">{drivers?.pbl_height_proxy.value ?? 280} <span className="text-[12px] font-normal text-[#86868b]">m</span></div>
          <span className="text-[10px] font-medium text-[#6e6e73]">Low</span>
        </div>

        <div className="bg-white border border-[#d2d2d7] rounded-xl p-4 space-y-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#86868b] flex items-center gap-1">
            <AlertCircle className="w-3 h-3" strokeWidth={1.5} /> Inversion
          </span>
          <div className="text-[22px] font-semibold tracking-tight text-[#1d1d1f]">3.2 <span className="text-[12px] font-normal text-[#86868b]">°C/km</span></div>
          <span className="text-[10px] font-medium text-[#6e6e73]">Strong</span>
        </div>
      </div>

      {/* Regime banner */}
      <div className="bg-white border border-[#d2d2d7] rounded-xl p-6 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#86868b]">Current Atmospheric Regime</span>
          <div className="text-right">
            <span className="text-[10px] text-[#86868b] uppercase font-medium block">Severity</span>
            <span className="text-[12px] font-semibold text-[#b25000]">High</span>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#fff8f0] text-[#b25000] border border-[#ffddb5] flex items-center justify-center font-semibold shrink-0 mt-0.5">!</div>
          <div>
            <h2 className="text-[15px] font-semibold text-[#1d1d1f]">Stable / Inversion</h2>
            <p className="text-[13px] text-[#6e6e73] leading-relaxed mt-1">
              Stable atmospheric conditions are limiting vertical mixing and increasing near-surface pollutant accumulation across Delhi NCR.
            </p>
          </div>
        </div>
      </div>

      {/* Ventilation and Inversion cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {vent && (
          <div className="bg-white border border-[#d2d2d7] rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[15px] font-semibold text-[#1d1d1f] flex items-center gap-2">
                  <Wind className="w-4 h-4 text-[#0066cc]" strokeWidth={1.5} />
                  Ventilation Index Proxy (Vc)
                </h3>
                <p className="text-[11px] text-[#86868b] font-mono mt-0.5">Formula: Vc = Wind_Speed_10m × PBL_Height_Proxy</p>
              </div>
              <span className="text-[10px] px-2 py-1 bg-[#fff8f0] text-[#b25000] rounded-md border border-[#ffddb5] font-medium">PROXY</span>
            </div>

            <div className="p-5 bg-[#f5f5f7] border border-[#e8e8ed] rounded-lg space-y-1 text-center">
              <span className="text-[12px] text-[#6e6e73]">Calculated Ventilation Velocity</span>
              <div className="text-[36px] font-semibold text-[#1d1d1f]">{vent.ventilation_index_proxy} <span className="text-[14px] text-[#6e6e73] font-normal">m²/s</span></div>
              <p className="text-[12px] font-semibold" style={{ color: vent.color }}>{vent.status}</p>
            </div>

            <div className="p-4 bg-[#f5f5f7] border border-[#e8e8ed] rounded-lg text-[12px] text-[#6e6e73] leading-relaxed space-y-1.5">
              <div className="flex items-center gap-1 text-[#0066cc] font-medium">
                <Info className="w-3.5 h-3.5" strokeWidth={1.5} />
                Scientific Interpretation:
              </div>
              <p>Higher ventilation velocity (Vc &gt; 6000 m²/s) promotes rapid vertical and horizontal pollutant dispersion. Lower ventilation velocity (Vc &lt; 2000 m²/s) suppresses atmospheric mixing, creating severe pollution traps near the ground.</p>
            </div>
          </div>
        )}

        {inv && (
          <div className="bg-white border border-[#d2d2d7] rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[15px] font-semibold text-[#1d1d1f] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-[#b25000]" strokeWidth={1.5} />
                  Thermal Inversion Proxy Index
                </h3>
                <p className="text-[11px] text-[#86868b] mt-0.5">Scale: 0 (Unstable / Mixed) to 100 (Strong Surface Trap)</p>
              </div>
              <span className="text-[10px] px-2 py-1 bg-[#fff8f0] text-[#b25000] rounded-md border border-[#ffddb5] font-medium">PROXY</span>
            </div>

            <div className="p-5 bg-[#f5f5f7] border border-[#e8e8ed] rounded-lg space-y-1 text-center">
              <span className="text-[12px] text-[#6e6e73]">Thermal Inversion Stability Score</span>
              <div className="text-[36px] font-semibold text-[#1d1d1f]">{inv.inversion_proxy_index} <span className="text-[14px] text-[#6e6e73] font-normal">/ 100</span></div>
              <p className="text-[12px] font-semibold" style={{ color: inv.color }}>{inv.status}</p>
            </div>

            <div className="p-4 bg-[#fff8f0] border border-[#ffddb5] rounded-lg text-[12px] text-[#6e6e73] leading-relaxed space-y-1.5">
              <div className="flex items-center gap-1 text-[#b25000] font-medium">
                <Info className="w-3.5 h-3.5" strokeWidth={1.5} />
                Educational Physics Note:
              </div>
              <p>"Temperature inversion occurs when warm air caps cooler surface air, suppressing vertical atmospheric mixing and trapping vehicle and crop smoke directly in the breathing zone."</p>
            </div>
          </div>
        )}
      </div>

      {/* Two charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white border border-[#d2d2d7] rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#e8e8ed] pb-3">
            <div>
              <h2 className="text-[14px] font-semibold text-[#1d1d1f]">Meteorological Conditions</h2>
              <p className="text-[11px] text-[#86868b]">Temperature and wind evolution</p>
            </div>
            <span className="text-[10px] font-medium text-[#6e6e73] px-2 py-0.5 rounded-md bg-[#f5f5f7] border border-[#e8e8ed]">24H</span>
          </div>
          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={meteoSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="meteoColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0066cc" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#0066cc" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8e8ed" vertical={false} />
                <XAxis dataKey="hour" stroke="#86868b" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#86868b" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#d2d2d7', borderRadius: '8px', fontSize: '12px', color: '#1d1d1f' }} />
                <Area type="monotone" dataKey="temp" stroke="#0066cc" strokeWidth={2} fillOpacity={1} fill="url(#meteoColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-[#d2d2d7] rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#e8e8ed] pb-3">
            <div>
              <h2 className="text-[14px] font-semibold text-[#1d1d1f]">Boundary Layer Height</h2>
              <p className="text-[11px] text-[#86868b]">Vertical mixing potential</p>
            </div>
            <span className="text-[10px] font-medium text-[#6e6e73] px-2 py-0.5 rounded-md bg-[#f5f5f7] border border-[#e8e8ed]">PBLH</span>
          </div>
          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={pblSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="pblColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0066cc" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#0066cc" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8e8ed" vertical={false} />
                <XAxis dataKey="hour" stroke="#86868b" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#86868b" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#d2d2d7', borderRadius: '8px', fontSize: '12px', color: '#1d1d1f' }} />
                <Area type="monotone" dataKey="pbl" stroke="#0066cc" strokeWidth={2} fillOpacity={1} fill="url(#pblColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
