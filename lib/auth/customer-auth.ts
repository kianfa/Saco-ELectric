import { cache } from "react"
import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { getAuthenticatedUserWithProfile, getMinimalCustomerStatus } from "@/lib/auth/session"
import { withServerTiming } from "@/lib/performance/server-timing"

export type CustomerSessionUser = {
  id: string
  email: string | null
  fullName: string | null
  phone: string | null
  role: string | null
}

export const getCurrentCustomerUser = cache(async (): Promise<CustomerSessionUser | null> =>
  withServerTiming("getCurrentCustomerUser", async () => {
    const user = await getAuthenticatedUserWithProfile()
    if (!user) return null
    return user
  }),
)

export { getMinimalCustomerStatus }

export const requireCustomerAccess = cache(async (): Promise<CustomerSessionUser> => {
  const user = await getCurrentCustomerUser()
  if (!user) redirect("/auth/login")
  return user
})

export async function signOutCustomer(): Promise<void> {
  const supabase = await getSupabaseServerClient()
  await withServerTiming("supabase.auth.signOut.customer", () => supabase.auth.signOut().then(() => undefined))
}
