"use client"

import { Phone, Clock, FileText } from "lucide-react"

export function TopBar() {
  return (
    <div className="bg-primary text-primary-foreground py-2 text-sm">
      <div className="container mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <span>به فروشگاه صنعت الکتریک خوش آمدید</span>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <a href="/projects" className="flex items-center gap-1.5 hover:text-accent transition-colors">
            <FileText className="w-4 h-4" />
            <span>اطلاعات پروژه‌شما</span>
          </a>
          <a href="tel:02112345678" className="flex items-center gap-1.5 hover:text-accent transition-colors">
            <Phone className="w-4 h-4" />
            <span dir="ltr">021-12345678</span>
          </a>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>پشتیبانی ۲۴ ساعته</span>
          </div>
        </div>
      </div>
    </div>
  )
}
