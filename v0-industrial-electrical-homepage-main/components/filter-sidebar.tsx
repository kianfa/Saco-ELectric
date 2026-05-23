"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { filterCategories, filterBrands, filterApplications, formatPrice } from "@/lib/data"

interface FilterState {
  categories: string[]
  brands: string[]
  priceRange: [number, number]
  inStock: boolean | null
  hasWarranty: boolean | null
  applications: string[]
}

interface FilterSidebarProps {
  filters: FilterState
  onFilterChange: (filters: FilterState) => void
  onClearFilters: () => void
}

export function FilterSidebar({ filters, onFilterChange, onClearFilters }: FilterSidebarProps) {
  const handleCategoryChange = (category: string, checked: boolean) => {
    const newCategories = checked
      ? [...filters.categories, category]
      : filters.categories.filter((c) => c !== category)
    onFilterChange({ ...filters, categories: newCategories })
  }

  const handleBrandChange = (brand: string, checked: boolean) => {
    const newBrands = checked
      ? [...filters.brands, brand]
      : filters.brands.filter((b) => b !== brand)
    onFilterChange({ ...filters, brands: newBrands })
  }

  const handleApplicationChange = (app: string, checked: boolean) => {
    const newApplications = checked
      ? [...filters.applications, app]
      : filters.applications.filter((a) => a !== app)
    onFilterChange({ ...filters, applications: newApplications })
  }

  const handlePriceChange = (value: number[]) => {
    onFilterChange({ ...filters, priceRange: [value[0], value[1]] })
  }

  const handleStockChange = (value: boolean | null) => {
    onFilterChange({ ...filters, inStock: value })
  }

  const handleWarrantyChange = (value: boolean | null) => {
    onFilterChange({ ...filters, hasWarranty: value })
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-bold text-foreground mb-4">دسته‌بندی</h3>
        <div className="space-y-3">
          {filterCategories.map((category) => (
            <div key={category} className="flex items-center gap-3">
              <Checkbox
                id={`cat-${category}`}
                checked={filters.categories.includes(category)}
                onCheckedChange={(checked) => handleCategoryChange(category, checked as boolean)}
              />
              <Label htmlFor={`cat-${category}`} className="text-sm text-foreground cursor-pointer">
                {category}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Brands */}
      <div className="border-t border-border pt-6">
        <h3 className="font-bold text-foreground mb-4">برند</h3>
        <div className="space-y-3">
          {filterBrands.map((brand) => (
            <div key={brand} className="flex items-center gap-3">
              <Checkbox
                id={`brand-${brand}`}
                checked={filters.brands.includes(brand)}
                onCheckedChange={(checked) => handleBrandChange(brand, checked as boolean)}
              />
              <Label htmlFor={`brand-${brand}`} className="text-sm text-foreground cursor-pointer">
                {brand}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="border-t border-border pt-6">
        <h3 className="font-bold text-foreground mb-4">محدوده قیمت</h3>
        <div className="space-y-4">
          <Slider
            value={filters.priceRange}
            min={0}
            max={30000000}
            step={100000}
            onValueChange={handlePriceChange}
            className="w-full"
          />
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground mb-1 block">از</Label>
              <Input
                type="text"
                value={formatPrice(filters.priceRange[0])}
                readOnly
                className="text-sm h-9"
              />
            </div>
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground mb-1 block">تا</Label>
              <Input
                type="text"
                value={formatPrice(filters.priceRange[1])}
                readOnly
                className="text-sm h-9"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center">تومان</p>
        </div>
      </div>

      {/* Stock Status */}
      <div className="border-t border-border pt-6">
        <h3 className="font-bold text-foreground mb-4">وضعیت موجودی</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Checkbox
              id="in-stock"
              checked={filters.inStock === true}
              onCheckedChange={(checked) => handleStockChange(checked ? true : null)}
            />
            <Label htmlFor="in-stock" className="text-sm text-foreground cursor-pointer">
              موجود
            </Label>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox
              id="out-of-stock"
              checked={filters.inStock === false}
              onCheckedChange={(checked) => handleStockChange(checked ? false : null)}
            />
            <Label htmlFor="out-of-stock" className="text-sm text-foreground cursor-pointer">
              ناموجود
            </Label>
          </div>
        </div>
      </div>

      {/* Warranty */}
      <div className="border-t border-border pt-6">
        <h3 className="font-bold text-foreground mb-4">گارانتی</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Checkbox
              id="has-warranty"
              checked={filters.hasWarranty === true}
              onCheckedChange={(checked) => handleWarrantyChange(checked ? true : null)}
            />
            <Label htmlFor="has-warranty" className="text-sm text-foreground cursor-pointer">
              دارد
            </Label>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox
              id="no-warranty"
              checked={filters.hasWarranty === false}
              onCheckedChange={(checked) => handleWarrantyChange(checked ? false : null)}
            />
            <Label htmlFor="no-warranty" className="text-sm text-foreground cursor-pointer">
              ندارد
            </Label>
          </div>
        </div>
      </div>

      {/* Applications */}
      <div className="border-t border-border pt-6">
        <h3 className="font-bold text-foreground mb-4">مناسب برای</h3>
        <div className="space-y-3">
          {filterApplications.map((app) => (
            <div key={app} className="flex items-center gap-3">
              <Checkbox
                id={`app-${app}`}
                checked={filters.applications.includes(app)}
                onCheckedChange={(checked) => handleApplicationChange(app, checked as boolean)}
              />
              <Label htmlFor={`app-${app}`} className="text-sm text-foreground cursor-pointer">
                {app}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="border-t border-border pt-6 space-y-3">
        <Button className="w-full bg-primary hover:bg-primary/90 rounded-xl">
          اعمال فیلتر
        </Button>
        <Button
          variant="outline"
          className="w-full rounded-xl"
          onClick={onClearFilters}
        >
          پاک کردن فیلترها
        </Button>
      </div>
    </div>
  )
}
