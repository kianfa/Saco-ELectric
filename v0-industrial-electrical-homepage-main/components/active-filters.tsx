"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/data"

interface FilterState {
  categories: string[]
  brands: string[]
  priceRange: [number, number]
  inStock: boolean | null
  hasWarranty: boolean | null
  applications: string[]
}

interface ActiveFiltersProps {
  filters: FilterState
  onRemoveFilter: (type: string, value?: string) => void
  onClearAll: () => void
}

export function ActiveFilters({ filters, onRemoveFilter, onClearAll }: ActiveFiltersProps) {
  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.brands.length > 0 ||
    filters.applications.length > 0 ||
    filters.inStock !== null ||
    filters.hasWarranty !== null ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 30000000

  if (!hasActiveFilters) return null

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <span className="text-sm text-muted-foreground">فیلترهای فعال:</span>

      {/* Category chips */}
      {filters.categories.map((cat) => (
        <FilterChip
          key={`cat-${cat}`}
          label={cat}
          onRemove={() => onRemoveFilter("category", cat)}
        />
      ))}

      {/* Brand chips */}
      {filters.brands.map((brand) => (
        <FilterChip
          key={`brand-${brand}`}
          label={brand}
          onRemove={() => onRemoveFilter("brand", brand)}
        />
      ))}

      {/* Application chips */}
      {filters.applications.map((app) => (
        <FilterChip
          key={`app-${app}`}
          label={app}
          onRemove={() => onRemoveFilter("application", app)}
        />
      ))}

      {/* Stock status chip */}
      {filters.inStock !== null && (
        <FilterChip
          label={filters.inStock ? "موجود" : "ناموجود"}
          onRemove={() => onRemoveFilter("inStock")}
        />
      )}

      {/* Warranty chip */}
      {filters.hasWarranty !== null && (
        <FilterChip
          label={filters.hasWarranty ? "گارانتی دارد" : "بدون گارانتی"}
          onRemove={() => onRemoveFilter("hasWarranty")}
        />
      )}

      {/* Price range chip */}
      {(filters.priceRange[0] > 0 || filters.priceRange[1] < 30000000) && (
        <FilterChip
          label={`${formatPrice(filters.priceRange[0])} - ${formatPrice(filters.priceRange[1])} تومان`}
          onRemove={() => onRemoveFilter("priceRange")}
        />
      )}

      {/* Clear all button */}
      <Button
        variant="ghost"
        size="sm"
        className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg"
        onClick={onClearAll}
      >
        پاک کردن همه
      </Button>
    </div>
  )
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-sm px-3 py-1.5 rounded-lg">
      {label}
      <button
        onClick={onRemove}
        className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </span>
  )
}
