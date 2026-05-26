import { getSupabaseServerClient } from "@/lib/supabase/server"
import { assertSafeImageFile, buildSafeStoragePath, getSafeImageExtension, toSafePathSegment } from "@/lib/security/file-upload"
import type { AdminProduct, AdminProductFormInput, AdminProductImage, AdminProductSpec } from "@/types/admin-product"
import type { Product } from "@/types/product"
import { fetchProducts } from "@/lib/repositories/products-repository"

const PRODUCT_IMAGES_BUCKET = "product-images"

// Admin write operations are intentionally centralized here.
// When tightening Supabase RLS for production, restrict INSERT/UPDATE/DELETE
// on products, inventory, product_images, product_specs, and storage.objects
// to authenticated users whose profiles.role = 'admin'.

type Relation<T> = T | T[] | null

type RawAdminImageRow = {
  id: string | number
  image_url?: string | null
  url?: string | null
  alt_text?: string | null
  sort_order?: number | string | null
  is_main?: boolean | null
}

type RawAdminSpecRow = {
  id?: string | number
  spec_name?: string | null
  spec_value?: string | null
  name?: string | null
  label?: string | null
  value?: string | null
  sort_order?: number | string | null
}

type RawAdminProductRow = {
  id: string | number
  name: string | null
  slug: string | null
  model?: string | null
  sku?: string | null
  short_description?: string | null
  description?: string | null
  price?: number | string | null
  old_price?: number | string | null
  discount_percent?: number | string | null
  warranty?: string | null
  origin_country?: string | null
  brand_id?: string | null
  category_id?: string | null
  is_active?: boolean | null
  is_featured?: boolean | null
  has_warranty?: boolean | null
  brands?: Relation<{ name: string | null }>
  categories?: Relation<{ name: string | null }>
  inventory?: Relation<{
    quantity?: number | string | null
    stock_quantity?: number | string | null
    low_stock_threshold?: number | string | null
  }>
  product_images?: Relation<RawAdminImageRow>
  product_specs?: Relation<RawAdminSpecRow>
}

const ADMIN_PRODUCT_SELECT = `
  id,
  name,
  slug,
  model,
  sku,
  short_description,
  description,
  price,
  old_price,
  discount_percent,
  warranty,
  origin_country,
  brand_id,
  category_id,
  is_active,
  is_featured,
  has_warranty,
  brands(name),
  categories(name),
  inventory(quantity, stock_quantity, low_stock_threshold),
  product_images(id, image_url, url, alt_text, sort_order, is_main),
  product_specs(id, spec_name, spec_value, name, label, value, sort_order)
`

const ADMIN_PRODUCT_SELECT_FALLBACK = `
  id,
  name,
  slug,
  model,
  sku,
  price,
  old_price,
  discount_percent,
  brand_id,
  category_id,
  is_active,
  is_featured,
  has_warranty,
  brands(name),
  categories(name),
  inventory(quantity, stock_quantity),
  product_images(id, image_url, alt_text, sort_order, is_main),
  product_specs(id, spec_name, spec_value, name, label, value, sort_order)
`

function toArray<T>(value: Relation<T>): T[] {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}

