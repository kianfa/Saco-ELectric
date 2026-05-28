import { NextResponse } from "next/server"
import { getCurrentCustomerUser } from "@/lib/auth/customer-auth"

export async function GET() {
  const user = await getCurrentCustomerUser()
  return NextResponse.json({
    isLoggedIn: Boolean(user),
    user: user
      ? {
          email: user.email,
          fullName: user.fullName,
          phone: user.phone,
        }
      : null,
  })
}
