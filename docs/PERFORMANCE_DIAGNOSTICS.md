# Server-side performance diagnostics

Set `DEBUG_PERFORMANCE=true` temporarily to print concise timings. The logs intentionally exclude cookies, access tokens, session objects, keys, passwords, database URLs, filesystem paths, and customer profile values.

Optional timeout configuration:

```env
DEBUG_PERFORMANCE=true
EXTERNAL_REQUEST_TIMEOUT_MS=20000
SUPABASE_LATENCY_RUNS=5
SUPABASE_LATENCY_CONCURRENCY=3
```

Expected storefront settings labels include:

```txt
[perf] getPublicSiteSettings requested by storefront-layout
[perf] start site settings lookup timeout=20000ms
[perf] success site settings lookup 123ms
[perf] timeout site settings lookup after 20000ms configured=20000ms
[perf] failure site settings lookup <safe message>
[perf] success getPublicSiteSettings storefront-layout 125ms
```

Expected customer-status labels include:

```txt
[perf] start customer status route logic
[perf] start customer auth cookie presence
[perf] success customer auth cookie presence 1ms
[perf] start create Supabase server client
[perf] start supabase.auth.getUser timeout=20000ms
[perf] start minimal customer profile lookup timeout=20000ms
[perf] success customer status response serialization 1ms
```

For anonymous customers, the status route should stop after the cookie-presence check and skip the remote Auth and profile calls.

Run the network-only diagnostic separately:

```bash
pnpm debug:supabase-latency
```

It reports sequential and small-concurrency parallel measurements for DNS, the Supabase Auth settings endpoint, the exact filtered public `site_settings` query, and a minimal public database query. It reports min, max, median, average, timeout count, and safe error summaries.

Compare development and production requests after configuring `.env.local`:

```bash
pnpm dev
pnpm build
pnpm start
```

Then request `/`, `/admin/login`, `/admin/products`, and `/api/auth/customer/status` three times each. Compare first-request compilation or cache-miss latency against second and third requests. Keep `DEBUG_PERFORMANCE=false` during normal production operation.
