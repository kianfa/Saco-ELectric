import {
  manualCheckoutExplanation,
  manualCheckoutHelperText,
  storeContactConfig,
} from "@/lib/store-contact-config"
import type { PublicSiteSettings } from "@/types/site-settings"

export const publicSiteSettingsFallback: PublicSiteSettings = {
  contactInfo: {
    brandName: storeContactConfig.brandName,
    address: "",
    landline: storeContactConfig.landline,
    mobile: storeContactConfig.mobile,
    supportPhone: storeContactConfig.mobile,
    telegramUsername: storeContactConfig.telegram.username,
    telegramUrl: storeContactConfig.telegram.url,
    whatsappUrl: storeContactConfig.whatsapp.url,
    messagingApps: [...storeContactConfig.channels],
    workingHours: storeContactConfig.workingHours,
    email: "",
  },
  footerInfo: {
    description: storeContactConfig.defaultFooterDescription,
    copyright: storeContactConfig.defaultCopyright,
    trustBadgeImageUrl: null,
    instagramUrl: null,
    telegramUrl: storeContactConfig.telegram.url,
    baleUrl: null,
    linkedinUrl: null,
  },
  manualCheckout: {
    explanationText: manualCheckoutExplanation,
    helperText: manualCheckoutHelperText,
    cardToCardInstructionText: manualCheckoutExplanation,
    onlinePaymentDisabledText: "در حال حاضر پرداخت مستقیم اینترنتی فعال نیست و به‌زودی اضافه خواهد شد.",
  },
}
