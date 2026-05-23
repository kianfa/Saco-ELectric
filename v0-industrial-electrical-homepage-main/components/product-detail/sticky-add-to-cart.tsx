"use client"

import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/data"

interface StickyAddToCartProps {
  price: number
  discount: number | null
}

export function StickyAddToCart({ price, discount }: StickyAddToCartProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 md:hidden z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            {discount && (
              <span className="bg-accent text-accent-foreground text-xs font-bold px-2 py-0.5 rounded">
                {discount}٪
              </span>
            )}
            <span className="text-lg font-bold text-foreground">
              {formatPrice(price)}
            </span>
            <span className="text-sm text-muted-foreground">تومان</span>
          </div>
        </div>
        <Button
          size="lg"
          className="bg-primary hover:bg-primary/90 rounded-xl gap-2 px-8"
        >
          <ShoppingCart className="w-5 h-5" />
          <span>افزودن به سبد</span>
        </Button>
      </div>
    </div>
  )
}
