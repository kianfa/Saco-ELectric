"use client"

import { CategoryCard } from "./category-card"
import { ChevronLeft, ChevronRight, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Category } from "@/types/category"

interface CategorySectionProps {
  categories: Category[]
  error?: string | null
}

export function CategorySection({ categories, error }: CategorySectionProps) {
  return (
    <section className="container mx-auto px-4 py-8">
      <div className="relative">
        {/* Navigation Arrows */}
        <Button
          variant="outline"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-card shadow-lg rounded-full hidden lg:flex"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-card shadow-lg rounded-full hidden lg:flex"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>

        {error ? (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-sm text-destructive flex items-center gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>خطا در دریافت دسته‌بندی‌ها. لطفاً بعداً دوباره تلاش کنید.</span>
          </div>
        ) : categories.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-muted-foreground">
            هنوز دسته‌بندی‌ای ثبت نشده است.
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide lg:grid lg:grid-cols-8 lg:overflow-visible lg:pb-0 px-0 lg:px-12">
            {categories.map((category) => (
              <div key={category.id} className="flex-shrink-0 w-28 md:w-auto">
                <CategoryCard
                  name={category.name}
                  image={category.imageUrl}
                  href={`/products?category=${encodeURIComponent(category.slug)}`}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
