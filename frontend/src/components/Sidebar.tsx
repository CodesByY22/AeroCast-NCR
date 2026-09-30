import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Map, TrendingUp, Wind, Flame, Cpu, Bell, CheckCircle2, FileText, Shield
} from 'lucide-react'

const monitorItems = [
  { path: '/', label: 'Overview', icon: LayoutDashboard },
  { path: '/map', label: 'AQI Map', icon: Map },
  { path: '/forecast', label: '72h Forecast', icon: TrendingUp },
  { path: '/atmosphere', label: 'Atmosphere', icon: Wind },
  { path: '/stubble', label: 'Fire & Plume', icon: Flame },
  { path: '/explainability', label: 'Intelligence', icon: Cpu },
  { path: '/alerts', label: 'Early Warning', icon: Bell }
]

const analysisItems = [
  { path: '/validation', label: 'Model Validation', icon: CheckCircle2 },
  { path: '/terms', label: 'Terms of Service', icon: FileText },
  { path: '/privacy', label: 'Privacy Policy', icon: Shield }
]

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between shrink-0 h-screen sticky top-0 font-sans z-20">
      <div className="overflow-y-auto">
        {/* Brand Section */}
        <div className="p-5 border-b border-slate-100 flex items-center space-x-3">
          <div className="w-9 h-9 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold text-base shadow-sm shrink-0">
            A
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-slate-900 leading-none">AeroCast-NCR</h1>
            <p className="text-[11px] text-slate-500 mt-1">Air Pollution Intelligence</p>
          </div>
        </div>

        {/* MONITOR Section */}
        <div className="p-3 space-y-1">
          <div className="px-3 pt-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            MONITOR
          </div>
          {monitorItems.map(item => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-white text-slate-900 font-bold border-2 border-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </div>

        {/* ANALYSIS Section */}
        <div className="p-3 space-y-1 border-t border-slate-100">
          <div className="px-3 pt-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            ANALYSIS
          </div>
          {analysisItems.map(item => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-white text-slate-900 font-bold border-2 border-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </div>
      </div>

      {/* Footer info */}
      <div className="p-4 border-t border-slate-100 text-[11px] text-slate-500 space-y-1 bg-slate-50/50">
        <div className="font-semibold text-slate-700">SIH26082 · MoES / NCMRWF</div>
        <div className="text-[10px] text-slate-400">Delhi NCR Air Quality Forecasting</div>
      </div>
    </aside>
  )
}
