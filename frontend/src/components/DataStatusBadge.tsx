interface Props {
  source: string
  status: 'LIVE' | 'CONNECTED' | 'HISTORICAL' | 'CACHED' | 'OFFLINE'
  lastUpdated?: string
}

export default function DataStatusBadge({ source, status, lastUpdated }: Props) {
  const getColors = () => {
    switch (status) {
      case 'LIVE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'CONNECTED':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'HISTORICAL':
      case 'CACHED':
        return 'bg-amber-50 text-amber-700 border-amber-200'
      default:
        return 'bg-rose-50 text-rose-700 border-rose-200'
    }
  }

  const getDotColor = () => {
    switch (status) {
      case 'LIVE':
      case 'CONNECTED':
        return 'bg-emerald-500'
      case 'HISTORICAL':
      case 'CACHED':
        return 'bg-amber-500'
      default:
        return 'bg-rose-500'
    }
  }

  return (
    <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md border text-[11px] font-mono tracking-tight shrink-0 ${getColors()}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${getDotColor()}`}></span>
      <span className="font-semibold">{source}:</span>
      <span>{status}</span>
      {lastUpdated && <span className="text-slate-400">({lastUpdated})</span>}
    </div>
  )
}
