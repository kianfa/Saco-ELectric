export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  homepageTitle: string | null
  homepageImageUrl: string | null
  homepageImageAltText: string | null
  homepageIconUrl: string | null
  homepageIconAltText: string | null
  /** Resolved display image for public homepage cards: homepageImageUrl -> imageUrl -> homepageIconUrl. */
  displayImageUrl: string | null
  /** ALT text resolved for the image currently displayed on public category cards. */
  displayImageAltText: string | null
  homepageUrl: string | null
  showOnHomepage: boolean
  homepageSortOrder: number
  isActive: boolean
  productCount?: number
}

export interface HomepageCategorySectionSettings {
  title: string
  subtitle: string
  isActive: boolean
  productCount?: number
}

export interface AdminCategoryHomepageSettingsInput {
  id: string
  name?: string | null
  slug: string
  homepageTitle?: string | null
  homepageImageUrl?: string | null
  homepageImageAltText?: string | null
  homepageIconUrl?: string | null
  homepageIconAltText?: string | null
  homepageUrl?: string | null
  showOnHomepage: boolean
  homepageSortOrder: number
  isActive: boolean
  productCount?: number
}

export interface CategoryActionState {
  ok: boolean
  message: string
}
