"use server"

import { redirect } from "next/navigation"
import { loginAdminWithEmailPassword } from "@/lib/services/auth-service"
import { signOutAdmin } from "@/lib/auth/admin-auth"

export type LoginActionState = {
  ok: boolean
  message: string
}

export async function loginAdminAction(_prevState: LoginActionState, formData: FormData): Promise<LoginActionState> {
  const email = String(formData.get("email") ?? "").trim()
  const password = String(formData.get("password") ?? "")

  if (!email || !password) {
    return { ok: false, message: "ایمیل و رمز عبور الزامی است" }
  }

  const result = await loginAdminWithEmailPassword(email, password)
  if (!result.ok) return { ok: false, message: result.message }

  redirect("/admin/products")
}

export async function logoutAdminAction() {
  await signOutAdmin()
  redirect("/admin/login")
}
