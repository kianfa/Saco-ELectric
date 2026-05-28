"use client"

import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { ProductImage } from "@/components/common/product-image"
import type { ProductDetailImage } from "@/types/product"

interface ProductGalleryProps {
  images: ProductDetailImage[]
  badges: string[]
  productName: string
}

function sortGalleryImages(images: ProductDetailImage[]) {
  return [...images]
    .filter((image) => Boolean(image.imageUrl?.trim()))
    .sort((imageA, imageB) => {
      if (imageA.isMain && !imageB.isMain) return -1
      if (!imageA.isMain && imageB.isMain) return 1
      return imageA.sortOrder - imageB.sortOrder
    })
}

export function ProductGallery({ images, badges, productName }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const visibleImages = useMemo(() => sortGalleryImages(images), [images])
  const currentImage = visibleImages[selectedImage]

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative overflow-hidden rounded-2xl">
        {/* Badges */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
          {badges.map((badge, index) => (
            <Badge
              key={index}
              variant={index === 0 ? "default" : "secondary"}
              className={`${
                index === 0
                  ? "bg-green-600 hover:bg-green-700"
                  : index === 1
                  ? "bg-primary hover:bg-primary/90"
                  : "bg-accent hover:bg-accent/90 text-accent-foreground"
              } text-xs px-3 py-1`}
            >
              {badge}
            </Badge>
          ))}
        </div>

        <ProductImage
          src={currentImage?.imageUrl ?? null}
          alt={currentImage?.altText || productName}
          size="detail"
          className="w-full"
          priority
        />
      </div>

      {/* Thumbnails */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {(visibleImages.length > 0 ? visibleImages : [null]).map((image, index) => (
          <button
            key={image?.imageUrl ?? `placeholder-${index}`}
            onClick={() => setSelectedImage(index)}
            className={`shrink-0 w-20 h-20 rounded-xl border-2 overflow-hidden transition-all bg-white ${
              selectedImage === index
                ? "border-primary ring-2 ring-primary/20"
                : "border-border hover:border-primary/50"
            }`}
            aria-label={`تصویر ${index + 1} ${productName}`}
          >
            <ProductImage
              src={image?.imageUrl ?? null}
              alt={image?.altText || `${productName} ${index + 1}`}
              size="thumbnail"
              className="h-full w-full rounded-none border-0 shadow-none"
            />
          </button>
        ))}
      </div>
    </div>
  )
}
