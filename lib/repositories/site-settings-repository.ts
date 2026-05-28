import { getSupabaseClient } from "@/lib/supabase/client"

type RawSiteSetting = {
  id: string | number
  key: string | null
  value: Record<string, unknown> | null
}

function isMissingTableOrColumn(message: string) {
  const lower = message.toLowerCase()
  return lower.includes("does not exist") || lower.includes("schema cache")
}

// Public read repository. Supabase remains isolated here so this can later be
// replaced with a custom API or another database provider.
export async function fetchPublicSiteSettingsRows(): Promise<Record<string, Record<string, unknown>>> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from("site_settings").select("id,key,value")

  if (error) {
    if (isMissingTableOrColumn(error.message)) return {}
    throw new Error(`Failed to fetch public site settings: ${error.message}`)
  }

  return ((data ?? []) as RawSiteSetting[]).reduce<Record<string, Record<string, unknown>>>((acc, row) => {
    if (row.key) acc[row.key] = row.value ?? {}
    return acc
  }, {})
}
