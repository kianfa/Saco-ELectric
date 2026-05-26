"use client"

import { useEffect, useState } from "react"
import { ChevronLeft } from "lucide-react"

interface CategoryCardProps {
  name: string
  image: string | null
  fallbackImage?: string | null
  href: string
}

export function CategoryCard({ name, image, fallbackImage = null, href }: CategoryCardProps) {
  const [currentImage, setCurrentImage] = useState(image)

  useEffect(() => {
    setCurrentImage(image)
  }, [image])

  const handleImageError = () => {
    if (fallbackImage && currentImage !== fallbackImage) {
      setCurrentImage(fallbackImage)
      return
    }
    setCurrentImage(null)
  }

  return (
    <a
      href={href}
      className="group flex h-full min-h-[178px] flex-col items-center justify-between rounded-2xl border border-border bg-card p-4 text-center transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-lg"
    >
      <div className="mb-3 flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl bg-muted md:h-24 md:w-24">
        {currentImage ? (
          <img
            src={currentImage}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={handleImageError}
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
            <span className="text-3xl">⚡</span>
          </div>
        )}
      </div>
      <span className="line-clamp-2 min-h-11 text-sm font-bold leading-6 text-foreground md:text-base">{name}</span>
      <div className="mt-2 flex items-center gap-1 text-muted-foreground transition-colors group-hover:text-primary">
        <ChevronLeft className="h-4 w-4" />
      </div>
    </a>
  )
}
