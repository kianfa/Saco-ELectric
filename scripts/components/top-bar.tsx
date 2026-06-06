"use client"

import { Clock, FileText, MessageCircle, Phone } from "lucide-react"
import { useContactInfo } from "@/components/site-settings-provider"
import { storeContactConfig } from "@/lib/store-contact-config"

export function TopBar() {
  const contact = useContactInfo()
  const brandName = contact.brandName || storeContactConfig.brandName
  const landline = contact.landline || storeContactConfig.landline
  const supportPhone = contact.supportPhone || contact.mobile || storeContactConfig.mobile

  return (
    <div className="bg-primary text-primary-foreground py-2 text-sm">
      <div className="container mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <span>به فروشگاه {brandName} خوش آمدید</span>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <a href="/projects" className="flex items-center gap-1.5 hover:text-accent transition-colors">
            <FileText className="w-4 h-4" />
            <span>اطلاعات پروژه‌شما</span>
          </a>
          <a href={`tel:${landline}`} className="flex items-center gap-1.5 hover:text-accent transition-colors">
            <Phone className="w-4 h-4" />
            <span dir="ltr">{landline}</span>
          </a>
          <a href={`tel:${supportPhone}`} className="hidden items-center gap-1.5 hover:text-accent transition-colors sm:flex">
            <MessageCircle className="w-4 h-4" />
            <span dir="ltr">{supportPhone}</span>
          </a>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>{contact.workingHours || "پشتیبانی فروش و پروژه"}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
