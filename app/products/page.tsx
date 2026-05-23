import { ProductsErrorState, ProductsPageClient } from "@/components/products/products-page-client"
import { getProducts } from "@/lib/services/products-service"

export default async function ProductsPage() {
  try {
    const products = await getProducts()
    return <ProductsPageClient products={products} />
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown products data error"
    return <ProductsErrorState message={message} />
  }
}
