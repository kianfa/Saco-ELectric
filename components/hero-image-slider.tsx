"use client"

import { useEffect, useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { HeroSliderImage } from "@/types/site-content"

type HeroImageSliderProps = {
  images: HeroSliderImage[]
  fallbackImageUrl?: string | null
  fallbackMobileImageUrl?: string | null
  fallbackAlt?: string
  className?: string
}

function normalizeImages(images: HeroSliderImage[], fallbackImageUrl?: string | null, fallbackMobileImageUrl?: string | null, fallbackAlt?: string) {
  const activeImages = images
    .filter((image) => image.isActive && image.desktopUrl)
    .sort((a, b) => a.sortOrder - b.sortOrder)

  if (activeImages.length) return activeImages
  if (fallbackImageUrl) {
    return [{ desktopUrl: fallbackImageUrl, mobileUrl: fallbackMobileImageUrl ?? null, altText: fallbackAlt ?? "تصویر هیرو", sortOrder: 0, isActive: true }]
  }
  return []
}

export function HeroImageSlider({ images, fallbackImageUrl, fallbackMobileImageUrl, fallbackAlt, className }: HeroImageSliderProps) {
  const slides = useMemo(() => normalizeImages(images, fallbackImageUrl, fallbackMobileImageUrl, fallbackAlt), [images, fallbackImageUrl, fallbackMobileImageUrl, fallbackAlt])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (slides.length <= 1 || paused) return
    const interval = window.setInterval(() => {
      setCurrentIndex((current) => (current + 1) % slides.length)
    }, 5000)
    return () => window.clearInterval(interval)
  }, [slides.length, paused])

  useEffect(() => {
    setCurrentIndex(0)
  }, [slides.length])

  if (!slides.length) {
    return (
      <div className={cn("relative w-full max-w-md", className)}>
        <div className="grid grid-cols-2 gap-4">
          {[["⚡", "تابلو برق"], ["🔧", "PLC"], ["⚙️", "موتور"], ["📡", "سنسور"]].map(([icon, label]) => (
            <div key={label} className="flex aspect-square items-center justify-center rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
              <div className="text-center">
                <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-xl bg-accent/20"><span className="text-2xl">{icon}</span></div>
                <span className="text-sm text-primary-foreground/80">{label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const canNavigate = slides.length > 1
  const previous = () => setCurrentIndex((current) => (current - 1 + slides.length) % slides.length)
  const next = () => setCurrentIndex((current) => (current + 1) % slides.length)

  return (
    <div
      className={cn("relative w-full max-w-md overflow-hidden rounded-3xl border border-white/20 bg-white/10 p-3 shadow-2xl backdrop-blur-sm", className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-white/10">
        {slides.map((slide, index) => (
          <picture key={`${slide.desktopUrl}-${slide.sortOrder}`}>
            {slide.mobileUrl ? <source media="(max-width: 767px)" srcSet={slide.mobileUrl} /> : null}
            <img
              src={slide.desktopUrl}
              alt={slide.altText || fallbackAlt || "تصویر تجهیزات برق صنعتی"}
              className={cn(
                "absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-out",
                index === currentIndex ? "scale-100 opacity-100" : "scale-105 opacity-0",
              )}
            />
          </picture>
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/30 via-transparent to-transparent" />
        {!slides[currentIndex]?.desktopUrl ? (
          <div className="absolute inset-0 flex items-center justify-center text-primary-foreground/70"><ImageIcon className="h-10 w-10" /></div>
        ) : null}
      </div>

      {canNavigate ? (
        <>
          <button type="button" aria-label="تصویر قبلی" onClick={previous} className="absolute right-5 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-primary/40 text-white backdrop-blur transition hover:bg-primary/70 lg:flex">
            <ChevronRight className="h-5 w-5" />
          </button>
          <button type="button" aria-label="تصویر بعدی" onClick={next} className="absolute left-5 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-primary/40 text-white backdrop-blur transition hover:bg-primary/70 lg:flex">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
            {slides.map((slide, index) => (
              <button
                type="button"
                key={`${slide.desktopUrl}-dot-${slide.sortOrder}`}
                aria-label={`نمایش تصویر ${index + 1}`}
                onClick={() => setCurrentIndex(index)}
                className={cn("h-2.5 rounded-full transition-all", index === currentIndex ? "w-8 bg-accent" : "w-2.5 bg-white/60 hover:bg-white")}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  )
}
