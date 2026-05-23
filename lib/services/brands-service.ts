import { fetchBrands } from "@/lib/repositories/brands-repository"
import type { Brand } from "@/types/brand"

// Application service API used by pages/components.
// Keep this provider-agnostic so a future PostgreSQL/API provider can replace
// the repository without changing the homepage UI.
export async function getBrands(): Promise<Brand[]> {
  return fetchBrands()
}
