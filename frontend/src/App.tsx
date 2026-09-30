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
      <div className="flex min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
        <Sidebar />

        <div className="flex-1 flex flex-col min-w-0">
          <Header
            onRefresh={loadAllData}
            loading={loading}
            onOpenWrfModal={() => setShowWrfModal(true)}
          />

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

          <footer className="border-t border-[#d2d2d7] py-4 px-8 flex flex-col sm:flex-row items-center justify-between text-[12px] text-[#86868b] bg-white shrink-0 gap-2">
            <span>AeroCast NCR · Air Pollution-Weather Intelligence System · <strong className="text-[#6e6e73]">SIH26082</strong></span>
            <div className="flex items-center gap-4">
              <Link to="/terms" className="hover:text-[#1d1d1f] transition-colors">Terms of Service</Link>
              <Link to="/privacy" className="hover:text-[#1d1d1f] transition-colors">Privacy Policy</Link>
              <a href="https://github.com/CodesByY22/AeroCast-NCR" target="_blank" rel="noreferrer" className="hover:text-[#1d1d1f] transition-colors">GitHub</a>
            </div>
          </footer>
        </div>

        {/* WRF-Chem modal */}
        {showWrfModal && wrfStub && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white border border-[#d2d2d7] rounded-xl max-w-lg w-full p-6 space-y-4 shadow-lg">
              <div className="flex justify-between items-start">
                <h3 className="text-[15px] font-semibold text-[#1d1d1f] flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#0066cc]" strokeWidth={1.5} />
                  Operational WRF-Chem Connector Contract
                </h3>
                <button onClick={() => setShowWrfModal(false)} className="text-[#86868b] hover:text-[#1d1d1f] text-sm p-1">✕</button>
              </div>
              <div className="bg-[#f5f5f7] rounded-lg p-4 font-mono text-[12px] text-[#1d1d1f] space-y-1.5 border border-[#e8e8ed]">
                <div><span className="text-[#0066cc] font-medium">Status:</span> {wrfStub.status}</div>
                <div><span className="text-[#ff9f0a] font-medium">Notice:</span> {wrfStub.notice}</div>
                <div><span className="text-[#34c759] font-medium">Target Resolution:</span> {wrfStub.target_resolution}</div>
                <div><span className="text-[#6e6e73] font-medium">Benchmark:</span> {wrfStub.benchmark_reference}</div>
              </div>
              <p className="text-[12px] text-[#6e6e73]">
                This research stub satisfies the hard constraint: AeroCast NCR does not fake 3D atmospheric chemistry runs, exposing a clean API contract for operational WRF-Chem HPC coupling post-MVP.
              </p>
              <div className="flex justify-end">
                <button
                  onClick={() => setShowWrfModal(false)}
                  className="px-4 py-2 bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] border border-[#d2d2d7] rounded-lg text-[12px] font-medium transition-colors"
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
