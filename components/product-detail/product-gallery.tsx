"use client"

import { useMemo, useState } from "react"
import { Maximize2, ZoomIn } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
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
  const [previewOpen, setPreviewOpen] = useState(false)
  const visibleImages = useMemo(() => sortGalleryImages(images), [images])
  const currentImage = visibleImages[selectedImage]

  return (
    <div className="space-y-4 lg:sticky lg:top-24">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-3 shadow-sm sm:p-4">
        <div className="absolute right-6 top-6 z-10 flex flex-col items-start gap-2">
          {badges.map((badge, index) => (
            <Badge
              key={badge}
              variant={index === 0 ? "default" : "secondary"}
              className={
                index === 0
                  ? "rounded-full bg-emerald-600 px-3 py-1 text-xs text-white hover:bg-emerald-600"
                  : "rounded-full border border-border bg-white/90 px-3 py-1 text-xs text-foreground shadow-sm backdrop-blur hover:bg-white"
              }
            >
              {badge}
            </Badge>
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="absolute left-6 top-6 z-10 rounded-xl border-border bg-white/90 shadow-sm backdrop-blur hover:bg-white"
          onClick={() => setPreviewOpen(true)}
          aria-label="نمایش بزرگ‌تر تصویر محصول"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>

        <ProductImage
          src={currentImage?.imageUrl ?? null}
          alt={currentImage?.altText || productName}
          size="detail"
          className="w-full rounded-2xl border-0 bg-white shadow-none"
          imageClassName="transition-transform duration-300"
          priority
        />

        <div className="pointer-events-none absolute bottom-7 left-7 flex items-center gap-1.5 rounded-full border border-white/70 bg-white/85 px-3 py-1.5 text-xs text-muted-foreground shadow-sm backdrop-blur">
          <Maximize2 className="h-3.5 w-3.5" />
          <span>برای مشاهده بزرگ‌تر کلیک کنید</span>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-3 shadow-sm">
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
          {(visibleImages.length > 0 ? visibleImages : [null]).map((image, index) => (
            <button
              type="button"
              key={image?.id ?? image?.imageUrl ?? `placeholder-${index}`}
              onClick={() => setSelectedImage(index)}
              className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border bg-white p-1 transition-all sm:h-24 sm:w-24 ${
                selectedImage === index
                  ? "border-primary ring-2 ring-primary/15"
                  : "border-border hover:border-primary/50"
              }`}
              aria-label={`تصویر ${index + 1} ${productName}`}
            >
              <ProductImage
                src={image?.imageUrl ?? null}
                alt={image?.altText || `${productName} ${index + 1}`}
                size="thumbnail"
                className="h-full w-full rounded-lg border-0 bg-white p-1 shadow-none"
              />
            </button>
          ))}
        </div>
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent dir="rtl" className="max-w-4xl rounded-3xl border-border bg-card p-4 sm:p-6">
          <DialogTitle className="sr-only">پیش‌نمایش تصویر {productName}</DialogTitle>
          <ProductImage
            src={currentImage?.imageUrl ?? null}
            alt={currentImage?.altText || productName}
            size="detail"
            className="max-h-[78vh] w-full rounded-2xl border-0 bg-white shadow-none"
            imageClassName="max-h-[70vh]"
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
