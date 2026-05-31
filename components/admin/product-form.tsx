"use client"

import { useActionState, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AlertTriangle, ImagePlus, Loader2, Plus, Save, Trash2, X } from "lucide-react"
import { toast } from "sonner"
import type { AdminActionState, AdminProduct, AdminProductFormOptions, AdminProductImage, AdminProductSpec } from "@/types/admin-product"
import { createProductAction, updateProductAction } from "@/lib/actions/admin-products-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProductImagePreviewCard } from "@/components/admin/product-image-preview-card"

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\u0600-\u06FF]+/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function initialSpecs(product?: AdminProduct | null): AdminProductSpec[] {
  if (product?.specs?.length) return product.specs
  return [
    { specName: "جریان نامی", specValue: "100A", sortOrder: 1 },
    { specName: "تعداد پل", specValue: "3P", sortOrder: 2 },
  ]
}

function initialState(): AdminActionState {
  return { ok: false, message: "" }
}

export function ProductForm({ options, product = null }: { options: AdminProductFormOptions; product?: AdminProduct | null }) {
  const router = useRouter()
  const isEdit = Boolean(product)
  const action = (isEdit && product ? updateProductAction.bind(null, product.id) : createProductAction) as (
    prevState: AdminActionState,
    formData: FormData
  ) => Promise<AdminActionState>
  const [state, formAction, pending] = useActionState<AdminActionState, FormData>(action, initialState())
  const [name, setName] = useState(product?.name ?? "")
  const [model, setModel] = useState(product?.model ?? "")
  const [slug, setSlug] = useState(product?.slug ?? "")
  const [brandId, setBrandId] = useState(product?.brandId ?? "")
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? "")
  const [price, setPrice] = useState(String(product?.price ?? ""))
  const [oldPrice, setOldPrice] = useState(String(product?.oldPrice ?? ""))
  const [discountPercent, setDiscountPercent] = useState(String(product?.discountPercent ?? "0"))
  const [quantity, setQuantity] = useState(String(product?.quantity ?? "0"))
  const [specs, setSpecs] = useState<AdminProductSpec[]>(initialSpecs(product))
  const [existingImages, setExistingImages] = useState<AdminProductImage[]>(product?.images ?? [])
  const [removedImageIds, setRemovedImageIds] = useState<string[]>([])
  const [mainExistingImageId, setMainExistingImageId] = useState<string | null>(product?.images.find((image) => image.isMain)?.id ?? null)
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([])
  const [newImageAltTexts, setNewImageAltTexts] = useState<string[]>([])
  const [manualSlugTouched, setManualSlugTouched] = useState(Boolean(product?.slug))
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const selectedBrand = options.brands.find((brand) => brand.id === brandId)?.slug ?? ""
  const calculatedDiscount = useMemo(() => {
    const priceNumber = Number(price || 0)
    const oldPriceNumber = Number(oldPrice || 0)
    if (!priceNumber || !oldPriceNumber || oldPriceNumber <= priceNumber) return Number(discountPercent || 0)
    return Math.round(((oldPriceNumber - priceNumber) / oldPriceNumber) * 100)
  }, [price, oldPrice, discountPercent])

  useEffect(() => {
    if (manualSlugTouched) return
    const nextSlug = slugify([selectedBrand, model, name].filter(Boolean).join(" "))
    if (nextSlug) setSlug(nextSlug)
  }, [manualSlugTouched, model, name, selectedBrand])

  useEffect(() => {
    if (!state.message) return
    if (state.ok) {
      toast.success(state.message)
      if (state.redirectTo) router.push(state.redirectTo)
    } else {
      toast.error(state.message)
    }
  }, [router, state])

  function addSpec() {
    setSpecs((items) => [...items, { specName: "", specValue: "", sortOrder: items.length + 1 }])
  }

  function updateSpec(index: number, field: keyof AdminProductSpec, value: string | number) {
    setSpecs((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item))
  }

  function removeSpec(index: number) {
    setSpecs((items) => items.filter((_, itemIndex) => itemIndex !== index).map((item, itemIndex) => ({ ...item, sortOrder: itemIndex + 1 })))
  }

  function removeExistingImage(id: string) {
    setRemovedImageIds((items) => [...items, id])
    setExistingImages((images) => images.filter((image) => image.id !== id))
    if (mainExistingImageId === id) setMainExistingImageId(null)
  }

  function handleNewImagesChange(files: FileList | null) {
    newImagePreviews.forEach((url) => URL.revokeObjectURL(url))
    const selectedFiles = Array.from(files ?? [])
    const previews = selectedFiles.map((file) => URL.createObjectURL(file))
    const defaultAlt = `${name}${model ? ` ${model}` : ""}`.trim() || "تصویر محصول"
    setNewImagePreviews(previews)
    setNewImageAltTexts(selectedFiles.map((_, index) => newImageAltTexts[index] || defaultAlt))
  }

  function clearNewImages() {
    newImagePreviews.forEach((url) => URL.revokeObjectURL(url))
    setNewImagePreviews([])
    setNewImageAltTexts([])
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  function updateExistingImageAlt(id: string, altText: string) {
    setExistingImages((images) => images.map((image) => image.id === id ? { ...image, altText } : image))
  }

  function updateNewImageAlt(index: number, altText: string) {
    setNewImageAltTexts((items) => items.map((item, itemIndex) => itemIndex === index ? altText : item))
  }

  return (
    <form action={formAction} className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <input type="hidden" name="specsJson" value={JSON.stringify(specs)} />
      <input type="hidden" name="existingImagesJson" value={JSON.stringify(existingImages)} />
      <input type="hidden" name="removedImageIdsJson" value={JSON.stringify(removedImageIds)} />
      <input type="hidden" name="mainExistingImageId" value={mainExistingImageId ?? ""} />
      <input type="hidden" name="newImageAltTextsJson" value={JSON.stringify(newImageAltTexts)} />

      <div className="space-y-6">
        <Card className="rounded-2xl shadow-sm">
          <CardHeader><CardTitle>اطلاعات اصلی محصول</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Field label="نام محصول" error={state.fieldErrors?.name} className="md:col-span-2">
              <Input name="name" value={name} onChange={(event) => setName(event.target.value)} required className="rounded-xl" />
            </Field>
            <Field label="slug" error={state.fieldErrors?.slug} helper="این مقدار برای آدرس صفحه محصول استفاده می‌شود.">
              <Input name="slug" value={slug} onChange={(event) => { setSlug(slugify(event.target.value)); setManualSlugTouched(true) }} required dir="ltr" className="rounded-xl text-left" />
            </Field>
            <Field label="مدل">
              <Input name="model" value={model} onChange={(event) => setModel(event.target.value)} className="rounded-xl" />
            </Field>
            <Field label="SKU" error={state.fieldErrors?.sku}>
              <Input name="sku" defaultValue={product?.sku ?? ""} dir="ltr" className="rounded-xl text-left" />
            </Field>
            <Field label="برند">
              <Select value={brandId || "none"} onValueChange={(value) => setBrandId(value === "none" ? "" : value)} name="brandId">
                <SelectTrigger className="w-full rounded-xl"><SelectValue placeholder="انتخاب برند" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">بدون برند</SelectItem>
                  {options.brands.map((brand) => <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="دسته‌بندی" error={state.fieldErrors?.categoryId}>
              <Select value={categoryId || "none"} onValueChange={(value) => setCategoryId(value === "none" ? "" : value)} name="categoryId">
                <SelectTrigger className="w-full rounded-xl"><SelectValue placeholder="انتخاب دسته‌بندی" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">انتخاب نشده</SelectItem>
                  {options.categories.map((category) => <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="توضیح کوتاه" className="md:col-span-2">
              <Textarea name="shortDescription" defaultValue={product?.shortDescription ?? ""} className="min-h-24 rounded-xl" />
            </Field>
            <Field label="توضیحات کامل" className="md:col-span-2">
              <Textarea name="description" defaultValue={product?.description ?? ""} className="min-h-36 rounded-xl" />
            </Field>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader><CardTitle>قیمت‌گذاری و موجودی</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <Field label="قیمت اصلی" error={state.fieldErrors?.price}>
              <Input name="price" value={price} onChange={(e) => setPrice(e.target.value)} inputMode="numeric" required className="rounded-xl" />
            </Field>
            <Field label="قیمت قبل از تخفیف">
              <Input name="oldPrice" value={oldPrice} onChange={(e) => setOldPrice(e.target.value)} inputMode="numeric" className="rounded-xl" />
            </Field>
            <Field label="درصد تخفیف">
              <Input name="discountPercent" value={discountPercent} onChange={(e) => setDiscountPercent(e.target.value)} inputMode="numeric" className="rounded-xl" />
            </Field>
            <div className="rounded-xl bg-muted p-4 text-sm md:col-span-3">
              تخفیف محاسبه‌شده: <span className="font-bold text-primary">{new Intl.NumberFormat("fa-IR").format(calculatedDiscount)}٪</span>
            </div>
            <Field label="تعداد موجودی" error={state.fieldErrors?.quantity}>
              <Input name="quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} inputMode="numeric" className="rounded-xl" />
            </Field>
            <Field label="حداقل موجودی هشدار">
              <Input name="lowStockThreshold" defaultValue={product?.lowStockThreshold ?? ""} inputMode="numeric" className="rounded-xl" />
            </Field>
            <div className="flex items-end">
              <div className="w-full rounded-xl border bg-card p-3 text-sm">
                وضعیت: {Number(quantity) > 0 ? <span className="font-bold text-green-600">موجود</span> : <span className="font-bold text-destructive">ناموجود</span>}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader><CardTitle>تصاویر محصول</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-dashed bg-muted/40 p-4">
              <Label htmlFor="images" className="mb-3 flex items-center gap-2 font-bold"><ImagePlus className="h-4 w-4" /> آپلود تصویر اصلی و گالری</Label>
              <Input ref={fileInputRef} id="images" name="images" type="file" accept="image/*" multiple onChange={(event) => handleNewImagesChange(event.target.files)} className="rounded-xl bg-card" />
              <p className="mt-2 text-xs text-muted-foreground">مسیر ذخیره‌سازی: product-images/products/{slug || "product-slug"}/main.webp و gallery</p>
              <p className="mt-1 text-xs font-medium text-primary">پیشنهاد: تصویر محصول با پس‌زمینه سفید یا روشن و نسبت ۱:۱ آپلود شود.</p>
            </div>

            {existingImages.length ? (
              <div>
                <div className="mb-2 text-sm font-bold">تصاویر فعلی</div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {existingImages.map((image) => {
                    const fallbackText = `${name}${model ? ` ${model}` : ""}`.trim() || "تصویر محصول"
                    const isMain = mainExistingImageId ? mainExistingImageId === image.id : image.isMain

                    return (
                      <ProductImagePreviewCard
                        key={image.id}
                        imageUrl={image.imageUrl}
                        altText={image.altText ?? ""}
                        fallbackText={fallbackText}
                        isMain={isMain}
                        onSetMain={() => setMainExistingImageId(image.id)}
                        onRemove={() => removeExistingImage(image.id)}
                        onAltTextChange={(value) => updateExistingImageAlt(image.id, value)}
                      />
                    )
                  })}
                </div>
              </div>
            ) : null}

            {newImagePreviews.length ? (
              <div>
                <div className="mb-2 flex items-center justify-between"><span className="text-sm font-bold">پیش‌نمایش تصاویر جدید</span><Button type="button" variant="ghost" size="sm" onClick={clearNewImages}><X className="h-4 w-4" /> حذف همه</Button></div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {newImagePreviews.map((url, index) => {
                    const fallbackText = `${name}${model ? ` ${model}` : ""}`.trim() || "تصویر محصول"

                    return (
                      <ProductImagePreviewCard
                        key={url}
                        imageUrl={url}
                        altText={newImageAltTexts[index] ?? ""}
                        fallbackText={fallbackText}
                        isMain={!existingImages.length && index === 0}
                        onAltTextChange={(value) => updateNewImageAlt(index, value)}
                      />
                    )
                  })}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="flex-row items-center justify-between"><CardTitle>مشخصات فنی</CardTitle><Button type="button" variant="outline" onClick={addSpec} className="rounded-xl"><Plus className="h-4 w-4" /> افزودن ردیف</Button></CardHeader>
          <CardContent className="space-y-3">
            {specs.map((spec, index) => (
              <div key={index} className="grid gap-2 rounded-xl border p-3 md:grid-cols-[1fr_1fr_100px_auto]">
                <Input value={spec.specName} onChange={(e) => updateSpec(index, "specName", e.target.value)} placeholder="نام مشخصه" className="rounded-xl" />
                <Input value={spec.specValue} onChange={(e) => updateSpec(index, "specValue", e.target.value)} placeholder="مقدار" className="rounded-xl" />
                <Input value={spec.sortOrder} onChange={(e) => updateSpec(index, "sortOrder", Number(e.target.value))} inputMode="numeric" className="rounded-xl" />
                <Button type="button" variant="ghost" size="icon" onClick={() => removeSpec(index)} className="rounded-xl text-destructive"><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <aside className="space-y-6 xl:sticky xl:top-6 xl:h-fit">
        <Card className="rounded-2xl shadow-sm">
          <CardHeader><CardTitle>وضعیت محصول</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <CheckField name="isActive" label="فعال / قابل نمایش" defaultChecked={product?.isActive ?? true} />
            <CheckField name="isFeatured" label="محصول ویژه" defaultChecked={product?.isFeatured ?? false} />
            <CheckField name="showInHomepage" label="نمایش در صفحه اصلی" defaultChecked={product?.isFeatured ?? false} />
            <CheckField name="hasWarranty" label="دارای گارانتی" defaultChecked={product?.hasWarranty ?? true} />
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader><CardTitle>گارانتی و کشور سازنده</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Field label="گارانتی"><Input name="warranty" defaultValue={product?.warranty ?? "ضمانت اصالت و سلامت کالا"} className="rounded-xl" /></Field>
            <Field label="کشور سازنده"><Input name="originCountry" defaultValue={product?.originCountry ?? ""} className="rounded-xl" /></Field>
          </CardContent>
        </Card>

        {product?.slug && slug !== product.slug ? (
          <div className="rounded-2xl border border-accent/40 bg-accent/10 p-4 text-sm leading-7 text-primary">
            <div className="flex items-center gap-2 font-bold"><AlertTriangle className="h-4 w-4" /> هشدار تغییر slug</div>
            با تغییر slug، آدرس صفحه محصول و مسیر پوشه تصاویر ممکن است تغییر کند.
          </div>
        ) : null}

        {state.message && !state.ok ? <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{state.message}</div> : null}

        <div className="grid gap-3 rounded-2xl border bg-card p-4 shadow-sm">
          <Button name="intent" value="save" disabled={pending} className="h-12 rounded-xl bg-primary hover:bg-primary/90">
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} ذخیره محصول
          </Button>
          {!isEdit ? <Button name="intent" value="save-new" disabled={pending} variant="outline" className="h-12 rounded-xl">ذخیره و افزودن محصول جدید</Button> : null}
          <Button asChild type="button" variant="ghost" className="h-12 rounded-xl"><Link href="/admin/products">انصراف</Link></Button>
        </div>
      </aside>
    </form>
  )
}

function Field({ label, helper, error, className, children }: { label: string; helper?: string; error?: string; className?: string; children: ReactNode }) {
  return (
    <div className={className}>
      <Label className="mb-2 block font-semibold">{label}</Label>
      {children}
      {helper ? <p className="mt-1 text-xs text-muted-foreground">{helper}</p> : null}
      {error ? <p className="mt-1 text-xs text-destructive">{error}</p> : null}
    </div>
  )
}

function CheckField({ name, label, defaultChecked }: { name: string; label: string; defaultChecked: boolean }) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-xl border p-3 text-sm font-medium">
      {label}
      <Checkbox name={name} defaultChecked={defaultChecked} />
    </label>
  )
}
