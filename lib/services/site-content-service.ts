import {
  createBanner,
  deleteBanner,
  fetchAdminBanners,
  fetchAdminHomepageSections,
  fetchAdminSiteSettings,
  fetchActiveBannersByPlacement,
  fetchBanners,
  fetchHomepageSection,
  fetchHomepageSections,
  fetchSiteSettings,
  updateBanner,
  uploadSiteMedia,
  upsertHomepageSection,
  upsertSiteSetting,
} from "@/lib/repositories/site-content-repository"
import type { BannerFormInput, HomepageSection, SiteSettingsBundle } from "@/types/site-content"

export const getHomepageSection = fetchHomepageSection
export const getHomepageSections = fetchHomepageSections
export const getSiteBanners = fetchBanners
export const getActiveBannersByPlacement = fetchActiveBannersByPlacement
export const getSiteSettings = fetchSiteSettings
export const getAdminHomepageSections = fetchAdminHomepageSections
export const getAdminSiteBanners = fetchAdminBanners
export const getAdminSiteSettings = fetchAdminSiteSettings

export async function saveHomepageSection(section: Partial<HomepageSection> & { sectionKey: string }) {
  if (section.sectionKey === "hero" && !section.title?.trim()) {
    return { ok: false, message: "عنوان اصلی hero الزامی است" }
  }
  await upsertHomepageSection(section)
  return { ok: true, message: "محتوای صفحه اصلی ذخیره شد" }
}

export async function saveSiteSettings(settings: SiteSettingsBundle) {
  await upsertSiteSetting("contact_info", settings.contactInfo)
  await upsertSiteSetting("footer_info", settings.footerInfo)
  await upsertSiteSetting("manual_checkout", settings.manualCheckout)
  return { ok: true, message: "تنظیمات سایت ذخیره شد" }
}

export async function saveBanner(input: BannerFormInput) {
  if (!input.title.trim()) return { ok: false, message: "عنوان بنر الزامی است" }
  if (!input.placement.trim()) return { ok: false, message: "محل نمایش بنر الزامی است" }
  if (input.id) await updateBanner(input as BannerFormInput & { id: string })
  else await createBanner(input)
  return { ok: true, message: "بنر ذخیره شد" }
}

export async function removeBanner(id: string) {
  await deleteBanner(id)
  return { ok: true, message: "بنر حذف شد" }
}

export async function uploadWebsiteMedia(file: File, folder: string, fileName: string) {
  const ext = file.name.split(".").pop()?.toLowerCase() || "webp"
  const safeName = fileName.includes(".") ? fileName : `${fileName}.${ext}`
  return uploadSiteMedia(file, `${folder}/${safeName}`)
}
