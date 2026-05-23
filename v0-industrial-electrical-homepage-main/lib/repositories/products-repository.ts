import { getSupabaseClient } from "@/lib/supabase/client"
import type { Product, ProductDetail, ProductQueryOptions } from "@/types/product"

type SupabaseRelation<T> = T | T[] | null

type RawProductRow = {
  id: string | number
  name: string | null
  slug: string | null
  model: string | null
  sku: string | null
  price: number | string | null
  old_price?: number | string | null
  oldPrice?: number | string | null
  discount_percent?: number | string | null
  discountPercent?: number | string | null
  is_featured?: boolean | null
  is_active?: boolean | null
  isFeatured?: boolean | null
  has_warranty?: boolean | null
  rating?: number | string | null
  review_count?: number | string | null
  short_description?: string | null
  description?: string | null
  warranty?: string | null
  origin_country?: string | null
  brands?: SupabaseRelation<{ name: string | null }>
  brand?: SupabaseRelation<{ name: string | null }>
  categories?: SupabaseRelation<{ name: string | null }>
  category?: SupabaseRelation<{ name: string | null }>
  inventory?: SupabaseRelation<{
    stock_quantity?: number | string | null
    quantity?: number | string | null
  }>
  product_images?: SupabaseRelation<{
    image_url?: string | null
    alt_text?: string | null
    is_main?: boolean | null
    sort_order?: number | string | null
  }>
  product_specs?: SupabaseRelation<{
    spec_name?: string | null
    spec_value?: string | null
    label?: string | null
    name?: string | null
    value?: string | null
    sort_order?: number | string | null
  }>
}

const PRODUCTS_SELECT = `
  id,
  name,
  slug,
  model,
  sku,
  price,
  old_price,
  discount_percent,
  is_featured,
  is_active,
  has_warranty,
  rating,
  review_count,
  brands(name),
  categories(name),
  inventory(stock_quantity, quantity),
  product_images(image_url, alt_text, is_main, sort_order),
  product_specs(label, name, value, sort_order)
`

const PRODUCT_DETAIL_SELECT = `
  id,
  name,
  slug,
  model,
  sku,
  price,
  old_price,
  discount_percent,
  is_featured,
  is_active,
  has_warranty,
  rating,
  review_count,
  short_description,
  description,
  warranty,
  origin_country,
  brands(name),
  categories(name),
  inventory(stock_quantity, quantity),
  product_images(image_url, alt_text, is_main, sort_order),
  product_specs(spec_name, spec_value, label, name, value, sort_order)
`

// Fallback for schemas that have not added optional detail columns yet.
// This keeps /products/[slug] working while the database evolves.
const PRODUCT_DETAIL_SELECT_FALLBACK = `
  id,
  name,
  slug,
  model,
  sku,
  price,
  old_price,
  discount_percent,
  is_featured,
  is_active,
  has_warranty,
  rating,
  review_count,
  brands(name),
  categories(name),
  inventory(stock_quantity, quantity),
  product_images(image_url, alt_text, is_main, sort_order),
  product_specs(spec_name, spec_value, label, name, value, sort_order)
`

function toArray<T>(value: SupabaseRelation<T>): T[] {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}

function toNumber(value: number | string | null | undefined, fallback = 0): number {
  if (value === null || value === undefined || value === "") return fallback
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function firstRelationName(value: SupabaseRelation<{ name: string | null }> | undefined): string | null {
  return toArray(value ?? null)[0]?.name ?? null
}

function createFallbackSlug(name: string, model: string | null): string {
  return `${name}-${model ?? ""}`
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\u0600-\u06FF-]/g, "")
}

function pickMainImage(images: RawProductRow["product_images"]): { url: string | null; alt: string | null } {
  const sorted = sortImages(images)
  const firstImage = sorted[0]
  return {
    url: firstImage?.image_url?.trim() || null,
    alt: firstImage?.alt_text ?? null,
  }
}

function sortImages(images: RawProductRow["product_images"]) {
  return toArray(images).sort((imageA, imageB) => {
    const aIsMain = Boolean(imageA?.is_main)
    const bIsMain = Boolean(imageB?.is_main)
    if (aIsMain && !bIsMain) return -1
    if (!aIsMain && bIsMain) return 1
    return toNumber(imageA?.sort_order, 999) - toNumber(imageB?.sort_order, 999)
  })
}

function sortSpecs(specs: RawProductRow["product_specs"]) {
  return toArray(specs).sort(
    (specA, specB) => toNumber(specA?.sort_order, 999) - toNumber(specB?.sort_order, 999)
  )
}

function mapSpecs(specs: RawProductRow["product_specs"]): string[] {
  return sortSpecs(specs)
    .map((spec) => {
      const title = spec?.label ?? spec?.name ?? spec?.spec_name ?? ""
      const value = spec?.value ?? spec?.spec_value ?? ""
      return title && value ? `${title}: ${value}` : title || value
    })
    .filter((spec): spec is string => Boolean(spec))
}

