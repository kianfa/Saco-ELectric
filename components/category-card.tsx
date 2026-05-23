"use client"

import { ChevronLeft } from "lucide-react"

interface CategoryCardProps {
  name: string
  image: string | null
  href: string
}

export function CategoryCard({ name, image, href }: CategoryCardProps) {
  return (
    <a
      href={href}
      className="group flex flex-col items-center p-4 bg-card border border-border rounded-2xl hover:border-primary hover:shadow-lg transition-all duration-300"
    >
      <div className="w-20 h-20 md:w-24 md:h-24 bg-muted rounded-xl mb-3 overflow-hidden flex items-center justify-center">
        {image ? (
          <img src={image} alt={name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center">
            <span className="text-3xl">⚡</span>
          </div>
        )}
      </div>
      <span className="text-sm md:text-base font-medium text-foreground text-center">{name}</span>
      <div className="flex items-center gap-1 text-muted-foreground group-hover:text-primary transition-colors mt-1">
        <ChevronLeft className="w-4 h-4" />
      </div>
    </a>
  )
}
