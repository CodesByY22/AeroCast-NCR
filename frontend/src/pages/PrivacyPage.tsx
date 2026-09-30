import { Lock, Check } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e8f5e9] text-[#2e7d32] border border-[#c8e6c9] text-[11px] font-medium">
          <Lock className="w-3.5 h-3.5" strokeWidth={1.5} />
          Zero Personal Data Tracking — Privacy Policy
        </div>
        <h1 className="text-[28px] font-semibold tracking-tight text-[#1d1d1f]">Privacy Policy</h1>
        <p className="text-[14px] text-[#86868b]">Effective Date: September 2026 | Prototype Version 1.0 (SIH26082 Focus)</p>
      </div>

      <div className="bg-white border border-[#d2d2d7] rounded-xl p-6 space-y-6 text-[14px] text-[#1d1d1f] leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-[16px] font-semibold text-[#1d1d1f]">1. Our Data Privacy Commitment</h2>
          <p className="text-[#424245]">
            AeroCast NCR prioritizes user privacy. The platform functions strictly as an open-access environmental information viewer and forecasting intelligence dashboard.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-[16px] font-semibold text-[#1d1d1f]">2. Information We Do NOT Collect</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 bg-[#f5f5f7] border border-[#e8e8ed] rounded-lg flex items-start gap-2 text-[12px] text-[#424245]">
              <Check className="w-4 h-4 text-[#2e7d32] shrink-0 mt-0.5" strokeWidth={1.5} />
              <span><strong>No Personal Identification:</strong> We do not ask for names, email addresses, or accounts.</span>
            </div>
            <div className="p-3 bg-[#f5f5f7] border border-[#e8e8ed] rounded-lg flex items-start gap-2 text-[12px] text-[#424245]">
              <Check className="w-4 h-4 text-[#2e7d32] shrink-0 mt-0.5" strokeWidth={1.5} />
              <span><strong>No Geolocation Tracking:</strong> The platform displays fixed monitoring station coordinates without querying device location.</span>
            </div>
            <div className="p-3 bg-[#f5f5f7] border border-[#e8e8ed] rounded-lg flex items-start gap-2 text-[12px] text-[#424245]">
              <Check className="w-4 h-4 text-[#2e7d32] shrink-0 mt-0.5" strokeWidth={1.5} />
              <span><strong>No Analytics Cookies:</strong> We do not place tracking cookies, advertising tags, or third-party pixels.</span>
            </div>
            <div className="p-3 bg-[#f5f5f7] border border-[#e8e8ed] rounded-lg flex items-start gap-2 text-[12px] text-[#424245]">
              <Check className="w-4 h-4 text-[#2e7d32] shrink-0 mt-0.5" strokeWidth={1.5} />
              <span><strong>Client-Side Processing:</strong> Interactive calculations and chart renderings occur entirely within your web browser.</span>
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-[16px] font-semibold text-[#1d1d1f]">3. Technical Infrastructure & Hosting</h2>
          <p className="text-[#424245]">
            Our frontend application is hosted on Vercel and backend microservices run on Render. Standard server infrastructure logs (IP address, user-agent string) may be recorded by hosting providers solely for DDoS prevention and operational health monitoring.
          </p>
        </section>

        <section className="space-y-2 border-t border-[#e8e8ed] pt-4">
          <p className="text-[12px] text-[#86868b]">
            Note: Draft for review. AeroCast NCR adheres to public domain non-personal data governance standards.
          </p>
        </section>
      </div>
    </div>
  )
}
