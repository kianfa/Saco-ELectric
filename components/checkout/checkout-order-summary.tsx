"use client"

import Link from "next/link"
import { ArrowRight, Camera, ExternalLink, Info, LockKeyhole, MessageCircle, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ProductImageWithFallback } from "@/components/product-image-with-fallback"
import { formatPrice } from "@/lib/data"
import type { CartItem } from "@/lib/cart/cart-store"
import { manualCheckoutConfig } from "@/lib/manual-checkout-config"

interface CheckoutOrderSummaryProps {
  items: CartItem[]
  subtotal: number
  discount: number
  payable: number
  shippingLabel: string
  itemCount: number
  telegramUrl: string
  baleUrl: string | null
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
  payable,
  shippingLabel,
  itemCount,
  telegramUrl,
  baleUrl,
}: CheckoutOrderSummaryProps) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-foreground">خلاصه سفارش</h2>
          <p className="text-sm text-muted-foreground">این بخش را برای پشتیبانی ارسال کنید</p>
        </div>
        <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-extrabold text-primary">
          {itemCount.toLocaleString("fa-IR")} کالا
        </div>
      </div>

      <div className="mb-4 flex items-start gap-2 rounded-xl border border-orange-200 bg-orange-50 px-3 py-3 text-xs font-semibold leading-6 text-orange-800">
        <Camera className="mt-0.5 h-4 w-4 shrink-0" />
        <span>برای نهایی‌سازی سفارش، لطفاً از سبد خرید یا خلاصه سفارش خود اسکرین‌شات تهیه کرده و از طریق تلگرام، واتساپ، بله یا روبیکا برای پشتیبانی ارسال کنید. کارشناسان فروش پس از بررسی موجودی کالا، تأیید قیمت نهایی و هماهنگی شرایط ارسال، اطلاعات پرداخت کارت‌به‌کارت را در اختیار شما قرار می‌دهند. پس از پرداخت، سفارش شما در سریع‌ترین زمان ممکن آماده پردازش و ارسال خواهد شد.</span>
      </div>

      <div className="space-y-3 rounded-2xl bg-muted/35 p-3">
        {items.map((item) => (
          <div key={item.productId} className="flex items-start justify-between gap-3 text-sm">
            <div className="flex min-w-0 gap-3">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-muted">
                <ProductImageWithFallback
                  imageUrl={item.mainImageUrl}
                  alt={item.name}
                  fallbackLabel={item.name}
                  objectFit="cover"
                />
              </div>
              <div className="min-w-0">
                <p className="line-clamp-2 font-bold leading-6 text-foreground">{item.name}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span dir="ltr">{item.model ?? item.sku ?? "—"}</span>
                  <span>{item.brandName ?? "برند نامشخص"}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {item.quantity.toLocaleString("fa-IR")} × {formatPrice(item.price)} تومان
                </p>
              </div>
            </div>
            <span className="shrink-0 font-extrabold text-primary">
              {formatPrice(item.price * item.quantity)} تومان
            </span>
          </div>
        ))}
      </div>

      <Separator className="my-4" />

      <div className="space-y-3">
        <PriceRow label="تعداد کالاها" value={`${itemCount.toLocaleString("fa-IR")} عدد`} />
        <PriceRow label="جمع کالاها" value={`${formatPrice(subtotal)} تومان`} />
        <PriceRow label="تخفیف کالاها" value={`${formatPrice(discount)} تومان`} />
        <PriceRow label="هزینه ارسال" value={shippingLabel} />
      </div>

      <Separator className="my-4" />

      <PriceRow label="مبلغ قابل پرداخت" value={`${formatPrice(payable)} تومان`} highlight />

      <div className="mt-3 flex items-start gap-2 rounded-xl bg-muted/50 px-3 py-3 text-xs font-semibold leading-6 text-muted-foreground">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <span>اسکرین‌شات سبد خرید خود را از طریق تلگرام، واتساپ، بله یا روبیکا ارسال کنید تا موجودی، قیمت نهایی و شرایط ارسال توسط کارشناسان ما تأیید شود. پس از تأیید، اطلاعات کارت‌به‌کارت برای تکمیل خرید ارسال خواهد شد.</span>
      </div>

      <div className="mt-5 space-y-3">
        <Button asChild className="h-12 w-full rounded-xl bg-secondary text-base font-extrabold text-secondary-foreground hover:bg-secondary/90">
          <a href={telegramUrl} target="_blank" rel="noreferrer">
            ارسال سفارش در تلگرام
            <Send className="h-4 w-4" />
          </a>
        </Button>
        <Button asChild variant="outline" className="h-11 w-full rounded-xl bg-transparent">
          <a href={baleUrl ?? `tel:${manualCheckoutConfig.bale.phone}`} target="_blank" rel="noreferrer">
            ارسال سفارش در بله
            <MessageCircle className="h-4 w-4" />
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
        <Button asChild variant="ghost" className="h-10 w-full rounded-xl">
          <Link href="/cart">
            <ArrowRight className="h-4 w-4" />
            بازگشت به سبد خرید
          </Link>
        </Button>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
        <LockKeyhole className="h-4 w-4" />
        پرداخت آنلاین در این مرحله غیرفعال است و هیچ تراکنش بانکی ثبت نمی‌شود.
      </div>
    </section>
  )
}
