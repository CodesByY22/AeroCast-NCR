import { StubbleRiskData } from '../api/client'

interface Props {
  risk: StubbleRiskData | null
  loading: boolean
}

export default function StubblePage({ risk, loading }: Props) {
  if (loading && !risk) {
    return <div className="p-8 text-center text-[#6e6e73] font-sans">Loading NASA FIRMS satellite fire detections...</div>
  }

  const transport = risk?.transport_risk
  const hotspots = risk?.active_fire_hotspots || []

  return (
    <div className="p-8 space-y-8 font-sans max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-[#e5e5ea] rounded-2xl p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-[#1d1d1f] tracking-tight">
          Regional Stubble Burning & Smoke Transport Risk Model
        </h1>
        <p className="text-xs text-[#6e6e73] mt-1">NASA FIRMS satellite thermal anomalies (VIIRS 375m) coupled with upwind 10m surface wind direction vectors.</p>
      </div>

      {/* Regional Transport Risk Summary Bar */}
      {transport && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-[#e5e5ea] rounded-2xl p-5 space-y-2 shadow-sm">
            <span className="text-xs font-medium text-[#6e6e73]">
              Transport Risk Score (0-100)
            </span>
            <div className="text-3xl font-semibold text-[#1d1d1f]">
              {transport.stubble_transport_risk_score} <span className="text-xs font-normal text-[#86868b]">/ 100</span>
            </div>
            <p className="text-xs font-semibold" style={{ color: transport.color }}>{transport.category}</p>
          </div>

          <div className="bg-white border border-[#e5e5ea] rounded-2xl p-5 space-y-1 shadow-sm">
            <span className="text-xs font-semibold text-[#6e6e73] uppercase tracking-wider">Upwind Active Fires</span>
            <div className="text-2xl font-semibold text-[#1d1d1f]">{transport.fire_count_200km}</div>
            <span className="text-[11px] text-[#86868b]">VIIRS 375m Satellite Hotspots</span>
          </div>

          <div className="bg-white border border-[#e5e5ea] rounded-2xl p-5 space-y-1 shadow-sm">
            <span className="text-xs font-semibold text-[#6e6e73] uppercase tracking-wider">Total FRP Power</span>
            <div className="text-2xl font-semibold text-[#1d1d1f]">{transport.total_active_frp_mw} <span className="text-xs font-normal text-[#86868b]">MW</span></div>
            <span className="text-[11px] text-[#86868b]">Fire Radiative Power</span>
          </div>

          <div className="bg-white border border-[#e5e5ea] rounded-2xl p-5 space-y-1 shadow-sm">
            <span className="text-xs font-semibold text-[#6e6e73] uppercase tracking-wider">Upwind Vector Match</span>
            <div className="text-2xl font-semibold text-[#0066cc]">{transport.upwind_alignment_vector}</div>
            <span className="text-[11px] text-[#86868b]">North-West Alignment</span>
          </div>
        </div>
      )}

      {/* Active Satellite Fire Cluster Table */}
      <div className="bg-white border border-[#e5e5ea] rounded-2xl p-6 space-y-4 shadow-sm">
        <h2 className="text-base font-semibold text-[#1d1d1f]">Active Satellite Thermal Anomalies (Within 200 km)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-[#e5e5ea] text-[#6e6e73] font-semibold bg-[#f5f5f7]">
                <th className="p-3">Cluster Region</th>
                <th className="p-3">Coordinates</th>
                <th className="p-3">FRP Power (MW)</th>
                <th className="p-3">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e5ea] text-[#1d1d1f]">
              {hotspots.map((h, i) => (
                <tr key={i} className="hover:bg-[#f5f5f7]/60 transition">
                  <td className="p-3 font-semibold text-[#1d1d1f]">{h.cluster}</td>
                  <td className="p-3 font-mono text-[#6e6e73]">{h.latitude.toFixed(3)}°N, {h.longitude.toFixed(3)}°E</td>
                  <td className="p-3 font-mono font-semibold text-[#dc2626]">{h.frp} MW</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {h.confidence}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
