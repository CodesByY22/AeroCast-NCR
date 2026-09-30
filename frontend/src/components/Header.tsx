import { useState, useEffect } from 'react'
import { MapPin, Bell, Layers, RefreshCw } from 'lucide-react'
import DataStatusBadge from './DataStatusBadge'

interface HeaderProps {
  onRefresh: () => void
  loading: boolean
  onOpenWrfModal: () => void
}

export default function Header({ onRefresh, loading, onOpenWrfModal }: HeaderProps) {
  const [timeStr, setTimeStr] = useState('')

  useEffect(() => {
    const updateClock = () => {
      const now = new Date()
      setTimeStr(now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false }) + ' IST')
    }
    updateClock()
    const timer = setInterval(updateClock, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <header className="h-14 border-b border-[#d2d2d7] bg-white sticky top-0 z-30 px-6 flex items-center justify-between">
      {/* Left: data source badges */}
      <div className="flex items-center gap-2 overflow-x-auto py-1">
        <DataStatusBadge source="OpenAQ" status="LIVE" />
        <DataStatusBadge source="Open-Meteo" status="CONNECTED" />
        <DataStatusBadge source="NASA FIRMS" status="LIVE" />
        <DataStatusBadge source="XGBoost" status="CONNECTED" />
      </div>

      {/* Right: controls */}
      <div className="flex items-center gap-2.5">
        {/* Location pill */}
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#d2d2d7] bg-white text-[13px] font-medium text-[#1d1d1f] hover:bg-[#f5f5f7] transition-colors">
          <MapPin className="w-3.5 h-3.5 text-[#86868b]" strokeWidth={1.5} />
          <span>Delhi NCR</span>
          <span className="text-[10px] text-[#86868b] ml-0.5">▾</span>
        </button>

        {/* Clock */}
        <div className="hidden lg:flex items-center text-[12px] text-[#6e6e73] font-mono px-2.5 py-1.5 rounded-lg border border-[#e8e8ed] bg-[#f5f5f7]">
          {timeStr}
        </div>

        {/* LIVE badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#e8f5e9] text-[#2e7d32] border border-[#c8e6c9] text-[11px] font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2e7d32] animate-pulse"></span>
          <span>LIVE</span>
        </div>

        {/* Bell */}
        <button className="relative p-2 rounded-lg text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-[#f5f5f7] transition-colors">
          <Bell className="w-4 h-4" strokeWidth={1.5} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#ff3b30]"></span>
        </button>

        {/* WRF-Chem Stub */}
        <button
          onClick={onOpenWrfModal}
          className="text-[12px] px-3 py-1.5 rounded-lg bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] font-medium border border-[#d2d2d7] flex items-center gap-1.5 transition-colors"
        >
          <Layers className="w-3.5 h-3.5 text-[#86868b]" strokeWidth={1.5} />
          <span className="hidden md:inline">WRF-Chem Stub</span>
        </button>

        {/* Refresh */}
        <button
          onClick={onRefresh}
          disabled={loading}
          className="text-[12px] px-3.5 py-1.5 rounded-lg bg-[#1d1d1f] hover:bg-[#424245] text-white font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} strokeWidth={1.5} />
          <span className="hidden sm:inline">Refresh</span>
        </button>

        {/* User avatar */}
        <div className="flex items-center gap-2 pl-2.5 border-l border-[#e8e8ed]">
          <div className="w-7 h-7 bg-[#e8e8ed] text-[#6e6e73] rounded-full flex items-center justify-center font-semibold text-[11px]">
            A
          </div>
          <div className="hidden lg:block text-[11px] leading-tight">
            <div className="font-medium text-[#1d1d1f]">Analytics</div>
            <div className="text-[#86868b]">Dashboard</div>
          </div>
        </div>
      </div>
    </header>
  )
}
