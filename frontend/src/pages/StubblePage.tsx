import { Flame, Compass, ArrowDown, MapPin, Info } from 'lucide-react'
import { StubbleRiskData } from '../api/client'

interface Props {
  risk: StubbleRiskData | null
  loading: boolean
}

export default function StubblePage({ risk, loading }: Props) {
  if (loading && !risk) {
    return <div className="p-8 text-center text-[#86868b]">Loading NASA FIRMS satellite fire detections...</div>
  }

  const transport = risk?.transport_risk
  const hotspots = risk?.active_fire_hotspots || []

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-[#d2d2d7] rounded-xl p-6">
        <h2 className="text-[18px] font-semibold text-[#1d1d1f] flex items-center gap-2">
          <Flame className="w-5 h-5 text-[#b25000]" strokeWidth={1.5} />
          Regional Stubble Burning & Smoke Transport Intelligence
        </h2>
        <p className="text-[13px] text-[#86868b] mt-1">NASA FIRMS satellite active fire detections (VIIRS 375m / MODIS) matched with upwind surface wind direction vectors.</p>
      </div>

      {/* Transport Risk KPIs */}
      {transport && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-[#d2d2d7] rounded-xl p-5 space-y-2">
            <span className="text-[12px] text-[#6e6e73] font-medium flex items-center gap-1">
              Transport Risk Score <span className="text-[9px] px-1.5 bg-[#fff8f0] text-[#b25000] rounded border border-[#ffddb5] font-semibold">PROXY</span>
            </span>
            <div className="text-[30px] font-semibold text-[#1d1d1f]">
              {transport.stubble_transport_risk_score} <span className="text-[12px] text-[#86868b] font-normal">/ 100</span>
            </div>
            <p className="text-[12px] font-semibold" style={{ color: transport.color }}>{transport.category}</p>
          </div>

          <div className="bg-white border border-[#d2d2d7] rounded-xl p-4 space-y-1 text-center">
            <span className="text-[11px] text-[#6e6e73] font-medium uppercase">Upwind Active Fires</span>
            <div className="text-[24px] font-semibold text-[#b25000]">{transport.fire_count_200km}</div>
            <span className="text-[10px] text-[#86868b]">VIIRS 375m Hotspots</span>
          </div>

          <div className="bg-white border border-[#d2d2d7] rounded-xl p-4 space-y-1 text-center">
            <span className="text-[11px] text-[#6e6e73] font-medium uppercase">Total FRP Power</span>
            <div className="text-[24px] font-semibold text-[#ff3b30]">{transport.total_active_frp_mw} <span className="text-[12px] font-normal text-[#86868b]">MW</span></div>
            <span className="text-[10px] text-[#86868b]">Fire Radiative Power</span>
          </div>

          <div className="bg-white border border-[#d2d2d7] rounded-xl p-4 space-y-1 text-center">
            <span className="text-[11px] text-[#6e6e73] font-medium uppercase">Upwind Vector Match</span>
            <div className="text-[24px] font-semibold text-[#0066cc]">{transport.upwind_alignment_vector}</div>
            <span className="text-[10px] text-[#86868b]">NW Wind Cosine Vector</span>
          </div>
        </div>
      )}

      {/* Transport Corridor */}
      <div className="bg-white border border-[#d2d2d7] rounded-xl p-6 space-y-4">
        <h3 className="text-[15px] font-semibold text-[#1d1d1f] flex items-center gap-2">
          <Compass className="w-4 h-4 text-[#0066cc]" strokeWidth={1.5} />
          Regional Smoke Transport Pathway Corridor
        </h3>

        <div className="bg-[#f5f5f7] border border-[#e8e8ed] rounded-lg p-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[12px] text-center">
          <div className="p-4 bg-[#fff8f0] border border-[#ffddb5] rounded-lg space-y-1 w-full md:w-1/4">
            <span className="text-[#b25000] font-semibold block">1. Punjab / Haryana Fires</span>
            <span className="text-[#86868b] text-[10px] block">NASA VIIRS Active Hotspots</span>
          </div>
          <ArrowDown className="w-5 h-5 text-[#86868b] rotate-0 md:-rotate-90 shrink-0" strokeWidth={1.5} />
          <div className="p-4 bg-[#f0f4ff] border border-[#c5d5f7] rounded-lg space-y-1 w-full md:w-1/4">
            <span className="text-[#0066cc] font-semibold block">2. Prevailing NW Wind Vector</span>
            <span className="text-[#86868b] text-[10px] block">Advection Speed & Angle</span>
          </div>
          <ArrowDown className="w-5 h-5 text-[#86868b] rotate-0 md:-rotate-90 shrink-0" strokeWidth={1.5} />
          <div className="p-4 bg-[#f5f0ff] border border-[#d5c5f7] rounded-lg space-y-1 w-full md:w-1/4">
            <span className="text-[#6e3fc7] font-semibold block">3. Transport Corridor</span>
            <span className="text-[#86868b] text-[10px] block">Low Ventilation Trajectory</span>
          </div>
          <ArrowDown className="w-5 h-5 text-[#86868b] rotate-0 md:-rotate-90 shrink-0" strokeWidth={1.5} />
          <div className="p-4 bg-[#fff0f0] border border-[#f7c5c5] rounded-lg space-y-1 w-full md:w-1/4">
            <span className="text-[#d32f2f] font-semibold block">4. Delhi NCR Atmosphere</span>
            <span className="text-[#86868b] text-[10px] block">Surface Smog Accumulation</span>
          </div>
        </div>

        <div className="p-3 bg-[#f5f5f7] border border-[#e8e8ed] rounded-lg text-[12px] text-[#6e6e73] flex items-start gap-2">
          <Info className="w-4 h-4 text-[#0066cc] shrink-0 mt-0.5" strokeWidth={1.5} />
          <span>Scientific Disclaimer: This vector model evaluates upwind geometric transport risk and is explicitly labeled as a <strong>Regional Smoke Transport Risk Proxy</strong>. It is not a 3D Eulerian source-apportionment chemical model.</span>
        </div>
      </div>

      {/* Fire hotspot table */}
      <div className="bg-white border border-[#d2d2d7] rounded-xl p-6 space-y-4">
        <h3 className="text-[15px] font-semibold text-[#1d1d1f] flex items-center justify-between">
          <span>Active NASA VIIRS Satellite Detections (Upwind Hotspots)</span>
          <span className="text-[12px] text-[#86868b] font-normal">Total {hotspots.length} Clusters</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[12px]">
            <thead>
              <tr className="border-b border-[#d2d2d7] text-[#6e6e73] font-medium bg-[#f5f5f7]">
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
                <tr key={idx} className="border-b border-[#e8e8ed] hover:bg-[#f5f5f7] transition-colors">
                  <td className="p-3 font-medium text-[#1d1d1f] flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-[#b25000]" strokeWidth={1.5} />
                    {fire.cluster}
                  </td>
                  <td className="p-3 text-[#6e6e73] font-mono">{fire.latitude.toFixed(4)}</td>
                  <td className="p-3 text-[#6e6e73] font-mono">{fire.longitude.toFixed(4)}</td>
                  <td className="p-3 font-semibold text-[#ff3b30]">{fire.frp} MW</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#e8f5e9] text-[#2e7d32] border border-[#c8e6c9]">
                      {fire.confidence}
                    </span>
                  </td>
                  <td className="p-3 text-[#86868b]">VIIRS 375m NRT</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
