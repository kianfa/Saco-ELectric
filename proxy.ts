import { NextResponse, type NextRequest } from "next/server"

function hasSupabaseAuthCookie(request: NextRequest): boolean {
  return request.cookies.getAll().some(({ name, value }) => {
    return name.startsWith("sb-") && name.includes("auth-token") && Boolean(value)
  })
}

// Lightweight cookie-presence gate only. It deliberately performs no network or
// database request. Protected layouts and Server Actions remain authoritative.
export function proxy(request: NextRequest) {
  const startedAt = performance.now()
  const { pathname } = request.nextUrl

  if (!pathname.startsWith("/admin") || pathname.startsWith("/admin/login")) {
    return NextResponse.next()
  }

  if (!hasSupabaseAuthCookie(request)) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = "/admin/login"
    loginUrl.searchParams.set("next", pathname)
    if (process.env.DEBUG_PERFORMANCE === "true") {
      console.log("[perf] proxy.ts", Math.round(performance.now() - startedAt), "ms")
    }
    return NextResponse.redirect(loginUrl)
  }

  if (process.env.DEBUG_PERFORMANCE === "true") {
    console.log("[perf] proxy.ts", Math.round(performance.now() - startedAt), "ms")
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
