import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { CheckCircle2, ShieldCheck, Cpu } from 'lucide-react'
import { ValidationMetricsData } from '../api/client'

interface Props {
  validation: ValidationMetricsData | null
  loading: boolean
}

export default function ValidationPage({ validation, loading }: Props) {
  if (loading && !validation) {
    return <div className="p-8 text-center text-slate-400">Loading model validation protocol & metrics...</div>
  }

  const split = validation?.split_protocol
  const table = validation?.metrics_table || []
  const dlBench = validation?.deep_learning_benchmark
  const testSeries = validation?.observed_vs_predicted_test_series || []

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          <span>SIH Model Evaluation & Scientific Validation Protocol</span>
        </h2>
        <p className="text-xs text-slate-400">Empirical validation documentation, chronological split proof, and actual vs predicted performance curves on unseen test data.</p>
      </div>

      {/* Chronological Time-Series Split Verification Banner */}
      {split && (
        <div className="bg-slate-900/90 border border-cyan-800/40 rounded-2xl p-6 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Strict Time-Series Chronological Split Protocol (Data Leakage Proof)</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              NON-RANDOM SPLIT VERIFIED
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs pt-1">
            <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1">
              <span className="text-slate-400 text-[10px] uppercase">Training Window</span>
              <div className="font-bold text-slate-100">{split.train_hours} Hours</div>
              <span className="text-slate-400 text-[10px]">{split.train_period}</span>
            </div>

            <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1">
              <span className="text-slate-400 text-[10px] uppercase">Unseen Test Window</span>
              <div className="font-bold text-cyan-400">{split.test_hours} Hours</div>
              <span className="text-slate-400 text-[10px]">{split.test_period}</span>
            </div>

            <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1">
              <span className="text-slate-400 text-[10px] uppercase">Validation Rule</span>
              <div className="font-bold text-emerald-400">Strict Non-Overlapping</div>
              <span className="text-slate-400 text-[10px]">Zero Random K-Fold Shuffling</span>
            </div>
          </div>
        </div>
      )}

      {/* Observed vs Predicted Test Dataset Line Chart */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <h3 className="text-md font-bold text-slate-100 flex items-center justify-between">
          <span>Observed PM2.5 vs Predicted PM2.5 (+24h XGBoost on Unseen Test Split)</span>
          <span className="text-xs text-cyan-400 font-mono">Evaluation Set ({testSeries.length} Timesteps)</span>
        </h3>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={testSeries} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="timestamp" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} label={{ value: 'PM2.5 (µg/m³)', angle: -90, position: 'insideLeft', fill: '#64748b' }} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
              <Legend />
              <Line type="monotone" dataKey="observed_pm25" name="Observed Ground Truth (PM2.5)" stroke="#10b981" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="predicted_pm25" name="Predicted Model Output (PM2.5)" stroke="#06b6d4" strokeWidth={2.5} strokeDasharray="4 4" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Model Performance Metrics Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-md font-bold text-slate-100">Multi-Horizon Evaluation Metrics (XGBoost Regressor)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/60">
                <th className="p-3">Forecast Horizon</th>
                <th className="p-3">Model Architecture</th>
                <th className="p-3">MAE (µg/m³)</th>
                <th className="p-3">RMSE (µg/m³)</th>
                <th className="p-3">R² Score</th>
                <th className="p-3">MAPE (%)</th>
              </tr>
            </thead>
            <tbody>
              {table.map((row, idx) => (
                <tr key={idx} className="border-b border-slate-800/60 hover:bg-slate-800/40 transition">
                  <td className="p-3 font-bold text-cyan-400">{row.horizon}</td>
                  <td className="p-3 text-slate-300">{row.model}</td>
                  <td className="p-3 text-amber-400 font-semibold">{row.mae.toFixed(2)}</td>
                  <td className="p-3 text-rose-400 font-semibold">{row.rmse.toFixed(2)}</td>
                  <td className="p-3 text-emerald-400 font-bold">{row.r2.toFixed(4)}</td>
                  <td className="p-3 text-sky-400">{row.mape.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* XGBoost vs PyTorch LSTM Benchmark Decision Card */}
      {dlBench && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3">
          <h3 className="text-md font-bold text-slate-100 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <span>Deep Learning Benchmark Comparison (+24h Horizon)</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
            <div className="p-4 bg-slate-950/80 border border-emerald-500/30 rounded-xl space-y-1">
              <span className="text-emerald-400 font-bold block">XGBoost Regressor (Selected Model)</span>
              <div>MAE: {dlBench.xgboost.mae} µg/m³ · RMSE: {dlBench.xgboost.rmse} µg/m³</div>
              <div className="text-emerald-400 font-bold text-sm">R² Score: {dlBench.xgboost.r2}</div>
            </div>

            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1 text-slate-400">
              <span className="text-slate-300 font-bold block">PyTorch LSTM Sequence Network</span>
              <div>MAE: {dlBench.lstm_pytorch.mae} µg/m³ · RMSE: {dlBench.lstm_pytorch.rmse} µg/m³</div>
              <div className="text-rose-400 font-bold text-sm">R² Score: {dlBench.lstm_pytorch.r2}</div>
            </div>
          </div>

          <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800 font-sans">
            <strong className="text-slate-100">Decision Rule Verification:</strong> {dlBench.decision}
          </p>
        </div>
      )}
    </div>
  )
}
