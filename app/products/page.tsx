import { ProductsErrorState, ProductsPageClient } from "@/components/products/products-page-client"
import { getBrands } from "@/lib/services/brands-service"
import { getCategories } from "@/lib/services/categories-service"
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
    const availability = readSearchParam(params.availability)?.trim() || undefined
    const sort = readSearchParam(params.sort)?.trim() || undefined
    const minPrice = readSearchParam(params.minPrice)?.trim() || undefined
    const maxPrice = readSearchParam(params.maxPrice)?.trim() || undefined

    const [products, categories, brands] = await Promise.all([
      getProducts({
        active: true,
        search,
        brand,
        category,
      }),
      getCategories().catch(() => []),
      getBrands().catch(() => []),
    ])

    return (
      <ProductsPageClient
        products={products}
        categories={categories}
        brands={brands}
        initialSearchQuery={search ?? ""}
        activeBrandSlug={brand ?? ""}
        activeCategorySlug={category ?? ""}
        activeAvailability={availability ?? ""}
        activeSort={sort ?? "bestselling"}
        activeMinPrice={minPrice ?? ""}
        activeMaxPrice={maxPrice ?? ""}
      />
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown products data error"
    return <ProductsErrorState message={message} />
  }
}
