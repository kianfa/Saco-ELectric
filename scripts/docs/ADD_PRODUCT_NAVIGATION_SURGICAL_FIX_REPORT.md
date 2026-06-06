# Add-product navigation surgical fix

## Scope

This patch changes only the navigation entry points from `/admin/products` to the existing create-product route `/admin/products/new` and adds guarded destination diagnostics. It does not change product form submission, database inserts, image uploads, local storage, Supabase Storage compatibility, or authentication architecture.

## Route

The existing filesystem route is:

```txt
app/admin/(protected)/products/new/page.tsx
```

The browser URL is:

```txt
/admin/products/new
```

## Navigation change

The populated-table toolbar, empty state, and error fallback now render direct `next/link` anchors. They do not use `Button asChild`, Radix `Slot`, `router.push`, `useTransition`, `startTransition`, manual loading state, `preventDefault`, or form submission.

`prefetch={false}` is intentional for these links so clicking initiates an unambiguous route request during diagnosis.

## Guarded server logs

Set:

```env
DEBUG_PERFORMANCE=true
```

Expected protected-layout logs:

```txt
[admin-protected-layout] render started
[admin-protected-layout] auth check started
[admin-protected-layout] auth check completed
```

Expected destination-page logs:

```txt
[add-product-page] render started
[add-product-page] categories load started
[add-product-page] brands load started
[add-product-page] categories load completed
[add-product-page] brands load completed
[add-product-page] render completed durationMs=...
```

No secrets are logged.

## Manual browser verification

1. Sign in as an admin.
2. Open `/admin/products`.
3. Click the Persian add-product link once.
4. Confirm a request starts for `/admin/products/new` and the URL changes.
5. Open `/admin/products/new` directly and confirm it renders.
6. Inspect the console logs above when `DEBUG_PERFORMANCE=true`.

The route-level loading fallback remains synchronous and network-free and shows:

```txt
در حال آماده‌سازی فرم محصول...
```
