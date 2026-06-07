import { headers } from "next/headers"
import { auth } from "@/lib/auth/better-auth"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export type LoginResult = { ok: true } | { ok: false; message: string }
export type CustomerRegisterInput = { fullName: string; phone: string; email: string; password: string }

async function signOutCurrentSession(): Promise<void> {
  try { await auth.api.signOut({ headers: await headers() }) } catch { /* no active session */ }
}

export async function loginAdminWithEmailPassword(email: string, password: string): Promise<LoginResult> {
  try {
    const result = await auth.api.signInEmail({ body: { email, password }, headers: await headers() })
    const supabase = await getSupabaseServerClient()
    const { data: profile, error } = await supabase.from("profiles").select("id, role").eq("id", result.user.id).maybeSingle()
    if (error) { await signOutCurrentSession(); return { ok: false, message: "خطا در بررسی دسترسی مدیر" } }
    if (profile?.role !== "admin") { await signOutCurrentSession(); return { ok: false, message: "شما دسترسی مدیر ندارید" } }
    return { ok: true }
  } catch {
    return { ok: false, message: "ایمیل یا رمز عبور اشتباه است" }
  }
}

export async function loginCustomerWithEmailPassword(email: string, password: string): Promise<LoginResult> {
  try {
    const result = await auth.api.signInEmail({ body: { email, password }, headers: await headers() })
    const supabase = await getSupabaseServerClient()
    const { data: profile, error } = await supabase.from("profiles").select("id, role").eq("id", result.user.id).maybeSingle()
    if (error) { await signOutCurrentSession(); return { ok: false, message: "خطا در بررسی حساب کاربری" } }
    if (profile?.role === "admin") { await signOutCurrentSession(); return { ok: false, message: "برای ورود مدیر از صفحه ورود مدیر استفاده کنید." } }
    if (!profile) {
      const { error: insertError } = await supabase.from("profiles").insert({ id: result.user.id, full_name: result.user.name ?? null, phone: null, role: "customer" })
      if (insertError) { await signOutCurrentSession(); return { ok: false, message: "خطا در آماده‌سازی حساب کاربری" } }
    }
    return { ok: true }
  } catch {
    return { ok: false, message: "ایمیل یا رمز عبور اشتباه است" }
  }
}

export async function registerCustomerWithEmailPassword(input: CustomerRegisterInput): Promise<LoginResult> {
  try {
    const result = await auth.api.signUpEmail({ body: { name: input.fullName, email: input.email, password: input.password }, headers: await headers() })
    const supabase = await getSupabaseServerClient()
    const { error } = await supabase.from("profiles").upsert({ id: result.user.id, full_name: input.fullName, phone: input.phone, role: "customer" }, { onConflict: "id" })
    if (error) { await signOutCurrentSession(); return { ok: false, message: "حساب کاربری ایجاد شد اما ذخیره پروفایل انجام نشد. لطفاً دوباره تلاش کنید." } }
    return { ok: true }
  } catch {
    return { ok: false, message: "ایجاد حساب کاربری انجام نشد. لطفاً اطلاعات را بررسی کنید." }
  }
}

export async function sendCustomerPasswordResetEmail(email: string): Promise<LoginResult> {
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.BETTER_AUTH_URL || "http://localhost:3000"
    await auth.api.requestPasswordReset({ body: { email, redirectTo: `${siteUrl}/auth/reset-password` } })
  } catch {
    // Always return the same response to avoid revealing whether an email exists.
  }
  return { ok: true }
}

export async function resetCustomerPassword(token: string, password: string): Promise<LoginResult> {
  try {
    await auth.api.resetPassword({ body: { token, newPassword: password } })
    return { ok: true }
  } catch {
    return { ok: false, message: "لینک بازیابی نامعتبر یا منقضی شده است." }
  }
}
