"use client"

import { useMemo, useState } from "react"
import { Star, ShoppingCart, Phone, FileText, Truck, Shield, Headphones } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { QuantitySelector } from "@/components/cart/quantity-selector"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatPrice } from "@/lib/data"
import { useCart } from "@/lib/cart/cart-store"
import type { ProductVariant } from "@/types/product"

interface ProductInfoProps {
  id: string
  slug: string
  name: string
  brand: string
  model: string
  sku: string | null
  rating: number
  reviewCount: number
  shortDescription: string
  inStock: boolean
  stockCount: number
  warranty: string
  price: number
  oldPrice: number | null
  discount: number | null
  mainImageUrl: string | null
  variants: ProductVariant[]
}

export function ProductInfo(props: ProductInfoProps) {
  const { id, slug, name, brand, model, sku, rating, reviewCount, shortDescription, inStock, stockCount, warranty, price, oldPrice, discount, mainImageUrl, variants } = props
  const [quantity, setQuantity] = useState(1)
  const [selectedVariantId, setSelectedVariantId] = useState("")
  const { addToCart } = useCart()
  const selectedVariant = useMemo(() => variants.find((variant) => variant.id === selectedVariantId) ?? null, [selectedVariantId, variants])
  const displayedPrice = selectedVariant?.price ?? (variants.length ? Math.min(...variants.map((variant) => variant.price)) : price)
  const safeStockCount = typeof stockCount === "number" ? stockCount : -1
  const maxQuantity = safeStockCount > 0 ? safeStockCount : 99

  function handleQuantityChange(nextQuantity: number) {
    if (safeStockCount > 0 && nextQuantity > safeStockCount) return toast.warning("تعداد انتخاب‌شده بیشتر از موجودی انبار است")
    setQuantity(Math.max(1, nextQuantity))
  }

  function handleAddToCart() {
    if (!inStock) return toast.error("این محصول در حال حاضر ناموجود است")
    if (variants.length && !selectedVariant) return toast.error("لطفاً یکی از گزینه‌های محصول را انتخاب کنید")
    addToCart({
      productId: id,
      selectedVariantId: selectedVariant?.id ?? null,
      selectedVariantLabel: selectedVariant?.label ?? null,
      slug,
      name,
      model,
      sku,
      brandName: brand,
      price: selectedVariant?.price ?? price,
      oldPrice: variants.length ? null : oldPrice,
      mainImageUrl,
      stockQuantity: safeStockCount,
    }, quantity)
  }

  return <div className="space-y-6">
    <div className="flex items-center gap-2"><span className="text-sm text-muted-foreground">برند:</span><span className="text-sm font-medium text-primary">{brand}</span></div>
    <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-relaxed">{name}</h1>
    <p className="text-muted-foreground" dir="ltr">{model}</p>
    <div className="flex items-center gap-3"><div className="flex items-center gap-1">{[...Array(5)].map((_, i) => <Star key={i} className={`w-5 h-5 ${i < Math.floor(rating) ? "fill-accent text-accent" : "fill-muted text-muted"}`} />)}</div><span className="font-medium">{rating}</span><span className="text-sm text-muted-foreground">({reviewCount} نظر)</span></div>
    <p className="text-muted-foreground leading-relaxed text-sm md:text-base">{shortDescription}</p>
    <div className="flex items-center gap-2">{inStock ? <><span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" /><span className="text-green-600 font-medium">موجود در انبار</span><span className="text-sm text-muted-foreground">({safeStockCount > 0 ? safeStockCount.toLocaleString("fa-IR") : "قابل بررسی"} عدد)</span></> : <><span className="w-3 h-3 bg-red-500 rounded-full" /><span className="text-red-600 font-medium">ناموجود</span></>}</div>
    <div className="flex items-center gap-2 text-sm"><Shield className="w-5 h-5 text-primary" /><span>{warranty}</span></div>
    {variants.length ? <div className="space-y-2 rounded-2xl border border-primary/15 bg-card p-4"><label className="text-sm font-bold">انتخاب گزینه محصول</label><Select value={selectedVariantId} onValueChange={setSelectedVariantId}><SelectTrigger className="rounded-xl"><SelectValue placeholder="یک گزینه را انتخاب کنید" /></SelectTrigger><SelectContent>{variants.map((variant) => <SelectItem key={variant.id} value={variant.id}>{variant.label} — {formatPrice(variant.price)} تومان</SelectItem>)}</SelectContent></Select><p className="text-xs text-muted-foreground">برای افزودن این محصول به سبد خرید، انتخاب گزینه الزامی است.</p></div> : null}
    <div className="bg-muted/50 rounded-2xl p-4 space-y-2"><div className="flex items-center justify-between"><span className="text-muted-foreground">قیمت:</span>{!variants.length && discount ? <span className="bg-accent text-accent-foreground text-sm font-bold px-3 py-1 rounded-lg">{discount}٪ تخفیف</span> : null}</div><div className="flex items-baseline gap-2"><span className="text-3xl font-bold text-foreground">{formatPrice(displayedPrice)}</span><span className="text-lg text-muted-foreground">تومان</span></div>{variants.length && !selectedVariant ? <p className="text-xs text-muted-foreground">شروع قیمت از گزینه‌های فعال</p> : null}{!variants.length && oldPrice ? <p className="text-muted-foreground line-through text-sm">{formatPrice(oldPrice)} تومان</p> : null}</div>
    <div className="flex items-center gap-4"><span className="text-sm text-muted-foreground">تعداد:</span><QuantitySelector value={quantity} onChange={handleQuantityChange} disabled={!inStock} max={maxQuantity} /></div>
    <div className="space-y-3"><Button size="lg" className="w-full bg-primary hover:bg-primary/90 rounded-xl gap-2 h-14 text-lg" disabled={!inStock} onClick={handleAddToCart}><ShoppingCart className="w-5 h-5" /><span>{inStock ? "افزودن به سبد خرید" : "ناموجود"}</span></Button><div className="grid grid-cols-2 gap-3"><Button variant="outline" size="lg" className="rounded-xl gap-2 h-12"><Phone className="w-4 h-4" /><span className="text-sm">درخواست مشاوره فنی</span></Button><Button variant="outline" size="lg" className="rounded-xl gap-2 h-12"><FileText className="w-4 h-4" /><span className="text-sm">استعلام قیمت عمده</span></Button></div></div>
    <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border"><div className="flex flex-col items-center text-center gap-2 p-3"><Truck className="w-6 h-6 text-primary" /><span className="text-xs text-muted-foreground">ارسال سریع</span></div><div className="flex flex-col items-center text-center gap-2 p-3"><Shield className="w-6 h-6 text-primary" /><span className="text-xs text-muted-foreground">تضمین اصالت کالا</span></div><div className="flex flex-col items-center text-center gap-2 p-3"><Headphones className="w-6 h-6 text-primary" /><span className="text-xs text-muted-foreground">پشتیبانی فنی تخصصی</span></div></div>
  </div>
}
