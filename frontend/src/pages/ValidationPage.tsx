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
    return <div className="p-8 text-center text-slate-500 font-sans">Loading model validation protocol & metrics...</div>
  }

  const split = validation?.split_protocol
  const table = validation?.metrics_table || []
  const dlBench = validation?.deep_learning_benchmark
  const testSeries = validation?.observed_vs_predicted_test_series || []

  return (
    <div className="p-8 space-y-8 font-sans max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <CheckCircle2 className="w-6 h-6 text-emerald-600" />
          <span>SIH Model Evaluation & Scientific Validation Protocol</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">Empirical validation documentation, chronological split proof, and actual vs predicted performance curves on unseen test data.</p>
      </div>

      {/* Chronological Time-Series Split Verification Banner */}
      {split && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-[#0066cc] text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Strict Time-Series Chronological Split Protocol (Data Leakage Proof)</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              NON-RANDOM SPLIT VERIFIED
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs pt-1">
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
              <span className="text-slate-500 text-[10px] uppercase">Training Window</span>
              <div className="font-bold text-slate-900">{split.train_hours} Hours</div>
              <span className="text-slate-500 text-[10px]">{split.train_period}</span>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
              <span className="text-slate-500 text-[10px] uppercase">Unseen Test Window</span>
              <div className="font-bold text-[#0066cc]">{split.test_hours} Hours</div>
              <span className="text-slate-500 text-[10px]">{split.test_period}</span>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
              <span className="text-slate-500 text-[10px] uppercase">Validation Rule</span>
              <div className="font-bold text-emerald-700">Strict Non-Overlapping</div>
              <span className="text-slate-500 text-[10px]">Zero Random K-Fold Shuffling</span>
            </div>
          </div>
        </div>
      )}

      {/* Observed vs Predicted Test Dataset Line Chart */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-xs">
        <h3 className="text-md font-bold text-slate-900 flex items-center justify-between">
          <span>Observed PM2.5 vs Predicted PM2.5 (+24h XGBoost on Unseen Test Split)</span>
          <span className="text-xs text-[#0066cc] font-mono">Evaluation Set ({testSeries.length} Timesteps)</span>
        </h3>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={testSeries} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="timestamp" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} label={{ value: 'PM2.5 (µg/m³)', angle: -90, position: 'insideLeft', fill: '#64748b' }} />
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px', color: '#0f172a' }} />
              <Legend />
              <Line type="monotone" dataKey="observed_pm25" name="Observed Ground Truth (PM2.5)" stroke="#10b981" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="predicted_pm25" name="Predicted Model Output (PM2.5)" stroke="#0066cc" strokeWidth={2.5} strokeDasharray="4 4" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Model Performance Metrics Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-xs">
        <h3 className="text-md font-bold text-slate-900">Multi-Horizon Evaluation Metrics (XGBoost Regressor)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50">
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
                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition">
                  <td className="p-3 font-bold text-[#0066cc]">{row.horizon}</td>
                  <td className="p-3 text-slate-800">{row.model}</td>
                  <td className="p-3 text-slate-900 font-semibold">{row.mae.toFixed(2)}</td>
                  <td className="p-3 text-slate-900 font-semibold">{row.rmse.toFixed(2)}</td>
                  <td className="p-3 text-emerald-700 font-bold">{row.r2.toFixed(4)}</td>
                  <td className="p-3 text-[#0066cc]">{row.mape.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* XGBoost vs PyTorch LSTM Benchmark Decision Card */}
      {dlBench && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-3 shadow-xs">
          <h3 className="text-md font-bold text-slate-900 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#0066cc]" />
            <span>Deep Learning Benchmark Comparison (+24h Horizon)</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
            <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-1">
              <span className="text-emerald-800 font-bold block">XGBoost Regressor (Selected Model)</span>
              <div className="text-slate-700">MAE: {dlBench.xgboost.mae} µg/m³ · RMSE: {dlBench.xgboost.rmse} µg/m³</div>
              <div className="text-emerald-700 font-bold text-sm">R² Score: {dlBench.xgboost.r2}</div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-slate-600">
              <span className="text-slate-800 font-bold block">PyTorch LSTM Sequence Network</span>
              <div className="text-slate-600">MAE: {dlBench.lstm_pytorch.mae} µg/m³ · RMSE: {dlBench.lstm_pytorch.rmse} µg/m³</div>
              <div className="text-rose-600 font-bold text-sm">R² Score: {dlBench.lstm_pytorch.r2}</div>
            </div>
          </div>

          <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200/80 font-sans">
            <strong className="text-slate-900">Decision Rule Verification:</strong> {dlBench.decision}
          </p>
        </div>
      )}
    </div>
  )
}
