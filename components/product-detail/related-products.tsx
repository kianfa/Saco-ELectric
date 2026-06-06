"use client"

import Link from "next/link"
import { ArrowLeft, ShoppingCart, Star } from "lucide-react"
import { formatPrice } from "@/lib/data"
import { ProductImage } from "@/components/common/product-image"

interface RelatedProduct {
  id: number | string
  name: string
  model: string
  price: number
  oldPrice: number | null
  discount: number | null
  rating: number
  reviewCount: number
  image: string | null
  imageAlt?: string | null
  brand: string
  slug: string
  hasActiveVariants?: boolean
}

interface RelatedProductsProps {
  products: RelatedProduct[]
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  return (
    <section className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-primary">پیشنهادهای مرتبط</p>
          <h2 className="mt-1 text-xl font-black text-foreground">محصولات مرتبط</h2>
        </div>
        <Link href="/products" className="flex items-center gap-1 text-sm font-bold text-primary transition-colors hover:text-primary/75">
          <span>مشاهده همه</span>
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {products.map((product) => (
          <Link key={product.id} href={`/products/${product.slug}`} className="group flex flex-col rounded-2xl border border-border bg-white p-3 transition-all hover:border-primary/35 hover:shadow-md sm:p-4">
            <div className="relative mb-3">
              {product.discount ? <span className="absolute right-2 top-2 z-10 rounded-full bg-accent px-2.5 py-1 text-[11px] font-black text-accent-foreground">{product.discount}٪</span> : null}
              <ProductImage src={product.image} alt={product.imageAlt || product.name} size="card" className="w-full rounded-xl shadow-none" />
            </div>

            <div className="flex flex-1 flex-col">
              <p className="text-[11px] font-bold text-primary">{product.brand}</p>
              <h3 className="mt-1 line-clamp-2 text-sm font-black leading-6 text-foreground">{product.name}</h3>
              <p className="mt-1 text-xs text-muted-foreground" dir="ltr">{product.model}</p>

              <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                <span className="font-bold text-foreground">{product.rating}</span>
                <span>({product.reviewCount})</span>
              </div>

              <div className="mt-auto pt-4">
                {product.hasActiveVariants ? <p className="text-[11px] font-bold text-primary">شروع قیمت از</p> : null}
                <div className="mt-1 flex flex-wrap items-baseline gap-1">
                  <span className="text-base font-black text-foreground">{formatPrice(product.price)}</span>
                  <span className="text-[11px] text-muted-foreground">تومان</span>
                </div>
                {product.oldPrice ? <p className="mt-1 text-xs text-muted-foreground line-through">{formatPrice(product.oldPrice)}</p> : null}
              </div>

              <span className="mt-3 flex h-9 w-full items-center justify-center gap-2 rounded-xl bg-primary px-3 text-xs font-bold text-primary-foreground transition-colors group-hover:bg-primary/90">
                <ShoppingCart className="h-3.5 w-3.5" />
                <span>{product.hasActiveVariants ? "انتخاب گزینه‌ها" : "مشاهده محصول"}</span>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
