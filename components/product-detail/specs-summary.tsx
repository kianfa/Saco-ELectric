import type { ReactNode } from "react"
import { Activity, Layers, Shield, Zap } from "lucide-react"

interface SpecsSummaryProps {
  specs: { label: string; value: string }[]
}

const iconMap: Record<string, ReactNode> = {
  "جریان نامی": <Zap className="h-5 w-5" />,
  "تعداد پل": <Layers className="h-5 w-5" />,
  "قدرت قطع": <Activity className="h-5 w-5" />,
  "نوع حفاظت": <Shield className="h-5 w-5" />,
}

export function SpecsSummary({ specs }: SpecsSummaryProps) {
  return (
    <section className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-primary">در یک نگاه</p>
          <h2 className="mt-1 text-xl font-black text-foreground">ویژگی‌های کلیدی محصول</h2>
        </div>
        <span className="hidden text-xs text-muted-foreground sm:block">اطلاعات مهم برای انتخاب سریع‌تر</span>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {specs.map((spec, index) => (
          <div key={`${spec.label}-${index}`} className="rounded-2xl border border-border bg-muted/25 p-4 transition-colors hover:border-primary/30 hover:bg-primary/[0.025]">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              {iconMap[spec.label] || <Zap className="h-5 w-5" />}
            </div>
            <p className="text-xs font-medium text-muted-foreground">{spec.label}</p>
            <p className="mt-1 text-sm font-black leading-6 text-foreground sm:text-base">{spec.value}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
