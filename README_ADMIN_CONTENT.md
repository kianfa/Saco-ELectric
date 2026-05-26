# Admin content/media management

This update adds editable homepage/content management while keeping Supabase access out of UI components.

## New admin routes

- `/admin/content`
- `/admin/content/homepage`
- `/admin/content/banners`
- `/admin/content/settings`

## Supabase setup

Run this file in Supabase SQL Editor before saving content:

```txt
supabase/migrations/20260526_site_content.sql
```

Create a public Supabase Storage bucket named:

```txt
site-media
```

Suggested folders are created automatically by upload paths:

```txt
site-media/homepage/hero/hero-main.webp
site-media/homepage/hero/hero-mobile.webp
site-media/banners/promo-main.webp
site-media/footer/trust-badge.webp
```

If Storage upload fails with RLS, add policies for `storage.objects` as described at the bottom of the migration file.

## Architecture

Supabase-specific code is isolated in:

```txt
lib/repositories/site-content-repository.ts
```

UI calls server actions/services only:

```txt
lib/services/site-content-service.ts
lib/actions/site-content-actions.ts
```
