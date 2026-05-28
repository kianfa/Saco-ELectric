import { getSupabaseServerClient } from "@/lib/supabase/server"

export type LoginResult =
  | { ok: true }
  | { ok: false; message: string }

export type CustomerRegisterInput = {
  fullName: string
  phone: string
  email: string
  password: string
}

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

export async function loginCustomerWithEmailPassword(email: string, password: string): Promise<LoginResult> {
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
    return { ok: false, message: "خطا در بررسی حساب کاربری" }
  }

  if (profile?.role === "admin") {
    await supabase.auth.signOut()
    return { ok: false, message: "برای ورود مدیر از صفحه ورود مدیر استفاده کنید." }
  }

  if (!profile) {
    await supabase.from("profiles").insert({
      id: data.user.id,
      full_name: data.user.user_metadata?.full_name ?? null,
      phone: data.user.user_metadata?.phone ?? null,
      role: "customer",
    })
  }

  return { ok: true }
}

export async function registerCustomerWithEmailPassword(input: CustomerRegisterInput): Promise<LoginResult> {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        full_name: input.fullName,
        phone: input.phone,
        role: "customer",
      },
    },
  })

  if (error || !data.user) {
    return { ok: false, message: error?.message ?? "خطا در ایجاد حساب کاربری" }
  }

  // Public registration must never create admins. The role is hardcoded to customer.
  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: data.user.id,
      full_name: input.fullName,
      phone: input.phone,
      role: "customer",
    },
    { onConflict: "id" }
  )

  if (profileError) {
    return {
      ok: false,
      message:
        "حساب کاربری ایجاد شد اما ذخیره پروفایل انجام نشد. اگر تایید ایمیل فعال است، پس از تایید ایمیل دوباره وارد شوید.",
    }
  }

  return { ok: true }
}

export async function sendCustomerPasswordResetEmail(email: string): Promise<LoginResult> {
  const supabase = await getSupabaseServerClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/login`,
  })

  if (error) return { ok: false, message: "ارسال لینک بازیابی رمز عبور انجام نشد" }
  return { ok: true }
}
