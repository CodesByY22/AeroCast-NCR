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
    return <div className="p-8 text-center text-[#86868b]">Loading model validation protocol & metrics...</div>
  }

  const split = validation?.split_protocol
  const table = validation?.metrics_table || []
  const dlBench = validation?.deep_learning_benchmark
  const testSeries = validation?.observed_vs_predicted_test_series || []

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-[#d2d2d7] rounded-xl p-6">
        <h2 className="text-[18px] font-semibold text-[#1d1d1f] flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-[#2e7d32]" strokeWidth={1.5} />
          SIH Model Evaluation & Scientific Validation Protocol
        </h2>
        <p className="text-[13px] text-[#86868b] mt-1">Empirical validation documentation, chronological split proof, and actual vs predicted performance curves on unseen test data.</p>
      </div>

      {/* Split protocol */}
      {split && (
        <div className="bg-white border border-[#d2d2d7] rounded-xl p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#0066cc] text-[12px] font-medium uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-[#2e7d32]" strokeWidth={1.5} />
              Strict Time-Series Chronological Split Protocol (Data Leakage Proof)
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#e8f5e9] text-[#2e7d32] border border-[#c8e6c9]">
              NON-RANDOM SPLIT VERIFIED
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-[12px] pt-1">
            <div className="p-3 bg-[#f5f5f7] border border-[#e8e8ed] rounded-lg space-y-1">
              <span className="text-[#86868b] text-[10px] uppercase">Training Window</span>
              <div className="font-semibold text-[#1d1d1f]">{split.train_hours} Hours</div>
              <span className="text-[#86868b] text-[10px]">{split.train_period}</span>
            </div>
            <div className="p-3 bg-[#f5f5f7] border border-[#e8e8ed] rounded-lg space-y-1">
              <span className="text-[#86868b] text-[10px] uppercase">Unseen Test Window</span>
              <div className="font-semibold text-[#0066cc]">{split.test_hours} Hours</div>
              <span className="text-[#86868b] text-[10px]">{split.test_period}</span>
            </div>
            <div className="p-3 bg-[#f5f5f7] border border-[#e8e8ed] rounded-lg space-y-1">
              <span className="text-[#86868b] text-[10px] uppercase">Validation Rule</span>
              <div className="font-semibold text-[#2e7d32]">Strict Non-Overlapping</div>
              <span className="text-[#86868b] text-[10px]">Zero Random K-Fold Shuffling</span>
            </div>
          </div>
        </div>
      )}

      {/* Observed vs Predicted chart */}
      <div className="bg-white border border-[#d2d2d7] rounded-xl p-6 space-y-4">
        <h3 className="text-[15px] font-semibold text-[#1d1d1f] flex items-center justify-between">
          <span>Observed PM2.5 vs Predicted PM2.5 (+24h XGBoost on Unseen Test Split)</span>
          <span className="text-[12px] text-[#0066cc] font-mono">Evaluation Set ({testSeries.length} Timesteps)</span>
        </h3>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={testSeries} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8e8ed" />
              <XAxis dataKey="timestamp" stroke="#86868b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#86868b" tick={{ fontSize: 11 }} label={{ value: 'PM2.5 (µg/m³)', angle: -90, position: 'insideLeft', fill: '#86868b' }} />
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#d2d2d7', borderRadius: '8px', fontSize: '12px', color: '#1d1d1f' }} />
              <Legend />
              <Line type="monotone" dataKey="observed_pm25" name="Observed Ground Truth (PM2.5)" stroke="#2e7d32" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="predicted_pm25" name="Predicted Model Output (PM2.5)" stroke="#0066cc" strokeWidth={2} strokeDasharray="4 4" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Metrics table */}
      <div className="bg-white border border-[#d2d2d7] rounded-xl p-6 space-y-4">
        <h3 className="text-[15px] font-semibold text-[#1d1d1f]">Multi-Horizon Evaluation Metrics (XGBoost Regressor)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[12px]">
            <thead>
              <tr className="border-b border-[#d2d2d7] text-[#6e6e73] font-medium bg-[#f5f5f7]">
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
                <tr key={idx} className="border-b border-[#e8e8ed] hover:bg-[#f5f5f7] transition-colors">
                  <td className="p-3 font-semibold text-[#0066cc] font-mono">{row.horizon}</td>
                  <td className="p-3 text-[#424245]">{row.model}</td>
                  <td className="p-3 text-[#1d1d1f] font-semibold">{row.mae.toFixed(2)}</td>
                  <td className="p-3 text-[#1d1d1f] font-semibold">{row.rmse.toFixed(2)}</td>
                  <td className="p-3 text-[#2e7d32] font-semibold">{row.r2.toFixed(4)}</td>
                  <td className="p-3 text-[#0066cc]">{row.mape.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DL Benchmark */}
      {dlBench && (
        <div className="bg-white border border-[#d2d2d7] rounded-xl p-6 space-y-3">
          <h3 className="text-[15px] font-semibold text-[#1d1d1f] flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#0066cc]" strokeWidth={1.5} />
            Deep Learning Benchmark Comparison (+24h Horizon)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-[12px]">
            <div className="p-4 bg-[#e8f5e9] border border-[#c8e6c9] rounded-lg space-y-1">
              <span className="text-[#2e7d32] font-semibold block">XGBoost Regressor (Selected Model)</span>
              <div className="text-[#424245]">MAE: {dlBench.xgboost.mae} µg/m³ · RMSE: {dlBench.xgboost.rmse} µg/m³</div>
              <div className="text-[#2e7d32] font-semibold text-[14px]">R² Score: {dlBench.xgboost.r2}</div>
            </div>

            <div className="p-4 bg-[#f5f5f7] border border-[#e8e8ed] rounded-lg space-y-1 text-[#6e6e73]">
              <span className="text-[#424245] font-semibold block">PyTorch LSTM Sequence Network</span>
              <div>MAE: {dlBench.lstm_pytorch.mae} µg/m³ · RMSE: {dlBench.lstm_pytorch.rmse} µg/m³</div>
              <div className="text-[#d32f2f] font-semibold text-[14px]">R² Score: {dlBench.lstm_pytorch.r2}</div>
            </div>
          </div>

          <p className="text-[12px] text-[#6e6e73] bg-[#f5f5f7] p-3 rounded-lg border border-[#e8e8ed]">
            <strong className="text-[#1d1d1f]">Decision Rule Verification:</strong> {dlBench.decision}
          </p>
        </div>
      )}
    </div>
  )
}
