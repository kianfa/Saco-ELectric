import "server-only"

import { createClient, type SupabaseClient } from "@supabase/supabase-js"

let serverDatabaseClient: SupabaseClient | null = null

// Trusted application-server database client. Better Auth sessions do not
// populate Supabase auth.uid(), so protected server actions authorize first and
// then use this server-only client for the existing Supabase database queries.
export async function getSupabaseServerClient(): Promise<SupabaseClient> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !secretKey) {
    throw new Error("Missing Supabase server database environment variables")
  }

  if (!serverDatabaseClient) {
    serverDatabaseClient = createClient(supabaseUrl, secretKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    })
  }

  return serverDatabaseClient
}
