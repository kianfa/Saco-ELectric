export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  homepageTitle: string | null
  homepageImageUrl: string | null
  homepageIconUrl: string | null
  /** Resolved display image for public homepage cards: homepageImageUrl -> imageUrl -> homepageIconUrl. */
  displayImageUrl: string | null
  homepageUrl: string | null
  showOnHomepage: boolean
  homepageSortOrder: number
  isActive: boolean
}

export interface HomepageCategorySectionSettings {
  title: string
  subtitle: string
  isActive: boolean
}

export interface AdminCategoryHomepageSettingsInput {
  id: string
  name?: string | null
  slug: string
  homepageTitle?: string | null
  homepageImageUrl?: string | null
  homepageIconUrl?: string | null
  homepageUrl?: string | null
  showOnHomepage: boolean
  homepageSortOrder: number
  isActive: boolean
}

export interface CategoryActionState {
  ok: boolean
  message: string
}
