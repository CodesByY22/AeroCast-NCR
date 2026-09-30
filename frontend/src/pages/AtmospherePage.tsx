import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
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

  // Mock time series for meteorological evolution & PBL height curves
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

        <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold w-fit">
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          <span>Stable / Inversion</span>
        </div>
      </div>

      {/* Top 6 KPI Metric Cards Grid - Clean White Theme */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* TEMPERATURE */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-2 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">T TEMPERATURE</span>
          <div className="text-2xl font-extrabold tracking-tight text-slate-900">{drivers?.temperature_2m.value ?? 16.2} <span className="text-xs font-normal text-slate-400">°C</span></div>
          <span className="inline-block text-[10px] font-bold text-slate-500">Cool</span>
        </div>

        {/* HUMIDITY */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-2 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">H HUMIDITY</span>
          <div className="text-2xl font-extrabold tracking-tight text-slate-900">{drivers?.relative_humidity.value ?? 78} <span className="text-xs font-normal text-slate-400">%</span></div>
          <span className="inline-block text-[10px] font-bold text-slate-500">High</span>
        </div>

        {/* WIND SPEED */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-2 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">W WIND SPEED</span>
          <div className="text-2xl font-extrabold tracking-tight text-slate-900">{drivers?.wind_speed_10m.value ?? 2.1} <span className="text-xs font-normal text-slate-400">m/s</span></div>
          <span className="inline-block text-[10px] font-bold text-slate-500">Weak</span>
        </div>

        {/* WIND DIRECTION */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-2 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">↗ WIND DIRECTION</span>
          <div className="text-2xl font-extrabold tracking-tight text-slate-900">{drivers?.wind_direction_10m.value ?? 18} <span className="text-xs font-normal text-slate-400">°</span></div>
          <span className="inline-block text-[10px] font-bold text-slate-500">NNE</span>
        </div>

        {/* PBL HEIGHT */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-2 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">↕ PBL HEIGHT</span>
          <div className="text-2xl font-extrabold tracking-tight text-slate-900">{drivers?.pbl_height_proxy.value ?? 280} <span className="text-xs font-normal text-slate-400">m</span></div>
          <span className="inline-block text-[10px] font-bold text-slate-500">Low</span>
        </div>

        {/* INVERSION */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-2 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Δ INVERSION</span>
          <div className="text-2xl font-extrabold tracking-tight text-slate-900">3.2 <span className="text-xs font-normal text-slate-400">°C/km</span></div>
          <span className="inline-block text-[10px] font-bold text-slate-500">Strong</span>
        </div>
      </div>

      {/* Middle Regime Warning Banner - Clean White Theme */}
      <div className="bg-white border border-slate-200/80 text-slate-900 rounded-2xl p-6 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">CURRENT ATMOSPHERIC REGIME</span>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">SEVERITY</span>
            <span className="text-xs font-extrabold text-amber-600">High</span>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <div className="w-7 h-7 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center font-bold shrink-0 mt-0.5">
            !
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900">Stable / Inversion</h2>
            <p className="text-xs text-slate-500 leading-relaxed font-sans">
              Stable atmospheric conditions are limiting vertical mixing and increasing near-surface pollutant accumulation across the Delhi NCR region.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom 2 Charts Grid - Clean White Theme */}
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
                  <linearGradient id="meteoColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="hour" stroke="#94a3b8" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '10px', fontSize: '12px', color: '#0f172a' }} />
                <Area type="monotone" dataKey="temp" stroke="#0284c7" strokeWidth={2.5} fillOpacity={1} fill="url(#meteoColor)" />
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
                  <linearGradient id="pblColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="hour" stroke="#94a3b8" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '10px', fontSize: '12px', color: '#0f172a' }} />
                <Area type="monotone" dataKey="pbl" stroke="#0284c7" strokeWidth={2.5} fillOpacity={1} fill="url(#pblColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
