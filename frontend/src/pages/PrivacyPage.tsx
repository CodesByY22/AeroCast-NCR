import { LockClosedIcon, CheckIcon } from '@heroicons/react/24/outline'

export default function PrivacyPage() {
  return (
    <div className="p-10 max-w-4xl mx-auto space-y-12 pb-24 text-[13px] text-textMuted leading-relaxed">
      <div>
        <h1 className="text-[28px] font-light tracking-tight text-textMain">Privacy Policy</h1>
        <p className="mt-1">Effective Date: September 2026 | Prototype Version 1.0</p>
      </div>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-[14px] text-textMain mb-2">1. Zero Personal Data Tracking</h2>
          <p>We do not ask for names, email addresses, or accounts. We do not track geolocation. We do not place analytics cookies.</p>
        </section>
        <section>
          <h2 className="text-[14px] text-textMain mb-2">2. Client-Side Processing</h2>
          <p>Interactive calculations and chart renderings occur entirely within your web browser.</p>
        </section>
      </div>
    </div>
  )
}
