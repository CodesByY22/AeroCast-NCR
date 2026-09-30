import { useState, useEffect } from 'react'
import { MapPin, Bell, Layers, RefreshCw, Radio } from 'lucide-react'
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
    <header className="h-16 border-b border-slate-100 bg-white/95 backdrop-blur-md sticky top-0 z-30 px-6 flex items-center justify-between font-sans">
      {/* Left: Status Badges */}
      <div className="flex items-center space-x-2 overflow-x-auto py-1">
        <DataStatusBadge source="OpenAQ" status="LIVE" />
        <DataStatusBadge source="Open-Meteo" status="CONNECTED" />
        <DataStatusBadge source="NASA FIRMS" status="LIVE" />
        <DataStatusBadge source="XGBoost" status="CONNECTED" />
      </div>

      {/* Right Controls Bar */}
      <div className="flex items-center space-x-3">
        {/* Location Dropdown Pill */}
        <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-2xs cursor-pointer hover:bg-slate-50 transition">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          <span>Delhi NCR</span>
          <span className="text-[10px] text-slate-400">▼</span>
        </div>

        {/* Live Clock Badge */}
        <div className="hidden lg:flex items-center space-x-1.5 text-xs text-slate-500 font-mono bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80">
          <span>{timeStr}</span>
        </div>

        {/* Live Badge */}
        <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
          <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
          <span>LIVE</span>
        </div>

        {/* Notification Bell */}
        <div className="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500"></span>
        </div>

        {/* WRF-Chem Stub Modal */}
        <button
          onClick={onOpenWrfModal}
          className="text-xs px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold border border-slate-200 flex items-center gap-1.5 transition"
        >
          <Layers className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden md:inline">WRF-Chem Stub</span>
        </button>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={loading}
          className="text-xs px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold flex items-center gap-1.5 transition shadow-2xs active:scale-95"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>

        {/* User Avatar */}
        <div className="flex items-center space-x-2 pl-2 border-l border-slate-100">
          <div className="w-7 h-7 bg-slate-200 text-slate-700 rounded-full flex items-center justify-center font-bold text-xs">
            A
          </div>
          <div className="hidden lg:block text-[11px] leading-tight">
            <div className="font-bold text-slate-800">Analytics</div>
            <div className="text-slate-400">Dashboard</div>
          </div>
        </div>
      </div>
    </header>
  )
}
