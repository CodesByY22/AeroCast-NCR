import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import {
  WindIcon, CloudIcon, ArrowsRightLeftIcon, InformationCircleIcon
} from '@heroicons/react/24/outline'

export default function AtmospherePage({ diagnostics, loading }: { diagnostics: any, loading: boolean }) {
  if (loading && !diagnostics) return null

  const drivers = diagnostics?.meteorological_drivers

  return (
    <div className="p-10 max-w-6xl mx-auto space-y-12 pb-24">
      <div>
        <h1 className="text-[28px] font-light tracking-tight text-textMain">Atmospheric Boundary Layer</h1>
        <p className="text-[13px] text-textMuted mt-1">Meteorological drivers influencing pollutant dispersion.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="space-y-2">
          <span className="text-[10px] font-medium tracking-[0.1em] text-textMuted uppercase block">PBL Height</span>
          <div className="text-[40px] font-light text-textMain leading-none">{drivers?.pbl_height_proxy.value ?? 285}</div>
          <p className="text-[11px] text-textMuted">meters (estimated)</p>
        </div>
        <div className="space-y-2">
          <span className="text-[10px] font-medium tracking-[0.1em] text-textMuted uppercase block">Wind Vector</span>
          <div className="text-[40px] font-light text-textMain leading-none">{drivers?.wind_speed_10m.value ?? 1.4}</div>
          <p className="text-[11px] text-textMuted">m/s at {drivers?.wind_direction_10m.value}°</p>
        </div>
        <div className="space-y-2">
          <span className="text-[10px] font-medium tracking-[0.1em] text-textMuted uppercase block">Thermal</span>
          <div className="text-[40px] font-light text-textMain leading-none">{drivers?.temperature_2m.value ?? 18.4}°C</div>
          <p className="text-[11px] text-textMuted">{drivers?.relative_humidity.value ?? 78}% RH</p>
        </div>
        <div className="space-y-2">
          <span className="text-[10px] font-medium tracking-[0.1em] text-textMuted uppercase block">Ventilation Index</span>
          <div className="text-[40px] font-light text-[#ef4444] leading-none">Poor</div>
          <p className="text-[11px] text-textMuted">Stagnant conditions</p>
        </div>
      </div>
    </div>
  )
}
