import { getSupabaseClient } from "@/lib/supabase/client"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import type {
  BannerFormInput,
  HomepageSection,
  JsonRecord,
  SiteBanner,
  SiteSetting,
  SiteSettingsBundle,
} from "@/types/site-content"

const SITE_MEDIA_BUCKET = "site-media"

type RawSection = {
  id: string | number
  section_key: string | null
  title?: string | null
  subtitle?: string | null
  description?: string | null
  image_url?: string | null
  mobile_image_url?: string | null
  primary_button_text?: string | null
  primary_button_url?: string | null
  secondary_button_text?: string | null
  secondary_button_url?: string | null
  metadata?: JsonRecord | null
  is_active?: boolean | null
  sort_order?: number | string | null
}

type RawBanner = {
  id: string | number
  title: string | null
  subtitle?: string | null
  description?: string | null
  image_url?: string | null
  button_text?: string | null
  button_url?: string | null
  badge_text?: string | null
  placement?: string | null
  is_active?: boolean | null
  starts_at?: string | null
  ends_at?: string | null
  sort_order?: number | string | null
}

type RawSetting = { id: string | number; key: string | null; value?: JsonRecord | null }

function toNumber(value: number | string | null | undefined, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function isMissingTableOrColumn(message: string) {
  const lower = message.toLowerCase()
  return lower.includes("does not exist") || lower.includes("schema cache")
}

function mapSection(row: RawSection): HomepageSection {
  return {
    id: String(row.id),
    sectionKey: row.section_key ?? "",
    title: row.title ?? null,
    subtitle: row.subtitle ?? null,
    description: row.description ?? null,
    imageUrl: row.image_url ?? null,
    mobileImageUrl: row.mobile_image_url ?? null,
    primaryButtonText: row.primary_button_text ?? null,
    primaryButtonUrl: row.primary_button_url ?? null,
    secondaryButtonText: row.secondary_button_text ?? null,
    secondaryButtonUrl: row.secondary_button_url ?? null,
    metadata: row.metadata ?? {},
    isActive: Boolean(row.is_active ?? true),
    sortOrder: toNumber(row.sort_order),
  }
}

function mapBanner(row: RawBanner): SiteBanner {
  return {
    id: String(row.id),
    title: row.title ?? "بنر بدون عنوان",
    subtitle: row.subtitle ?? null,
    description: row.description ?? null,
    imageUrl: row.image_url ?? null,
    buttonText: row.button_text ?? null,
    buttonUrl: row.button_url ?? null,
    badgeText: row.badge_text ?? null,
    placement: row.placement ?? "homepage_promo",
    isActive: Boolean(row.is_active ?? true),
    startsAt: row.starts_at ?? null,
    endsAt: row.ends_at ?? null,
    sortOrder: toNumber(row.sort_order),
  }
}

function mapSetting(row: RawSetting): SiteSetting {
  return { id: String(row.id), key: row.key ?? "", value: row.value ?? {} }
}

// Public read repository. Supabase is isolated here so the provider can be replaced later.
export async function fetchHomepageSection(sectionKey: string, includeInactive = false): Promise<HomepageSection | null> {
  const supabase = getSupabaseClient()
  let query = supabase.from("homepage_sections").select("*").eq("section_key", sectionKey).maybeSingle()
  if (!includeInactive) query = query.eq("is_active", true)

  const { data, error } = await query
  if (error) {
    if (isMissingTableOrColumn(error.message)) return null
    throw new Error(`Failed to fetch homepage section: ${error.message}`)
  }
  return data ? mapSection(data as RawSection) : null
}

export async function fetchHomepageSections(includeInactive = false): Promise<HomepageSection[]> {
  const supabase = getSupabaseClient()
  let query = supabase.from("homepage_sections").select("*").order("sort_order", { ascending: true })
  if (!includeInactive) query = query.eq("is_active", true)
  const { data, error } = await query
  if (error) {
    if (isMissingTableOrColumn(error.message)) return []
    throw new Error(`Failed to fetch homepage sections: ${error.message}`)
  }
  return ((data ?? []) as RawSection[]).map(mapSection)
}

export async function fetchBanners(placement?: string, includeInactive = false): Promise<SiteBanner[]> {
  const supabase = getSupabaseClient()
  let query = supabase.from("site_banners").select("*").order("sort_order", { ascending: true })
  if (placement) query = query.eq("placement", placement)
  if (!includeInactive) query = query.eq("is_active", true)
  const { data, error } = await query
  if (error) {
    if (isMissingTableOrColumn(error.message)) return []
    throw new Error(`Failed to fetch banners: ${error.message}`)
  }
  return ((data ?? []) as RawBanner[]).map(mapBanner)
}

export async function fetchSiteSettings(): Promise<SiteSettingsBundle> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("site_settings").select("*")
  if (error) {
    if (isMissingTableOrColumn(error.message)) return { contactInfo: {}, footerInfo: {}, manualCheckout: {} }
    throw new Error(`Failed to fetch site settings: ${error.message}`)
  }
  const settings = ((data ?? []) as RawSetting[]).map(mapSetting)
  const find = (key: string) => settings.find((item) => item.key === key)?.value ?? {}
  return {
    contactInfo: find("contact_info") as SiteSettingsBundle["contactInfo"],
    footerInfo: find("footer_info") as SiteSettingsBundle["footerInfo"],
    manualCheckout: find("manual_checkout") as SiteSettingsBundle["manualCheckout"],
  }
}

