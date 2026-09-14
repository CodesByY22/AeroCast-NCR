interface Props {
  source: string
  status: 'LIVE' | 'CONNECTED' | 'HISTORICAL' | 'CACHED' | 'OFFLINE'
  lastUpdated?: string
}

export default function DataStatusBadge({ source, status, lastUpdated }: Props) {
  const getColors = () => {
    switch (status) {
      case 'LIVE':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
      case 'CONNECTED':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
      case 'HISTORICAL':
      case 'CACHED':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/30'
      default:
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30'
    }
  }

  return (
    <div className={`flex items-center space-x-1.5 px-2 py-0.5 rounded-lg border text-[10px] font-mono ${getColors()}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === 'LIVE' || status === 'CONNECTED' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
      <span className="font-semibold">{source}:</span>
      <span>{status}</span>
      {lastUpdated && <span className="text-slate-500">({lastUpdated})</span>}
    </div>
  )
}
