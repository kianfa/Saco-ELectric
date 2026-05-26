"use client"

import { Clock, FileText, MessageCircle, Phone } from "lucide-react"
import { storeContactConfig } from "@/lib/store-contact-config"

export function TopBar() {
  return (
    <div className="bg-primary text-primary-foreground py-2 text-sm">
      <div className="container mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <span>به فروشگاه {storeContactConfig.brandName} خوش آمدید</span>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <a href="/projects" className="flex items-center gap-1.5 hover:text-accent transition-colors">
            <FileText className="w-4 h-4" />
            <span>اطلاعات پروژه‌شما</span>
          </a>
          <a href={`tel:${storeContactConfig.landline}`} className="flex items-center gap-1.5 hover:text-accent transition-colors">
            <Phone className="w-4 h-4" />
            <span dir="ltr">{storeContactConfig.landline}</span>
          </a>
          <a href={`tel:${storeContactConfig.mobile}`} className="hidden items-center gap-1.5 hover:text-accent transition-colors sm:flex">
            <MessageCircle className="w-4 h-4" />
            <span dir="ltr">{storeContactConfig.mobile}</span>
          </a>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>پشتیبانی فروش و پروژه</span>
          </div>
        </div>
      </div>
    </div>
  )
}
