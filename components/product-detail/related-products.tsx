"use client"

import Link from "next/link"
import { Heart, Star, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
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
}

interface RelatedProductsProps {
  products: RelatedProduct[]
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl md:text-2xl font-bold text-foreground">
          محصولات مرتبط
        </h2>
        <Link
          href="/products"
          className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
        >
          مشاهده همه
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.slug}`}
            className="group bg-card border border-border rounded-2xl p-4 hover:border-primary hover:shadow-xl transition-all duration-300 flex flex-col"
          >
            {/* Image Container */}
            <div className="relative mb-4">
              {/* Discount Badge */}
              {product.discount && (
                <span className="absolute top-2 right-2 bg-accent text-accent-foreground text-xs font-bold px-2 py-1 rounded-lg z-10">
                  {product.discount}٪
                </span>
              )}

              {/* Favorite Button */}
              <button
                onClick={(e) => e.preventDefault()}
                className="absolute top-2 left-2 w-8 h-8 bg-card/80 backdrop-blur-sm rounded-full flex items-center justify-center border border-border hover:border-destructive hover:text-destructive transition-colors z-10"
              >
                <Heart className="w-4 h-4" />
              </button>

              {/* Product Image */}
              <ProductImage
                src={product.image}
                alt={product.imageAlt || product.name}
                size="card"
                className="w-full"
              />
            </div>

            {/* Product Info */}
            <div className="flex-1 flex flex-col">
              <h3 className="font-semibold text-foreground mb-1 line-clamp-2 text-sm">
                {product.name}
              </h3>
              <p className="text-xs text-muted-foreground mb-2" dir="ltr">
                {product.model}
              </p>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-3">
                <Star className="w-4 h-4 fill-accent text-accent" />
                <span className="text-sm font-medium">{product.rating}</span>
                <span className="text-xs text-muted-foreground">
                  ({product.reviewCount})
                </span>
              </div>

              {/* Price */}
              <div className="mt-auto">
                <div className="flex items-baseline gap-2">
                  <span className="text-base font-bold text-foreground">
                    {formatPrice(product.price)}
                  </span>
                  <span className="text-xs text-muted-foreground">تومان</span>
                </div>
                {product.oldPrice && (
                  <span className="text-xs text-muted-foreground line-through">
                    {formatPrice(product.oldPrice)}
                  </span>
                )}
              </div>

              {/* Add to Cart Button */}
              <Button
                onClick={(e) => e.preventDefault()}
                className="w-full mt-3 bg-primary hover:bg-primary/90 rounded-xl gap-2 text-sm"
                size="sm"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>افزودن به سبد</span>
              </Button>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
