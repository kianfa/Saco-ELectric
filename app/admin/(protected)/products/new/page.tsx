import { AdminLayout } from "@/components/admin/admin-layout"
import { ProductForm } from "@/components/admin/product-form"
import { getAdminBrands } from "@/lib/services/admin-brands-service"
import { getAdminCategories } from "@/lib/services/admin-categories-service"

export default async function NewProductPage() {
  const [brands, categories] = await Promise.all([getAdminBrands(), getAdminCategories()])

  return (
    <AdminLayout title="افزودن محصول جدید" subtitle="محصول جدید را بدون نوشتن SQL در دیتابیس و Storage ثبت کنید.">
      <ProductForm options={{ brands, categories }} />
    </AdminLayout>
  )
}
