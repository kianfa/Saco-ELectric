"use client"

import Link from "next/link"
import { Heart, Star, ShoppingCart, Eye, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart/cart-store"
import { formatPrice } from "@/lib/data"
import { ProductImage } from "@/components/common/product-image"
import type { Product } from "@/types/product"

interface ProductListingCardProps {
  product: Product
}

export function ProductListingCard({ product }: ProductListingCardProps) {
  const { addToCart } = useCart()
  const {
    name,
    model,
    sku,
    price,
    oldPrice,
    discountPercent,
    rating,
    reviewCount,
    brandName,
    stockQuantity,
    mainImageUrl,
    mainImageAlt,
    slug,
  } = product
  const safeStockQuantity = typeof stockQuantity === "number" ? stockQuantity : -1
  const inStock = safeStockQuantity !== 0

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      slug,
      name,
      model,
      sku,
      brandName,
      price,
      oldPrice,
      mainImageUrl,
      stockQuantity: safeStockQuantity,
    })
  }

  return (
    <div className="group bg-card border border-border rounded-2xl p-4 hover:border-primary hover:shadow-xl transition-all duration-300 flex flex-col">
      {/* Image Container */}
      <div className="relative mb-4">
        {/* Discount Badge */}
        {discountPercent > 0 && (
          <span className="absolute top-2 right-2 bg-accent text-accent-foreground text-xs font-bold px-2 py-1 rounded-lg z-10">
            {discountPercent}٪
          </span>
        )}

        {/* Favorite Button */}
        <button className="absolute top-2 left-2 w-8 h-8 bg-card/80 backdrop-blur-sm rounded-full flex items-center justify-center border border-border hover:border-destructive hover:text-destructive transition-colors z-10">
          <Heart className="w-4 h-4" />
        </button>

        {/* Product Image */}
        <Link href={`/products/${slug}`}>
          <ProductImage
            src={mainImageUrl}
            alt={mainImageAlt || name}
            size="card"
            className="w-full cursor-pointer"
          />
        </Link>
      </div>

      {/* Product Info */}
      <div className="flex-1 flex flex-col">
        <Link href={`/products/${slug}`}>
          <h3 className="font-semibold text-foreground mb-1 line-clamp-2 text-sm hover:text-primary transition-colors">
            {name}
          </h3>
        </Link>
        <p className="text-xs text-muted-foreground mb-1" dir="ltr">
          {model ?? sku ?? "—"}
        </p>
        <p className="text-xs text-primary mb-2">{brandName ?? "برند نامشخص"}</p>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <Star className="w-3.5 h-3.5 fill-accent text-accent" />
          <span className="text-sm font-medium">{rating}</span>
          <span className="text-xs text-muted-foreground">({reviewCount})</span>
        </div>

        {/* Stock Status */}
        <div className="flex items-center gap-1 mb-3">
          {inStock ? (
            <>
              <Check className="w-3.5 h-3.5 text-green-600" />
              <span className="text-xs text-green-600">موجود در انبار</span>
            </>
          ) : (
            <>
              <X className="w-3.5 h-3.5 text-destructive" />
              <span className="text-xs text-destructive">ناموجود</span>
            </>
          )}
        </div>

        {/* Price */}
        <div className="mt-auto">
          {oldPrice && (
            <span className="text-xs text-muted-foreground line-through block mb-1">
              {formatPrice(oldPrice)} تومان
            </span>
          )}
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-foreground">
              {formatPrice(price)}
            </span>
            <span className="text-xs text-muted-foreground">تومان</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-2 mt-3">
          <Button
            type="button"
            className="w-full bg-primary hover:bg-primary/90 rounded-xl gap-2 text-sm"
            disabled={!inStock}
            onClick={handleAddToCart}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>{inStock ? "افزودن به سبد" : "ناموجود"}</span>
          </Button>
          <Button variant="outline" className="w-full rounded-xl gap-2 text-sm" asChild>
            <Link href={`/products/${slug}`}>
              <Eye className="w-4 h-4" />
              <span>مشاهده جزئیات</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
