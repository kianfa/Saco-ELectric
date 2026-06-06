# Add Product navigation fix

## Confirmed route

The existing create route is:

```txt
app/admin/(protected)/products/new/page.tsx
```

Route groups do not appear in the URL, so the browser destination is:

```txt
/admin/products/new
```

## Root cause

The button wiring was already valid: `AdminProductsTable` renders a single App Router `Link` through the existing Radix `Button asChild` pattern. There is no nested `<button><a>` element and no programmatic navigation state.

The apparent navigation failure was caused by destination rendering latency. The create page loaded the full admin brand and category management datasets (`getAdminBrands()` and `getAdminCategories()`), which include product-count scans and larger management payloads. In addition, the route-level `loading.tsx` rendered the asynchronous `AdminLayout`, so the fallback itself could suspend while waiting for another admin-profile read. That prevented immediate feedback and made the current page appear stuck.

## Fix

- The create page now loads `getAdminBrandOptions()` and `getAdminCategoryOptions()` only.
- Independent option queries run with `Promise.all()`.
- The loading fallback is synchronous and network-free.
- The loading fallback immediately displays `در حال آماده‌سازی فرم محصول...`.
- Destination rendering logs are guarded by `DEBUG_PERFORMANCE=true`.

## Diagnostics

Run:

```bash
pnpm debug:add-product-navigation
```

For temporary server timings:

```env
DEBUG_PERFORMANCE=true
```

Expected destination logs:

```txt
[add-product-page] render started
[add-product-page] initial data load started
[perf] start add-product form options
[perf] success add-product form options ...ms
[add-product-page] initial data load completed durationMs=...
[add-product-page] render completed durationMs=...
```

The protected layout still performs the authoritative admin check and logs its duration through the existing `protected admin layout auth` timer.
