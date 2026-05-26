import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { HeroImageSlider } from "@/components/hero-image-slider"
import type { HeroSliderImage, HomepageSection } from "@/types/site-content"

const defaultTrustPoints = ["کیفیت برتر", "برندهای معتبر", "قیمت رقابتی", "پشتیبانی فنی تخصصی"]

function getTrustPoints(section?: HomepageSection | null): string[] {
  const points = section?.metadata?.trustPoints
  return Array.isArray(points) && points.length ? points.map(String) : defaultTrustPoints
}

function getHeroImages(section?: HomepageSection | null): HeroSliderImage[] {
  const rawImages = section?.metadata?.heroImages
  if (!Array.isArray(rawImages)) return []

  return rawImages
    .map((item, index) => {
      const image = item as Partial<HeroSliderImage>
      return {
        desktopUrl: typeof image.desktopUrl === "string" ? image.desktopUrl : "",
        mobileUrl: typeof image.mobileUrl === "string" ? image.mobileUrl : null,
        altText: typeof image.altText === "string" ? image.altText : `تصویر تجهیزات برق صنعتی ${index + 1}`,
        sortOrder: Number.isFinite(Number(image.sortOrder)) ? Number(image.sortOrder) : index,
        isActive: image.isActive !== false,
      }
    })
    .filter((image) => image.desktopUrl)
    .sort((a, b) => a.sortOrder - b.sortOrder)
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
  const heroImages = getHeroImages(section)
  const fallbackImageUrl = section?.imageUrl || null
  const fallbackMobileImageUrl = section?.mobileImageUrl || null
  const firstImage = heroImages[0]?.desktopUrl || fallbackImageUrl

  return (
    <section className="container mx-auto px-4 py-6">
      <div className="relative min-h-[520px] overflow-hidden rounded-3xl bg-gradient-to-l from-primary via-primary to-primary/90 lg:min-h-[500px]">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute right-10 top-10 h-64 w-64 rounded-full bg-accent blur-3xl" />
          <div className="absolute bottom-10 left-20 h-48 w-48 rounded-full bg-accent/50 blur-2xl" />
        </div>

        {firstImage ? (
          <div className="absolute inset-0 opacity-15 lg:opacity-20">
            <img src={firstImage} alt="" aria-hidden="true" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-l from-primary via-primary/95 to-primary/70" />
          </div>
        ) : null}

        <div className="relative grid min-h-[520px] gap-8 p-6 md:p-8 lg:min-h-[500px] lg:grid-cols-2 lg:p-12">
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

          <div className="flex items-center justify-center">
            <HeroImageSlider
              images={heroImages}
              fallbackImageUrl={fallbackImageUrl}
              fallbackMobileImageUrl={fallbackMobileImageUrl}
              fallbackAlt={title}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