// Admin server-side repository. Create/update/delete/upload operations belong here only.
export async function fetchAdminHomepageSections(): Promise<HomepageSection[]> {
  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase.from("homepage_sections").select("*").order("sort_order", { ascending: true })
  if (error) {
    if (isMissingTableOrColumn(error.message)) return []
    throw new Error(`Failed to fetch homepage content: ${error.message}`)
  }
  return ((data ?? []) as RawSection[]).map(mapSection)
}

export async function fetchAdminBanners(): Promise<SiteBanner[]> {
  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase.from("site_banners").select("*").order("sort_order", { ascending: true })
  if (error) {
    if (isMissingTableOrColumn(error.message)) return []
    throw new Error(`Failed to fetch banners: ${error.message}`)
  }
  return ((data ?? []) as RawBanner[]).map(mapBanner)
}

export async function fetchAdminSiteSettings(): Promise<SiteSettingsBundle> {
  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase.from("site_settings").select("*")
  if (error) {
    if (isMissingTableOrColumn(error.message)) return { contactInfo: {}, footerInfo: {}, manualCheckout: {} }
    throw new Error(`Failed to fetch settings: ${error.message}`)
  }
  const settings = ((data ?? []) as RawSetting[]).map(mapSetting)
  const find = (key: string) => settings.find((item) => item.key === key)?.value ?? {}
  return {
    contactInfo: find("contact_info") as SiteSettingsBundle["contactInfo"],
    footerInfo: find("footer_info") as SiteSettingsBundle["footerInfo"],
    manualCheckout: find("manual_checkout") as SiteSettingsBundle["manualCheckout"],
  }
}

export async function upsertHomepageSection(section: Partial<HomepageSection> & { sectionKey: string }): Promise<void> {
  const supabase = await getSupabaseServerClient()
  const payload = {
    section_key: section.sectionKey,
    title: section.title ?? null,
    subtitle: section.subtitle ?? null,
    description: section.description ?? null,
    image_url: section.imageUrl ?? null,
    mobile_image_url: section.mobileImageUrl ?? null,
    primary_button_text: section.primaryButtonText ?? null,
    primary_button_url: section.primaryButtonUrl ?? null,
    secondary_button_text: section.secondaryButtonText ?? null,
    secondary_button_url: section.secondaryButtonUrl ?? null,
    metadata: section.metadata ?? {},
    is_active: section.isActive ?? true,
    sort_order: section.sortOrder ?? 0,
    updated_at: new Date().toISOString(),
  }
  const { error } = await supabase.from("homepage_sections").upsert(payload, { onConflict: "section_key" })
  if (error) throw new Error(`Failed to save homepage section: ${error.message}`)
}

export async function upsertSiteSetting(key: string, value: JsonRecord): Promise<void> {
  const supabase = await getSupabaseServerClient()
  const { error } = await supabase.from("site_settings").upsert(
    { key, value, updated_at: new Date().toISOString() },
    { onConflict: "key" }
  )
  if (error) throw new Error(`Failed to save site setting: ${error.message}`)
}

export async function createBanner(input: BannerFormInput): Promise<void> {
  const supabase = await getSupabaseServerClient()
  const { id, ...rest } = input
  const { error } = await supabase.from("site_banners").insert({
    title: rest.title,
    subtitle: rest.subtitle,
    description: rest.description,
    image_url: rest.imageUrl,
    button_text: rest.buttonText,
    button_url: rest.buttonUrl,
    badge_text: rest.badgeText,
    placement: rest.placement,
    is_active: rest.isActive,
    starts_at: rest.startsAt || null,
    ends_at: rest.endsAt || null,
    sort_order: rest.sortOrder,
  })
  if (error) throw new Error(`Failed to create banner: ${error.message}`)
}

export async function updateBanner(input: BannerFormInput & { id: string }): Promise<void> {
  const supabase = await getSupabaseServerClient()
  const { error } = await supabase.from("site_banners").update({
    title: input.title,
    subtitle: input.subtitle,
    description: input.description,
    image_url: input.imageUrl,
    button_text: input.buttonText,
    button_url: input.buttonUrl,
    badge_text: input.badgeText,
    placement: input.placement,
    is_active: input.isActive,
    starts_at: input.startsAt || null,
    ends_at: input.endsAt || null,
    sort_order: input.sortOrder,
    updated_at: new Date().toISOString(),
  }).eq("id", input.id)
  if (error) throw new Error(`Failed to update banner: ${error.message}`)
}

export async function deleteBanner(id: string): Promise<void> {
  const supabase = await getSupabaseServerClient()
  const { error } = await supabase.from("site_banners").delete().eq("id", id)
  if (error) throw new Error(`Failed to delete banner: ${error.message}`)
}

export async function uploadSiteMedia(file: File, path: string): Promise<string> {
  const supabase = await getSupabaseServerClient()
  const upload = await supabase.storage.from(SITE_MEDIA_BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type || "image/webp",
  })
  if (upload.error) throw new Error(`Failed to upload site media: ${upload.error.message}`)
  return supabase.storage.from(SITE_MEDIA_BUCKET).getPublicUrl(path).data.publicUrl
}
