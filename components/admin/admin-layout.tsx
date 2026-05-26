import type { ReactNode } from "react"
import Link from "next/link"
import { LayoutDashboard, Package, Tags, Building2, ShoppingCart, Settings, Zap, LogOut, UserRound, ImagePlus } from "lucide-react"
import { cn } from "@/lib/utils"
import { getCurrentAdminUser } from "@/lib/auth/admin-auth"
import { logoutAdminAction } from "@/lib/actions/auth-actions"
import { Button } from "@/components/ui/button"

const links = [
  { href: "/admin/products", label: "محصولات", icon: Package },
  { href: "/admin/content", label: "محتوای سایت", icon: ImagePlus },
  { href: "/admin/content/banners", label: "بنرها", icon: Tags },
  { href: "#", label: "برندها", icon: Building2 },
  { href: "#", label: "سفارش‌ها", icon: ShoppingCart },
  { href: "/admin/content/settings", label: "تنظیمات سایت", icon: Settings },
]

export async function AdminLayout({ children, title, subtitle }: { children: ReactNode; title: string; subtitle?: string }) {
  const admin = await getCurrentAdminUser()

  return (
    <div className="min-h-screen bg-muted/30" dir="rtl">
      <div className="border-b bg-card shadow-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-accent">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <div className="font-bold text-primary">پنل مدیریت صنعت الکتریک</div>
              <div className="text-xs text-muted-foreground">مدیریت فروشگاه تجهیزات برق صنعتی</div>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-xl bg-muted px-3 py-2 text-sm text-muted-foreground md:flex">
              <UserRound className="h-4 w-4" />
              <span>{admin?.fullName || admin?.email || "مدیر"}</span>
            </div>
            <Link href="/products" className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-muted">
              مشاهده سایت
            </Link>
            <form action={logoutAdminAction}>
              <Button type="submit" variant="outline" className="rounded-xl text-destructive hover:text-destructive">
                <LogOut className="ml-2 h-4 w-4" />
                خروج از پنل
              </Button>
            </form>
          </div>
        </div>
      </div>

      <div className="container mx-auto grid gap-6 px-4 py-6 lg:grid-cols-[260px_1fr]">
        <aside className="h-fit rounded-2xl border bg-card p-3 shadow-sm lg:sticky lg:top-6">
          <div className="mb-3 flex items-center gap-2 px-3 py-2 text-sm font-bold text-primary">
            <LayoutDashboard className="h-4 w-4" />
            منوی مدیریت
          </div>
          <nav className="grid gap-1">
            {links.map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-primary/5 hover:text-primary",
                    (link.href === "/admin/products" || link.href.startsWith("/admin/content")) && "bg-primary/10 text-primary"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              )
            })}
          </nav>
          <div className="mt-4 rounded-xl bg-accent/10 p-3 text-xs leading-6 text-muted-foreground">
            دسترسی این بخش با Supabase Auth و نقش <span dir="ltr">profiles.role = admin</span> محافظت می‌شود.
          </div>
        </aside>

        <main>
          <div className="mb-6">
            <h1 className="text-2xl font-black text-primary md:text-3xl">{title}</h1>
            {subtitle ? <p className="mt-2 text-muted-foreground">{subtitle}</p> : null}
          </div>
          {children}
        </main>
      </div>
    </div>
  )
}
