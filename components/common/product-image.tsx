"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { IndustrialImagePlaceholder } from "@/components/common/industrial-image-placeholder"

type ProductImageSize = "card" | "detail" | "thumbnail" | "search" | "cart" | "admin"

type ProductImageProps = {
  src?: string | null
  alt: string
  className?: string
  imageClassName?: string
  size?: ProductImageSize
  priority?: boolean
}

const sizeClasses: Record<ProductImageSize, string> = {
  card: "aspect-square rounded-xl p-4 sm:p-5",
  detail: "aspect-square rounded-2xl p-6 sm:p-8",
  thumbnail: "aspect-square rounded-xl p-2",
  search: "h-12 w-12 rounded-xl p-1.5",
  cart: "aspect-square rounded-xl p-2",
  admin: "aspect-square rounded-lg p-2",
}

const labelBySize: Record<ProductImageSize, string | null> = {
  card: "تصویر محصول",
  detail: "تصویر محصول",
  thumbnail: null,
  search: null,
  cart: null,
  admin: null,
}

export function ProductImage({ src, alt, className, imageClassName, size = "card", priority = false }: ProductImageProps) {
  const [hasError, setHasError] = useState(false)
  const normalizedSrc = src?.trim() || null

  useEffect(() => {
    setHasError(false)
  }, [normalizedSrc])

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden border border-slate-100 bg-gradient-to-br from-slate-50 via-white to-slate-100 shadow-sm",
        "before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_70%_20%,rgba(249,115,22,0.08),transparent_34%),radial-gradient(circle_at_10%_85%,rgba(15,23,42,0.07),transparent_32%)]",
        sizeClasses[size],
        className,
      )}
    >
      {normalizedSrc && !hasError ? (
        <img
          src={normalizedSrc}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          onError={() => setHasError(true)}
          className={cn(
            "relative z-[1] h-full w-full object-contain transition-transform duration-300 ease-out group-hover:scale-[1.03]",
            imageClassName,
          )}
        />
      ) : (
        <IndustrialImagePlaceholder alt={alt} label={labelBySize[size]} compact={size === "search" || size === "thumbnail" || size === "cart" || size === "admin"} />
      )}
    </div>
  )
}
