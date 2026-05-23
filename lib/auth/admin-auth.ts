import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export type AdminProfile = {
  id: string
  fullName: string | null
  phone: string | null
  role: string | null
}

export type AdminSessionUser = {
  id: string
  email: string | null
  fullName: string | null
  role: string | null
}

function mapProfile(row: { id: string; full_name: string | null; phone: string | null; role: string | null } | null): AdminProfile | null {
  if (!row) return null
  return {
    id: row.id,
    fullName: row.full_name,
    phone: row.phone,
    role: row.role,
  }
}

export async function getCurrentAdminUser(): Promise<AdminSessionUser | null> {
  const supabase = await getSupabaseServerClient()
  const { data: userResult, error: userError } = await supabase.auth.getUser()

  if (userError || !userResult.user) return null

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, phone, role")
    .eq("id", userResult.user.id)
    .maybeSingle()

  if (profileError) {
    throw new Error(`Failed to read profile: ${profileError.message}`)
  }

  const mappedProfile = mapProfile(profile)
  if (mappedProfile?.role !== "admin") return null

  return {
    id: userResult.user.id,
    email: userResult.user.email ?? null,
    fullName: mappedProfile.fullName,
    role: mappedProfile.role,
  }
}

export async function requireAdminAccess(): Promise<AdminSessionUser> {
  const admin = await getCurrentAdminUser()
  if (!admin) {
    redirect("/admin/login")
  }
  return admin
}

export async function signOutAdmin(): Promise<void> {
  const supabase = await getSupabaseServerClient()
  await supabase.auth.signOut()
}
