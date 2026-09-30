import { CpuChipIcon, InformationCircleIcon } from '@heroicons/react/24/outline'

export default function ExplainabilityPage({ diagnostics, forecast, loading }: { diagnostics: any, forecast: any, loading: boolean }) {
  if (loading && !diagnostics) return null

  return (
    <div className="p-10 max-w-6xl mx-auto space-y-12 pb-24">
      <div>
        <h1 className="text-[28px] font-light tracking-tight text-textMain">AI Intelligence</h1>
        <p className="text-[13px] text-textMuted mt-1">SHAP values and causal drivers for the current forecast.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-6">
          <span className="text-[14px] text-textMain block">Top Contributing Factors</span>
          <div className="space-y-4">
            {diagnostics?.model_explainability?.shap_values.map((sv: any, i: number) => (
              <div key={i} className="flex justify-between items-center text-[13px]">
                <span className="text-textMuted">{sv.feature.replace(/_/g, ' ').toUpperCase()}</span>
                <span className="font-mono text-textMain">{sv.value.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6 pl-0 lg:pl-12 lg:border-l lg:border-borderSubtle">
          <span className="text-[14px] text-textMain block">Model Constraints</span>
          <p className="text-[12px] text-textMuted leading-relaxed">
            The AI model relies heavily on meteorological dispersion proxies (PBL height and wind speed) and upstream fire counts. Urban background emissions are treated as a constant bias in this iteration.
          </p>
        </div>
      </div>
    </div>
  )
}
