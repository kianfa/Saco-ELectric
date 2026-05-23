"use client"

import { useState } from "react"
import {
  Star,
  ShoppingCart,
  Phone,
  FileText,
  Truck,
  Shield,
  Headphones,
  Plus,
  Minus,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/data"

interface ProductInfoProps {
  name: string
  brand: string
  model: string
  rating: number
  reviewCount: number
  shortDescription: string
  inStock: boolean
  stockCount: number
  warranty: string
  price: number
  oldPrice: number | null
  discount: number | null
}

export function ProductInfo({
  name,
  brand,
  model,
  rating,
  reviewCount,
  shortDescription,
  inStock,
  stockCount,
  warranty,
  price,
  oldPrice,
  discount,
}: ProductInfoProps) {
  const [quantity, setQuantity] = useState(1)

  const incrementQuantity = () => setQuantity((q) => q + 1)
  const decrementQuantity = () => setQuantity((q) => Math.max(1, q - 1))

  return (
    <div className="space-y-6">
      {/* Brand */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">برند:</span>
        <span className="text-sm font-medium text-primary">{brand}</span>
      </div>

      {/* Title */}
      <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-relaxed">
        {name}
      </h1>

      {/* Model */}
      <p className="text-muted-foreground" dir="ltr">
        {model}
      </p>

      {/* Rating */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-5 h-5 ${
                i < Math.floor(rating)
                  ? "fill-accent text-accent"
                  : "fill-muted text-muted"
              }`}
            />
          ))}
        </div>
        <span className="font-medium">{rating}</span>
        <span className="text-sm text-muted-foreground">
          ({reviewCount} نظر)
        </span>
      </div>

      {/* Short Description */}
      <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
        {shortDescription}
      </p>

      {/* Stock Status */}
      <div className="flex items-center gap-2">
        {inStock ? (
          <>
            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <span className="text-green-600 font-medium">موجود در انبار</span>
            <span className="text-sm text-muted-foreground">
              ({stockCount} عدد)
            </span>
          </>
        ) : (
          <>
            <span className="w-3 h-3 bg-red-500 rounded-full" />
            <span className="text-red-600 font-medium">ناموجود</span>
          </>
        )}
      </div>

      {/* Warranty */}
      <div className="flex items-center gap-2 text-sm">
        <Shield className="w-5 h-5 text-primary" />
        <span>{warranty}</span>
      </div>

      {/* Price */}
      <div className="bg-muted/50 rounded-2xl p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">قیمت:</span>
          {discount && (
            <span className="bg-accent text-accent-foreground text-sm font-bold px-3 py-1 rounded-lg">
              {discount}٪ تخفیف
            </span>
          )}
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-foreground">
            {formatPrice(price)}
          </span>
          <span className="text-lg text-muted-foreground">تومان</span>
        </div>
        {oldPrice && (
          <p className="text-muted-foreground line-through text-sm">
            {formatPrice(oldPrice)} تومان
          </p>
        )}
      </div>

      {/* Quantity Selector */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">تعداد:</span>
        <div className="flex items-center border border-border rounded-xl overflow-hidden">
          <button
            onClick={decrementQuantity}
            className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-12 h-10 flex items-center justify-center font-medium border-x border-border">
            {quantity}
          </span>
          <button
            onClick={incrementQuantity}
            className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="space-y-3">
        <Button
          size="lg"
          className="w-full bg-primary hover:bg-primary/90 rounded-xl gap-2 h-14 text-lg"
        >
          <ShoppingCart className="w-5 h-5" />
          <span>افزودن به سبد خرید</span>
        </Button>

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            size="lg"
            className="rounded-xl gap-2 h-12"
          >
            <Phone className="w-4 h-4" />
            <span className="text-sm">درخواست مشاوره فنی</span>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="rounded-xl gap-2 h-12"
          >
            <FileText className="w-4 h-4" />
            <span className="text-sm">استعلام قیمت عمده</span>
          </Button>
        </div>
      </div>

      {/* Trust Notes */}
      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border">
        <div className="flex flex-col items-center text-center gap-2 p-3">
          <Truck className="w-6 h-6 text-primary" />
          <span className="text-xs text-muted-foreground">ارسال سریع</span>
        </div>
        <div className="flex flex-col items-center text-center gap-2 p-3">
          <Shield className="w-6 h-6 text-primary" />
          <span className="text-xs text-muted-foreground">تضمین اصالت کالا</span>
        </div>
        <div className="flex flex-col items-center text-center gap-2 p-3">
          <Headphones className="w-6 h-6 text-primary" />
          <span className="text-xs text-muted-foreground">پشتیبانی فنی تخصصی</span>
        </div>
      </div>
    </div>
  )
}