function toNumber(value: number | string | null | undefined, fallback = 0): number {
  if (value === null || value === undefined || value === "") return fallback
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function relationName(value: Relation<{ name: string | null }> | undefined): string | null {
  return toArray(value ?? null)[0]?.name ?? null
}

function isMissingColumnError(message: string): boolean {
  return message.toLowerCase().includes("does not exist")
}

function sortImages(images: RawAdminProductRow["product_images"]): RawAdminImageRow[] {
  return toArray(images ?? null).sort((a, b) => {
    const aMain = Boolean(a?.is_main)
    const bMain = Boolean(b?.is_main)
    if (aMain && !bMain) return -1
    if (!aMain && bMain) return 1
    return toNumber(a?.sort_order, 999) - toNumber(b?.sort_order, 999)
  })
}

function mapAdminProduct(row: RawAdminProductRow): AdminProduct {
  const inventory = toArray(row.inventory)[0]
  const images: AdminProductImage[] = sortImages(row.product_images).map((image, index) => ({
    id: String(image.id),
    imageUrl: image.image_url || image.url || "",
    altText: image.alt_text ?? null,
    sortOrder: toNumber(image.sort_order, index + 1),
    isMain: Boolean(image.is_main ?? index === 0),
  }))

  const specs: AdminProductSpec[] = toArray(row.product_specs)
    .sort((a, b) => toNumber(a?.sort_order, 999) - toNumber(b?.sort_order, 999))
    .map((spec, index) => ({
      id: spec?.id ? String(spec.id) : undefined,
      specName: spec?.spec_name ?? spec?.name ?? spec?.label ?? "",
      specValue: spec?.spec_value ?? spec?.value ?? "",
      sortOrder: toNumber(spec?.sort_order, index + 1),
    }))

  return {
    id: String(row.id),
    name: row.name ?? "محصول بدون نام",
    slug: row.slug ?? "",
    model: row.model ?? null,
    sku: row.sku ?? null,
    shortDescription: row.short_description ?? null,
    description: row.description ?? null,
    price: toNumber(row.price),
    oldPrice: toNumber(row.old_price, 0) || null,
    discountPercent: toNumber(row.discount_percent, 0),
    warranty: row.warranty ?? null,
    originCountry: row.origin_country ?? null,
    brandId: row.brand_id ?? null,
    brandName: relationName(row.brands),
    categoryId: row.category_id ?? null,
    categoryName: relationName(row.categories),
    quantity: toNumber(inventory?.quantity ?? inventory?.stock_quantity, 0),
    lowStockThreshold: toNumber(inventory?.low_stock_threshold, 0) || null,
    isActive: Boolean(row.is_active ?? true),
    isFeatured: Boolean(row.is_featured),
    hasWarranty: Boolean(row.has_warranty ?? true),
    images,
    specs,
  }
}

function productPayload(input: AdminProductFormInput, includeOptionalColumns = true) {
  const payload: Record<string, unknown> = {
    name: input.name,
    slug: input.slug,
    model: input.model,
    sku: input.sku,
    price: input.price,
    old_price: input.oldPrice,
    discount_percent: input.discountPercent,
    brand_id: input.brandId,
    category_id: input.categoryId,
    is_active: input.isActive,
    is_featured: input.isFeatured || input.showInHomepage,
    has_warranty: input.hasWarranty,
    rating: 0,
    review_count: 0,
  }

  if (includeOptionalColumns) {
    payload.short_description = input.shortDescription
    payload.description = input.description
    payload.warranty = input.warranty
    payload.origin_country = input.originCountry
  }

  return payload
}

export async function fetchAdminProducts(): Promise<Product[]> {
  return fetchProducts({})
}

export async function fetchAdminProductById(id: string): Promise<AdminProduct | null> {
  const supabase = await getSupabaseServerClient()
  const result = await supabase.from("products").select(ADMIN_PRODUCT_SELECT).eq("id", id).maybeSingle()

  if (!result.error) {
    return result.data ? mapAdminProduct(result.data as RawAdminProductRow) : null
  }

  if (!isMissingColumnError(result.error.message)) {
    throw new Error(`Failed to fetch admin product: ${result.error.message}`)
  }

  const fallback = await supabase.from("products").select(ADMIN_PRODUCT_SELECT_FALLBACK).eq("id", id).maybeSingle()
  if (fallback.error) throw new Error(`Failed to fetch admin product: ${fallback.error.message}`)
  return fallback.data ? mapAdminProduct(fallback.data as RawAdminProductRow) : null
}

export async function ensureSlugIsUnique(slug: string, excludeProductId?: string): Promise<boolean> {
  const supabase = await getSupabaseServerClient()
  let query = supabase.from("products").select("id").eq("slug", slug).limit(1)
  if (excludeProductId) query = query.neq("id", excludeProductId)
  const { data, error } = await query
  if (error) throw new Error(`Failed to validate slug: ${error.message}`)
  return (data ?? []).length === 0
}

export async function ensureSkuIsUnique(sku: string, excludeProductId?: string): Promise<boolean> {
  const supabase = await getSupabaseServerClient()
  let query = supabase.from("products").select("id").eq("sku", sku).limit(1)
  if (excludeProductId) query = query.neq("id", excludeProductId)
  const { data, error } = await query
  if (error) throw new Error(`Failed to validate SKU: ${error.message}`)
  return (data ?? []).length === 0
}

export async function insertProduct(input: AdminProductFormInput): Promise<string> {
  const supabase = await getSupabaseServerClient()
  const primary = await supabase.from("products").insert(productPayload(input, true)).select("id").single()

  if (!primary.error) return String(primary.data.id)
  if (!isMissingColumnError(primary.error.message)) {
    throw new Error(`Failed to create product: ${primary.error.message}`)
  }

  const fallback = await supabase.from("products").insert(productPayload(input, false)).select("id").single()
  if (fallback.error) throw new Error(`Failed to create product: ${fallback.error.message}`)
  return String(fallback.data.id)
}

export async function updateProductRecord(id: string, input: AdminProductFormInput): Promise<void> {
  const supabase = await getSupabaseServerClient()
  const primary = await supabase.from("products").update(productPayload(input, true)).eq("id", id)

  if (!primary.error) return
  if (!isMissingColumnError(primary.error.message)) {
    throw new Error(`Failed to update product: ${primary.error.message}`)
  }

  const fallback = await supabase.from("products").update(productPayload(input, false)).eq("id", id)
  if (fallback.error) throw new Error(`Failed to update product: ${fallback.error.message}`)
}

export async function upsertInventory(productId: string, quantity: number, lowStockThreshold: number | null): Promise<void> {
  const supabase = await getSupabaseServerClient()
  const { data: existing, error: findError } = await supabase
    .from("inventory")
    .select("id")
    .eq("product_id", productId)
    .maybeSingle()

  if (findError) throw new Error(`Failed to read inventory: ${findError.message}`)

  const payloadWithThreshold = {
    product_id: productId,
    quantity,
    stock_quantity: quantity,
    low_stock_threshold: lowStockThreshold,
  }
  const payload = {
    product_id: productId,
    quantity,
    stock_quantity: quantity,
  }

  const result = existing?.id
    ? await supabase.from("inventory").update(payloadWithThreshold).eq("id", existing.id)
    : await supabase.from("inventory").insert(payloadWithThreshold)

  if (!result.error) return

  if (!isMissingColumnError(result.error.message)) {
    throw new Error(`Failed to save inventory: ${result.error.message}`)
  }

  const fallback = existing?.id
    ? await supabase.from("inventory").update(payload).eq("id", existing.id)
    : await supabase.from("inventory").insert(payload)

  if (fallback.error) throw new Error(`Failed to save inventory: ${fallback.error.message}`)
}

export async function replaceProductSpecs(productId: string, specs: AdminProductSpec[]): Promise<void> {
  const supabase = await getSupabaseServerClient()
  const deleteResult = await supabase.from("product_specs").delete().eq("product_id", productId)
  if (deleteResult.error) throw new Error(`Failed to clear specs: ${deleteResult.error.message}`)

  const rows = specs
    .filter((spec) => spec.specName.trim() || spec.specValue.trim())
    .map((spec, index) => ({
      product_id: productId,
      spec_name: spec.specName.trim(),
      spec_value: spec.specValue.trim(),
      name: spec.specName.trim(),
      label: spec.specName.trim(),
      value: spec.specValue.trim(),
      sort_order: spec.sortOrder || index + 1,
    }))

  if (!rows.length) return

  const result = await supabase.from("product_specs").insert(rows)
  if (result.error) throw new Error(`Failed to save specs: ${result.error.message}`)
}

export async function uploadProductImage(file: File, productSlug: string, fileName: string): Promise<string> {
  assertSafeImageFile(file)

  const supabase = await getSupabaseServerClient()
  const extension = getSafeImageExtension(file)
  const baseFileName = fileName.replace(/\.[^.]+$/, "")
  const safeFileName = `${toSafePathSegment(baseFileName, "product-image")}.${extension}`
  const path = buildSafeStoragePath(["products", productSlug, safeFileName])

  const upload = await supabase.storage.from(PRODUCT_IMAGES_BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type,
  })

  if (upload.error) throw new Error(`Failed to upload image: ${upload.error.message}`)

  const publicUrl = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path).data.publicUrl
  return publicUrl
}

