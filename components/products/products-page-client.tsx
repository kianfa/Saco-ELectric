"use client"

import { useMemo, useState } from "react"
import { ChevronLeft, RefreshCw } from "lucide-react"
import { TopBar } from "@/components/top-bar"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { FilterSidebar } from "@/components/filter-sidebar"
import { ProductToolbar } from "@/components/product-toolbar"
import { ActiveFilters } from "@/components/active-filters"
import { ProductListingCard } from "@/components/product-listing-card"
import { ProductListItem } from "@/components/product-list-item"
import { ProductPagination } from "@/components/product-pagination"
import { EmptyProductState } from "@/components/empty-product-state"
import { Button } from "@/components/ui/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import type { Product } from "@/types/product"

interface FilterState {
  categories: string[]
  brands: string[]
  priceRange: [number, number]
  inStock: boolean | null
  hasWarranty: boolean | null
  applications: string[]
}

const initialFilters: FilterState = {
  categories: [],
  brands: [],
  priceRange: [0, 30000000],
  inStock: null,
  hasWarranty: null,
  applications: [],
}

interface ProductsPageClientProps {
  products: Product[]
}

export function ProductsPageClient({ products }: ProductsPageClientProps) {
  const [filters, setFilters] = useState<FilterState>(initialFilters)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("bestselling")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const searchableText = [
          product.name,
          product.model,
          product.sku,
          product.brandName,
          product.categoryName,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()

        if (!searchableText.includes(query)) {
          return false
        }
      }

      if (
        filters.categories.length > 0 &&
        (!product.categoryName || !filters.categories.includes(product.categoryName))
      ) {
        return false
      }

      if (
        filters.brands.length > 0 &&
        (!product.brandName || !filters.brands.includes(product.brandName))
      ) {
        return false
      }

      if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) {
        return false
      }

      if (filters.inStock !== null && (product.stockQuantity > 0) !== filters.inStock) {
        return false
      }

      if (filters.hasWarranty !== null && product.hasWarranty !== filters.hasWarranty) {
        return false
      }

      return true
    })
  }, [filters, products, searchQuery])

  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      switch (sortBy) {
        case "cheapest":
          return a.price - b.price
        case "expensive":
          return b.price - a.price
        case "discount":
          return b.discountPercent - a.discountPercent
        case "newest":
          return String(b.id).localeCompare(String(a.id))
        default:
          return b.reviewCount - a.reviewCount
      }
    })
  }, [filteredProducts, sortBy])

  const itemsPerPage = 12
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage)
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleRemoveFilter = (type: string, value?: string) => {
    switch (type) {
      case "category":
        setFilters((prev) => ({
          ...prev,
          categories: prev.categories.filter((c) => c !== value),
        }))
        break
      case "brand":
        setFilters((prev) => ({
          ...prev,
          brands: prev.brands.filter((b) => b !== value),
        }))
        break
      case "application":
        setFilters((prev) => ({
          ...prev,
          applications: prev.applications.filter((a) => a !== value),
        }))
        break
      case "inStock":
        setFilters((prev) => ({ ...prev, inStock: null }))
        break
      case "hasWarranty":
        setFilters((prev) => ({ ...prev, hasWarranty: null }))
        break
      case "priceRange":
        setFilters((prev) => ({ ...prev, priceRange: [0, 30000000] }))
        break
    }
  }

  const handleClearFilters = () => {
    setFilters(initialFilters)
    setSearchQuery("")
    setCurrentPage(1)
  }

  const handleFilterChange = (nextFilters: FilterState) => {
    setFilters(nextFilters)
    setCurrentPage(1)
  }

  const totalProducts = filteredProducts.length

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <Header />

      <main className="container mx-auto px-4 py-6">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/" className="text-muted-foreground hover:text-primary">
                صفحه اصلی
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronLeft className="w-4 h-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage className="text-foreground font-medium">محصولات</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            محصولات برق صنعتی
          </h1>
          <p className="text-muted-foreground text-sm md:text-base mb-2">
            مشاهده و مقایسه انواع تجهیزات برق صنعتی، اتوماسیون، تابلو برق، کابل، سنسور و اینورتر
          </p>
          <p className="text-sm text-primary font-medium">
            {totalProducts.toLocaleString("fa-IR")} کالا
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="hidden lg:block w-72 shrink-0">
            <FilterSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
            />
          </aside>

          <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
            <SheetContent side="right" className="w-full sm:w-96 overflow-y-auto">
              <SheetHeader className="mb-4">
                <SheetTitle>فیلترها</SheetTitle>
              </SheetHeader>
              <FilterSidebar
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearFilters={() => {
                  handleClearFilters()
                  setMobileFiltersOpen(false)
                }}
              />
            </SheetContent>
          </Sheet>

          <div className="flex-1 min-w-0">
            <ProductToolbar
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              sortBy={sortBy}
              onSortChange={setSortBy}
              searchQuery={searchQuery}
              onSearchChange={(value) => {
                setSearchQuery(value)
                setCurrentPage(1)
              }}
              onOpenMobileFilters={() => setMobileFiltersOpen(true)}
            />

            <ActiveFilters
              filters={filters}
              onRemoveFilter={handleRemoveFilter}
              onClearAll={handleClearFilters}
            />

            {paginatedProducts.length > 0 ? (
              <>
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                    {paginatedProducts.map((product) => (
                      <ProductListingCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {paginatedProducts.map((product) => (
                      <ProductListItem key={product.id} product={product} />
                    ))}
                  </div>
                )}

                {totalPages > 1 && (
                  <ProductPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                )}
              </>
            ) : (
              <EmptyProductState onClearFilters={handleClearFilters} />
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export function ProductsErrorState({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <Header />
      <main className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-2xl rounded-2xl border border-destructive/20 bg-card p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <RefreshCw className="h-7 w-7" />
          </div>
          <h1 className="mb-3 text-2xl font-bold text-foreground">خطا در دریافت محصولات</h1>
          <p className="mb-6 text-sm leading-7 text-muted-foreground">
            اتصال به پایگاه داده برقرار نشد یا اطلاعات محصولات قابل دریافت نیست.
          </p>
          <p dir="ltr" className="mb-6 rounded-xl bg-muted p-3 text-xs text-muted-foreground">
            {message}
          </p>
          <Button asChild className="rounded-xl bg-primary hover:bg-primary/90">
            <a href="/products">تلاش مجدد</a>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  )
}
