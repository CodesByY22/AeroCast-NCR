import { Wind, Thermometer, Droplets, Compass, Layers, AlertCircle, Info } from 'lucide-react'
import { DiagnosticData } from '../api/client'

interface Props {
  diagnostics: DiagnosticData | null
  loading: boolean
}

export default function AtmospherePage({ diagnostics, loading }: Props) {
  if (loading && !diagnostics) {
    return <div className="p-8 text-center text-slate-400">Loading atmospheric diagnostics...</div>
  }

  const drivers = diagnostics?.meteorological_drivers
  const vent = diagnostics?.diagnostics.ventilation
  const inv = diagnostics?.diagnostics.inversion

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Wind className="w-6 h-6 text-cyan-400" />
          <span>Atmospheric Intelligence & Dispersion Diagnostics</span>
        </h2>
        <p className="text-xs text-slate-400">Coupled weather dynamics dictating surface pollutant accumulation vs. dispersion.</p>
      </div>

      {/* Surface Meteorology Grid */}
      {drivers && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Temperature */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-1">
            <span className="text-xs text-slate-400 font-semibold uppercase flex items-center gap-1.5">
              <Thermometer className="w-4 h-4 text-amber-400" /> Temperature (2m)
            </span>
            <div className="text-2xl font-bold text-slate-100">{drivers.temperature_2m.value} {drivers.temperature_2m.unit}</div>
          </div>

          {/* Humidity */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-1">
            <span className="text-xs text-slate-400 font-semibold uppercase flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-sky-400" /> Humidity (2m)
            </span>
            <div className="text-2xl font-bold text-slate-100">{drivers.relative_humidity.value} {drivers.relative_humidity.unit}</div>
          </div>

          {/* Wind Speed */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-1">
            <span className="text-xs text-slate-400 font-semibold uppercase flex items-center gap-1.5">
              <Wind className="w-4 h-4 text-cyan-400" /> Wind Speed (10m)
            </span>
            <div className="text-2xl font-bold text-slate-100">{drivers.wind_speed_10m.value} {drivers.wind_speed_10m.unit}</div>
          </div>

          {/* Wind Direction */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-1">
            <span className="text-xs text-slate-400 font-semibold uppercase flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-emerald-400" /> Wind Vector (10m)
            </span>
            <div className="text-2xl font-bold text-slate-100">{drivers.wind_direction_10m.value}° NW</div>
          </div>

          {/* PBL Height Proxy */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-1">
            <span className="text-xs text-slate-400 font-semibold uppercase flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-purple-400" /> PBL Height <span className="text-[9px] px-1 bg-amber-500/20 text-amber-300 rounded">PROXY</span>
            </span>
            <div className="text-2xl font-bold text-slate-100">{drivers.pbl_height_proxy.value} {drivers.pbl_height_proxy.unit}</div>
          </div>
        </div>
      )}

      {/* 2-Column Split: Ventilation Proxy Index & Thermal Inversion Proxy Index */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ventilation Index Proxy Card */}
        {vent && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-md font-bold text-slate-100 flex items-center gap-2">
                  <Wind className="w-5 h-5 text-cyan-400" />
                  <span>Ventilation Index Proxy (Vc)</span>
                </h3>
                <p className="text-xs text-slate-400 font-mono">Formula: Vc = Wind_Speed_10m × PBL_Height_Proxy</p>
              </div>
              <span className="text-xs px-2.5 py-1 bg-amber-500/20 text-amber-300 rounded-lg border border-amber-500/30 font-semibold">
                PROXY METRIC
              </span>
            </div>

            <div className="p-5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2 text-center">
              <span className="text-xs text-slate-400 font-medium">Calculated Ventilation Velocity</span>
              <div className="text-4xl font-extrabold text-slate-100">{vent.ventilation_index_proxy} <span className="text-sm text-slate-400 font-normal">m²/s</span></div>
              <p className="text-xs font-bold" style={{ color: vent.color }}>{vent.status}</p>
            </div>

            <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl text-xs text-slate-300 leading-relaxed space-y-2">
              <div className="flex items-center space-x-1.5 text-cyan-400 font-semibold">
                <Info className="w-4 h-4" />
                <span>Scientific Interpretation:</span>
              </div>
              <p>Higher ventilation velocity (Vc &gt; 6000 m²/s) promotes rapid vertical and horizontal pollutant dispersion. Lower ventilation velocity (Vc &lt; 2000 m²/s) suppresses atmospheric mixing, creating severe pollution traps near the ground.</p>
            </div>
          </div>
        )}

        {/* Thermal Inversion Proxy Index Card */}
        {inv && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-md font-bold text-slate-100 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-400" />
                  <span>Thermal Inversion Proxy Index</span>
                </h3>
                <p className="text-xs text-slate-400">Scale: 0 (Unstable / Mixed) to 100 (Strong Surface Trap)</p>
              </div>
              <span className="text-xs px-2.5 py-1 bg-amber-500/20 text-amber-300 rounded-lg border border-amber-500/30 font-semibold">
                PROXY METRIC
              </span>
            </div>

            <div className="p-5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2 text-center">
              <span className="text-xs text-slate-400 font-medium">Thermal Inversion Stability Score</span>
              <div className="text-4xl font-extrabold text-slate-100">{inv.inversion_proxy_index} <span className="text-sm text-slate-400 font-normal">/ 100</span></div>
              <p className="text-xs font-bold" style={{ color: inv.color }}>{inv.status}</p>
            </div>

            {/* Educational Tooltip Alert */}
            <div className="p-4 bg-slate-950/50 border border-amber-900/40 rounded-xl text-xs text-slate-300 leading-relaxed space-y-2">
              <div className="flex items-center space-x-1.5 text-amber-400 font-semibold">
                <Info className="w-4 h-4" />
                <span>Educational Physics Note:</span>
              </div>
              <p>“Temperature inversion occurs when warm air caps cooler surface air, suppressing vertical atmospheric mixing and trapping vehicle and crop smoke directly in the breathing zone.”</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
