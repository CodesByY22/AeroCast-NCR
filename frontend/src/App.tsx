import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
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
import TermsPage from './pages/TermsPage'
import PrivacyPage from './pages/PrivacyPage'
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
      <div className="flex min-h-screen bg-[#f5f5f7] text-[#1d1d1f] font-sans selection:bg-blue-100 selection:text-[#0066cc]">
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
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
            </Routes>
          </main>

          {/* Clean Footer */}
          <footer className="border-t border-[#e5e5ea] py-5 px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#6e6e73] bg-white shrink-0 font-sans gap-2">
            <div>
              <span>AeroCast NCR — Air Pollution–Weather Intelligence System | <strong>SIH26082</strong></span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/terms" className="hover:text-[#1d1d1f] underline transition">Terms of Service</Link>
              <Link to="/privacy" className="hover:text-[#1d1d1f] underline transition">Privacy Policy</Link>
              <a href="https://github.com/CodesByY22/AeroCast-NCR" target="_blank" rel="noreferrer" className="hover:text-[#1d1d1f] underline transition">GitHub Repository</a>
            </div>
          </footer>
        </div>

        {/* Persistent WRF-Chem Connector Contract Modal */}
        {showWrfModal && wrfStub && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white border border-[#e5e5ea] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
              <div className="flex justify-between items-start">
                <h3 className="text-base font-semibold text-[#1d1d1f] flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#0066cc]" />
                  <span>Operational WRF-Chem Connector Contract</span>
                </h3>
                <button onClick={() => setShowWrfModal(false)} className="text-[#6e6e73] hover:text-[#1d1d1f] font-semibold text-sm">✕</button>
              </div>
              <div className="bg-[#f5f5f7] rounded-xl p-4 font-mono text-xs text-[#1d1d1f] space-y-2 border border-[#e5e5ea]">
                <div><span className="text-[#0066cc] font-semibold">Status:</span> {wrfStub.status}</div>
                <div><span className="text-amber-700 font-semibold">Notice:</span> {wrfStub.notice}</div>
                <div><span className="text-emerald-700 font-semibold">Target Resolution:</span> {wrfStub.target_resolution}</div>
                <div><span className="text-indigo-700 font-semibold">Benchmark:</span> {wrfStub.benchmark_reference}</div>
              </div>
              <p className="text-xs text-[#6e6e73]">
                This research stub satisfies the hard constraint: AeroCast NCR does not fake 3D atmospheric chemistry runs, exposing a clean API contract for operational WRF-Chem HPC coupling post-MVP.
              </p>
              <div className="flex justify-end">
                <button
                  onClick={() => setShowWrfModal(false)}
                  className="px-4 py-2 bg-[#f5f5f7] hover:bg-[#e5e5ea] text-[#1d1d1f] border border-[#e5e5ea] rounded-xl text-xs font-semibold transition"
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
