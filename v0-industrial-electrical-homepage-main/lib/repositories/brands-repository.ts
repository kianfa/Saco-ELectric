import { getSupabaseClient } from "@/lib/supabase/client"
import type { Brand } from "@/types/brand"

type RawBrandRow = {
  id: string | number
  name: string | null
  slug: string | null
  logo_url?: string | null
  logoUrl?: string | null
  description?: string | null
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

function mapBrand(row: RawBrandRow): Brand {
  const name = row.name ?? "برند بدون نام"

  return {
    id: String(row.id),
    name,
    slug: row.slug || createFallbackSlug(name),
    logoUrl: row.logo_url ?? row.logoUrl ?? null,
    description: row.description ?? null,
  }
}

// Repository boundary: Supabase-specific brand queries belong here only.
// To migrate away from Supabase later, replace this repository implementation and
// keep the Brand type and brands-service API unchanged.
export async function fetchBrands(): Promise<Brand[]> {
  const supabase = getSupabaseClient()

  const primaryResult = await supabase
    .from("brands")
    .select("id, name, slug, logo_url, description")
    .eq("is_active", true)
    .order("name", { ascending: true })

  if (!primaryResult.error) {
    return ((primaryResult.data ?? []) as RawBrandRow[]).map(mapBrand)
  }

  if (!isMissingColumnError(primaryResult.error.message)) {
    throw new Error(`Failed to fetch brands: ${primaryResult.error.message}`)
  }

  const fallbackResult = await supabase
    .from("brands")
    .select("id, name, slug")
    .order("name", { ascending: true })

  if (fallbackResult.error) {
    throw new Error(`Failed to fetch brands: ${fallbackResult.error.message}`)
  }

  return ((fallbackResult.data ?? []) as RawBrandRow[]).map(mapBrand)
}
