import "server-only"

import { cache } from "react"
import { cookies } from "next/headers"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { withAuthRequestTimeout, withServerTiming } from "@/lib/performance/server-timing"
import { traceLog, withRequestTraceTiming } from "@/lib/performance/request-tracing"

export type ProfileRow = {
  id: string
  full_name: string | null
  phone: string | null
  role: string | null
}

type MinimalProfileRow = {
  full_name: string | null
}

export type AuthenticatedUserWithProfile = {
  id: string
  email: string | null
  fullName: string | null
  phone: string | null
  role: string | null
}

function isSupabaseAuthCookieName(name: string): boolean {
  return name.startsWith("sb-") && name.includes("auth-token")
}

// Fast negative path for anonymous visitors. This never authorizes a request;
// it only avoids a remote Supabase Auth request when no auth cookie exists.
export const hasSupabaseAuthCookie = cache(async (): Promise<boolean> => {
  const cookieStore = await cookies()
  return cookieStore.getAll().some(({ name, value }) => isSupabaseAuthCookieName(name) && Boolean(value))
})

async function readVerifiedSupabaseUser(requestId?: string) {
  const hasAuthCookie = requestId
    ? await withRequestTraceTiming("customer-status auth-cookie check", requestId, () => hasSupabaseAuthCookie())
    : await withServerTiming("customer auth cookie presence", () => hasSupabaseAuthCookie())

  if (!hasAuthCookie) {
    if (requestId) traceLog(`customer-status anonymous fast-path requestId=${requestId}`)
    return null
  }

  const supabase = requestId
    ? await withRequestTraceTiming("customer-status create Supabase client", requestId, () => getSupabaseServerClient())
    : await withServerTiming("create Supabase server client", () => getSupabaseServerClient())

  const loadUser = () => withAuthRequestTimeout("supabase.auth.getUser", () => supabase.auth.getUser())
  const userResult = requestId
    ? await withRequestTraceTiming("customer-status auth.getUser", requestId, loadUser)
    : await loadUser()

  if (userResult.error || !userResult.data.user) return null
  return { supabase, user: userResult.data.user }
}

const getVerifiedSupabaseUser = cache(async () => readVerifiedSupabaseUser())

// Request-scoped memoization: protected layout and nested admin components can
// safely share one authoritative auth.getUser() + profile lookup per request.
export const getAuthenticatedUserWithProfile = cache(async (): Promise<AuthenticatedUserWithProfile | null> => {
  const verified = await getVerifiedSupabaseUser()
  if (!verified) return null

  const profileResult = await withAuthRequestTimeout(
    "profiles lookup",
    (signal) =>
      verified.supabase
        .from("profiles")
        .select("id, full_name, phone, role")
        .eq("id", verified.user.id)
        .abortSignal(signal)
        .maybeSingle<ProfileRow>(),
  )

  if (profileResult.error) {
    throw new Error(`Failed to read profile: ${profileResult.error.message}`)
  }

  return {
    id: verified.user.id,
    email: verified.user.email ?? null,
    fullName: profileResult.data?.full_name ?? null,
    phone: profileResult.data?.phone ?? null,
    role: profileResult.data?.role ?? null,
  }
})

async function readMinimalCustomerStatus(requestId?: string) {
  const verified = requestId ? await readVerifiedSupabaseUser(requestId) : await getVerifiedSupabaseUser()
  if (!verified) return { authenticated: false as const, user: null }

  const loadProfile = () =>
    withAuthRequestTimeout(
      "minimal customer profile lookup",
      (signal) =>
        verified.supabase
          .from("profiles")
          .select("full_name")
          .eq("id", verified.user.id)
          .abortSignal(signal)
          .maybeSingle<MinimalProfileRow>(),
    )

  const profileResult = requestId
    ? await withRequestTraceTiming("customer-status profile lookup", requestId, loadProfile)
    : await loadProfile()

  if (profileResult.error) {
    throw new Error(`Failed to read minimal customer profile: ${profileResult.error.message}`)
  }

  return {
    authenticated: true as const,
    user: {
      id: verified.user.id,
      fullName: profileResult.data?.full_name ?? null,
    },
  }
}

export const getMinimalCustomerStatus = cache(async () => readMinimalCustomerStatus())

// API route diagnostic entry point. It deliberately avoids the request-scoped
// cache so trace timings describe the one actual auth validation done by that
// endpoint request.
export async function getMinimalCustomerStatusWithTrace(requestId: string) {
  return readMinimalCustomerStatus(requestId)
}
