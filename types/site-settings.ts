export type PublicContactInfo = {
  brandName: string
  address: string
  landline: string
  mobile: string
  supportPhone: string
  telegramUsername: string
  telegramUrl: string
  whatsappUrl: string
  messagingApps: string[]
  workingHours: string
  email: string
}

export type PublicFooterInfo = {
  description: string
  copyright: string
  trustBadgeImageUrl: string | null
  instagramUrl: string | null
  telegramUrl: string
  baleUrl: string | null
  linkedinUrl: string | null
}

export type PublicManualCheckoutSettings = {
  explanationText: string
  helperText: string
  cardToCardInstructionText: string
  onlinePaymentDisabledText: string
}

export type PublicSiteSettings = {
  contactInfo: PublicContactInfo
  footerInfo: PublicFooterInfo
  manualCheckout: PublicManualCheckoutSettings
}
