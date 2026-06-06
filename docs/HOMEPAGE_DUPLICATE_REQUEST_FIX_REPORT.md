# Homepage duplicate-request fix

## Scope

This change removes duplicate storefront browser requests without disabling React Strict Mode and without changing Supabase Auth, the database schema, or the local media-storage implementation.

## Confirmed root causes

### Customer status

`Header` rendered `CustomerAuthButton`, and `CustomerAuthButton` owned its own `useEffect()` fetch to `/api/auth/customer/status`.

The global loading shell also rendered a `Header`, while the resolved homepage rendered another `Header`. During a single refresh those component-local effects could run for both mounts. React Strict Mode development replay could amplify the duplicate behavior.

### Footer categories

`Footer` owned its own `useEffect()` fetch to `/api/public/footer-categories`.

The loading shell rendered a `Footer`, and the resolved homepage rendered another `Footer`. React Strict Mode development replay could amplify the requests. The footer endpoint also invoked homepage-category mapping again after the homepage had already loaded categories for its visible category section.

### Category mapping

`getHomepageCategories()` mapped and printed the full category array each time it was called. It was called by the homepage and by each footer-category API request. This created repeated Supabase reads, repeated normalization, and repeated large development logs.

The homepage also independently requested `getSiteSettings()` even though the storefront layout already loaded normalized public settings.

## New architecture

### Shared customer-status source

`CustomerAuthStatusProvider` is mounted once in `app/(storefront)/layout.tsx`.

`CustomerAuthButton` consumes the provider and no longer starts an independent fetch. The provider uses one in-flight request and a 1.5-second browser-only snapshot keyed by pathname so development Strict Mode replay does not send a duplicate request. A pathname change triggers a fresh status read after login or logout navigation.

The provider does not store tokens, cookies, or session objects. It stores only the minimal UI status returned by the API.

### Shared footer categories

`app/(storefront)/layout.tsx` loads footer category links on the server and passes them through `PublicFooterCategoriesProvider`.

`Footer` consumes those links and no longer calls `/api/public/footer-categories` from the browser. The API route remains available for compatibility and diagnostics but is not used by the storefront UI.

### Cached category loading

`lib/services/categories-service.ts` now uses stable explicit cache keys:

```txt
public-categories-v1
public-homepage-categories-v1
```

Both caches use:

```txt
revalidate: 300
tag: public-categories
```

React request-scoped memoization deduplicates same-request server callers. The cross-request cache avoids repeated Supabase reads until controlled revalidation.

Category mutations call:

```ts
revalidateTag("public-categories", "max")
```

### Timeout behavior

Public category queries receive the existing external-request abort signal. If Supabase is temporarily unavailable, public category loaders return an empty list and existing footer fallback links remain visible. Authentication checks do not use this public-data fallback.

## Request tracing

Enable temporarily:

```env
DEBUG_PERFORMANCE=true
```

Expected safe trace examples:

```txt
[trace] customer-status request started requestId=...
[trace] customer-status auth.getUser started requestId=...
[trace] customer-status auth.getUser completed requestId=... durationMs=...
[trace] footer-categories request started requestId=...
[trace] fetchHomepageCategories caller=storefront-layout:homepage
[trace] fetchHomepageCategories caller=homepage-page
```

Tracing does not log cookies, tokens, credentials, session objects, personal data, database URLs, or filesystem paths.

## Dependency-free structural audit

Run:

```bash
pnpm debug:homepage-request-sources
```

Expected output:

```txt
customer-status browser fetch call sites: 1
footer-categories browser fetch call sites: 0
legacy verbose homepage log strings in audited sources: 0
```

## Runtime verification on the configured host

Run development mode:

```bash
DEBUG_PERFORMANCE=true pnpm dev
```

Refresh `/` once and record:

```txt
GET /
GET /api/auth/customer/status
GET /api/public/footer-categories
[perf] homepage categories mapped
```

Then run production mode:

```bash
pnpm build
DEBUG_PERFORMANCE=true pnpm start
```

Refresh `/` once again and record the same values.

Expected application-level counts after this patch:

```txt
GET /                                           1
GET /api/auth/customer/status                   1
GET /api/public/footer-categories               0
[perf] homepage categories mapped               1 per cache miss or controlled revalidation
```

A manual request to `/api/public/footer-categories` remains supported and is traced separately.

## Image compatibility

This patch does not alter URL normalization or upload behavior. New local URLs under `/uploads/...` and legacy Supabase-hosted URLs continue to render as before. No signed URL generation was added.
