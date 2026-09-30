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
    return <div className="p-8 text-center text-slate-500 font-sans">Loading atmospheric intelligence...</div>
  }

  const drivers = diagnostics?.meteorological_drivers
  const vent = diagnostics?.diagnostics.ventilation
  const inv = diagnostics?.diagnostics.inversion

  // Time series for meteorological evolution & PBL height curves
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
    <div className="p-8 space-y-8 font-sans max-w-7xl mx-auto">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Atmospheric Intelligence</h1>
          <p className="text-xs text-slate-500 mt-1">Meteorological and boundary-layer conditions influencing pollution dispersion</p>
        </div>

        <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-[#0f172a] text-white text-xs font-bold w-fit shadow-xs">
          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          <span>Stable / Inversion</span>
        </div>
      </div>

      {/* Top 6 KPI Metric Cards Grid - Matches Overview Theme Exactly */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* TEMPERATURE */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-2 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Thermometer className="w-3.5 h-3.5 text-slate-500" /> TEMPERATURE
          </span>
          <div className="text-2xl font-extrabold tracking-tight text-slate-900">{drivers?.temperature_2m.value ?? 16.2} <span className="text-xs font-normal text-slate-400">°C</span></div>
          <span className="inline-block text-[10px] font-bold text-slate-500">Cool</span>
        </div>

        {/* HUMIDITY */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-2 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Droplets className="w-3.5 h-3.5 text-slate-500" /> HUMIDITY
          </span>
          <div className="text-2xl font-extrabold tracking-tight text-slate-900">{drivers?.relative_humidity.value ?? 78} <span className="text-xs font-normal text-slate-400">%</span></div>
          <span className="inline-block text-[10px] font-bold text-slate-500">High</span>
        </div>

        {/* WIND SPEED */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-2 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Wind className="w-3.5 h-3.5 text-slate-500" /> WIND SPEED
          </span>
          <div className="text-2xl font-extrabold tracking-tight text-slate-900">{drivers?.wind_speed_10m.value ?? 2.1} <span className="text-xs font-normal text-slate-400">m/s</span></div>
          <span className="inline-block text-[10px] font-bold text-slate-500">Weak</span>
        </div>

        {/* WIND DIRECTION */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-2 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-slate-500" /> WIND DIRECTION
          </span>
          <div className="text-2xl font-extrabold tracking-tight text-slate-900">{drivers?.wind_direction_10m.value ?? 18} <span className="text-xs font-normal text-slate-400">°</span></div>
          <span className="inline-block text-[10px] font-bold text-slate-500">NNE</span>
        </div>

        {/* PBL HEIGHT */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-2 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-slate-500" /> PBL HEIGHT
          </span>
          <div className="text-2xl font-extrabold tracking-tight text-slate-900">{drivers?.pbl_height_proxy.value ?? 280} <span className="text-xs font-normal text-slate-400">m</span></div>
          <span className="inline-block text-[10px] font-bold text-slate-500">Low</span>
        </div>

        {/* INVERSION */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-2 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-slate-500" /> INVERSION
          </span>
          <div className="text-2xl font-extrabold tracking-tight text-slate-900">3.2 <span className="text-xs font-normal text-slate-400">°C/km</span></div>
          <span className="inline-block text-[10px] font-bold text-slate-500">Strong</span>
        </div>
      </div>

      {/* Middle Regime Warning Banner */}
      <div className="bg-white border border-slate-200/80 text-slate-900 rounded-2xl p-6 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">CURRENT ATMOSPHERIC REGIME</span>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">SEVERITY</span>
            <span className="text-xs font-extrabold text-amber-600">High</span>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-200 flex items-center justify-center font-extrabold shrink-0 mt-0.5">
            !
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900">Stable / Inversion</h2>
            <p className="text-xs text-slate-500 leading-relaxed font-sans">
              Stable atmospheric conditions are limiting vertical mixing and increasing near-surface pollutant accumulation across Delhi NCR.
            </p>
          </div>
        </div>
      </div>

      {/* 2-Column Split: Ventilation Proxy & Thermal Inversion Detail Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ventilation Index Proxy Card */}
        {vent && (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-md font-bold text-slate-900 flex items-center gap-2">
                  <Wind className="w-5 h-5 text-[#0284c7]" />
                  <span>Ventilation Index Proxy (Vc)</span>
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">Formula: Vc = Wind_Speed_10m × PBL_Height_Proxy</p>
              </div>
              <span className="text-xs px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg border border-amber-200 font-semibold">
                PROXY METRIC
              </span>
            </div>

            <div className="p-5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2 text-center">
              <span className="text-xs text-slate-500 font-medium">Calculated Ventilation Velocity</span>
              <div className="text-4xl font-extrabold text-slate-900">{vent.ventilation_index_proxy} <span className="text-sm text-slate-500 font-normal">m²/s</span></div>
              <p className="text-xs font-bold" style={{ color: vent.color }}>{vent.status}</p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-600 leading-relaxed space-y-2">
              <div className="flex items-center space-x-1.5 text-[#0284c7] font-semibold">
                <Info className="w-4 h-4" />
                <span>Scientific Interpretation:</span>
              </div>
              <p>Higher ventilation velocity (Vc &gt; 6000 m²/s) promotes rapid vertical and horizontal pollutant dispersion. Lower ventilation velocity (Vc &lt; 2000 m²/s) suppresses atmospheric mixing, creating severe pollution traps near the ground.</p>
            </div>
          </div>
        )}

        {/* Thermal Inversion Proxy Index Card */}
        {inv && (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-md font-bold text-slate-900 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  <span>Thermal Inversion Proxy Index</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Scale: 0 (Unstable / Mixed) to 100 (Strong Surface Trap)</p>
              </div>
              <span className="text-xs px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg border border-amber-200 font-semibold">
                PROXY METRIC
              </span>
            </div>

            <div className="p-5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2 text-center">
              <span className="text-xs text-slate-500 font-medium">Thermal Inversion Stability Score</span>
              <div className="text-4xl font-extrabold text-slate-900">{inv.inversion_proxy_index} <span className="text-sm text-slate-500 font-normal">/ 100</span></div>
              <p className="text-xs font-bold" style={{ color: inv.color }}>{inv.status}</p>
            </div>

            <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl text-xs text-slate-700 leading-relaxed space-y-2">
              <div className="flex items-center space-x-1.5 text-amber-700 font-semibold">
                <Info className="w-4 h-4" />
                <span>Educational Physics Note:</span>
              </div>
              <p>“Temperature inversion occurs when warm air caps cooler surface air, suppressing vertical atmospheric mixing and trapping vehicle and crop smoke directly in the breathing zone.”</p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom 2 Area Charts Grid - Matches Overview Theme Exactly */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Meteorological Conditions Chart */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Meteorological Conditions</h2>
              <p className="text-xs text-slate-400">Temperature and wind evolution</p>
            </div>
            <span className="text-[10px] font-bold text-slate-600 px-2 py-0.5 rounded bg-slate-100">24H</span>
          </div>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={meteoSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="meteoColorOverview" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="hour" stroke="#94a3b8" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '10px', fontSize: '12px', color: '#0f172a' }} />
                <Area type="monotone" dataKey="temp" stroke="#0284c7" strokeWidth={2.5} fillOpacity={1} fill="url(#meteoColorOverview)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Boundary Layer Height Chart */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Boundary Layer Height</h2>
              <p className="text-xs text-slate-400">Vertical mixing potential</p>
            </div>
            <span className="text-[10px] font-bold text-slate-600 px-2 py-0.5 rounded bg-slate-100">PBLH</span>
          </div>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={pblSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="pblColorOverview" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="hour" stroke="#94a3b8" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '10px', fontSize: '12px', color: '#0f172a' }} />
                <Area type="monotone" dataKey="pbl" stroke="#0284c7" strokeWidth={2.5} fillOpacity={1} fill="url(#pblColorOverview)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
