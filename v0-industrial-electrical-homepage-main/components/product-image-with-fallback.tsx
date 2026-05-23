"use client"

import { useEffect, useState } from "react"
import { Zap } from "lucide-react"
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
  objectFit = "cover",
}: ProductImageWithFallbackProps) {
  const [hasError, setHasError] = useState(false)
  const normalizedUrl = imageUrl?.trim() || null

  useEffect(() => {
    setHasError(false)
  }, [normalizedUrl])

  if (normalizedUrl && !hasError) {
    return (
      <img
        src={normalizedUrl}
        alt={alt || fallbackLabel}
        loading="lazy"
        onError={() => setHasError(true)}
        className={cn(
          "h-full w-full transition-transform duration-300",
          objectFit === "contain" ? "object-contain" : "object-cover",
          className
        )}
      />
    )
  }

  return (
    <div
      role="img"
      aria-label={alt || fallbackLabel}
      className={cn(
        "h-full w-full bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center",
        fallbackClassName,
        className
      )}
    >
      <div className="text-center p-4">
        <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary/45 shadow-sm ring-1 ring-primary/10">
          <Zap className={cn("h-8 w-8", iconClassName)} strokeWidth={1.6} />
        </div>
        <div className="hidden sm:block text-[11px] font-medium text-muted-foreground">
          تصویر محصول به‌زودی
        </div>
      </div>
    </div>
  )
}
