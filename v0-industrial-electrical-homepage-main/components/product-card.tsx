"use client"

import Link from "next/link"
import { Heart, Star, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/data"
import { ProductImageWithFallback } from "@/components/product-image-with-fallback"

interface ProductCardProps {
  name: string
  slug: string
  model: string | null
  price: number
  oldPrice: number | null
  discount: number | null
  rating: number
  reviewCount: number
  image: string | null
  imageAlt?: string | null
  brand: string | null
}

export function ProductCard({
  name,
  slug,
  model,
  price,
  oldPrice,
  discount,
  rating,
  reviewCount,
  image,
  imageAlt,
  brand,
}: ProductCardProps) {
  return (
    <div className="group bg-card border border-border rounded-2xl p-4 hover:border-primary hover:shadow-xl transition-all duration-300 flex flex-col">
      {/* Image Container */}
      <div className="relative mb-4">
        {/* Discount Badge */}
        {discount ? (
          <span className="absolute top-2 right-2 bg-accent text-accent-foreground text-xs font-bold px-2 py-1 rounded-lg z-10">
            {discount}٪
          </span>
        ) : null}

        {/* Favorite Button */}
        <button className="absolute top-2 left-2 w-8 h-8 bg-card/80 backdrop-blur-sm rounded-full flex items-center justify-center border border-border hover:border-destructive hover:text-destructive transition-colors z-10">
          <Heart className="w-4 h-4" />
        </button>

        {/* Product Image */}
        <Link href={`/products/${slug}`} aria-label={name}>
          <div className="aspect-square bg-muted rounded-xl overflow-hidden flex items-center justify-center">
            <ProductImageWithFallback
              imageUrl={image}
              alt={imageAlt || name}
              fallbackLabel={name}
              className="group-hover:scale-105"
              objectFit="cover"
            />
          </div>
        </Link>
      </div>

      {/* Product Info */}
      <div className="flex-1 flex flex-col">
        <Link href={`/products/${slug}`}>
          <h3 className="font-semibold text-foreground mb-1 line-clamp-2 text-sm md:text-base hover:text-primary transition-colors">
            {name}
          </h3>
        </Link>
        <p className="text-xs text-muted-foreground mb-1" dir="ltr">
          {model ?? "—"}
        </p>
        {brand ? <p className="text-xs text-primary mb-2">{brand}</p> : null}

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          <Star className="w-4 h-4 fill-accent text-accent" />
          <span className="text-sm font-medium">{rating}</span>
          <span className="text-xs text-muted-foreground">({reviewCount})</span>
        </div>

        {/* Price */}
        <div className="mt-auto">
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-lg font-bold text-foreground">
              {formatPrice(price)}
            </span>
            <span className="text-sm text-muted-foreground">تومان</span>
          </div>
          {oldPrice ? (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(oldPrice)} تومان
            </span>
          ) : null}
        </div>

        {/* Add to Cart Button */}
        <Button className="w-full mt-3 bg-primary hover:bg-primary/90 rounded-xl gap-2">
          <ShoppingCart className="w-4 h-4" />
          <span>افزودن به سبد خرید</span>
        </Button>
      </div>
    </div>
  )
}
