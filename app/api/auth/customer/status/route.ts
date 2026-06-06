import { NextResponse } from "next/server"
import { getMinimalCustomerStatusWithTrace } from "@/lib/auth/session"
import { createRequestTraceId, traceLog, withRequestTraceTiming } from "@/lib/performance/request-tracing"

export const dynamic = "force-dynamic"

export async function GET() {
  const requestId = createRequestTraceId()
  traceLog(`customer-status request started requestId=${requestId}`)

  try {
    const status = await withRequestTraceTiming("customer-status route logic", requestId, () =>
      getMinimalCustomerStatusWithTrace(requestId),
    )
    const response = await withRequestTraceTiming("customer-status response serialization", requestId, async () =>
      NextResponse.json(status, {
        headers: { "Cache-Control": "private, no-store" },
      }),
    )
    traceLog(`customer-status request completed requestId=${requestId} authenticated=${status.authenticated}`)
    return response
  } catch {
    // Authentication timeouts and failures are never treated as authenticated.
    traceLog(`customer-status request completed requestId=${requestId} authenticated=false fallback=true`)
    return NextResponse.json(
      { authenticated: false, user: null },
      { headers: { "Cache-Control": "private, no-store" } },
    )
  }
}
