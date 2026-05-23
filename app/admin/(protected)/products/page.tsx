import { AdminLayout } from "@/components/admin/admin-layout"
import { AdminEmptyState } from "@/components/admin/admin-empty-state"
import { AdminProductsTable } from "@/components/admin/admin-products-table"
import { getAdminProducts } from "@/lib/services/admin-products-service"
import { getBrands } from "@/lib/services/brands-service"
import { getCategories } from "@/lib/services/categories-service"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function AdminProductsPage() {
  try {
    const [products, brands, categories] = await Promise.all([getAdminProducts(), getBrands(), getCategories()])

    return (
      <AdminLayout title="مدیریت محصولات" subtitle="افزودن، ویرایش و کنترل وضعیت محصولات فروشگاه">
        {products.length ? (
          <AdminProductsTable products={products} brands={brands} categories={categories} />
        ) : (
          <AdminEmptyState />
        )}
      </AdminLayout>
    )
  } catch (error) {
    return (
      <AdminLayout title="مدیریت محصولات">
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-6 text-destructive shadow-sm">
          <h2 className="font-bold">خطا در دریافت محصولات</h2>
          <p className="mt-2 text-sm">{error instanceof Error ? error.message : "خطای نامشخص"}</p>
          <Button asChild className="mt-4 rounded-xl"><Link href="/admin/products/new">افزودن محصول جدید</Link></Button>
        </div>
      </AdminLayout>
    )
  }
}