function mapProduct(row: RawProductRow): Product {
  const name = row.name ?? "محصول بدون نام"
  const model = row.model ?? null
  const inventory = toArray(row.inventory)[0]
  const mainImage = pickMainImage(row.product_images)

  return {
    id: String(row.id),
    name,
    slug: row.slug || createFallbackSlug(name, model),
    model,
    sku: row.sku ?? null,
    price: toNumber(row.price),
    oldPrice: toNumber(row.old_price ?? row.oldPrice, 0) || null,
    discountPercent: toNumber(row.discount_percent ?? row.discountPercent, 0),
    brandName: firstRelationName(row.brands ?? row.brand),
    categoryName: firstRelationName(row.categories ?? row.category),
    stockQuantity: toNumber(inventory?.stock_quantity ?? inventory?.quantity, 0),
    mainImageUrl: mainImage.url,
    mainImageAlt: mainImage.alt,
    isFeatured: Boolean(row.is_featured ?? row.isFeatured),
    isActive: Boolean(row.is_active ?? true),
    rating: toNumber(row.rating, 4.8),
    reviewCount: toNumber(row.review_count, 0),
    hasWarranty: Boolean(row.has_warranty ?? true),
    specs: mapSpecs(row.product_specs),
  }
}

function mapProductDetail(row: RawProductRow): ProductDetail {
  const product = mapProduct(row)
  const detailSpecs = sortSpecs(row.product_specs)
    .map((spec) => ({
      name: spec?.name ?? spec?.label ?? spec?.spec_name ?? "",
      value: spec?.value ?? spec?.spec_value ?? "",
      sortOrder: toNumber(spec?.sort_order, 999),
    }))
    .filter((spec) => spec.name || spec.value)

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    model: product.model,
    sku: product.sku,
    shortDescription:
      row.short_description ??
      (product.model
        ? `${product.name} مدل ${product.model}، مناسب استفاده در پروژه‌های برق صنعتی و تابلو برق.`
        : `${product.name}، مناسب استفاده در پروژه‌های برق صنعتی و تابلو برق.`),
    description:
      row.description ??
      "اطلاعات تکمیلی این محصول به‌زودی تکمیل می‌شود. برای دریافت دیتاشیت، مشاوره فنی یا استعلام موجودی پروژه‌ای با کارشناسان فروش تماس بگیرید.",
    price: product.price,
    oldPrice: product.oldPrice,
    discountPercent: product.discountPercent,
    warranty:
      row.warranty ??
      (product.hasWarranty ? "ضمانت اصالت و سلامت کالا" : null),
    originCountry: row.origin_country ?? null,
    brandName: product.brandName,
    categoryName: product.categoryName,
    stockQuantity: product.stockQuantity,
    images: sortImages(row.product_images)
      .map((image, index) => ({
        imageUrl: image?.image_url?.trim() || "",
        altText: image?.alt_text ?? null,
        isMain: Boolean(image?.is_main ?? index === 0),
        sortOrder: toNumber(image?.sort_order, index + 1),
      }))
      .filter((image) => Boolean(image.imageUrl)),
    specs: detailSpecs,
    rating: product.rating,
    reviewCount: product.reviewCount,
    hasWarranty: product.hasWarranty,
  }
}

// Repository boundary: Supabase-specific query syntax belongs here only.
// To migrate to self-hosted PostgreSQL, a REST API, or another provider, replace the
// methods in this file and keep the Product/ProductDetail types and service API unchanged.
export async function fetchProducts(options: ProductQueryOptions = {}): Promise<Product[]> {
  const supabase = getSupabaseClient()
  let query = supabase
    .from("products")
    .select(PRODUCTS_SELECT)
    .order("id", { ascending: false })

  if (options.active !== undefined) {
    query = query.eq("is_active", options.active)
  }

  if (options.featured !== undefined) {
    query = query.eq("is_featured", options.featured)
  }

  if (options.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to fetch products: ${error.message}`)
  }

  return ((data ?? []) as RawProductRow[]).map(mapProduct)
}

function isMissingColumnError(message: string): boolean {
  return message.toLowerCase().includes("does not exist")
}

export async function fetchProductBySlug(slug: string): Promise<ProductDetail | null> {
  const supabase = getSupabaseClient()

  const firstResult = await supabase
    .from("products")
    .select(PRODUCT_DETAIL_SELECT)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle()

  if (!firstResult.error) {
    return firstResult.data ? mapProductDetail(firstResult.data as RawProductRow) : null
  }

  if (!isMissingColumnError(firstResult.error.message)) {
    throw new Error(`Failed to fetch product by slug: ${firstResult.error.message}`)
  }

  const fallbackResult = await supabase
    .from("products")
    .select(PRODUCT_DETAIL_SELECT_FALLBACK)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle()

  if (fallbackResult.error) {
    throw new Error(`Failed to fetch product by slug: ${fallbackResult.error.message}`)
  }

  return fallbackResult.data ? mapProductDetail(fallbackResult.data as RawProductRow) : null
}
