import "server-only"

import { cache } from "react"
import { headers } from "next/headers"
import { auth } from "@/lib/auth/better-auth"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { withAuthRequestTimeout } from "@/lib/performance/server-timing"
import { withRequestTraceTiming } from "@/lib/performance/request-tracing"

export type ProfileRow = { id: string; full_name: string | null; phone: string | null; role: string | null }
type MinimalProfileRow = { full_name: string | null }
export type AuthenticatedUserWithProfile = { id: string; email: string | null; fullName: string | null; phone: string | null; role: string | null }

const getBetterAuthSession = cache(async () =>
  withAuthRequestTimeout("better-auth.getSession", async () => auth.api.getSession({ headers: await headers() })),
)

export const getAuthenticatedUserWithProfile = cache(async (): Promise<AuthenticatedUserWithProfile | null> => {
  const session = await getBetterAuthSession()
  if (!session?.user) return null

  const supabase = await getSupabaseServerClient()
  const profileResult = await withAuthRequestTimeout("profiles lookup", (signal) =>
    supabase.from("profiles").select("id, full_name, phone, role").eq("id", session.user.id).abortSignal(signal).maybeSingle<ProfileRow>(),
  )
  if (profileResult.error) throw new Error(`Failed to read profile: ${profileResult.error.message}`)

  return {
    id: session.user.id,
    email: session.user.email ?? null,
    fullName: profileResult.data?.full_name ?? null,
    phone: profileResult.data?.phone ?? null,
    role: profileResult.data?.role ?? null,
  }
})

async function readMinimalCustomerStatus(requestId?: string) {
  const loadSession = () => getBetterAuthSession()
  const session = requestId
    ? await withRequestTraceTiming("customer-status better-auth.getSession", requestId, loadSession)
    : await loadSession()
  if (!session?.user) return { authenticated: false as const, user: null }

  const supabase = await getSupabaseServerClient()
  const loadProfile = () => withAuthRequestTimeout("minimal customer profile lookup", (signal) =>
    supabase.from("profiles").select("full_name").eq("id", session.user.id).abortSignal(signal).maybeSingle<MinimalProfileRow>(),
  )
  const profileResult = requestId
    ? await withRequestTraceTiming("customer-status profile lookup", requestId, loadProfile)
    : await loadProfile()
  if (profileResult.error) throw new Error(`Failed to read minimal customer profile: ${profileResult.error.message}`)

  return { authenticated: true as const, user: { id: session.user.id, fullName: profileResult.data?.full_name ?? null } }
}

export const getMinimalCustomerStatus = cache(async () => readMinimalCustomerStatus())
export async function getMinimalCustomerStatusWithTrace(requestId: string) { return readMinimalCustomerStatus(requestId) }
