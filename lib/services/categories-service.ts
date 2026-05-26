import {
  fetchAllCategoriesForAdmin,
  fetchCategories,
  fetchHomepageCategories,
  updateCategoryHomepageSettings as updateCategoryHomepageSettingsInRepository,
} from "@/lib/repositories/categories-repository"
import { fetchAdminHomepageSections, fetchHomepageSection, upsertHomepageSection } from "@/lib/repositories/site-content-repository"
import { uploadWebsiteMedia } from "@/lib/services/site-content-service"
import type { AdminCategoryHomepageSettingsInput, Category, HomepageCategorySectionSettings } from "@/types/category"
import { toSafePathSegment } from "@/lib/security/file-upload"

const DEFAULT_HOMEPAGE_CATEGORY_SETTINGS: HomepageCategorySectionSettings = {
  title: "دسته‌بندی تجهیزات",
  subtitle: "انتخاب سریع تجهیزات برق صنعتی بر اساس دسته‌بندی",
  isActive: true,
}

// Application service API used by pages/components.
// Keep this provider-agnostic so a future PostgreSQL/API provider can replace
// the repository without changing homepage or admin UI.
export async function getCategories(): Promise<Category[]> {
  return fetchCategories()
}

export async function getHomepageCategories(): Promise<Category[]> {
  const categories = await fetchHomepageCategories()

  if (process.env.NODE_ENV === "development") {
    console.log(
      "Homepage categories mapped:",
      categories.map((category) => ({
        name: category.name,
        slug: category.slug,
        homepageImageUrl: category.homepageImageUrl,
        homepageIconUrl: category.homepageIconUrl,
        imageUrl: category.imageUrl,
        displayImageUrl: category.displayImageUrl,
      })),
    )
  }

  return categories
}

export async function getAllCategoriesForAdmin(): Promise<Category[]> {
  return fetchAllCategoriesForAdmin()
}

export async function updateCategoryHomepageSettings(input: AdminCategoryHomepageSettingsInput) {
  if (!input.id) return { ok: false, message: "شناسه دسته‌بندی نامعتبر است" }
  if (!input.slug.trim()) return { ok: false, message: "slug دسته‌بندی نامعتبر است" }
  if (!Number.isFinite(input.homepageSortOrder)) return { ok: false, message: "ترتیب نمایش باید عددی باشد" }

  await updateCategoryHomepageSettingsInRepository(input)
  return { ok: true, message: "تنظیمات دسته‌بندی صفحه اصلی ذخیره شد" }
}

export async function uploadCategoryHomepageImage(categorySlug: string, file: File) {
  const safeSlug = toSafePathSegment(categorySlug, "category")
  return uploadWebsiteMedia(file, `categories/${safeSlug}`, "homepage.webp")
}

export async function uploadCategoryHomepageIcon(categorySlug: string, file: File) {
  const safeSlug = toSafePathSegment(categorySlug, "category")
  return uploadWebsiteMedia(file, `categories/${safeSlug}`, "icon.webp")
}

export async function getHomepageCategorySectionSettings(): Promise<HomepageCategorySectionSettings> {
  const section = await fetchHomepageSection("homepage_categories")
  if (!section) return DEFAULT_HOMEPAGE_CATEGORY_SETTINGS
  return {
    title: section.title || DEFAULT_HOMEPAGE_CATEGORY_SETTINGS.title,
    subtitle: section.subtitle || DEFAULT_HOMEPAGE_CATEGORY_SETTINGS.subtitle,
    isActive: section.isActive,
  }
}

export async function getAdminHomepageCategorySectionSettings(): Promise<HomepageCategorySectionSettings> {
  const sections = await fetchAdminHomepageSections()
  const section = sections.find((item) => item.sectionKey === "homepage_categories")
  if (!section) return DEFAULT_HOMEPAGE_CATEGORY_SETTINGS
  return {
    title: section.title || DEFAULT_HOMEPAGE_CATEGORY_SETTINGS.title,
    subtitle: section.subtitle || DEFAULT_HOMEPAGE_CATEGORY_SETTINGS.subtitle,
    isActive: section.isActive,
  }
}

export async function updateHomepageCategorySectionSettings(input: HomepageCategorySectionSettings) {
  if (!input.title.trim()) return { ok: false, message: "عنوان بخش الزامی است" }
  await upsertHomepageSection({
    sectionKey: "homepage_categories",
    title: input.title.trim(),
    subtitle: input.subtitle.trim() || null,
    isActive: input.isActive,
    sortOrder: 1,
    metadata: {},
  })
  return { ok: true, message: "تنظیمات بخش دسته‌بندی‌های صفحه اصلی ذخیره شد" }
}
