"use client"

import { footerLinks } from "@/lib/data"
import { Zap, Instagram, Send, MessageCircle, Linkedin, Phone, MapPin, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { storeContactConfig } from "@/lib/store-contact-config"
import { useSiteSettings } from "@/components/site-settings-provider"

export function Footer(_props: { settings?: unknown } = {}) {
  const { contactInfo: contact, footerInfo: footer } = useSiteSettings()
  const description = footer.description || storeContactConfig.defaultFooterDescription
  const copyright = footer.copyright || storeContactConfig.defaultCopyright
  const trustBadgeImageUrl = footer.trustBadgeImageUrl
  const landline = contact.landline || storeContactConfig.landline
  const supportPhone = contact.supportPhone || contact.mobile || storeContactConfig.mobile
  const telegramUsername = contact.telegramUsername || storeContactConfig.telegram.username
  const telegramUrl = footer.telegramUrl || contact.telegramUrl || storeContactConfig.telegram.url
  const workingHours = contact.workingHours || storeContactConfig.workingHours
  const address = contact.address
  const brandName = contact.brandName || storeContactConfig.brandName
  const channels = contact.messagingApps?.length ? contact.messagingApps : [...storeContactConfig.channels]

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-6">
          {/* Logo & Description */}
          <div className="lg:col-span-2">
            <a href="/" className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-foreground/10">
                <Zap className="h-7 w-7 text-accent" />
              </div>
              <div>
                <h3 className="text-xl font-bold">{brandName}</h3>
                <p className="text-xs text-primary-foreground/70">{storeContactConfig.tagline}</p>
              </div>
            </a>
            <p className="mb-6 text-sm leading-relaxed text-primary-foreground/80">{description}</p>

            <div className="flex items-center gap-3">
              {trustBadgeImageUrl ? (
                <div className="h-20 w-16 overflow-hidden rounded-lg bg-primary-foreground/10">
                  <img src={trustBadgeImageUrl} alt="نماد اعتماد" className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="flex h-20 w-16 items-center justify-center rounded-lg bg-primary-foreground/10">
                  <span className="text-xs text-primary-foreground/60">نماد اعتماد</span>
                </div>
              )}
              <div className="flex h-20 w-16 items-center justify-center rounded-lg bg-primary-foreground/10">
                <span className="text-xs text-primary-foreground/60">ساماندهی</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="mb-4 font-bold">دسترسی سریع</h4>
            <ul className="space-y-2">
              {footerLinks.quickAccess.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-sm text-primary-foreground/70 transition-colors hover:text-accent">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-bold">خدمات ما</h4>
            <ul className="space-y-2">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-sm text-primary-foreground/70 transition-colors hover:text-accent">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-bold">راهنمای مشتریان</h4>
            <ul className="space-y-2">
              {footerLinks.customerGuide.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-sm text-primary-foreground/70 transition-colors hover:text-accent">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-bold">ارتباط با {brandName}</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/75">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-accent" />
                <span>تلفن ثابت:</span>
                <a href={`tel:${landline}`} dir="ltr" className="font-bold text-primary-foreground hover:text-accent">{landline}</a>
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-accent" />
                <span>موبایل / پشتیبانی:</span>
                <a href={`tel:${supportPhone}`} dir="ltr" className="font-bold text-primary-foreground hover:text-accent">{supportPhone}</a>
              </li>
              <li className="flex items-center gap-2">
                <Send className="h-4 w-4 text-accent" />
                <span>تلگرام:</span>
                <a href={telegramUrl} target="_blank" rel="noreferrer" dir="ltr" className="font-bold text-primary-foreground hover:text-accent">{telegramUsername}</a>
              </li>
              {address && (
                <li className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 text-accent" />
                  <span>{address}</span>
                </li>
              )}
              <li className="flex items-start gap-2">
                <Clock className="mt-0.5 h-4 w-4 text-accent" />
                <span>{workingHours}</span>
              </li>
            </ul>
            <div className="mt-4 flex flex-wrap gap-2">
              {channels.map((channel) => (
                <span key={channel} className="rounded-full bg-primary-foreground/10 px-3 py-1 text-xs font-semibold text-primary-foreground/80">
                  {channel}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-primary-foreground/10 pt-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div>
              <h4 className="mb-1 font-bold">خبرنامه {brandName}</h4>
              <p className="text-sm text-primary-foreground/70">جدیدترین محصولات، مقالات فنی و تخفیف‌های ویژه را دریافت کنید.</p>
            </div>
            <div className="flex w-full gap-2 md:w-auto">
              <Input
                type="email"
                placeholder="ایمیل خود را وارد کنید..."
                className="min-w-[250px] rounded-xl border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/50"
              />
              <Button className="rounded-xl bg-accent px-6 text-accent-foreground hover:bg-accent/90">عضویت</Button>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-primary-foreground/10 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-primary-foreground/70">{copyright}</p>
            <div className="flex items-center gap-3">
              <a href={footer.instagramUrl || "#"} className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/10 transition-colors hover:bg-accent hover:text-accent-foreground" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
              <a href={telegramUrl} target="_blank" rel="noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/10 transition-colors hover:bg-accent hover:text-accent-foreground" aria-label="Telegram">
                <Send className="h-5 w-5" />
              </a>
              <a href={`tel:${supportPhone}`} className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/10 transition-colors hover:bg-accent hover:text-accent-foreground" aria-label="Messaging apps">
                <MessageCircle className="h-5 w-5" />
              </a>
              <a href={footer.linkedinUrl || "#"} className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/10 transition-colors hover:bg-accent hover:text-accent-foreground" aria-label="LinkedIn">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
