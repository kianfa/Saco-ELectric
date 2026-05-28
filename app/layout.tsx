import type { Metadata } from 'next'
import { Vazirmatn } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { CartProvider } from '@/lib/cart/cart-store'
import { SiteSettingsProvider } from '@/components/site-settings-provider'
import { getPublicSiteSettings } from '@/lib/services/site-settings-service'
import { publicSiteSettingsFallback } from '@/lib/site-settings-defaults'

export const dynamic = "force-dynamic"

const vazirmatn = Vazirmatn({ 
  subsets: ['arabic'],
  variable: '--font-vazirmatn',
})

export const metadata: Metadata = {
  title: 'ساکو الکتریک | فروشگاه تخصصی تجهیزات برق صنعتی',
  description: 'ساکو الکتریک؛ فروشگاه تخصصی تجهیزات برق صنعتی با ارائه محصولات اصل، قیمت رقابتی و پشتیبانی فنی',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  let siteSettings = publicSiteSettingsFallback
  try {
    siteSettings = await getPublicSiteSettings()
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.log("Failed to load public site settings, using fallback:", error)
    }
  }

  return (
    <html lang="fa" dir="rtl" className="bg-background">
      <body className={`${vazirmatn.className} font-sans antialiased`}>
        <SiteSettingsProvider settings={siteSettings}><CartProvider>{children}</CartProvider></SiteSettingsProvider>
        <Toaster richColors position="top-center" />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
