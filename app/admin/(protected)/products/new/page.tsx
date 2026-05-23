import { AdminLayout } from "@/components/admin/admin-layout"
import { ProductForm } from "@/components/admin/product-form"
import { getBrands } from "@/lib/services/brands-service"
import { getCategories } from "@/lib/services/categories-service"

export default async function NewProductPage() {
  const [brands, categories] = await Promise.all([getBrands(), getCategories()])

  return (
    <AdminLayout title="افزودن محصول جدید" subtitle="محصول جدید را بدون نوشتن SQL در دیتابیس و Storage ثبت کنید.">
      <ProductForm options={{ brands, categories }} />
    </AdminLayout>
  )
}
