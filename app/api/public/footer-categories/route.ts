import { NextResponse } from "next/server"
import { getHomepageCategories, getCategories } from "@/lib/services/categories-service"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const homepageCategories = await getHomepageCategories().catch(() => [])
    const source = homepageCategories.length ? homepageCategories : await getCategories().catch(() => [])

    const categories = source
      .filter((category) => category.isActive !== false)
      .slice(0, 8)
      .map((category) => ({
        name: category.homepageTitle || category.name,
        slug: category.slug,
        href: category.homepageUrl || `/products?category=${encodeURIComponent(category.slug)}`,
      }))

    return NextResponse.json({ categories })
  } catch {
    return NextResponse.json({ categories: [] })
  }
}
