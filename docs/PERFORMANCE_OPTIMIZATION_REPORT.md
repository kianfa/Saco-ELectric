# Admin latency optimization report

## Baseline supplied with the issue

```txt
GET /admin/login?next=%2Fadmin%2Fproducts 200 in 20.3s
(next.js: 65ms, proxy.ts: 9ms, application-code: 20.2s)
```

## Measured code-path findings

The supplied trace already isolated the delay to application code. Static tracing of the render tree found that `app/layout.tsx` synchronously fetched `site_settings` from Supabase for every route, including `/admin/login`, before rendering any children. The public admin-login page also performed an authenticated user lookup and profile query before rendering the login form.

For `/admin/products`, the protected layout and `AdminLayout` both requested the current admin user. The page also fetched full brand and category management payloads. Those management loaders each scanned the `products` table to compute counts that the product-list filter dropdowns never render.

The customer auth button issued the status request from a client effect. Its response included more profile fields than the button needs.

## Applied changes

- Root layout is network-free. Storefront-only cached settings loading moved to `app/(storefront)/layout.tsx`.
- `/admin/login` no longer performs pre-submit Supabase Auth or profile queries.
- Proxy is a cookie-presence gate only and performs no network request.
- Supabase server client, authenticated profile read, admin read, and admin guard are request-scoped memoized with React `cache()`.
- `/admin/products` uses a slim joined product query and two small filter-option queries in parallel.
- Product-filter brand/category loaders no longer compute unused product counts.
- Customer status returns only `authenticated`, `id`, and `fullName`.
- Concurrent customer-status effect mounts share one in-flight request without retaining stale status after navigation.
- Public storefront settings are cached for 60 seconds and invalidated after settings edits.
- Targeted external calls now have an 8-second timeout and the admin list shows a Persian delay message.
- Added a reviewed, non-destructive `product_images(product_id, sort_order)` index migration.

## Runtime timing procedure

This sandbox does not contain production environment values or access to the configured Supabase project, so post-change HTTP timings must be collected on the target environment. Set:

```env
DEBUG_PERFORMANCE=true
```

Run:

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm build
pnpm start
pnpm debug:supabase-latency
```

Then request:

```txt
/admin/login
/admin/products
/api/auth/customer/status
```

Disable `DEBUG_PERFORMANCE` after collecting the measurements.
