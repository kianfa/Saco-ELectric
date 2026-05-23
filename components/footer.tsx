"use client"

import { footerLinks } from "@/lib/data"
import { Zap, Instagram, Send, MessageCircle, Linkedin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Logo & Description */}
          <div className="lg:col-span-2">
            <a href="/" className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary-foreground/10 rounded-full flex items-center justify-center">
                <Zap className="w-7 h-7 text-accent" />
              </div>
              <div>
                <h3 className="text-xl font-bold">صنعت الکتریک</h3>
                <p className="text-xs text-primary-foreground/70">فروشگاه تخصصی تجهیزات برق صنعتی</p>
              </div>
            </a>
            <p className="text-primary-foreground/80 text-sm leading-relaxed mb-6">
              مرجع تخصصی تجهیزات برق صنعتی با ارائه محصولات اصل، قیمت رقابتی و پشتیبانی فنی
            </p>

            {/* Trust Badge Placeholder */}
            <div className="flex items-center gap-3">
              <div className="w-16 h-20 bg-primary-foreground/10 rounded-lg flex items-center justify-center">
                <span className="text-xs text-primary-foreground/60">نماد اعتماد</span>
              </div>
              <div className="w-16 h-20 bg-primary-foreground/10 rounded-lg flex items-center justify-center">
                <span className="text-xs text-primary-foreground/60">ساماندهی</span>
              </div>
            </div>
          </div>

          {/* Quick Access */}
          <div>
            <h4 className="font-bold mb-4">دسترسی سریع</h4>
            <ul className="space-y-2">
              {footerLinks.quickAccess.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-primary-foreground/70 hover:text-accent transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-bold mb-4">خدمات ما</h4>
            <ul className="space-y-2">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-primary-foreground/70 hover:text-accent transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Guide */}
          <div>
            <h4 className="font-bold mb-4">راهنمای مشتریان</h4>
            <ul className="space-y-2">
              {footerLinks.customerGuide.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-primary-foreground/70 hover:text-accent transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="border-t border-primary-foreground/10 mt-8 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="font-bold mb-1">خبرنامه صنعت الکتریک</h4>
              <p className="text-sm text-primary-foreground/70">
                جدیدترین محصولات، مقالات فنی و تخفیف‌های ویژه را دریافت کنید.
              </p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Input
                type="email"
                placeholder="ایمیل خود را وارد کنید..."
                className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 rounded-xl min-w-[250px]"
              />
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl px-6">
                عضویت
              </Button>
            </div>
          </div>
        </div>

        {/* Social & Copyright */}
        <div className="border-t border-primary-foreground/10 mt-8 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-primary-foreground/70">
              © صنعت الکتریک. تمامی حقوق این سایت محفوظ است.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="w-10 h-10 bg-primary-foreground/10 rounded-full flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-primary-foreground/10 rounded-full flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <Send className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-primary-foreground/10 rounded-full flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-primary-foreground/10 rounded-full flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
