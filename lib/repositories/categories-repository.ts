import { getSupabaseClient } from "@/lib/supabase/client"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import type { AdminCategoryHomepageSettingsInput, Category } from "@/types/category"

export type HomepageCategorySectionRow = {
  id: string | number
  section_key: string | null
  title?: string | null
  subtitle?: string | null
  is_active?: boolean | null
}

type RawCategoryRow = {
  id: string | number
  name: string | null
  slug: string | null
  description?: string | null
  image_url?: string | null
  imageUrl?: string | null
  homepage_title?: string | null
  homepage_display_title?: string | null
  homepage_image_url?: string | null
  homepage_icon_url?: string | null
  homepage_url?: string | null
  show_on_homepage?: boolean | null
  homepage_sort_order?: number | string | null
  is_active?: boolean | null
}

type ProductCategoryRow = {
  category_id?: string | number | null
}

function isMissingColumnError(message: string): boolean {
  const lower = message.toLowerCase()
  return lower.includes("does not exist") || lower.includes("schema cache")
}

function createFallbackSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\u0600-\u06FF-]/g, "")
}

function toNumber(value: number | string | null | undefined, fallback = 0): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function normalizePublicSiteMediaUrl(value: string | null | undefined) {
  if (!value) return null
  const trimmed = value.trim()
  if (!trimmed) return null
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("/")) return trimmed

  // Backward-compatible storage path support. UI receives a clean URL and never
  // knows about Supabase bucket details.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "")
  if (!supabaseUrl) return trimmed
  const path = trimmed.startsWith("site-media/") ? trimmed.slice("site-media/".length) : trimmed
  return `${supabaseUrl}/storage/v1/object/public/site-media/${path.replace(/^\/+/ , "")}`
}

function mapCategory(row: RawCategoryRow): Category {
  const name = row.name ?? "دسته‌بندی بدون نام"
  const slug = row.slug || createFallbackSlug(name)
  const imageUrl = normalizePublicSiteMediaUrl(row.image_url ?? row.imageUrl ?? null)
  const homepageImageUrl = normalizePublicSiteMediaUrl(row.homepage_image_url)
  const homepageIconUrl = normalizePublicSiteMediaUrl(row.homepage_icon_url)
  const displayImageUrl = homepageImageUrl ?? imageUrl ?? homepageIconUrl ?? null

  return {
    id: String(row.id),
    name,
    slug,
    description: row.description ?? null,
    imageUrl,
    homepageTitle: row.homepage_title ?? row.homepage_display_title ?? null,
    homepageImageUrl,
    homepageIconUrl,
    displayImageUrl,
    homepageUrl: row.homepage_url ?? null,
    showOnHomepage: row.show_on_homepage ?? true,
    homepageSortOrder: toNumber(row.homepage_sort_order),
    isActive: row.is_active ?? true,
    productCount: 0,
  }
}

const fullCategorySelect =
  "id, name, slug, description, image_url, homepage_title, homepage_image_url, homepage_icon_url, homepage_url, show_on_homepage, homepage_sort_order, is_active"

// Repository boundary: Supabase-specific category queries belong here only.
// To migrate away from Supabase later, replace this repository implementation and
// keep the Category type and categories-service API unchanged.
export async function fetchCategories(): Promise<Category[]> {
  const supabase = getSupabaseClient()

  const primaryResult = await supabase
    .from("categories")
    .select(fullCategorySelect)
    .eq("is_active", true)
    .order("name", { ascending: true })

  if (!primaryResult.error) {
    return ((primaryResult.data ?? []) as RawCategoryRow[]).map(mapCategory)
  }

  if (!isMissingColumnError(primaryResult.error.message)) {
    throw new Error(`Failed to fetch categories: ${primaryResult.error.message}`)
  }

  const fallbackResult = await supabase
    .from("categories")
    .select("id, name, slug, description, image_url")
    .order("name", { ascending: true })

  if (fallbackResult.error) {
    const minimalResult = await supabase.from("categories").select("id, name, slug").order("name", { ascending: true })
    if (minimalResult.error) throw new Error(`Failed to fetch categories: ${minimalResult.error.message}`)
    return ((minimalResult.data ?? []) as RawCategoryRow[]).map(mapCategory)
  }

  return ((fallbackResult.data ?? []) as RawCategoryRow[]).map(mapCategory)
}


export async function fetchCategoryProductCounts(): Promise<Record<string, number>> {
  const supabase = getSupabaseClient()

  const activeResult = await supabase.from("products").select("category_id").eq("is_active", true)
  const result = !activeResult.error
    ? activeResult
    : isMissingColumnError(activeResult.error.message)
      ? await supabase.from("products").select("category_id")
      : activeResult

  if (result.error) {
    if (isMissingColumnError(result.error.message)) return {}
    throw new Error(`Failed to fetch category product counts: ${result.error.message}`)
  }

  return ((result.data ?? []) as ProductCategoryRow[]).reduce<Record<string, number>>((acc, row) => {
    if (row.category_id == null) return acc
    const key = String(row.category_id)
    acc[key] = (acc[key] ?? 0) + 1
    return acc
  }, {})
}

export async function fetchCategoriesWithProductCounts(): Promise<Category[]> {
  const [categories, counts] = await Promise.all([fetchCategories(), fetchCategoryProductCounts().catch(() => ({}))])
  return categories.map((category) => ({ ...category, productCount: counts[category.id] ?? 0 }))
}

export async function fetchHomepageCategories(): Promise<Category[]> {
  const supabase = getSupabaseClient()

  const result = await supabase
    .from("categories")
    .select(fullCategorySelect)
    .eq("is_active", true)
    .eq("show_on_homepage", true)
    .order("homepage_sort_order", { ascending: true })
    .order("name", { ascending: true })

  if (!result.error) return ((result.data ?? []) as RawCategoryRow[]).map(mapCategory)

  if (!isMissingColumnError(result.error.message)) {
    throw new Error(`Failed to fetch homepage categories: ${result.error.message}`)
  }

  // Backward-compatible fallback for databases that have not run the homepage
  // category migration yet. Public homepage still renders instead of breaking.
  return fetchCategories()
}

export async function fetchAllCategoriesForAdmin(): Promise<Category[]> {
  const supabase = await getSupabaseServerClient()
  const result = await supabase
    .from("categories")
    .select(fullCategorySelect)
    .order("homepage_sort_order", { ascending: true })
    .order("name", { ascending: true })

  if (!result.error) return ((result.data ?? []) as RawCategoryRow[]).map(mapCategory)

  if (!isMissingColumnError(result.error.message)) {
    throw new Error(`Failed to fetch admin categories: ${result.error.message}`)
  }

  const fallback = await supabase.from("categories").select("id, name, slug, description, image_url").order("name", { ascending: true })
  if (fallback.error) throw new Error(`Failed to fetch admin categories: ${fallback.error.message}`)
  return ((fallback.data ?? []) as RawCategoryRow[]).map(mapCategory)
}

export async function updateCategoryHomepageSettings(input: AdminCategoryHomepageSettingsInput): Promise<void> {
  const supabase = await getSupabaseServerClient()
  const payload = {
    homepage_title: input.homepageTitle || null,
    homepage_image_url: input.homepageImageUrl || null,
    homepage_icon_url: input.homepageIconUrl || null,
    homepage_url: input.homepageUrl || null,
    show_on_homepage: input.showOnHomepage,
    homepage_sort_order: input.homepageSortOrder,
    is_active: input.isActive,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase.from("categories").update(payload).eq("id", input.id)
  if (error) throw new Error(`Failed to update category homepage settings: ${error.message}`)
}
