"use client"

import { useActionState } from "react"
import { saveHomepageContentAction } from "@/lib/actions/site-content-actions"
import type { HomepageSection, SiteContentActionState } from "@/types/site-content"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { AdminSubmitButton } from "@/components/admin/content/admin-submit-button"
import { ContentActionMessage } from "@/components/admin/content/content-action-message"

const initialState: SiteContentActionState = { ok: false, message: "" }

function findSection(sections: HomepageSection[], key: string) {
  return sections.find((section) => section.sectionKey === key)
}

function trustPointsText(section?: HomepageSection) {
  const points = section?.metadata?.trustPoints
  return Array.isArray(points) ? points.join("\n") : "کیفیت برتر\nبرندهای معتبر\nقیمت رقابتی\nپشتیبانی فنی تخصصی"
}

export function HomepageContentForm({ sections }: { sections: HomepageSection[] }) {
  const [state, formAction] = useActionState(saveHomepageContentAction, initialState)
  const hero = findSection(sections, "hero")
  const promo = findSection(sections, "promo_banner")
  const notice = findSection(sections, "homepage_notice")

  return (
    <form action={formAction} className="space-y-6">
      <ContentActionMessage state={state} />

      <Card className="rounded-2xl shadow-sm">
        <CardHeader><CardTitle>Hero صفحه اصلی</CardTitle></CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <input type="hidden" name="heroImageUrl" defaultValue={hero?.imageUrl ?? ""} />
          <input type="hidden" name="heroMobileImageUrl" defaultValue={hero?.mobileImageUrl ?? ""} />
          <div className="space-y-2 md:col-span-2">
            <Label>عنوان اصلی</Label>
            <Input name="heroTitle" required defaultValue={hero?.title ?? "راهکار حرفه‌ای برق صنعتی"} className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label>زیرعنوان</Label>
            <Input name="heroSubtitle" defaultValue={hero?.subtitle ?? "تجهیزات مطمئن برای صنعت و اتوماسیون"} className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label>فعال</Label>
            <div className="flex h-10 items-center gap-3"><Switch name="heroIsActive" defaultChecked={hero?.isActive ?? true} /> <span className="text-sm text-muted-foreground">نمایش در سایت</span></div>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>توضیح کوتاه</Label>
            <Textarea name="heroDescription" defaultValue={hero?.description ?? ""} className="min-h-24 rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label>متن دکمه اصلی</Label>
            <Input name="heroPrimaryButtonText" defaultValue={hero?.primaryButtonText ?? "مشاهده محصولات"} className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label>لینک دکمه اصلی</Label>
            <Input name="heroPrimaryButtonUrl" dir="ltr" defaultValue={hero?.primaryButtonUrl ?? "/products"} className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label>متن دکمه دوم</Label>
            <Input name="heroSecondaryButtonText" defaultValue={hero?.secondaryButtonText ?? "استعلام قیمت"} className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label>لینک دکمه دوم</Label>
            <Input name="heroSecondaryButtonUrl" dir="ltr" defaultValue={hero?.secondaryButtonUrl ?? "/checkout"} className="rounded-xl" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>نکات اعتماد، هر مورد در یک خط</Label>
            <Textarea name="heroTrustPoints" defaultValue={trustPointsText(hero)} className="min-h-28 rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label>تصویر دسکتاپ hero</Label>
            <Input name="heroImage" type="file" accept="image/*" className="rounded-xl" />
            {hero?.imageUrl ? <p className="text-xs text-muted-foreground" dir="ltr">{hero.imageUrl}</p> : null}
          </div>
          <div className="space-y-2">
            <Label>تصویر موبایل hero</Label>
            <Input name="heroMobileImage" type="file" accept="image/*" className="rounded-xl" />
            {hero?.mobileImageUrl ? <p className="text-xs text-muted-foreground" dir="ltr">{hero.mobileImageUrl}</p> : null}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader><CardTitle>بنر تبلیغاتی صفحه اصلی</CardTitle></CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <input type="hidden" name="promoImageUrl" defaultValue={promo?.imageUrl ?? ""} />
          <div className="space-y-2"><Label>عنوان بنر</Label><Input name="promoTitle" defaultValue={promo?.title ?? "فروش ویژه تجهیزات برق صنعتی"} className="rounded-xl" /></div>
          <div className="space-y-2"><Label>زیرعنوان</Label><Input name="promoSubtitle" defaultValue={promo?.subtitle ?? "تخفیف‌های استثنایی مخصوص پروژه‌ها و خریداران عمده"} className="rounded-xl" /></div>
          <div className="space-y-2"><Label>متن Badge</Label><Input name="promoBadgeText" defaultValue={String(promo?.metadata?.badgeText ?? "تا ۲۰٪ تخفیف پروژه‌ای")} className="rounded-xl" /></div>
          <div className="space-y-2"><Label>متن دکمه</Label><Input name="promoButtonText" defaultValue={promo?.primaryButtonText ?? "مشاهده پیشنهادها"} className="rounded-xl" /></div>
          <div className="space-y-2"><Label>لینک دکمه</Label><Input name="promoButtonUrl" dir="ltr" defaultValue={promo?.primaryButtonUrl ?? "/products"} className="rounded-xl" /></div>
          <div className="space-y-2"><Label>فعال</Label><div className="flex h-10 items-center gap-3"><Switch name="promoIsActive" defaultChecked={promo?.isActive ?? true} /><span className="text-sm text-muted-foreground">نمایش بنر</span></div></div>
          <div className="space-y-2 md:col-span-2"><Label>توضیح</Label><Textarea name="promoDescription" defaultValue={promo?.description ?? ""} className="rounded-xl" /></div>
          <div className="space-y-2 md:col-span-2"><Label>تصویر بنر</Label><Input name="promoImage" type="file" accept="image/*" className="rounded-xl" /></div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader><CardTitle>اعلان کوچک صفحه اصلی</CardTitle></CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <input type="hidden" name="noticeImageUrl" defaultValue={notice?.imageUrl ?? ""} />
          <div className="space-y-2"><Label>عنوان</Label><Input name="noticeTitle" defaultValue={notice?.title ?? ""} className="rounded-xl" /></div>
          <div className="space-y-2"><Label>متن دکمه</Label><Input name="noticeButtonText" defaultValue={notice?.primaryButtonText ?? ""} className="rounded-xl" /></div>
          <div className="space-y-2"><Label>لینک</Label><Input name="noticeButtonUrl" dir="ltr" defaultValue={notice?.primaryButtonUrl ?? ""} className="rounded-xl" /></div>
          <div className="space-y-2"><Label>فعال</Label><div className="flex h-10 items-center gap-3"><Switch name="noticeIsActive" defaultChecked={notice?.isActive ?? false} /><span className="text-sm text-muted-foreground">نمایش اعلان</span></div></div>
          <div className="space-y-2 md:col-span-2"><Label>توضیح</Label><Textarea name="noticeDescription" defaultValue={notice?.description ?? ""} className="rounded-xl" /></div>
          <div className="space-y-2 md:col-span-2"><Label>تصویر اختیاری</Label><Input name="noticeImage" type="file" accept="image/*" className="rounded-xl" /></div>
        </CardContent>
      </Card>

      <div className="sticky bottom-4 z-10 flex justify-end rounded-2xl border bg-card/95 p-4 shadow-lg backdrop-blur">
        <AdminSubmitButton>ذخیره محتوای صفحه اصلی</AdminSubmitButton>
      </div>
    </form>
  )
}
