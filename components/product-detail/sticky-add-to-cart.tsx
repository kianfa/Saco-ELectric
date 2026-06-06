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
  return <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-3 md:hidden z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]"><div className="flex items-center gap-3"><div className="min-w-0 flex-1">{variants.length ? <select value={selectedVariantId} onChange={(event) => setSelectedVariantId(event.target.value)} className="mb-1 h-9 w-full rounded-lg border border-input bg-background px-2 text-xs"><option value="">انتخاب گزینه</option>{variants.map((variant) => <option key={variant.id} value={variant.id}>{variant.label}</option>)}</select> : null}<div className="flex items-baseline gap-1"><span className="text-base font-bold">{formatPrice(displayedPrice)}</span><span className="text-xs text-muted-foreground">تومان</span></div></div><Button size="lg" className="bg-primary hover:bg-primary/90 rounded-xl gap-2 px-5" disabled={!inStock} onClick={handleAddToCart}><ShoppingCart className="w-5 h-5" /><span>{inStock ? "افزودن به سبد" : "ناموجود"}</span></Button></div></div>
}
