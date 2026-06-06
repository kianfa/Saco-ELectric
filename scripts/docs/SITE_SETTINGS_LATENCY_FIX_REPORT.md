# Site settings and customer-status latency fix report

## Confirmed call sites

Runtime call sites for cached public site settings after the fix:

1. `app/(storefront)/layout.tsx` calls `getPublicSiteSettings("storefront-layout")`.
2. `lib/services/site-settings-service.ts` exposes compatibility helpers `getContactInfo()`, `getFooterInfo()`, and `getManualCheckoutSettings()`. No current app route imports these helpers directly.

The global root layout, admin pages, admin layouts, and `/api/auth/customer/status` do not import or call public storefront settings.

## Cache behavior

Next.js `unstable_cache` internally includes the stringified callback in cache identity. The application does not manually add `function.toString()` to the key. The loader now uses the explicit stable key part `public-site-settings-v2`, a 300-second revalidation period, and the tag `public-site-settings`.

Settings updates retain `revalidateTag("public-site-settings", "max")` for Next.js 16 stale-while-revalidate invalidation.

## Query optimization

The public settings loader now performs one filtered request only:

```ts
supabase
  .from("site_settings")
  .select("key,value")
  .in("key", ["contact_info", "site_contact", "site_info", "footer_info", "manual_checkout"])
```

`site_settings.key` is already declared `UNIQUE` in `supabase/migrations/20260526_site_content.sql`, so PostgreSQL already creates the supporting unique index. No additional index migration is needed.

## Timeout handling

The public request uses a configurable timeout (`EXTERNAL_REQUEST_TIMEOUT_MS`, default 20000 ms), receives an `AbortSignal`, and falls back to safe public defaults during a transient outage. Authentication does not use this fallback.

## Customer status

**Historical implementation note, no longer active:** an earlier revision checked a Supabase session cookie and called the Supabase Auth user endpoint. The current implementation checks the Better Auth cookie and validates the Better Auth session server-side before querying only `profiles.full_name` for the header status payload.

## Local production measurements

Measured with `DEBUG_PERFORMANCE=true`, `next build`, and `next start`, without Supabase credentials configured in the sandbox:

| Route | First request | Second request | Third request |
| --- | ---: | ---: | ---: |
| `/admin/login?next=%2Fadmin%2Fproducts` | 1006 ms | 61 ms | 63 ms |
| `/api/auth/customer/status` (anonymous) | 43 ms | 16 ms | 16 ms |
| `/admin/products` (anonymous proxy redirect) | 10 ms | 8 ms | 9 ms |
| `/` (storefront fallback/cache) | 168 ms | 51 ms | 53 ms |

Storefront settings loader timings:

| Scenario | Duration |
| --- | ---: |
| first local fallback/cache population | 71 ms |
| cache hit | 2 ms |
| cache hit | 2 ms |

These local values prove the route separation and cache-hit path. Raw Supabase latency, authenticated status latency, and authenticated `/admin/products` latency must be measured on the configured deployment with `pnpm debug:supabase-latency` because this sandbox does not have the project Supabase URL or anonymous key.

## Verification

- `pnpm exec tsc --noEmit`: passed.
- `pnpm build`: passed with exit code 0.
- `pnpm lint`: could not start because the existing project declares `eslint .` but does not include `eslint` or an ESLint configuration file. This is a pre-existing tooling gap, not a lint finding introduced by this change.
- Runtime source scan: no active Supabase Storage client calls. New media writes use the host filesystem.
- Runtime source scan: no public site-settings imports under `app/admin` or `app/api`.
