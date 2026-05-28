import { ProductsErrorState, ProductsPageClient } from "@/components/products/products-page-client"
import { getProducts } from "@/lib/services/products-service"

type SearchParamsValue = string | string[] | undefined
type ProductsPageSearchParams = Record<string, SearchParamsValue>

function readSearchParam(value: SearchParamsValue): string | undefined {
  if (Array.isArray(value)) return value[0]
  return value
}

interface ProductsPageProps {
  searchParams?: Promise<ProductsPageSearchParams> | ProductsPageSearchParams
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  try {
    const params = await Promise.resolve(searchParams ?? {})
    const search = readSearchParam(params.search)?.trim() || undefined
    const brand = readSearchParam(params.brand)?.trim() || undefined
    const category = readSearchParam(params.category)?.trim() || undefined

    const products = await getProducts({
      active: true,
      search,
      brand,
      category,
    })

    return (
      <ProductsPageClient
        products={products}
        initialSearchQuery={search ?? ""}
        activeBrandSlug={brand ?? ""}
        activeCategorySlug={category ?? ""}
      />
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown products data error"
    return <ProductsErrorState message={message} />
  }
}
