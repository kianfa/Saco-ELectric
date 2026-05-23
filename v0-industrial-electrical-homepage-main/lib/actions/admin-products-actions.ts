"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import {
  createAdminProduct,
  deleteAdminProduct,
  toggleAdminProductActive,
  updateAdminProduct,
} from "@/lib/services/admin-products-service"
import type { AdminActionState, AdminProductFormInput, AdminProductImage, AdminProductSpec } from "@/types/admin-product"
import { requireAdminAccess } from "@/lib/auth/admin-auth"

const emptyState: AdminActionState = { ok: false, message: "" }

function nullableText(value: FormDataEntryValue | null): string | null {
  const text = typeof value === "string" ? value.trim() : ""
  if (!text || text === "none") return null
  return text
}

function numberValue(value: FormDataEntryValue | null, fallback = 0): number {
  const parsed = Number(typeof value === "string" ? value.replace(/,/g, "") : value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function jsonValue<T>(value: FormDataEntryValue | null, fallback: T): T {
  if (typeof value !== "string" || !value.trim()) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

function parseProductInput(formData: FormData): AdminProductFormInput {
  return {
    name: String(formData.get("name") ?? "").trim(),
    slug: String(formData.get("slug") ?? "").trim().toLowerCase(),
    model: nullableText(formData.get("model")),
    sku: nullableText(formData.get("sku")),
    shortDescription: nullableText(formData.get("shortDescription")),
    description: nullableText(formData.get("description")),
    brandId: nullableText(formData.get("brandId")),
    categoryId: nullableText(formData.get("categoryId")),
    price: numberValue(formData.get("price")),
    oldPrice: numberValue(formData.get("oldPrice"), 0) || null,
    discountPercent: numberValue(formData.get("discountPercent"), 0),
    quantity: numberValue(formData.get("quantity"), 0),
    lowStockThreshold: numberValue(formData.get("lowStockThreshold"), 0) || null,
    isActive: formData.get("isActive") === "on",
    isFeatured: formData.get("isFeatured") === "on",
    showInHomepage: formData.get("showInHomepage") === "on",
    hasWarranty: formData.get("hasWarranty") === "on",
    warranty: nullableText(formData.get("warranty")),
    originCountry: nullableText(formData.get("originCountry")),
    specs: jsonValue<AdminProductSpec[]>(formData.get("specsJson"), []),
    existingImages: jsonValue<AdminProductImage[]>(formData.get("existingImagesJson"), []),
    removedImageIds: jsonValue<string[]>(formData.get("removedImageIdsJson"), []),
    mainExistingImageId: nullableText(formData.get("mainExistingImageId")),
  }
}

function getImageFiles(formData: FormData): File[] {
  return formData
    .getAll("images")
    .filter((item): item is File => item instanceof File && item.size > 0)
}

export async function createProductAction(_prevState: AdminActionState = emptyState, formData: FormData): Promise<AdminActionState> {
  await requireAdminAccess()
  try {
    const intent = String(formData.get("intent") ?? "save")
    const input = parseProductInput(formData)
    const result = await createAdminProduct(input, getImageFiles(formData))

    if (!result.ok) return result

    revalidatePath("/")
    revalidatePath("/products")
    revalidatePath("/admin/products")

    return {
      ok: true,
      message: result.message,
      productId: result.productId,
      redirectTo: intent === "save-new" ? "/admin/products/new" : "/admin/products",
    }
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "خطا در ثبت محصول" }
  }
}

export async function updateProductAction(productId: string, _prevState: AdminActionState = emptyState, formData: FormData): Promise<AdminActionState> {
  await requireAdminAccess()
  try {
    const input = parseProductInput(formData)
    const result = await updateAdminProduct(productId, input, getImageFiles(formData))

    if (!result.ok) return result

    revalidatePath("/")
    revalidatePath("/products")
    revalidatePath(`/products/${input.slug}`)
    revalidatePath("/admin/products")
    revalidatePath(`/admin/products/${productId}/edit`)

    return { ok: true, message: result.message, productId, redirectTo: "/admin/products" }
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "خطا در به‌روزرسانی محصول" }
  }
}

export async function toggleProductActiveAction(formData: FormData) {
  await requireAdminAccess()
  const id = String(formData.get("id") ?? "")
  if (id) await toggleAdminProductActive(id)
  revalidatePath("/products")
  revalidatePath("/admin/products")
}

export async function deleteProductAction(formData: FormData) {
  await requireAdminAccess()
  const id = String(formData.get("id") ?? "")
  if (id) await deleteAdminProduct(id)
  revalidatePath("/products")
  revalidatePath("/admin/products")
  redirect("/admin/products")
}
