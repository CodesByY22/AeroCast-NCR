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
    <aside className="w-60 bg-white border-r border-[#d2d2d7] flex flex-col justify-between shrink-0 h-screen sticky top-0 z-20 select-none">
      <div className="overflow-y-auto">
        {/* Brand */}
        <div className="px-5 py-5 border-b border-[#e8e8ed]">
          <h1 className="text-[15px] font-semibold tracking-tight text-[#1d1d1f] leading-none">AeroCast-NCR</h1>
          <p className="text-[11px] text-[#86868b] mt-1">Air Pollution Intelligence</p>
        </div>

        {/* Monitor */}
        <div className="px-3 pt-4 pb-2">
          <div className="px-3 pb-2 text-[10px] font-semibold text-[#86868b] uppercase tracking-widest">
            Monitor
          </div>
          <nav className="space-y-0.5">
            {monitorItems.map(item => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-colors ${
                      isActive
                        ? 'bg-[#e8e8ed] text-[#1d1d1f] font-semibold'
                        : 'text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-[#f5f5f7]'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                  <span>{item.label}</span>
                </NavLink>
              )
            })}
          </nav>
        </div>

        {/* Analysis */}
        <div className="px-3 pt-2 pb-2 border-t border-[#e8e8ed] mt-1">
          <div className="px-3 pt-3 pb-2 text-[10px] font-semibold text-[#86868b] uppercase tracking-widest">
            Analysis
          </div>
          <nav className="space-y-0.5">
            {analysisItems.map(item => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-colors ${
                      isActive
                        ? 'bg-[#e8e8ed] text-[#1d1d1f] font-semibold'
                        : 'text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-[#f5f5f7]'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                  <span>{item.label}</span>
                </NavLink>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-[#e8e8ed] text-[11px] text-[#86868b] space-y-0.5">
        <div className="font-medium text-[#6e6e73]">SIH26082 · MoES / NCMRWF</div>
        <div>Delhi NCR Air Quality Forecasting</div>
      </div>
    </aside>
  )
}
