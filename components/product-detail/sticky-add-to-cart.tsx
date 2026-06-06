"use client"

import { useMemo, useState } from "react"
import { ShoppingCart } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/data"
import { useCart } from "@/lib/cart/cart-store"
import type { ProductVariant } from "@/types/product"

interface StickyAddToCartProps { productId: string; slug: string; name: string; model: string | null; sku: string | null; brandName: string | null; price: number; oldPrice: number | null; discount: number | null; mainImageUrl: string | null; stockQuantity: number; variants: ProductVariant[] }

export function StickyAddToCart(props: StickyAddToCartProps) {
  const { productId, slug, name, model, sku, brandName, price, oldPrice, mainImageUrl, stockQuantity, variants } = props
  const { addToCart } = useCart()
  const [selectedVariantId, setSelectedVariantId] = useState("")
  const selectedVariant = useMemo(() => variants.find((variant) => variant.id === selectedVariantId) ?? null, [selectedVariantId, variants])
  const displayedPrice = selectedVariant?.price ?? (variants.length ? Math.min(...variants.map((variant) => variant.price)) : price)
  const safeStockQuantity = typeof stockQuantity === "number" ? stockQuantity : -1
  const inStock = safeStockQuantity !== 0

  function handleAddToCart() {
    if (!inStock) return toast.error("این محصول در حال حاضر ناموجود است")
    if (variants.length && !selectedVariant) return toast.error("لطفاً ابتدا یکی از گزینه‌های محصول را انتخاب کنید")
    addToCart({ productId, selectedVariantId: selectedVariant?.id ?? null, selectedVariantLabel: selectedVariant?.label ?? null, slug, name, model, sku, brandName, price: selectedVariant?.price ?? price, oldPrice: variants.length ? null : oldPrice, mainImageUrl, stockQuantity: safeStockQuantity })
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 p-3 shadow-[0_-8px_30px_rgba(15,23,42,0.12)] backdrop-blur md:hidden">
      {variants.length ? (
        <select value={selectedVariantId} onChange={(event) => setSelectedVariantId(event.target.value)} className="mb-2 h-10 w-full rounded-xl border border-input bg-background px-3 text-xs font-medium">
          <option value="">انتخاب گزینه محصول</option>
          {variants.map((variant) => <option key={variant.id} value={variant.id}>{variant.label} — {formatPrice(variant.price)} تومان</option>)}
        </select>
      ) : null}
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium text-muted-foreground">قیمت فروش</p>
          <div className="mt-0.5 flex items-baseline gap-1">
            <span className="text-base font-black">{formatPrice(displayedPrice)}</span>
            <span className="text-[11px] text-muted-foreground">تومان</span>
          </div>
        </div>
        <Button size="lg" className="h-12 rounded-xl bg-primary px-5 font-black hover:bg-primary/90" disabled={!inStock} onClick={handleAddToCart}>
          <ShoppingCart className="h-5 w-5" />
          <span>{inStock ? "افزودن به سبد" : "ناموجود"}</span>
        </Button>
      </div>
    </div>
  )
}
