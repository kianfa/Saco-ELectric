"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import type { HomepageSection, SiteBanner } from "@/types/site-content"

export function PromoBanner({ section, banners = [] }: { section?: HomepageSection | null; banners?: SiteBanner[] }) {
  const banner = banners[0]
  const title = banner?.title || section?.title || "فروش ویژه تجهیزات برق صنعتی"
  const subtitle = banner?.subtitle || section?.subtitle || "تخفیف‌های استثنایی مخصوص پروژه‌ها و خریداران عمده"
  const badgeText = banner?.badgeText || String(section?.metadata?.badgeText ?? "تا ۲۰٪ تخفیف پروژه‌ای")
  const buttonText = banner?.buttonText || section?.primaryButtonText || "مشاهده پیشنهادها"
  const buttonUrl = banner?.buttonUrl || section?.primaryButtonUrl || "/products"
  const imageUrl = banner?.imageUrl || section?.imageUrl || null

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-primary to-primary/90 p-8 md:p-12">
        <div className="absolute inset-0 opacity-10"><div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-accent blur-3xl" /><div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-accent/50 blur-2xl" /></div>
        {imageUrl ? <img src={imageUrl} alt={title} className="absolute inset-0 h-full w-full object-cover opacity-20" /> : null}
        <div className="relative flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="text-center md:text-right"><h3 className="mb-2 text-2xl font-bold text-primary-foreground md:text-3xl">{title}</h3><p className="text-lg text-primary-foreground/80">{subtitle}</p></div>
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <div className="rounded-2xl bg-accent px-6 py-3 text-center text-accent-foreground"><span className="text-lg font-bold">{badgeText}</span></div>
            <Button asChild size="lg" className="rounded-xl bg-accent px-6 font-semibold text-accent-foreground hover:bg-accent/90"><Link href={buttonUrl}>{buttonText}<ArrowLeft className="mr-2 h-5 w-5" /></Link></Button>
          </div>
        </div>
      </div>
    </section>
  )
}
