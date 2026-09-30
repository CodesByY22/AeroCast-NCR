import { Flame, Compass, ArrowDown, MapPin, Info } from 'lucide-react'
import { StubbleRiskData } from '../api/client'

interface Props {
  risk: StubbleRiskData | null
  loading: boolean
}

export default function StubblePage({ risk, loading }: Props) {
  if (loading && !risk) {
    return <div className="p-8 text-center text-slate-500 font-sans">Loading NASA FIRMS satellite fire detections...</div>
  }

  const transport = risk?.transport_risk
  const hotspots = risk?.active_fire_hotspots || []

  return (
    <div className="p-8 space-y-8 font-sans max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Flame className="w-6 h-6 text-amber-600" />
          <span>Regional Stubble Burning & Smoke Transport Intelligence</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">NASA FIRMS satellite active fire detections (VIIRS 375m / MODIS) matched with upwind surface wind direction vectors.</p>
      </div>

      {/* Regional Transport Risk Summary Bar */}
      {transport && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-2 shadow-xs">
            <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
              Transport Risk Score <span className="text-[9px] px-1 bg-amber-50 text-amber-700 rounded border border-amber-200 font-bold">PROXY</span>
            </span>
            <div className="text-3xl font-extrabold text-slate-900">
              {transport.stubble_transport_risk_score} <span className="text-xs text-slate-400 font-normal">/ 100</span>
            </div>
            <p className="text-xs font-bold" style={{ color: transport.color }}>{transport.category}</p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-1 text-center shadow-xs">
            <span className="text-xs text-slate-500 font-semibold uppercase">Upwind Active Fires</span>
            <div className="text-2xl font-bold text-amber-600">{transport.fire_count_200km}</div>
            <span className="text-[10px] text-slate-400">VIIRS 375m Hotspots</span>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-1 text-center shadow-xs">
            <span className="text-xs text-slate-500 font-semibold uppercase">Total FRP Power</span>
            <div className="text-2xl font-bold text-rose-600">{transport.total_active_frp_mw} <span className="text-xs font-normal text-slate-400">MW</span></div>
            <span className="text-[10px] text-slate-400">Fire Radiative Power</span>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-1 text-center shadow-xs">
            <span className="text-xs text-slate-500 font-semibold uppercase">Upwind Vector Match</span>
            <div className="text-2xl font-bold text-[#0066cc]">{transport.upwind_alignment_vector}</div>
            <span className="text-[10px] text-slate-400">NW Wind Cosine Vector</span>
          </div>
        </div>
      )}

      {/* Smoke Transport Visualization Corridor */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-xs">
        <h3 className="text-md font-bold text-slate-900 flex items-center gap-2">
          <Compass className="w-5 h-5 text-[#0066cc]" />
          <span>Regional Smoke Transport Pathway Corridor</span>
        </h3>

        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-xs text-center">
          {/* Step 1 */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-1 w-full md:w-1/4">
            <span className="text-amber-800 font-bold block">1. Punjab / Haryana Fires</span>
            <span className="text-slate-500 text-[10px] block">NASA VIIRS Active Hotspots</span>
          </div>

          <ArrowDown className="w-6 h-6 text-slate-400 rotate-0 md:-rotate-90 shrink-0" />

          {/* Step 2 */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-1 w-full md:w-1/4">
            <span className="text-[#0066cc] font-bold block">2. Prevailing NW Wind Vector</span>
            <span className="text-slate-500 text-[10px] block">Advection Speed & Angle</span>
          </div>

          <ArrowDown className="w-6 h-6 text-slate-400 rotate-0 md:-rotate-90 shrink-0" />

          {/* Step 3 */}
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl space-y-1 w-full md:w-1/4">
            <span className="text-purple-800 font-bold block">3. Transport Corridor</span>
            <span className="text-slate-500 text-[10px] block">Low Ventilation Trajectory</span>
          </div>

          <ArrowDown className="w-6 h-6 text-slate-400 rotate-0 md:-rotate-90 shrink-0" />

          {/* Step 4 */}
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-1 w-full md:w-1/4">
            <span className="text-rose-800 font-bold block">4. Delhi NCR Atmosphere</span>
            <span className="text-slate-500 text-[10px] block">Surface Smog Accumulation</span>
          </div>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-600 flex items-start gap-2">
          <Info className="w-4 h-4 text-[#0066cc] shrink-0 mt-0.5" />
          <span>Scientific Disclaimer: This vector model evaluates upwind geometric transport risk and is explicitly labeled as a <strong>Regional Smoke Transport Risk Proxy</strong>. It is not a 3D Eulerian source-apportionment chemical model.</span>
        </div>
      </div>

      {/* Active Fire Hotspot Cluster Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-xs">
        <h3 className="text-md font-bold text-slate-900 flex items-center justify-between">
          <span>Active NASA VIIRS Satellite Detections (Upwind Hotspots)</span>
          <span className="text-xs text-slate-500 font-normal">Total {hotspots.length} Clusters</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50">
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
                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition">
                  <td className="p-3 font-semibold text-slate-900 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-600" />
                    {fire.cluster}
                  </td>
                  <td className="p-3 text-slate-600">{fire.latitude.toFixed(4)}</td>
                  <td className="p-3 text-slate-600">{fire.longitude.toFixed(4)}</td>
                  <td className="p-3 font-bold text-rose-600">{fire.frp} MW</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {fire.confidence}
                    </span>
                  </td>
                  <td className="p-3 text-slate-500">VIIRS 375m NRT</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
