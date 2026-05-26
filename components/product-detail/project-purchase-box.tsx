"use client"

import { Building2, Phone, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { storeContactConfig } from "@/lib/store-contact-config"

export function ProjectPurchaseBox() {
  return (
    <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 md:p-8 text-primary-foreground">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-primary-foreground/20 rounded-2xl flex items-center justify-center shrink-0">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2">خرید پروژه‌ای و عمده</h3>
            <p className="text-primary-foreground/80 text-sm md:text-base leading-relaxed">
              برای سفارش تعداد بالا، تامین پروژه، یا دریافت پیش‌فاکتور با
              کارشناسان ما تماس بگیرید.
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Button
            variant="secondary"
            size="lg"
            className="gap-2 rounded-xl bg-primary-foreground text-primary hover:bg-primary-foreground/90"
          >
            <FileText className="w-5 h-5" />
            <span>دریافت پیش‌فاکتور</span>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="gap-2 rounded-xl border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
          >
            <a href={`tel:${storeContactConfig.mobile}`}>
              <Phone className="w-5 h-5" />
              <span>تماس با کارشناس</span>
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
}
