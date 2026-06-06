# Admin new-product route rendering fix

The route is `app/admin/(protected)/products/new/page.tsx`, exposed as `/admin/products/new`.

## Root cause

The route body was already reduced to the required brand and category option lists, but the Supabase profile and option-list requests were only wrapped in `Promise.race()` timeouts. The underlying PostgREST builders did not receive an `AbortSignal`, so timed-out requests could continue in the background and accumulate across retries. This made direct navigation appear to remain pending even after the timeout path was reached.

## Fix

- Apply `.abortSignal(signal)` to the profile, category-option, and brand-option Supabase builders.
- Keep brand and category option loads parallel.
- Add guarded stage-by-stage `[admin-new-product]` diagnostics.
- Keep the synchronous route loading fallback.
- Add a route-level client error boundary with a Persian retry action.
- Render a safe protected-layout fallback if the authoritative auth request fails or times out; redirects remain preserved.

Enable diagnostics temporarily with `DEBUG_PERFORMANCE=true`.
