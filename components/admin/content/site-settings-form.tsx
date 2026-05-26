"use client"

import { useActionState } from "react"
import { saveSiteSettingsAction } from "@/lib/actions/site-content-actions"
import type { SiteContentActionState, SiteSettingsBundle } from "@/types/site-content"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AdminSubmitButton } from "@/components/admin/content/admin-submit-button"
import { ContentActionMessage } from "@/components/admin/content/content-action-message"

const initialState: SiteContentActionState = { ok: false, message: "" }

export function SiteSettingsForm({ settings }: { settings: SiteSettingsBundle }) {
  const [state, formAction] = useActionState(saveSiteSettingsAction, initialState)
  return (
    <form action={formAction} className="space-y-6">
      <ContentActionMessage state={state} />
      <Card className="rounded-2xl shadow-sm"><CardHeader><CardTitle>اطلاعات تماس</CardTitle></CardHeader><CardContent className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2"><Label>شماره تماس</Label><Input name="phone" defaultValue={settings.contactInfo.phone ?? ""} className="rounded-xl" /></div>
        <div className="space-y-2"><Label>شماره پشتیبانی</Label><Input name="supportPhone" defaultValue={settings.contactInfo.supportPhone ?? ""} className="rounded-xl" /></div>
        <div className="space-y-2"><Label>آیدی تلگرام</Label><Input name="telegramUsername" dir="ltr" defaultValue={settings.contactInfo.telegramUsername ?? ""} className="rounded-xl" /></div>
        <div className="space-y-2"><Label>شماره تلگرام</Label><Input name="telegramPhone" defaultValue={settings.contactInfo.telegramPhone ?? ""} className="rounded-xl" /></div>
        <div className="space-y-2"><Label>آیدی بله</Label><Input name="baleUsername" dir="ltr" defaultValue={settings.contactInfo.baleUsername ?? ""} className="rounded-xl" /></div>
        <div className="space-y-2"><Label>شماره بله</Label><Input name="balePhone" defaultValue={settings.contactInfo.balePhone ?? ""} className="rounded-xl" /></div>
        <div className="space-y-2 md:col-span-2"><Label>آدرس</Label><Textarea name="address" defaultValue={settings.contactInfo.address ?? ""} className="rounded-xl" /></div>
        <div className="space-y-2 md:col-span-2"><Label>ساعات پاسخگویی</Label><Input name="workingHours" defaultValue={settings.contactInfo.workingHours ?? ""} className="rounded-xl" /></div>
      </CardContent></Card>

      <Card className="rounded-2xl shadow-sm"><CardHeader><CardTitle>فوتر و شبکه‌های اجتماعی</CardTitle></CardHeader><CardContent className="grid gap-4 md:grid-cols-2">
        <input type="hidden" name="trustBadgeImageUrl" defaultValue={settings.footerInfo.trustBadgeImageUrl ?? ""} />
        <div className="space-y-2 md:col-span-2"><Label>توضیح کوتاه فروشگاه</Label><Textarea name="footerDescription" defaultValue={settings.footerInfo.description ?? ""} className="rounded-xl" /></div>
        <div className="space-y-2 md:col-span-2"><Label>متن کپی‌رایت</Label><Input name="copyright" defaultValue={settings.footerInfo.copyright ?? ""} className="rounded-xl" /></div>
        <div className="space-y-2"><Label>Instagram URL</Label><Input name="instagramUrl" dir="ltr" defaultValue={settings.footerInfo.instagramUrl ?? ""} className="rounded-xl" /></div>
        <div className="space-y-2"><Label>Telegram URL</Label><Input name="telegramUrl" dir="ltr" defaultValue={settings.footerInfo.telegramUrl ?? ""} className="rounded-xl" /></div>
        <div className="space-y-2"><Label>Bale URL</Label><Input name="baleUrl" dir="ltr" defaultValue={settings.footerInfo.baleUrl ?? ""} className="rounded-xl" /></div>
        <div className="space-y-2"><Label>LinkedIn URL</Label><Input name="linkedinUrl" dir="ltr" defaultValue={settings.footerInfo.linkedinUrl ?? ""} className="rounded-xl" /></div>
        <div className="space-y-2 md:col-span-2"><Label>تصویر نماد/اعتماد</Label><Input name="trustBadgeImage" type="file" accept="image/*" className="rounded-xl" /></div>
      </CardContent></Card>

      <Card className="rounded-2xl shadow-sm"><CardHeader><CardTitle>متن پرداخت دستی</CardTitle></CardHeader><CardContent className="space-y-4">
        <div className="space-y-2"><Label>توضیح تلگرام/بله</Label><Textarea name="manualExplanationText" defaultValue={settings.manualCheckout.explanationText ?? ""} className="min-h-28 rounded-xl" /></div>
        <div className="space-y-2"><Label>متن کوتاه کنار دکمه‌ها</Label><Textarea name="manualHelperText" defaultValue={settings.manualCheckout.helperText ?? ""} className="rounded-xl" /></div>
        <div className="space-y-2"><Label>مراحل کارت‌به‌کارت</Label><Textarea name="cardToCardInstructionText" defaultValue={settings.manualCheckout.cardToCardInstructionText ?? ""} className="min-h-32 rounded-xl" /></div>
        <div className="space-y-2"><Label>متن غیرفعال بودن پرداخت اینترنتی</Label><Textarea name="onlinePaymentDisabledText" defaultValue={settings.manualCheckout.onlinePaymentDisabledText ?? ""} className="rounded-xl" /></div>
      </CardContent></Card>

      <div className="sticky bottom-4 flex justify-end rounded-2xl border bg-card/95 p-4 shadow-lg backdrop-blur"><AdminSubmitButton>ذخیره تنظیمات سایت</AdminSubmitButton></div>
    </form>
  )
}
