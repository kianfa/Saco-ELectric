"use client"

import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { ProductImageWithFallback } from "@/components/product-image-with-fallback"
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
      <div className="relative aspect-square bg-muted rounded-2xl overflow-hidden border border-border">
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

        <ProductImageWithFallback
          imageUrl={currentImage?.imageUrl ?? null}
          alt={currentImage?.altText || productName}
          fallbackLabel={productName}
          objectFit="contain"
          className="bg-gradient-to-br from-primary/5 to-primary/10 p-6"
          fallbackClassName="p-0"
          iconClassName="h-14 w-14"
        />
      </div>

      {/* Thumbnails */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {(visibleImages.length > 0 ? visibleImages : [null]).map((image, index) => (
          <button
            key={image?.imageUrl ?? `placeholder-${index}`}
            onClick={() => setSelectedImage(index)}
            className={`shrink-0 w-20 h-20 rounded-xl border-2 overflow-hidden transition-all bg-muted ${
              selectedImage === index
                ? "border-primary ring-2 ring-primary/20"
                : "border-border hover:border-primary/50"
            }`}
            aria-label={`تصویر ${index + 1} ${productName}`}
          >
            <ProductImageWithFallback
              imageUrl={image?.imageUrl ?? null}
              alt={image?.altText || `${productName} ${index + 1}`}
              fallbackLabel={productName}
              objectFit="cover"
              iconClassName="h-5 w-5"
            />
          </button>
        ))}
      </div>
    </div>
  )
}
