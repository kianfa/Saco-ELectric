import {
  fetchProductBySlug,
  fetchProducts,
} from "@/lib/repositories/products-repository"
import type { Product, ProductDetail, ProductQueryOptions } from "@/types/product"

// Application service API used by pages/components.
// Keep this file provider-agnostic. Business rules, caching decisions, and future
// API-provider switching can be handled here without touching the UI.
export async function getProducts(options: ProductQueryOptions = {}): Promise<Product[]> {
  return fetchProducts(options)
}

export async function getFeaturedProducts(limit = 6): Promise<Product[]> {
  return fetchProducts({ active: true, featured: true, limit })
}

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  return fetchProductBySlug(slug)
}
