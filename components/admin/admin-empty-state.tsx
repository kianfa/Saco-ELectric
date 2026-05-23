import Link from "next/link"
import { PackagePlus } from "lucide-react"
import { Button } from "@/components/ui/button"

export function AdminEmptyState() {
  return (
    <div className="rounded-2xl border border-dashed bg-card p-10 text-center shadow-sm">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <PackagePlus className="h-8 w-8" />
      </div>
      <h2 className="text-xl font-bold text-primary">هنوز محصولی ثبت نشده است</h2>
      <p className="mt-2 text-sm text-muted-foreground">برای شروع، اولین محصول فروشگاه را بدون نیاز به SQL اضافه کنید.</p>
      <Button asChild className="mt-6 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90">
        <Link href="/admin/products/new">افزودن اولین محصول</Link>
      </Button>
    </div>
  )
}
