interface Props {
  source: string
  status: 'LIVE' | 'CONNECTED' | 'HISTORICAL' | 'CACHED' | 'OFFLINE'
  lastUpdated?: string
}

export default function DataStatusBadge({ source, status, lastUpdated }: Props) {
  const dotColor = (status === 'LIVE' || status === 'CONNECTED')
    ? 'bg-[#34c759]'
    : (status === 'HISTORICAL' || status === 'CACHED')
      ? 'bg-[#ff9f0a]'
      : 'bg-[#ff3b30]'

  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md border border-[#e8e8ed] text-[10px] font-mono tracking-tight shrink-0 text-[#6e6e73] bg-[#f5f5f7]">
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
      <span className="font-medium text-[#424245]">{source}:</span>
      <span>{status}</span>
      {lastUpdated && <span className="text-[#86868b]">({lastUpdated})</span>}
    </div>
  )
}
