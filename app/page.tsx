export const dynamic = "force-dynamic"

import { TopBar } from "@/components/top-bar"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { CategorySection } from "@/components/category-section"
import { FeaturedProducts } from "@/components/featured-products"
import { PromoBanner } from "@/components/promo-banner"
import { BrandStrip } from "@/components/brand-strip"
import { TrustFeatures } from "@/components/trust-features"
import { Footer } from "@/components/footer"
import { getBrands } from "@/lib/services/brands-service"
import { getHomepageCategories, getHomepageCategorySectionSettings } from "@/lib/services/categories-service"
import { getFeaturedProducts } from "@/lib/services/products-service"
import { getActiveBannersByPlacement, getHomepageSection, getSiteSettings } from "@/lib/services/site-content-service"
import type { Brand } from "@/types/brand"
import type { Category, HomepageCategorySectionSettings } from "@/types/category"
import type { Product } from "@/types/product"
import type { HomepageSection, SiteBanner, SiteSettingsBundle } from "@/types/site-content"

type SettledHomeData<T> = {
  data: T
  error: string | null
}

function normalizeSettledResult<T>(result: PromiseSettledResult<T>, fallback: T): SettledHomeData<T> {
  if (result.status === "fulfilled") {
    return { data: result.value, error: null }
  }

  const message = result.reason instanceof Error ? result.reason.message : "Unknown homepage data error"
  return { data: fallback, error: message }
}

export default async function HomePage() {
  const [featuredProductsResult, categoriesResult, categorySettingsResult, brandsResult, heroResult, promoResult, promoBannersResult, settingsResult] =
    await Promise.allSettled([
      getFeaturedProducts(),
      getHomepageCategories(),
      getHomepageCategorySectionSettings(),
      getBrands(),
      getHomepageSection("hero"),
      getHomepageSection("promo_banner"),
      getActiveBannersByPlacement("homepage_promo"),
      getSiteSettings(),
    ])

  const featuredProducts = normalizeSettledResult<Product[]>(featuredProductsResult, [])
  const categories = normalizeSettledResult<Category[]>(categoriesResult, [])
  const categorySettings = normalizeSettledResult<HomepageCategorySectionSettings>(categorySettingsResult, {
    title: "دسته‌بندی تجهیزات",
    subtitle: "انتخاب سریع تجهیزات برق صنعتی بر اساس دسته‌بندی",
    isActive: true,
  })
  const brands = normalizeSettledResult<Brand[]>(brandsResult, [])
  const hero = normalizeSettledResult<HomepageSection | null>(heroResult, null)
  const promo = normalizeSettledResult<HomepageSection | null>(promoResult, null)
  const promoBanners = normalizeSettledResult<SiteBanner[]>(promoBannersResult, [])
  const settings = normalizeSettledResult<SiteSettingsBundle>(settingsResult, {
    contactInfo: {},
    footerInfo: {},
    manualCheckout: {},
  })

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />
      <Header />
      <main className="flex-1">
        <HeroSection section={hero.data} />
        <CategorySection categories={categories.data} settings={categorySettings.data} error={categories.error} />
        <FeaturedProducts products={featuredProducts.data} error={featuredProducts.error} />
        <PromoBanner section={promo.data} banners={promoBanners.data} />
        <BrandStrip brands={brands.data} error={brands.error} />
        <TrustFeatures />
      </main>
      <Footer settings={settings.data} />
    </div>
  )
}
