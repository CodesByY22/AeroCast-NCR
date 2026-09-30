import { FireIcon, ArrowDownIcon, MapPinIcon, InformationCircleIcon } from '@heroicons/react/24/outline'

export default function StubblePage({ risk, loading }: { risk: any, loading: boolean }) {
  if (!risk) {
    return (
      <div className="p-10 max-w-6xl mx-auto">
        <div className="text-textMuted border border-borderSubtle p-6 rounded text-[13px]">
          {loading ? "Loading..." : "Cannot connect to the backend API. Please ensure the Python server is running."}
        </div>
      </div>
    )
  }

  return (
    <div className="p-10 max-w-6xl mx-auto space-y-12 pb-24">
      <div>
        <h1 className="text-[28px] font-light tracking-tight text-textMain">Fire & Plume Risk</h1>
        <p className="text-[13px] text-textMuted mt-1">Upstream biomass burning and transport trajectory analysis.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-2">
          <span className="text-[10px] font-medium tracking-[0.1em] text-textMuted uppercase block">Overall Risk</span>
          <div className="text-[40px] font-light text-[#ef4444] leading-none">{risk?.overall_risk ?? 'High'}</div>
        </div>
        <div className="space-y-2">
          <span className="text-[10px] font-medium tracking-[0.1em] text-textMuted uppercase block">Active Fire Spots</span>
          <div className="text-[40px] font-light text-textMain leading-none">{risk?.active_fire_hotspots?.length ?? 4}</div>
        </div>
        <div className="space-y-2">
          <span className="text-[10px] font-medium tracking-[0.1em] text-textMuted uppercase block">Transport Direction</span>
          <div className="text-[40px] font-light text-textMain leading-none">{risk?.wind_direction_from ?? 'NW'}</div>
        </div>
      </div>

      <hr className="border-borderSubtle" />

      <div className="space-y-6">
        <span className="text-[14px] text-textMain block">Active Upstream Clusters (Punjab/Haryana)</span>
        <div className="space-y-4">
          {risk?.active_fire_hotspots?.map((fire: any, idx: number) => (
            <div key={idx} className="flex justify-between items-center text-[13px] border-b border-borderSubtle pb-2">
              <span className="text-textMuted">{fire.cluster}</span>
              <span className="font-mono text-[#ef4444]">{fire.frp} MW</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