export async function insertProductImages(productId: string, images: Omit<AdminProductImage, "id">[]): Promise<void> {
  if (!images.length) return
  const supabase = await getSupabaseServerClient()

  const rows = images.map((image, index) => ({
    product_id: productId,
    url: image.imageUrl,
    image_url: image.imageUrl,
    alt_text: image.altText,
    sort_order: image.sortOrder || index + 1,
    is_main: image.isMain,
  }))

  const result = await supabase.from("product_images").insert(rows)
  if (!result.error) return

  if (!isMissingColumnError(result.error.message)) {
    throw new Error(`Failed to save product images: ${result.error.message}`)
  }

  const fallbackRows = rows.map(({ url, ...row }) => row)
  const fallback = await supabase.from("product_images").insert(fallbackRows)
  if (fallback.error) throw new Error(`Failed to save product images: ${fallback.error.message}`)
}

export async function updateExistingImages(options: {
  productId: string
  existingImages: AdminProductImage[]
  removedImageIds: string[]
  mainExistingImageId: string | null
}): Promise<void> {
  const supabase = await getSupabaseServerClient()

  if (options.removedImageIds.length) {
    const remove = await supabase.from("product_images").delete().in("id", options.removedImageIds)
    if (remove.error) throw new Error(`Failed to remove images: ${remove.error.message}`)
  }

  const remaining = options.existingImages.filter((image) => !options.removedImageIds.includes(image.id))
  for (const image of remaining) {
    const update = await supabase
      .from("product_images")
      .update({
        alt_text: image.altText,
        sort_order: image.sortOrder,
        is_main: options.mainExistingImageId ? image.id === options.mainExistingImageId : image.isMain,
      })
      .eq("id", image.id)
      .eq("product_id", options.productId)

    if (update.error) throw new Error(`Failed to update image: ${update.error.message}`)
  }
}

export async function toggleProductActiveRecord(id: string): Promise<void> {
  const supabase = await getSupabaseServerClient()
  const current = await supabase.from("products").select("is_active").eq("id", id).maybeSingle()
  if (current.error) throw new Error(`Failed to read product status: ${current.error.message}`)

  const update = await supabase.from("products").update({ is_active: !Boolean(current.data?.is_active) }).eq("id", id)
  if (update.error) throw new Error(`Failed to toggle product status: ${update.error.message}`)
}

export async function deleteProductRecord(id: string): Promise<void> {
  const supabase = await getSupabaseServerClient()
  await supabase.from("product_specs").delete().eq("product_id", id)
  await supabase.from("product_images").delete().eq("product_id", id)
  await supabase.from("inventory").delete().eq("product_id", id)
  const result = await supabase.from("products").delete().eq("id", id)
  if (result.error) throw new Error(`Failed to delete product: ${result.error.message}`)
}
