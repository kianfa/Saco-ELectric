import {
  deleteProductRecord,
  ensureSkuIsUnique,
  ensureSlugIsUnique,
  fetchAdminProductById,
  fetchAdminProducts,
  insertProduct,
  insertProductImages,
  replaceProductSpecs,
  toggleProductActiveRecord,
  updateExistingImages,
  updateProductRecord,
  uploadProductImage,
  upsertInventory,
} from "@/lib/repositories/admin-products-repository"
import type { AdminProduct, AdminProductFormInput, AdminProductImage } from "@/types/admin-product"
import type { Product } from "@/types/product"

// Admin service boundary. UI/server actions call this file, not Supabase directly.
// To migrate later, replace the repository implementation and keep this API stable.
export async function getAdminProducts(): Promise<Product[]> {
  return fetchAdminProducts()
}

export async function getAdminProductById(id: string): Promise<AdminProduct | null> {
  return fetchAdminProductById(id)
}

export async function validateAdminProductInput(input: AdminProductFormInput, productId?: string) {
  const fieldErrors: Record<string, string> = {}

  if (!input.name.trim()) fieldErrors.name = "نام محصول الزامی است."
  if (!input.slug.trim()) fieldErrors.slug = "Slug الزامی است."
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.slug)) {
    fieldErrors.slug = "Slug فقط باید شامل حروف انگلیسی کوچک، عدد و خط تیره باشد."
  }
  if (!Number.isFinite(input.price) || input.price <= 0) fieldErrors.price = "قیمت باید عددی و بزرگ‌تر از صفر باشد."
  if (!input.categoryId) fieldErrors.categoryId = "انتخاب دسته‌بندی الزامی است."
  if (!Number.isFinite(input.quantity) || input.quantity < 0) fieldErrors.quantity = "موجودی باید عددی و صفر یا بیشتر باشد."

  if (!fieldErrors.slug) {
    const isSlugUnique = await ensureSlugIsUnique(input.slug, productId)
    if (!isSlugUnique) fieldErrors.slug = "این slug قبلاً برای محصول دیگری ثبت شده است."
  }

  if (input.sku?.trim()) {
    const isSkuUnique = await ensureSkuIsUnique(input.sku.trim(), productId)
    if (!isSkuUnique) fieldErrors.sku = "این SKU قبلاً ثبت شده است."
  }

  return fieldErrors
}

export async function createAdminProduct(input: AdminProductFormInput, imageFiles: File[]) {
  const fieldErrors = await validateAdminProductInput(input)
  if (Object.keys(fieldErrors).length) {
    return { ok: false, message: "لطفاً خطاهای فرم را بررسی کنید.", fieldErrors }
  }

  const productId = await insertProduct(input)
  await upsertInventory(productId, input.quantity, input.lowStockThreshold)

  const uploadedImages: Omit<AdminProductImage, "id">[] = []
  for (let index = 0; index < imageFiles.length; index++) {
    const file = imageFiles[index]
    if (!file || file.size === 0) continue
    const fileName = index === 0 ? "main" : `gallery-${index}`
    const imageUrl = await uploadProductImage(file, input.slug, fileName)
    uploadedImages.push({
      imageUrl,
      altText: input.name,
      sortOrder: index + 1,
      isMain: index === 0,
    })
  }

  await insertProductImages(productId, uploadedImages)
  await replaceProductSpecs(productId, input.specs)

  return { ok: true, message: "محصول با موفقیت ثبت شد", productId }
}

export async function updateAdminProduct(id: string, input: AdminProductFormInput, imageFiles: File[]) {
  const fieldErrors = await validateAdminProductInput(input, id)
  if (Object.keys(fieldErrors).length) {
    return { ok: false, message: "لطفاً خطاهای فرم را بررسی کنید.", fieldErrors }
  }

  await updateProductRecord(id, input)
  await upsertInventory(id, input.quantity, input.lowStockThreshold)

  if (input.existingImages) {
    await updateExistingImages({
      productId: id,
      existingImages: input.existingImages,
      removedImageIds: input.removedImageIds ?? [],
      mainExistingImageId: input.mainExistingImageId ?? null,
    })
  }

  const uploadedImages: Omit<AdminProductImage, "id">[] = []
  for (let index = 0; index < imageFiles.length; index++) {
    const file = imageFiles[index]
    if (!file || file.size === 0) continue
    const fileName = input.existingImages?.length || index > 0 ? `gallery-${Date.now()}-${index + 1}` : "main"
    const imageUrl = await uploadProductImage(file, input.slug, fileName)
    uploadedImages.push({
      imageUrl,
      altText: input.name,
      sortOrder: (input.existingImages?.length ?? 0) + index + 1,
      isMain: !input.existingImages?.length && index === 0,
    })
  }

  await insertProductImages(id, uploadedImages)
  await replaceProductSpecs(id, input.specs)

  return { ok: true, message: "محصول با موفقیت به‌روزرسانی شد", productId: id }
}

export async function deleteAdminProduct(id: string): Promise<void> {
  await deleteProductRecord(id)
}

export async function toggleAdminProductActive(id: string): Promise<void> {
  await toggleProductActiveRecord(id)
}
