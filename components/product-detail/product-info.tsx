"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  BadgeCheck,
  CheckCircle2,
  FileText,
  Headphones,
  PackageCheck,
  Phone,
  ShieldCheck,
  ShoppingCart,
  Star,
  Truck,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { QuantitySelector } from "@/components/cart/quantity-selector"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatPrice } from "@/lib/data"
import { useCart } from "@/lib/cart/cart-store"
import { useContactInfo } from "@/components/site-settings-provider"
import { storeContactConfig } from "@/lib/store-contact-config"
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
  const contact = useContactInfo()
  const supportPhone = contact.supportPhone || contact.mobile || storeContactConfig.mobile
  const selectedVariant = useMemo(() => variants.find((variant) => variant.id === selectedVariantId) ?? null, [selectedVariantId, variants])
  const displayedPrice = selectedVariant?.price ?? (variants.length ? Math.min(...variants.map((variant) => variant.price)) : price)
  const safeStockCount = typeof stockCount === "number" ? stockCount : -1
  const maxQuantity = safeStockCount > 0 ? safeStockCount : 99
  const quoteHref = `/contact?subject=${encodeURIComponent(`استعلام قیمت ${name}`)}`

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

  return (
    <div className="space-y-5 lg:sticky lg:top-24">
      <div className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
          <span className="rounded-full bg-primary/[0.08] px-3 py-1 font-semibold text-primary">{brand}</span>
          {sku ? <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground">کد کالا: <bdi dir="ltr">{sku}</bdi></span> : null}
          {model ? <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground">مدل: <bdi dir="ltr">{model}</bdi></span> : null}
        </div>

        <h1 className="text-2xl font-black leading-[1.7] text-foreground sm:text-3xl">{name}</h1>

        <div className="mt-4 flex flex-wrap items-center gap-3 border-b border-border pb-5">
          <div className="flex items-center gap-1" aria-label={`امتیاز ${rating} از ۵`}>
            {[...Array(5)].map((_, index) => (
              <Star key={index} className={`h-4 w-4 ${index < Math.floor(rating) ? "fill-accent text-accent" : "fill-muted text-muted"}`} />
            ))}
          </div>
          <span className="text-sm font-bold text-foreground">{rating}</span>
          <span className="text-xs text-muted-foreground">({reviewCount.toLocaleString("fa-IR")} نظر)</span>
          <span className="hidden h-4 w-px bg-border sm:block" />
          <div className={`flex items-center gap-2 text-sm font-bold ${inStock ? "text-emerald-700" : "text-red-600"}`}>
            {inStock ? <CheckCircle2 className="h-4 w-4" /> : <PackageCheck className="h-4 w-4" />}
            <span>{inStock ? "موجود در انبار" : "ناموجود"}</span>
            {inStock && safeStockCount > 0 ? <span className="text-xs font-medium text-muted-foreground">({safeStockCount.toLocaleString("fa-IR")} عدد)</span> : null}
          </div>
        </div>

        {shortDescription ? <p className="mt-5 text-sm leading-7 text-muted-foreground sm:text-base">{shortDescription}</p> : null}
      </div>

      <div className="rounded-3xl border border-primary/15 bg-card p-5 shadow-[0_12px_40px_rgba(15,23,42,0.08)] sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-4 border-b border-border pb-4">
          <div>
            <p className="text-xs font-bold text-primary">خرید محصول</p>
            <h2 className="mt-1 text-lg font-black text-foreground">انتخاب گزینه و ثبت سفارش</h2>
          </div>
          {inStock ? (
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">آماده سفارش</span>
          ) : (
            <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600">ناموجود</span>
          )}
        </div>

        {variants.length ? (
          <div className="mb-5 rounded-2xl border border-primary/20 bg-primary/[0.035] p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <label className="text-sm font-black text-foreground">انتخاب تنوع محصول</label>
              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">الزامی</span>
            </div>
            <Select value={selectedVariantId} onValueChange={setSelectedVariantId}>
              <SelectTrigger className="h-12 rounded-xl border-primary/20 bg-white text-right shadow-sm">
                <SelectValue placeholder="یک گزینه را انتخاب کنید" />
              </SelectTrigger>
              <SelectContent dir="rtl">
                {variants.map((variant) => (
                  <SelectItem key={variant.id} value={variant.id} className="py-3">
                    {variant.label} — {formatPrice(variant.price)} تومان
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="mt-3 text-xs leading-6 text-muted-foreground">
              برای مشاهده قیمت نهایی و افزودن کالا به سبد خرید، ابتدا یکی از گزینه‌های فعال را انتخاب کنید.
            </p>
          </div>
        ) : null}

        <div className="rounded-2xl bg-muted/55 p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-muted-foreground">قیمت فروش</span>
            {!variants.length && discount ? <span className="rounded-full bg-accent px-3 py-1 text-xs font-black text-accent-foreground">{discount}٪ تخفیف</span> : null}
          </div>
          <div className="mt-2 flex flex-wrap items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">{formatPrice(displayedPrice)}</span>
            <span className="text-base font-bold text-muted-foreground">تومان</span>
          </div>
          {variants.length && !selectedVariant ? <p className="mt-2 text-xs font-medium text-primary">شروع قیمت از ارزان‌ترین گزینه فعال</p> : null}
          {!variants.length && oldPrice ? <p className="mt-2 text-sm text-muted-foreground line-through">{formatPrice(oldPrice)} تومان</p> : null}
          {selectedVariant ? <p className="mt-2 text-xs font-bold text-primary">قیمت گزینه انتخاب‌شده: {selectedVariant.label}</p> : null}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border p-3">
          <div>
            <p className="text-sm font-bold text-foreground">تعداد سفارش</p>
            <p className="mt-1 text-xs text-muted-foreground">تعداد موردنظر را انتخاب کنید.</p>
          </div>
          <QuantitySelector value={quantity} onChange={handleQuantityChange} disabled={!inStock} max={maxQuantity} />
        </div>

        <Button size="lg" className="mt-5 h-14 w-full rounded-xl bg-primary text-base font-black shadow-sm hover:bg-primary/90" disabled={!inStock} onClick={handleAddToCart}>
          <ShoppingCart className="h-5 w-5" />
          <span>{inStock ? "افزودن به سبد خرید" : "محصول ناموجود است"}</span>
        </Button>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Button asChild variant="outline" size="lg" className="h-12 rounded-xl border-primary/20 bg-white text-primary hover:bg-primary/5 hover:text-primary">
            <a href={`tel:${supportPhone}`}>
              <Phone className="h-4 w-4" />
              <span>درخواست مشاوره فنی</span>
            </a>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-12 rounded-xl border-primary/20 bg-white text-primary hover:bg-primary/5 hover:text-primary">
            <Link href={quoteHref}>
              <FileText className="h-4 w-4" />
              <span>استعلام قیمت عمده</span>
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 rounded-3xl border border-border bg-card p-4 shadow-sm sm:grid-cols-4">
        {[
          { icon: ShieldCheck, label: "ضمانت اصالت و سلامت کالا" },
          { icon: Truck, label: "ارسال سریع" },
          { icon: Headphones, label: "پشتیبانی فنی تخصصی" },
          { icon: BadgeCheck, label: "امکان استعلام قیمت عمده" },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-2 rounded-2xl bg-muted/35 px-3 py-4 text-center">
            <Icon className="h-5 w-5 text-primary" />
            <span className="text-[11px] font-bold leading-5 text-foreground">{label}</span>
          </div>
        ))}
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 text-sm leading-6 text-muted-foreground shadow-sm">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <span>{warranty}</span>
      </div>
    </div>
  )
}
