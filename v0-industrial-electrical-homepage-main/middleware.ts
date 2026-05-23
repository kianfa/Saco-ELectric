import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

// Lightweight admin gate for /admin routes.
// The protected admin route layout still performs the authoritative server-side role check.
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!pathname.startsWith("/admin") || pathname.startsWith("/admin/login")) {
    return NextResponse.next()
  }

  let response = NextResponse.next({ request })
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return response
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      },
    },
  })

  const { data: userResult } = await supabase.auth.getUser()
  if (!userResult.user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = "/admin/login"
    loginUrl.searchParams.set("next", pathname)
    return NextResponse.redirect(loginUrl)
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userResult.user.id)
    .maybeSingle()

  if (profile?.role !== "admin") {
    await supabase.auth.signOut()
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = "/admin/login"
    loginUrl.searchParams.set("error", "access-denied")
    return NextResponse.redirect(loginUrl)
  }

  return response
}

export const config = {
  matcher: ["/admin/:path*"],
}
