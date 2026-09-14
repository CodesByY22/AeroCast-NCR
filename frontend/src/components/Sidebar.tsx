import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, TrendingUp, Map, Wind, Flame, Cpu, Bell, CheckCircle2, ShieldAlert
} from 'lucide-react'

const navItems = [
  { path: '/', label: 'Overview', icon: LayoutDashboard },
  { path: '/forecast', label: '72H Forecast', icon: TrendingUp },
  { path: '/map', label: 'NCR Air Map', icon: Map },
  { path: '/atmosphere', label: 'Atmospheric Intel', icon: Wind },
  { path: '/stubble', label: 'Stubble & Smoke', icon: Flame },
  { path: '/explainability', label: 'Explainable AI', icon: Cpu },
  { path: '/alerts', label: 'Alerts Centre', icon: Bell },
  { path: '/validation', label: 'Model Validation', icon: CheckCircle2 }
]

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900/90 border-r border-slate-800/80 flex flex-col justify-between shrink-0 h-screen sticky top-0">
      <div>
        {/* Brand Section */}
        <div className="p-5 border-b border-slate-800/80 flex items-center space-x-3">
          <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
            <Wind className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white">AeroCast NCR</h1>
              <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                SIH
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Weather–Pollution Intelligence</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800/80 space-y-2">
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-[10px] space-y-1 text-slate-400">
          <div className="flex items-center justify-between text-slate-300 font-semibold">
            <span>IITM/IMD Benchmark</span>
            <ShieldAlert className="w-3 h-3 text-cyan-400" />
          </div>
          <p className="leading-tight">400m WRF-Chem Inspired Prototype</p>
        </div>
        <p className="text-[10px] text-slate-500 text-center">SIH26082 · MoES / NCMRWF</p>
      </div>
    </aside>
  )
}
