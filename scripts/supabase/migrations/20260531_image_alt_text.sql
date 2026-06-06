-- Adds optional ALT text fields for manageable public images.
-- Safe to run multiple times.

alter table public.categories
  add column if not exists homepage_image_alt_text text,
  add column if not exists homepage_icon_alt_text text;

alter table public.site_banners
  add column if not exists image_alt_text text;

comment on column public.categories.homepage_image_alt_text is
  'Accessible ALT text for the homepage category card image.';

comment on column public.categories.homepage_icon_alt_text is
  'Accessible ALT text for the homepage category icon fallback.';

comment on column public.site_banners.image_alt_text is
  'Accessible ALT text for the public banner image.';
