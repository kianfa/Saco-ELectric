"use client"

import Link from "next/link"
import { Building2, FileText, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { storeContactConfig } from "@/lib/store-contact-config"
import { useContactInfo } from "@/components/site-settings-provider"

export function ProjectPurchaseBox() {
  const contact = useContactInfo()
  const supportPhone = contact.supportPhone || contact.mobile || storeContactConfig.mobile

  return (
    <section className="overflow-hidden rounded-3xl border border-primary/15 bg-primary text-primary-foreground shadow-sm">
      <div className="grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-center md:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/[0.12]">
            <Building2 className="h-7 w-7" />
          </div>
          <div>
            <p className="text-xs font-bold text-white/70">تأمین تخصصی تجهیزات برق صنعتی</p>
            <h2 className="mt-1 text-xl font-black">خرید پروژه‌ای و سفارش عمده</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/80">
              برای بررسی موجودی، دریافت قیمت همکاری، تهیه پیش‌فاکتور رسمی و هماهنگی ارسال پروژه‌ای با کارشناسان فروش در ارتباط باشید.
            </p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 md:min-w-[320px]">
          <Button asChild variant="secondary" size="lg" className="h-12 rounded-xl bg-white font-bold text-primary hover:bg-white/90">
            <Link href="/contact?subject=%D8%A7%D8%B3%D8%AA%D8%B9%D9%84%D8%A7%D9%85%20%D9%82%DB%8C%D9%85%D8%AA%20%D9%BE%D8%B1%D9%88%DA%98%D9%87%E2%80%8C%D8%A7%DB%8C">
              <FileText className="h-4 w-4" />
              <span>دریافت پیش‌فاکتور</span>
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-12 rounded-xl border-white/30 bg-transparent font-bold text-white hover:bg-white/10 hover:text-white">
            <a href={`tel:${supportPhone}`}>
              <Phone className="h-4 w-4" />
              <span>تماس با کارشناس</span>
            </a>
          </Button>
        </div>
      </div>
    </section>
  )
}
