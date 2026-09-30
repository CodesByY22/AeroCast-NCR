import { DocumentTextIcon } from '@heroicons/react/24/outline'

export default function TermsPage() {
  return (
    <div className="p-10 max-w-4xl mx-auto space-y-12 pb-24 text-[13px] text-textMuted leading-relaxed">
      <div>
        <h1 className="text-[28px] font-light tracking-tight text-textMain">Terms of Service</h1>
        <p className="mt-1">Effective Date: September 2026 | Prototype Version 1.0</p>
      </div>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-[14px] text-textMain mb-2">1. Nature of the Service (SIH 2026 Context)</h2>
          <p>AeroCast NCR is a prototype developed for Smart India Hackathon (SIH) 2026. The data displayed is generated via experimental machine learning models and should not be used for critical health or policy decisions.</p>
        </section>
        <section>
          <h2 className="text-[14px] text-textMain mb-2">2. Scientific Disclaimer</h2>
          <p>Forecasts are probabilities, not guarantees. The system relies on third-party APIs (CPCB, NASA FIRMS, Open-Meteo) and is subject to their uptime and data accuracy limits.</p>
        </section>
      </div>
    </div>
  )
}
