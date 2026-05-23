import Link from "next/link"
import { ArrowLeft, ArrowRight, LockKeyhole, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { CartItem } from "@/lib/cart-data"

interface CheckoutOrderSummaryProps {
  items: CartItem[]
  subtotal: number
  discount: number
  tax: number
  payable: number
  shippingLabel: string
  itemCount: number
  disabled?: boolean
  loading?: boolean
  onSubmit: () => void
}

function PriceRow({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={highlight ? "text-lg font-extrabold text-primary" : "font-bold text-foreground"}>{value}</span>
    </div>
  )
}

export function CheckoutOrderSummary({
  items,
  subtotal,
  discount,
  tax,
  payable,
  shippingLabel,
  itemCount,
  disabled = false,
  loading = false,
  onSubmit,
}: CheckoutOrderSummaryProps) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-foreground">خلاصه سفارش</h2>
          <p className="text-sm text-muted-foreground">بررسی نهایی قبل از ثبت سفارش</p>
        </div>
        <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-extrabold text-primary">
          {itemCount.toLocaleString("fa-IR")} کالا
        </div>
      </div>

      <div className="space-y-3 rounded-2xl bg-muted/35 p-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-start justify-between gap-3 text-sm">
            <div className="min-w-0">
              <p className="line-clamp-2 font-bold leading-6 text-foreground">{item.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">تعداد: {item.quantity.toLocaleString("fa-IR")}</p>
            </div>
            <span className="shrink-0 font-extrabold text-primary">
              {(item.price * item.quantity).toLocaleString("fa-IR")}
            </span>
          </div>
        ))}
      </div>

      <Separator className="my-4" />

      <div className="space-y-3">
        <PriceRow label="تعداد کالاها" value={`${itemCount.toLocaleString("fa-IR")} عدد`} />
        <PriceRow label="جمع کالاها" value={`${subtotal.toLocaleString("fa-IR")} تومان`} />
        <PriceRow label="تخفیف" value={`${discount.toLocaleString("fa-IR")} تومان`} />
        <PriceRow label="هزینه ارسال" value={shippingLabel} />
        <PriceRow label="مالیات بر ارزش افزوده" value={`${tax.toLocaleString("fa-IR")} تومان`} />
      </div>

      <Separator className="my-4" />

      <PriceRow label="مبلغ قابل پرداخت" value={`${payable.toLocaleString("fa-IR")} تومان`} highlight />

      <div className="mt-5 space-y-3">
        <Button
          type="button"
          onClick={onSubmit}
          disabled={disabled || loading}
          className="h-12 w-full rounded-xl bg-secondary text-base font-extrabold text-secondary-foreground hover:bg-secondary/90"
        >
          {loading ? "در حال پردازش..." : "ثبت سفارش و ادامه پرداخت"}
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button asChild variant="outline" className="h-11 w-full rounded-xl bg-transparent">
          <Link href="/cart">
            <ArrowRight className="h-4 w-4" />
            بازگشت به سبد خرید
          </Link>
        </Button>
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold leading-6 text-emerald-700">
        <ShieldCheck className="h-4 w-4 shrink-0" />
        اطلاعات سفارش فقط برای ثبت و هماهنگی ارسال استفاده می‌شود.
      </div>
      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
        <LockKeyhole className="h-4 w-4" />
        اتصال درگاه پرداخت در مرحله بعدی پیاده‌سازی می‌شود.
      </div>
    </section>
  )
}
