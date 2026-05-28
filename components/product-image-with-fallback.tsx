"use client"

import { useEffect, useState } from "react"
import { IndustrialImagePlaceholder } from "@/components/common/industrial-image-placeholder"
import { cn } from "@/lib/utils"

interface ProductImageWithFallbackProps {
  imageUrl: string | null | undefined
  alt?: string | null
  fallbackLabel?: string
  className?: string
  fallbackClassName?: string
  iconClassName?: string
  objectFit?: "cover" | "contain"
}

export function ProductImageWithFallback({
  imageUrl,
  alt,
  fallbackLabel = "تصویر محصول",
  className,
  fallbackClassName,
  iconClassName,
  objectFit = "contain",
}: ProductImageWithFallbackProps) {
  const [hasError, setHasError] = useState(false)
  const normalizedUrl = imageUrl?.trim() || null

  useEffect(() => {
    setHasError(false)
  }, [normalizedUrl])

  if (normalizedUrl && !hasError) {
    return (
      <div className={cn("flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100 p-2", fallbackClassName)}>
        <img
          src={normalizedUrl}
          alt={alt || fallbackLabel}
          loading="lazy"
          onError={() => setHasError(true)}
          className={cn(
            "h-full w-full transition-transform duration-300",
            objectFit === "cover" ? "object-cover" : "object-contain",
            className,
          )}
        />
      </div>
    )
  }

  return (
    <IndustrialImagePlaceholder
      alt={alt || fallbackLabel}
      label="تصویر محصول"
      className={cn("h-full w-full", fallbackClassName, className)}
      iconClassName={iconClassName}
    />
  )
}
