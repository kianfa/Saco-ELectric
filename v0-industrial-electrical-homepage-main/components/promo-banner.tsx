"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export function PromoBanner() {
  return (
    <section className="container mx-auto px-4 py-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-primary to-primary/90 p-8 md:p-12">
        {/* Background Decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-accent/50 rounded-full blur-2xl" />
        </div>

        <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Text Content */}
          <div className="text-center md:text-right">
            <h3 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-2">
              فروش ویژه تجهیزات برق صنعتی
            </h3>
            <p className="text-primary-foreground/80 text-lg">
              تخفیف‌های استثنایی مخصوص پروژه‌ها و خریداران عمده
            </p>
          </div>

          {/* Badge & CTA */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="bg-accent text-accent-foreground px-6 py-3 rounded-2xl text-center">
              <span className="text-sm">تا</span>
              <span className="text-3xl font-bold mx-2">۲۰٪</span>
              <span className="text-sm block">تخفیف پروژه‌ای</span>
            </div>
            <Button
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl px-6 font-semibold"
            >
              مشاهده پیشنهادها
              <ArrowLeft className="w-5 h-5 mr-2" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
