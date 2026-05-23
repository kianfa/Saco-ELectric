"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export function HeroSection() {
  return (
    <section className="container mx-auto px-4 py-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-primary via-primary to-primary/90 min-h-[400px] lg:min-h-[450px]">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-64 h-64 bg-accent rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-20 w-48 h-48 bg-accent/50 rounded-full blur-2xl" />
        </div>

        <div className="relative grid lg:grid-cols-2 gap-8 p-8 lg:p-12">
          {/* Text Content */}
          <div className="flex flex-col justify-center text-primary-foreground">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4">
              راهکار حرفه‌ای برق صنعتی
            </h2>
            <p className="text-xl md:text-2xl mb-6 text-primary-foreground/90">
              تجهیزات مطمئن برای صنعت و اتوماسیون
            </p>
            <div className="flex flex-wrap gap-3 text-sm md:text-base mb-8 text-primary-foreground/80">
              <span>کیفیت برتر</span>
              <span className="text-accent">|</span>
              <span>برندهای معتبر</span>
              <span className="text-accent">|</span>
              <span>قیمت رقابتی</span>
              <span className="text-accent">|</span>
              <span>پشتیبانی فنی تخصصی</span>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl px-6 font-semibold"
              >
                مشاهده محصولات
                <ArrowLeft className="w-5 h-5 mr-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 rounded-xl px-6 font-semibold"
              >
                استعلام قیمت
              </Button>
            </div>
          </div>

          {/* Visual Content */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="relative w-full max-w-md">
              {/* Industrial Equipment Visual Composition */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 aspect-square flex items-center justify-center border border-white/20">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-2 bg-accent/20 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">⚡</span>
                    </div>
                    <span className="text-sm text-primary-foreground/80">تابلو برق</span>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 aspect-square flex items-center justify-center border border-white/20">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-2 bg-accent/20 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">🔧</span>
                    </div>
                    <span className="text-sm text-primary-foreground/80">PLC</span>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 aspect-square flex items-center justify-center border border-white/20">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-2 bg-accent/20 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">⚙️</span>
                    </div>
                    <span className="text-sm text-primary-foreground/80">موتور</span>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 aspect-square flex items-center justify-center border border-white/20">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-2 bg-accent/20 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">📡</span>
                    </div>
                    <span className="text-sm text-primary-foreground/80">سنسور</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Carousel Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          <span className="w-3 h-3 rounded-full bg-accent" />
          <span className="w-3 h-3 rounded-full bg-primary-foreground/30" />
          <span className="w-3 h-3 rounded-full bg-primary-foreground/30" />
          <span className="w-3 h-3 rounded-full bg-primary-foreground/30" />
        </div>
      </div>
    </section>
  )
}
