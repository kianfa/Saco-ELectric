"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import type { HomepageSection } from "@/types/site-content"

const defaultTrustPoints = ["کیفیت برتر", "برندهای معتبر", "قیمت رقابتی", "پشتیبانی فنی تخصصی"]

function getTrustPoints(section?: HomepageSection | null): string[] {
  const points = section?.metadata?.trustPoints
  return Array.isArray(points) && points.length ? points.map(String) : defaultTrustPoints
}

export function HeroSection({ section }: { section?: HomepageSection | null }) {
  const trustPoints = getTrustPoints(section)
  const title = section?.title || "راهکار حرفه‌ای برق صنعتی"
  const subtitle = section?.subtitle || "تجهیزات مطمئن برای صنعت و اتوماسیون"
  const description = section?.description || null
  const primaryText = section?.primaryButtonText || "مشاهده محصولات"
  const primaryUrl = section?.primaryButtonUrl || "/products"
  const secondaryText = section?.secondaryButtonText || "استعلام قیمت"
  const secondaryUrl = section?.secondaryButtonUrl || "/checkout"
  const imageUrl = section?.imageUrl || section?.mobileImageUrl || null

  return (
    <section className="container mx-auto px-4 py-6">
      <div className="relative min-h-[400px] overflow-hidden rounded-3xl bg-gradient-to-l from-primary via-primary to-primary/90 lg:min-h-[450px]">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute right-10 top-10 h-64 w-64 rounded-full bg-accent blur-3xl" />
          <div className="absolute bottom-10 left-20 h-48 w-48 rounded-full bg-accent/50 blur-2xl" />
        </div>

        {imageUrl ? (
          <div className="absolute inset-0 opacity-20 lg:opacity-25">
            <img src={imageUrl} alt={title} className="h-full w-full object-cover" />
          </div>
        ) : null}

        <div className="relative grid gap-8 p-8 lg:grid-cols-2 lg:p-12">
          <div className="flex flex-col justify-center text-primary-foreground">
            <h2 className="mb-4 text-3xl font-bold leading-tight md:text-4xl lg:text-5xl">{title}</h2>
            <p className="mb-4 text-xl text-primary-foreground/90 md:text-2xl">{subtitle}</p>
            {description ? <p className="mb-6 max-w-xl leading-8 text-primary-foreground/80">{description}</p> : null}
            <div className="mb-8 flex flex-wrap gap-3 text-sm text-primary-foreground/80 md:text-base">
              {trustPoints.map((point, index) => (
                <span key={point} className="contents">
                  {index ? <span className="text-accent">|</span> : null}
                  <span>{point}</span>
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-xl bg-accent px-6 font-semibold text-accent-foreground hover:bg-accent/90">
                <Link href={primaryUrl}>{primaryText}<ArrowLeft className="mr-2 h-5 w-5" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-xl border-2 border-primary-foreground bg-transparent px-6 font-semibold text-primary-foreground hover:bg-primary-foreground/10">
                <Link href={secondaryUrl}>{secondaryText}</Link>
              </Button>
            </div>
          </div>

          <div className="hidden items-center justify-center lg:flex">
            {imageUrl ? (
              <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/20 bg-white/10 p-3 shadow-2xl backdrop-blur-sm">
                <img src={imageUrl} alt={title} className="aspect-[4/3] w-full rounded-2xl object-cover" />
              </div>
            ) : (
              <div className="relative w-full max-w-md">
                <div className="grid grid-cols-2 gap-4">
                  {[["⚡", "تابلو برق"], ["🔧", "PLC"], ["⚙️", "موتور"], ["📡", "سنسور"]].map(([icon, label]) => (
                    <div key={label} className="flex aspect-square items-center justify-center rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                      <div className="text-center"><div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-xl bg-accent/20"><span className="text-2xl">{icon}</span></div><span className="text-sm text-primary-foreground/80">{label}</span></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
          <span className="h-3 w-3 rounded-full bg-accent" />
          <span className="h-3 w-3 rounded-full bg-primary-foreground/30" />
          <span className="h-3 w-3 rounded-full bg-primary-foreground/30" />
          <span className="h-3 w-3 rounded-full bg-primary-foreground/30" />
        </div>
      </div>
    </section>
  )
}
