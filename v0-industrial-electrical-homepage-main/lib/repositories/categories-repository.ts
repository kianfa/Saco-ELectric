import { getSupabaseClient } from "@/lib/supabase/client"
import type { Category } from "@/types/category"

type RawCategoryRow = {
  id: string | number
  name: string | null
  slug: string | null
  description?: string | null
  image_url?: string | null
  imageUrl?: string | null
}

function isMissingColumnError(message: string): boolean {
  return message.toLowerCase().includes("does not exist")
}

function createFallbackSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\u0600-\u06FF-]/g, "")
}

function mapCategory(row: RawCategoryRow): Category {
  const name = row.name ?? "دسته‌بندی بدون نام"

  return {
    id: String(row.id),
    name,
    slug: row.slug || createFallbackSlug(name),
    description: row.description ?? null,
    imageUrl: row.image_url ?? row.imageUrl ?? null,
  }
}

// Repository boundary: Supabase-specific category queries belong here only.
// To migrate away from Supabase later, replace this repository implementation and
// keep the Category type and categories-service API unchanged.
export async function fetchCategories(): Promise<Category[]> {
  const supabase = getSupabaseClient()

  const primaryResult = await supabase
    .from("categories")
    .select("id, name, slug, description, image_url")
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
    .select("id, name, slug")
    .order("name", { ascending: true })

  if (fallbackResult.error) {
    throw new Error(`Failed to fetch categories: ${fallbackResult.error.message}`)
  }

  return ((fallbackResult.data ?? []) as RawCategoryRow[]).map(mapCategory)
}
