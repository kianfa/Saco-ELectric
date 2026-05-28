import { fetchPublicSiteSettingsRows } from "@/lib/repositories/site-settings-repository"
import { storeContactConfig } from "@/lib/store-contact-config"
import { publicSiteSettingsFallback } from "@/lib/site-settings-defaults"
import type { PublicContactInfo, PublicFooterInfo, PublicManualCheckoutSettings, PublicSiteSettings } from "@/types/site-settings"

type JsonMap = Record<string, unknown>

function str(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined
}

function strArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined
  const items = value.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
  return items.length ? items : undefined
}

function normalizeTelegramUsername(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return storeContactConfig.telegram.username
  return trimmed.startsWith("@") ? trimmed : `@${trimmed}`
}

function buildTelegramUrl(username: string) {
  const clean = username.replace(/^@/, "")
  return clean ? `https://t.me/${clean}` : publicSiteSettingsFallback.contactInfo.telegramUrl
}

function buildWhatsappUrl(phone: string) {
  const digits = phone.replace(/\D/g, "")
  const normalized = digits.startsWith("0") ? `98${digits.slice(1)}` : digits
  return normalized ? `https://wa.me/${normalized}` : publicSiteSettingsFallback.contactInfo.whatsappUrl
}

function normalizeContactInfo(contact: JsonMap, footer: JsonMap): PublicContactInfo {
  const brandName = str(contact.brandName) ?? str(contact.brand_name) ?? storeContactConfig.brandName
  const landline = str(contact.landline) ?? str(contact.phone) ?? str(contact.fixedPhone) ?? storeContactConfig.landline
  const mobile = str(contact.mobile) ?? str(contact.supportPhone) ?? str(contact.telegramPhone) ?? storeContactConfig.mobile
  const supportPhone = str(contact.supportPhone) ?? str(contact.support_phone) ?? mobile
  const telegramUsername = normalizeTelegramUsername(str(contact.telegramUsername) ?? str(contact.telegram_username) ?? storeContactConfig.telegram.username)
  const telegramUrl = str(contact.telegramUrl) ?? str(contact.telegram_url) ?? str(footer.telegramUrl) ?? str(footer.telegram_url) ?? buildTelegramUrl(telegramUsername)
  const whatsappUrl = str(contact.whatsappUrl) ?? str(contact.whatsapp_url) ?? buildWhatsappUrl(mobile)

  return {
    brandName,
    address: str(contact.address) ?? "",
    landline,
    mobile,
    supportPhone,
    telegramUsername,
    telegramUrl,
    whatsappUrl,
    messagingApps: strArray(contact.messagingApps) ?? strArray(contact.messaging_apps) ?? [...storeContactConfig.channels],
    workingHours: str(contact.workingHours) ?? str(contact.working_hours) ?? storeContactConfig.workingHours,
    email: str(contact.email) ?? "",
  }
}

function normalizeFooterInfo(footer: JsonMap, contactInfo: PublicContactInfo): PublicFooterInfo {
  return {
    description: str(footer.description) ?? publicSiteSettingsFallback.footerInfo.description,
    copyright: str(footer.copyright) ?? publicSiteSettingsFallback.footerInfo.copyright,
    trustBadgeImageUrl: str(footer.trustBadgeImageUrl) ?? str(footer.trust_badge_image_url) ?? null,
    instagramUrl: str(footer.instagramUrl) ?? str(footer.instagram_url) ?? null,
    telegramUrl: str(footer.telegramUrl) ?? str(footer.telegram_url) ?? contactInfo.telegramUrl,
    baleUrl: str(footer.baleUrl) ?? str(footer.bale_url) ?? null,
    linkedinUrl: str(footer.linkedinUrl) ?? str(footer.linkedin_url) ?? null,
  }
}

function normalizeManualCheckout(manual: JsonMap): PublicManualCheckoutSettings {
  return {
    explanationText: str(manual.explanationText) ?? str(manual.explanation_text) ?? publicSiteSettingsFallback.manualCheckout.explanationText,
    helperText: str(manual.helperText) ?? str(manual.helper_text) ?? publicSiteSettingsFallback.manualCheckout.helperText,
    cardToCardInstructionText: str(manual.cardToCardInstructionText) ?? str(manual.card_to_card_instruction_text) ?? publicSiteSettingsFallback.manualCheckout.explanationText,
    onlinePaymentDisabledText:
      str(manual.onlinePaymentDisabledText) ??
      str(manual.online_payment_disabled_text) ??
      publicSiteSettingsFallback.manualCheckout.onlinePaymentDisabledText,
  }
}

export function normalizePublicSiteSettings(rows: Record<string, JsonMap>): PublicSiteSettings {
  const contactRows = {
    ...(rows.contact_info ?? {}),
    ...(rows.site_contact ?? {}),
    ...(rows.site_info ?? {}),
  }
  const footerRows = rows.footer_info ?? {}
  const manualRows = rows.manual_checkout ?? {}

  const contactInfo = normalizeContactInfo(contactRows, footerRows)
  const footerInfo = normalizeFooterInfo(footerRows, contactInfo)
  const manualCheckout = normalizeManualCheckout(manualRows)

  return { contactInfo, footerInfo, manualCheckout }
}

export async function getPublicSiteSettings(): Promise<PublicSiteSettings> {
  const rows = await fetchPublicSiteSettingsRows()
  const settings = normalizePublicSiteSettings(rows)

  if (process.env.NODE_ENV === "development") {
    console.log("Loaded public site settings:", {
      contactInfo: settings.contactInfo,
      footerInfo: settings.footerInfo,
      manualCheckout: settings.manualCheckout,
    })
  }

  return settings
}

export async function getContactInfo(): Promise<PublicContactInfo> {
  return (await getPublicSiteSettings()).contactInfo
}

export async function getFooterInfo(): Promise<PublicFooterInfo> {
  return (await getPublicSiteSettings()).footerInfo
}

export async function getManualCheckoutSettings(): Promise<PublicManualCheckoutSettings> {
  return (await getPublicSiteSettings()).manualCheckout
}
