"use client"

import { useEffect, useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import { IndustrialImagePlaceholder } from "@/components/common/industrial-image-placeholder"

type CategoryImageSize = "card" | "large" | "thumbnail"

type CategoryImageProps = {
  src?: string | null
  iconSrc?: string | null
  alt: string
  className?: string
  imageClassName?: string
  size?: CategoryImageSize
}

const sizeClasses: Record<CategoryImageSize, string> = {
  card: "h-20 w-20 rounded-xl p-2.5 md:h-24 md:w-24",
  large: "h-40 w-full rounded-2xl p-4",
  thumbnail: "h-14 w-14 rounded-xl p-2",
}

export function CategoryImage({ src, iconSrc, alt, className, imageClassName, size = "card" }: CategoryImageProps) {
  const sources = useMemo(() => [src?.trim() || null, iconSrc?.trim() || null].filter(Boolean) as string[], [src, iconSrc])
  const [sourceIndex, setSourceIndex] = useState(0)

  useEffect(() => {
    setSourceIndex(0)
  }, [sources.join("|")])

  const currentSrc = sources[sourceIndex] ?? null

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden border border-slate-100 bg-gradient-to-br from-slate-50 via-white to-slate-100 shadow-sm",
        "before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_70%_15%,rgba(249,115,22,0.08),transparent_34%),radial-gradient(circle_at_10%_90%,rgba(15,23,42,0.07),transparent_32%)]",
        sizeClasses[size],
        className,
      )}
    >
      {currentSrc ? (
        <img
          src={currentSrc}
          alt={alt}
          loading="lazy"
          onError={() => setSourceIndex((index) => index + 1)}
          className={cn("relative z-[1] h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.04]", imageClassName)}
        />
      ) : (
        <IndustrialImagePlaceholder alt={alt} label={size === "large" ? "تصویر دسته‌بندی" : null} compact={size !== "large"} />
      )}
    </div>
  )
}
