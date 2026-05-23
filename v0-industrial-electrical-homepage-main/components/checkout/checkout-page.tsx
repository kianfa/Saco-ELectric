"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { AlertTriangle, ChevronLeft, Home, Loader2, Plus } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { TopBar } from "@/components/top-bar"
import { CheckoutSteps } from "@/components/checkout/checkout-steps"
import { CustomerInfoForm } from "@/components/checkout/customer-info-form"
import { ShippingAddressForm } from "@/components/checkout/shipping-address-form"
import { ShippingMethod, ShippingMethodSelector } from "@/components/checkout/shipping-method-selector"
import { PaymentMethod, PaymentMethodSelector } from "@/components/checkout/payment-method-selector"
import { CheckoutOrderSummary } from "@/components/checkout/checkout-order-summary"
import { ProjectOrderNotice } from "@/components/checkout/project-order-notice"
import { PaymentRedirectModal } from "@/components/checkout/payment-redirect-modal"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { getCartTotals, mockCartItems } from "@/lib/cart-data"

export function CheckoutPage() {
  const items = mockCartItems
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("")
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showRedirect, setShowRedirect] = useState(false)

  const totals = useMemo(() => getCartTotals(items), [items])
  const tax = Math.round(totals.payable * 0.09)
  const payable = totals.payable + tax
  const hasOutOfStock = items.some((item) => !item.inStock)
  const canSubmit = Boolean(shippingMethod && paymentMethod)

  const shippingLabel = shippingMethod === "pickup" ? "رایگان" : "محاسبه پس از تایید"

  const handleSubmit = () => {
    setSubmitted(true)

    if (!canSubmit) {
      return
    }

    setIsSubmitting(true)
    setShowRedirect(true)
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <TopBar />
      <Header />

      <main className="pb-32 lg:pb-12">
        <div className="border-b border-border bg-muted/30">
          <div className="container mx-auto px-4 py-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/" className="flex items-center gap-1 text-muted-foreground hover:text-primary">
                      <Home className="h-4 w-4" />
                      صفحه اصلی
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator>
                  <ChevronLeft className="h-4 w-4" />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/cart" className="text-muted-foreground hover:text-primary">
                      سبد خرید
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator>
                  <ChevronLeft className="h-4 w-4" />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-medium text-foreground">تسویه حساب</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6 md:py-10">
          <div className="mb-6 md:mb-8">
            <h1 className="mb-2 text-2xl font-extrabold text-foreground md:text-3xl">تسویه حساب</h1>
            <p className="max-w-3xl text-sm leading-7 text-muted-foreground md:text-base">
              اطلاعات ارسال، صورتحساب و روش پرداخت سفارش خود را تکمیل کنید.
            </p>
          </div>

          <div className="mb-6">
            <CheckoutSteps />
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
            <section className="space-y-5 lg:order-1">
              {hasOutOfStock && (
                <div className="flex items-start gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm leading-7 text-destructive">
                  <AlertTriangle className="mt-1 h-5 w-5 shrink-0" />
                  <div>
                    <p className="font-extrabold">یک یا چند کالا در حال حاضر موجود نیست.</p>
                    <p>برای ادامه خرید، موجودی کالاهای پروژه‌ای را از فروشگاه استعلام کنید.</p>
                  </div>
                </div>
              )}

              <CustomerInfoForm showErrors={submitted} />
              <ShippingAddressForm showErrors={submitted} />
              <ShippingMethodSelector
                value={shippingMethod}
                onChange={setShippingMethod}
                showWarning={submitted && !shippingMethod}
              />
              <PaymentMethodSelector
                value={paymentMethod}
                onChange={setPaymentMethod}
                showWarning={submitted && !paymentMethod}
              />
              <ProjectOrderNotice />
            </section>

            <aside className="lg:sticky lg:top-32 lg:order-2">
              <CheckoutOrderSummary
                items={items}
                subtotal={totals.subtotal}
                discount={totals.discount}
                tax={tax}
                payable={payable}
                shippingLabel={shippingLabel}
                itemCount={totals.totalQuantity}
                disabled={isSubmitting}
                loading={isSubmitting}
                onSubmit={handleSubmit}
              />
            </aside>
          </div>
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 p-3 shadow-[0_-10px_30px_rgba(15,23,42,0.12)] backdrop-blur lg:hidden">
        <div className="container mx-auto flex items-center justify-between gap-3 px-1">
          <div>
            <p className="text-xs text-muted-foreground">مبلغ قابل پرداخت</p>
            <p className="text-lg font-extrabold text-primary">{payable.toLocaleString("fa-IR")} تومان</p>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="h-12 rounded-xl bg-secondary px-5 text-sm font-extrabold text-secondary-foreground hover:bg-secondary/90"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            ثبت سفارش
          </Button>
        </div>
      </div>

      <PaymentRedirectModal open={showRedirect} />
      <Footer />
    </div>
  )
}
