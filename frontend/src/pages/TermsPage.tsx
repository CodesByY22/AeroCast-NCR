import { FileText, Shield } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f0f4ff] text-[#0066cc] border border-[#c5d5f7] text-[11px] font-medium">
          <FileText className="w-3.5 h-3.5" strokeWidth={1.5} />
          Draft for Review — AeroCast NCR Governance
        </div>
        <h1 className="text-[28px] font-semibold tracking-tight text-[#1d1d1f]">Terms of Service</h1>
        <p className="text-[14px] text-[#86868b]">Effective Date: September 2026 | Prototype Version 1.0 (SIH26082 Focus)</p>
      </div>

      <div className="bg-white border border-[#d2d2d7] rounded-xl p-6 space-y-6 text-[14px] text-[#1d1d1f] leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-[16px] font-semibold text-[#1d1d1f]">1. Purpose and Scope</h2>
          <p className="text-[#424245]">
            AeroCast NCR is a decision-support prototype developed for Smart India Hackathon 2026 (Problem Statement SIH26082). It provides high-resolution 72-hour Air Quality Index (AQI) forecasts, atmospheric diagnostics, and stubble transport risk evaluations for the National Capital Region (NCR), India.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-[16px] font-semibold text-[#1d1d1f]">2. Data Sources and Attribution</h2>
          <p className="text-[#424245]">The platform fuses publicly available data streams from:</p>
          <ul className="list-disc pl-5 space-y-1 text-[#424245]">
            <li><strong>Central Pollution Control Board (CPCB) / OpenAQ:</strong> Ground-level ambient air quality monitoring readings.</li>
            <li><strong>Open-Meteo & ECMWF ERA5:</strong> High-resolution surface meteorological and boundary-layer reanalysis metrics.</li>
            <li><strong>NASA FIRMS (VIIRS/MODIS):</strong> Satellite thermal anomaly and active fire location observations.</li>
            <li><strong>Copernicus CAMS:</strong> Atmospheric aerosol and reactive gas monitoring data.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-[16px] font-semibold text-[#1d1d1f]">3. Non-Commercial & Operational Use Disclaimer</h2>
          <div className="bg-[#f5f5f7] border border-[#e8e8ed] p-4 rounded-lg text-[12px] space-y-2 text-[#424245]">
            <p className="font-medium text-[#1d1d1f] flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#0066cc]" strokeWidth={1.5} /> Operational Forecast Disclaimer
            </p>
            <p>
              AeroCast NCR is designed as a data-driven prototype inspired by operational 400m WRF-Chem systems. Predictions emitted by this system are for research, policy evaluation, and hackathon demonstration purposes. Official emergency advisories remain under the statutory purview of CPCB, CAQM, and IMD/NCMRWF.
            </p>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-[16px] font-semibold text-[#1d1d1f]">4. Intellectual Property</h2>
          <p className="text-[#424245]">
            The AeroCast NCR codebase is open-source under the MIT License. Model weights, training pipelines, and UI source code are maintained publicly at <a href="https://github.com/CodesByY22/AeroCast-NCR" target="_blank" rel="noreferrer" className="text-[#0066cc] underline">GitHub</a>.
          </p>
        </section>

        <section className="space-y-2 border-t border-[#e8e8ed] pt-4">
          <p className="text-[12px] text-[#86868b]">
            Note: This Terms of Service document is a review draft prepared for hackathon evaluation and compliance validation.
          </p>
        </section>
      </div>
    </div>
  )
}
