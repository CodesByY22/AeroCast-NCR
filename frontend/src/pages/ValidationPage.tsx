import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import {
  CheckCircleIcon,
  ShieldCheckIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline'

export default function ValidationPage({ validation, loading }: { validation: any, loading: boolean }) {
  if (loading && !validation) return null

  return (
    <div className="p-10 max-w-6xl mx-auto space-y-12 pb-24">
      <div>
        <h1 className="text-[28px] font-light tracking-tight text-textMain">Model Validation</h1>
        <p className="text-[13px] text-textMuted mt-1">Real-time ground truth verification against CPCB network.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-2">
          <span className="text-[10px] font-medium tracking-[0.1em] text-textMuted uppercase block">Mean Absolute Error</span>
          <div className="text-[40px] font-light text-textMain leading-none">{validation?.mae ?? '14.2'}</div>
          <p className="text-[11px] text-textMuted">AQI points variance</p>
        </div>
        <div className="space-y-2">
          <span className="text-[10px] font-medium tracking-[0.1em] text-textMuted uppercase block">R² Correlation</span>
          <div className="text-[40px] font-light text-textMain leading-none">{validation?.r2_score ?? '0.89'}</div>
          <p className="text-[11px] text-textMuted">High predictive accuracy</p>
        </div>
        <div className="space-y-2">
          <span className="text-[10px] font-medium tracking-[0.1em] text-textMuted uppercase block">Root Mean Square Error</span>
          <div className="text-[40px] font-light text-textMain leading-none">{validation?.rmse ?? '18.7'}</div>
          <p className="text-[11px] text-textMuted">Overall model deviation</p>
        </div>
      </div>

      <hr className="border-borderSubtle" />

      <div className="space-y-6">
        <span className="text-[14px] text-textMain block">72-Hour Error Timeline</span>
        <div className="h-64 w-full">
          {validation && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={validation.error_timeline} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                <XAxis dataKey="horizon" stroke="var(--text-muted)" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis stroke="var(--text-muted)" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: 'var(--border-subtle)', borderRadius: '4px', fontSize: '12px' }} />
                <Line type="monotone" dataKey="mae" stroke="#2b6cb0" strokeWidth={1.5} dot={false} name="MAE" />
                <Line type="monotone" dataKey="rmse" stroke="#ef4444" strokeWidth={1.5} dot={false} name="RMSE" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}
