import { getSupabaseServerClient } from "@/lib/supabase/server"

export type LoginResult =
  | { ok: true }
  | { ok: false; message: string }

// Auth service boundary. UI and server actions call this API, not Supabase directly.
// If Supabase Auth is replaced later, keep this service contract and swap the implementation here.
export async function loginAdminWithEmailPassword(email: string, password: string): Promise<LoginResult> {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error || !data.user) {
    return { ok: false, message: "ایمیل یا رمز عبور اشتباه است" }
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", data.user.id)
    .maybeSingle()

  if (profileError) {
    await supabase.auth.signOut()
    return { ok: false, message: "خطا در بررسی دسترسی مدیر" }
  }

  if (profile?.role !== "admin") {
    await supabase.auth.signOut()
    return { ok: false, message: "شما دسترسی مدیر ندارید" }
  }

  return { ok: true }
}
