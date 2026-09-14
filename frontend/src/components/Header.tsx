import { useState, useEffect } from 'react'
import { Layers, RefreshCw, Clock } from 'lucide-react'
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
    <header className="h-16 border-b border-slate-800/80 bg-slate-900/80 backdrop-blur sticky top-0 z-30 px-6 flex items-center justify-between">
      {/* Persistent Data Status Indicators */}
      <div className="flex items-center space-x-3 overflow-x-auto py-1">
        <DataStatusBadge source="OpenAQ" status="LIVE" />
        <DataStatusBadge source="Open-Meteo" status="CONNECTED" />
        <DataStatusBadge source="NASA FIRMS" status="LIVE" />
        <DataStatusBadge source="XGBoost Models" status="CONNECTED" />
        <DataStatusBadge source="FastAPI Backend" status="CONNECTED" />
      </div>

      {/* Clock & Action Controls */}
      <div className="flex items-center space-x-4">
        <div className="hidden md:flex items-center space-x-1.5 text-xs text-slate-400 font-mono bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>{timeStr}</span>
        </div>

        <button
          onClick={onOpenWrfModal}
          className="text-xs px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition"
        >
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>WRF-Chem Stub</span>
        </button>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="text-xs px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium flex items-center gap-1.5 transition shadow-lg shadow-cyan-600/20"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>
    </header>
  )
}
