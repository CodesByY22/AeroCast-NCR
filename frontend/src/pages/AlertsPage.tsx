import { BellIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { getBadgeStyle } from '../utils/colors'

export default function AlertsPage({ alerts, loading }: { alerts: any, loading: boolean }) {
  if (!alerts) {
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
        <h1 className="text-[28px] font-light tracking-tight text-textMain">Early Warning Network</h1>
        <p className="text-[13px] text-textMuted mt-1">Automated episodic alerts and advisory dissemination.</p>
      </div>

      <div className="space-y-6">
        <span className="text-[14px] text-textMain block">Recent Automated Bulletins</span>
        <div className="space-y-0 border-y border-borderSubtle">
          {alerts?.alerts.map((alert: any) => (
            <div key={alert.id} className="grid grid-cols-12 gap-4 py-4 border-b border-borderSubtle last:border-0 text-[13px]">
              <div className="col-span-2 text-textMuted">{alert.timestamp}</div>
              <div className="col-span-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-medium" style={getBadgeStyle(alert.severity_color)}>{alert.severity}</span>
              </div>
              <div className="col-span-8 text-textMain">{alert.message}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
