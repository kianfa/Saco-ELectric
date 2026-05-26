import { ExternalLink, MessageCircle, Phone, Send } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { manualCheckoutConfig, manualCheckoutHelperText } from "@/lib/manual-checkout-config"

const channels = [
  {
    id: "telegram",
    title: "تلگرام",
    text: "ارسال سریع تصویر سبد خرید و دریافت تایید موجودی و قیمت نهایی",
    usernameLabel: "آیدی",
    username: manualCheckoutConfig.telegram.username,
    phone: manualCheckoutConfig.telegram.phone,
    url: manualCheckoutConfig.telegram.url,
    buttonLabel: "ارسال در تلگرام",
  },
  {
    id: "whatsapp",
    title: "واتساپ",
    text: "ارسال تصویر سبد خرید و هماهنگی سفارش با شماره پشتیبانی",
    usernameLabel: "روش ارتباط",
    username: "شماره پشتیبانی",
    phone: manualCheckoutConfig.whatsapp.phone,
    url: null,
    buttonLabel: "تماس با پشتیبانی",
  },
  {
    id: "bale",
    title: "بله",
    text: "ارسال سفارش از طریق پیام‌رسان بله و هماهنگی پرداخت کارت به کارت",
    usernameLabel: "روش ارتباط",
    username: "شماره پشتیبانی",
    phone: manualCheckoutConfig.bale.phone,
    url: manualCheckoutConfig.bale.url,
    buttonLabel: "هماهنگی از طریق بله",
  },
  {
    id: "rubika",
    title: "روبیکا",
    text: "هماهنگی سفارش و ارسال رسید پرداخت از طریق روبیکا با شماره پشتیبانی",
    usernameLabel: "روش ارتباط",
    username: "شماره پشتیبانی",
    phone: manualCheckoutConfig.rubika.phone,
    url: manualCheckoutConfig.rubika.url,
    buttonLabel: "هماهنگی از طریق روبیکا",
  },
]

export function ManualCheckoutContactSection() {
  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
      <div className="mb-5">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-extrabold text-foreground">ارسال سفارش از طریق پیام‌رسان</h2>
          <Badge className="rounded-full bg-secondary/10 text-secondary hover:bg-secondary/10">روش فعال</Badge>
        </div>
        <p className="mt-1 text-sm leading-7 text-muted-foreground">{manualCheckoutHelperText}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {channels.map((channel) => (
          <div
            key={channel.id}
            className="rounded-2xl border border-border bg-background p-4 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
          >
            <div className="mb-4 flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                {channel.id === "telegram" ? <Send className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
              </div>
              <div>
                <h3 className="font-extrabold text-foreground">{channel.title}</h3>
                <p className="mt-1 text-sm leading-7 text-muted-foreground">{channel.text}</p>
              </div>
            </div>

            <div className="space-y-2 rounded-xl bg-muted/35 p-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">{channel.usernameLabel}:</span>
                <span dir="ltr" className="font-bold text-foreground">{channel.username}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  شماره تماس:
                </span>
                <span dir="ltr" className="font-bold text-foreground">{channel.phone}</span>
              </div>
            </div>

            <Button asChild className="mt-4 h-11 w-full rounded-xl bg-secondary font-extrabold text-secondary-foreground hover:bg-secondary/90">
              <a href={channel.url ?? `tel:${channel.phone}`} target={channel.url ? "_blank" : undefined} rel={channel.url ? "noreferrer" : undefined}>
                {channel.buttonLabel}
                {channel.url ? <ExternalLink className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
              </a>
            </Button>
          </div>
        ))}
      </div>
    </section>
  )
}
