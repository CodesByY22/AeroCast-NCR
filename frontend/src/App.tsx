import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import OverviewPage from './pages/OverviewPage'
import ForecastPage from './pages/ForecastPage'
import MapPage from './pages/MapPage'
import AtmospherePage from './pages/AtmospherePage'
import StubblePage from './pages/StubblePage'
import ExplainabilityPage from './pages/ExplainabilityPage'
import AlertsPage from './pages/AlertsPage'
import ValidationPage from './pages/ValidationPage'
import {
  fetch72hForecast, fetchDiagnostics, fetchStubbleRisk, fetchValidationMetrics, fetchAlertsHistory, fetchWrfStub,
  ForecastData, DiagnosticData, StubbleRiskData, ValidationMetricsData, AlertsHistoryData, WrfStubData
} from './api/client'
import { Layers } from 'lucide-react'

export default function App() {
  const [forecast, setForecast] = useState<ForecastData | null>(null)
  const [diagnostics, setDiagnostics] = useState<DiagnosticData | null>(null)
  const [risk, setRisk] = useState<StubbleRiskData | null>(null)
  const [validation, setValidation] = useState<ValidationMetricsData | null>(null)
  const [alerts, setAlerts] = useState<AlertsHistoryData | null>(null)
  const [wrfStub, setWrfStub] = useState<WrfStubData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showWrfModal, setShowWrfModal] = useState(false)

  const loadAllData = async () => {
    setLoading(true)
    try {
      const [fData, dData, rData, vData, aData, wData] = await Promise.all([
        fetch72hForecast(),
        fetchDiagnostics(),
        fetchStubbleRisk(),
        fetchValidationMetrics(),
        fetchAlertsHistory(),
        fetchWrfStub()
      ])
      setForecast(fData)
      setDiagnostics(dData)
      setRisk(rData)
      setValidation(vData)
      setAlerts(aData)
      setWrfStub(wData)
    } catch (e) {
      console.error('Failed to load application data:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAllData()
  }, [])

  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-[#070b14] text-slate-100 font-sans selection:bg-cyan-500 selection:text-white">
        {/* Persistent Left Sidebar Navigation */}
        <Sidebar />

        {/* Main Content Body */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Header Bar */}
          <Header
            onRefresh={loadAllData}
            loading={loading}
            onOpenWrfModal={() => setShowWrfModal(true)}
          />

          {/* Client-side Router Views */}
          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<OverviewPage forecast={forecast} diagnostics={diagnostics} risk={risk} loading={loading} />} />
              <Route path="/forecast" element={<ForecastPage forecast={forecast} loading={loading} />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/atmosphere" element={<AtmospherePage diagnostics={diagnostics} loading={loading} />} />
              <Route path="/stubble" element={<StubblePage risk={risk} loading={loading} />} />
              <Route path="/explainability" element={<ExplainabilityPage diagnostics={diagnostics} forecast={forecast} loading={loading} />} />
              <Route path="/alerts" element={<AlertsPage alerts={alerts} loading={loading} />} />
              <Route path="/validation" element={<ValidationPage validation={validation} loading={loading} />} />
            </Routes>
          </main>

          {/* Footer */}
          <footer className="border-t border-slate-800/80 py-4 text-center text-xs text-slate-500 shrink-0">
            AeroCast NCR — Weather–Pollution Intelligence Platform | SIH26082
          </footer>
        </div>

        {/* Persistent WRF-Chem Research Interface Modal */}
        {showWrfModal && wrfStub && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
              <div className="flex justify-between items-start">
                <h3 className="text-md font-bold text-slate-100 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-cyan-400" />
                  <span>Operational WRF-Chem Connector Contract</span>
                </h3>
                <button onClick={() => setShowWrfModal(false)} className="text-slate-400 hover:text-white font-bold text-sm">✕</button>
              </div>
              <div className="bg-slate-950 rounded-xl p-4 font-mono text-xs text-slate-300 space-y-2 border border-slate-800">
                <div><span className="text-cyan-400">Status:</span> {wrfStub.status}</div>
                <div><span className="text-amber-400">Notice:</span> {wrfStub.notice}</div>
                <div><span className="text-emerald-400">Target Resolution:</span> {wrfStub.target_resolution}</div>
                <div><span className="text-indigo-400">Benchmark:</span> {wrfStub.benchmark_reference}</div>
              </div>
              <p className="text-xs text-slate-400">
                This research stub satisfies the hard constraint: AeroCast NCR does not fake 3D atmospheric chemistry runs, exposing a clean API schema for operational WRF-Chem HPC coupling post-MVP.
              </p>
              <div className="flex justify-end">
                <button
                  onClick={() => setShowWrfModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </BrowserRouter>
  )
}
