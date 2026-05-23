import { CheckCircle2, CreditCard, FileText, Headphones } from "lucide-react"
import { cn } from "@/lib/utils"

export type PaymentMethod = "online" | "coordination" | "proforma" | ""

const methods = [
  {
    id: "online" as const,
    title: "پرداخت آنلاین",
    description: "انتقال به درگاه پرداخت امن ایرانی",
    icon: CreditCard,
  },
  {
    id: "coordination" as const,
    title: "پرداخت کارت به کارت / هماهنگی با فروش",
    description: "مناسب خریدهای عمده و پروژه‌ای",
    icon: Headphones,
  },
  {
    id: "proforma" as const,
    title: "صدور پیش‌فاکتور",
    description: "برای شرکت‌ها، سازمان‌ها و پروژه‌های صنعتی",
    icon: FileText,
  },
]

interface PaymentMethodSelectorProps {
  value: PaymentMethod
  onChange: (value: PaymentMethod) => void
  showWarning?: boolean
}

export function PaymentMethodSelector({ value, onChange, showWarning = false }: PaymentMethodSelectorProps) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
      <div className="mb-5">
        <h2 className="text-lg font-extrabold text-foreground">روش پرداخت</h2>
        <p className="mt-1 text-sm text-muted-foreground">روش پرداخت یا هماهنگی مالی سفارش را مشخص کنید.</p>
      </div>

      {showWarning && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
          لطفاً یک روش پرداخت انتخاب کنید.
        </div>
      )}

      <div className="grid gap-3">
        {methods.map((method) => {
          const Icon = method.icon
          const selected = value === method.id

          return (
            <button
              key={method.id}
              type="button"
              onClick={() => onChange(method.id)}
              className={cn(
                "flex w-full items-start gap-4 rounded-2xl border bg-background p-4 text-right transition-all hover:border-primary/50 hover:shadow-sm",
                selected ? "border-primary ring-2 ring-primary/10" : "border-border",
              )}
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-extrabold text-foreground">{method.title}</h3>
                  {selected && <CheckCircle2 className="h-5 w-5 shrink-0 text-secondary" />}
                </div>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{method.description}</p>
              </div>
            </button>
          )
        })}
      </div>

      <p className="mt-4 rounded-xl bg-muted/50 px-4 py-3 text-sm leading-7 text-muted-foreground">
        پرداخت آنلاین پس از تایید نهایی سفارش به درگاه بانکی منتقل می‌شود.
      </p>
    </section>
  )
}
