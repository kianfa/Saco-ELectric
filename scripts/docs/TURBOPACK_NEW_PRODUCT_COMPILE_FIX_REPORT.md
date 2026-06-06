# Turbopack `/admin/products/new` compile fix

## Confirmed import boundary

`components/admin/product-form.tsx` is a Client Component. It previously imported these Server Action modules directly:

- `@/lib/actions/admin-products-actions`
- `@/lib/actions/admin-brand-actions`
- `@/lib/actions/admin-category-actions`

The product action tree expands through:

`admin-products-actions -> admin-products-service -> admin-products-repository -> local-media-storage -> node:fs/promises, node:path, node:crypto`

Webpack completed the route compilation, but Turbopack remained at `Compiling /admin/products/new ...` while traversing this mixed client/server import graph.

## Fix

`ProductForm` now accepts Server Action references as serializable Server Action props. The Server Components for new and edit product pages import the actions and pass the references into the Client Component. The form UI and submission behavior remain unchanged.

## Verification commands

```bash
npm install
npm run debug:turbopack-new-product-imports
npm run dev
npm run dev -- --webpack
npm run build
```

Open `/admin/products/new` in both development modes.
