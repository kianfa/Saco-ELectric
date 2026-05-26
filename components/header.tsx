"use client"

import Link from "next/link"
import { Search, User, Zap, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { navLinks } from "@/lib/data"
import { useState } from "react"
import { CartDrawer } from "@/components/cart/cart-drawer"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      {/* Main Header */}
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <Zap className="w-7 h-7 text-accent" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-primary">ساکو الکتریک</h1>
              <p className="text-xs text-muted-foreground">فروشگاه تخصصی تجهیزات برق صنعتی</p>
            </div>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-2xl">
            <div className="relative w-full">
              <Input
                type="search"
                placeholder="جستجو برای محصولات، برندها، کد فنی و ..."
                className="w-full pr-4 pl-12 py-6 rounded-xl border-2 border-border focus:border-primary text-base"
              />
              <Button
                size="icon"
                className="absolute left-1.5 top-1/2 -translate-y-1/2 bg-primary hover:bg-primary/90 rounded-lg"
              >
                <Search className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
            <Button variant="outline" className="hidden sm:flex items-center gap-2 rounded-xl">
              <User className="w-5 h-5" />
              <span className="hidden lg:inline">ورود / ثبت‌نام</span>
            </Button>
            <Button variant="outline" size="icon" className="rounded-xl relative sm:hidden">
              <User className="w-5 h-5" />
            </Button>
            <CartDrawer />
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden mt-3">
          <div className="relative w-full">
            <Input
              type="search"
              placeholder="جستجو برای محصولات..."
              className="w-full pr-4 pl-12 py-5 rounded-xl border-2 border-border"
            />
            <Button
              size="icon"
              className="absolute left-1.5 top-1/2 -translate-y-1/2 bg-primary hover:bg-primary/90 rounded-lg"
            >
              <Search className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="hidden md:block bg-card border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-1">
            <Button className="flex items-center gap-2 bg-primary hover:bg-primary/90 rounded-xl my-2 px-4">
              <Menu className="w-5 h-5" />
              <span>دسته‌بندی کالاها</span>
            </Button>
            <div className="flex items-center">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="px-4 py-4 text-foreground hover:text-primary hover:bg-muted transition-colors font-medium"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-card border-t border-border">
          <div className="container mx-auto px-4 py-2">
            <Button className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 rounded-xl mb-2">
              <Menu className="w-5 h-5" />
              <span>دسته‌بندی کالاها</span>
            </Button>
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="block px-4 py-3 text-foreground hover:text-primary hover:bg-muted transition-colors font-medium border-b border-border last:border-0"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
