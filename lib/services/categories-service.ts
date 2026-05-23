import { fetchCategories } from "@/lib/repositories/categories-repository"
import type { Category } from "@/types/category"

// Application service API used by pages/components.
// Keep this provider-agnostic so a future PostgreSQL/API provider can replace
// the repository without changing the homepage UI.
export async function getCategories(): Promise<Category[]> {
  return fetchCategories()
}
