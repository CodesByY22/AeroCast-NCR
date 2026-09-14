import { Flame, Compass, ArrowDown, MapPin, Info } from 'lucide-react'
import { StubbleRiskData } from '../api/client'

interface Props {
  risk: StubbleRiskData | null
  loading: boolean
}

export default function StubblePage({ risk, loading }: Props) {
  if (loading && !risk) {
    return <div className="p-8 text-center text-slate-400">Loading NASA FIRMS satellite fire detections...</div>
  }

  const transport = risk?.transport_risk
  const hotspots = risk?.active_fire_hotspots || []

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Flame className="w-6 h-6 text-amber-400" />
          <span>Regional Stubble Burning & Smoke Transport Intelligence</span>
        </h2>
        <p className="text-xs text-slate-400">NASA FIRMS satellite active fire detections (VIIRS 375m / MODIS) matched with upwind surface wind direction vectors.</p>
      </div>

      {/* Regional Transport Risk Summary Bar */}
      {transport && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-2">
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
              Transport Risk Score <span className="text-[9px] px-1 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">PROXY</span>
            </span>
            <div className="text-3xl font-extrabold" style={{ color: transport.color }}>
              {transport.stubble_transport_risk_score} <span className="text-xs text-slate-400 font-normal">/ 100</span>
            </div>
            <p className="text-xs font-bold" style={{ color: transport.color }}>{transport.category}</p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-1 text-center">
            <span className="text-xs text-slate-400 font-semibold uppercase">Upwind Active Fires</span>
            <div className="text-2xl font-bold text-amber-400">{transport.fire_count_200km}</div>
            <span className="text-[10px] text-slate-500">VIIRS 375m Hotspots</span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-1 text-center">
            <span className="text-xs text-slate-400 font-semibold uppercase">Total FRP Power</span>
            <div className="text-2xl font-bold text-rose-400">{transport.total_active_frp_mw} <span className="text-xs font-normal text-slate-400">MW</span></div>
            <span className="text-[10px] text-slate-500">Fire Radiative Power</span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-1 text-center">
            <span className="text-xs text-slate-400 font-semibold uppercase">Upwind Vector Match</span>
            <div className="text-2xl font-bold text-cyan-400">{transport.upwind_alignment_vector}</div>
            <span className="text-[10px] text-slate-500">NW Wind Cosine Vector</span>
          </div>
        </div>
      )}

      {/* Smoke Transport Visualization Corridor */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <h3 className="text-md font-bold text-slate-100 flex items-center gap-2">
          <Compass className="w-5 h-5 text-cyan-400" />
          <span>Regional Smoke Transport Pathway Corridor</span>
        </h3>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-xs text-center">
          {/* Step 1 */}
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-1 w-full md:w-1/4">
            <span className="text-amber-400 font-bold block">1. Punjab / Haryana Fires</span>
            <span className="text-slate-400 text-[10px] block">NASA VIIRS Active Hotspots</span>
          </div>

          <ArrowDown className="w-6 h-6 text-slate-500 rotate-0 md:-rotate-90 shrink-0" />

          {/* Step 2 */}
          <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl space-y-1 w-full md:w-1/4">
            <span className="text-cyan-400 font-bold block">2. Prevailing NW Wind Vector</span>
            <span className="text-slate-400 text-[10px] block">Advection Speed & Angle</span>
          </div>

          <ArrowDown className="w-6 h-6 text-slate-500 rotate-0 md:-rotate-90 shrink-0" />

          {/* Step 3 */}
          <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl space-y-1 w-full md:w-1/4">
            <span className="text-purple-400 font-bold block">3. Potential Transport Corridor</span>
            <span className="text-slate-400 text-[10px] block">Low Ventilation Trajectory</span>
          </div>

          <ArrowDown className="w-6 h-6 text-slate-500 rotate-0 md:-rotate-90 shrink-0" />

          {/* Step 4 */}
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl space-y-1 w-full md:w-1/4">
            <span className="text-rose-400 font-bold block">4. Delhi NCR Atmosphere</span>
            <span className="text-slate-400 text-[10px] block">Surface Smog Accumulation</span>
          </div>
        </div>

        <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-400 flex items-start gap-2">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <span>Scientific Disclaimer: This vector model evaluates upwind geometric transport risk and is explicitly labeled as a <strong>Regional Smoke Transport Risk Proxy</strong>. It is not a 3D Eulerian source-apportionment chemical model.</span>
        </div>
      </div>

      {/* Active Fire Hotspot Cluster Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-md font-bold text-slate-100 flex items-center justify-between">
          <span>Active NASA VIIRS Satellite Detections (Upwind Hotspots)</span>
          <span className="text-xs text-slate-400 font-normal">Total {hotspots.length} Clusters</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/60">
                <th className="p-3">Cluster Region</th>
                <th className="p-3">Latitude (°N)</th>
                <th className="p-3">Longitude (°E)</th>
                <th className="p-3">FRP Intensity (MW)</th>
                <th className="p-3">Confidence</th>
                <th className="p-3">Satellite Sensor</th>
              </tr>
            </thead>
            <tbody>
              {hotspots.slice(0, 15).map((fire, idx) => (
                <tr key={idx} className="border-b border-slate-800/60 hover:bg-slate-800/40 transition">
                  <td className="p-3 font-semibold text-amber-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    {fire.cluster}
                  </td>
                  <td className="p-3 text-slate-300">{fire.latitude.toFixed(4)}</td>
                  <td className="p-3 text-slate-300">{fire.longitude.toFixed(4)}</td>
                  <td className="p-3 font-bold text-rose-400">{fire.frp} MW</td>
                  <td className="p-3 text-emerald-400 uppercase">{fire.confidence}</td>
                  <td className="p-3 text-slate-400">VIIRS 375m NRT</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
