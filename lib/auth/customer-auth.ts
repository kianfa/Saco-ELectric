import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export type CustomerSessionUser = {
  id: string
  email: string | null
  fullName: string | null
  phone: string | null
  role: string | null
}

type ProfileRow = {
  id: string
  full_name: string | null
  phone: string | null
  role: string | null
}

export async function getCurrentCustomerUser(): Promise<CustomerSessionUser | null> {
  const supabase = await getSupabaseServerClient()
  const { data: userResult, error: userError } = await supabase.auth.getUser()

  if (userError || !userResult.user) return null

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, phone, role")
    .eq("id", userResult.user.id)
    .maybeSingle<ProfileRow>()

  if (profileError) {
    throw new Error(`Failed to read customer profile: ${profileError.message}`)
  }

  return {
    id: userResult.user.id,
    email: userResult.user.email ?? null,
    fullName: profile?.full_name ?? null,
    phone: profile?.phone ?? null,
    role: profile?.role ?? null,
  }
}

export async function requireCustomerAccess(): Promise<CustomerSessionUser> {
  const user = await getCurrentCustomerUser()
  if (!user) redirect("/auth/login")
  return user
}

export async function signOutCustomer(): Promise<void> {
  const supabase = await getSupabaseServerClient()
  await supabase.auth.signOut()
}
