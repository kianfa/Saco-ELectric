-- Website content management tables for homepage, banners, footer/contact settings.
-- Run this in Supabase SQL Editor before using /admin/content pages.

create table if not exists site_settings (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists homepage_sections (
  id uuid primary key default gen_random_uuid(),
  section_key text unique not null,
  title text,
  subtitle text,
  description text,
  image_url text,
  mobile_image_url text,
  primary_button_text text,
  primary_button_url text,
  secondary_button_text text,
  secondary_button_url text,
  metadata jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists site_banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  description text,
  image_url text,
  button_text text,
  button_url text,
  badge_text text,
  placement text not null,
  is_active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table site_settings enable row level security;
alter table homepage_sections enable row level security;
alter table site_banners enable row level security;

-- Public pages can read active content/settings.
drop policy if exists "Public read site settings" on site_settings;
create policy "Public read site settings"
on site_settings for select to public using (true);

drop policy if exists "Public read active homepage sections" on homepage_sections;
create policy "Public read active homepage sections"
on homepage_sections for select to public using (is_active = true);

drop policy if exists "Public read active site banners" on site_banners;
create policy "Public read active site banners"
on site_banners for select to public using (
  is_active = true
  and (starts_at is null or starts_at <= now())
  and (ends_at is null or ends_at >= now())
);

-- Admin write/read policies. These rely on profiles.id = auth.uid() and profiles.role = 'admin'.
drop policy if exists "Admins manage site settings" on site_settings;
create policy "Admins manage site settings"
on site_settings for all to authenticated
using (exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin'))
with check (exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin'));

drop policy if exists "Admins manage homepage sections" on homepage_sections;
create policy "Admins manage homepage sections"
on homepage_sections for all to authenticated
using (exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin'))
with check (exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin'));

drop policy if exists "Admins manage site banners" on site_banners;
create policy "Admins manage site banners"
on site_banners for all to authenticated
using (exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin'))
with check (exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin'));

-- Storage bucket should be created in the dashboard as public bucket: site-media.
-- Add matching storage policies if uploads fail with RLS:
-- create policy "Public read site media" on storage.objects for select to public using (bucket_id = 'site-media');
-- create policy "Admins upload site media" on storage.objects for insert to authenticated with check (bucket_id = 'site-media' and exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin'));
-- create policy "Admins update site media" on storage.objects for update to authenticated using (bucket_id = 'site-media' and exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin')) with check (bucket_id = 'site-media' and exists (select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin'));

-- Normalize older homepage banner placement names so public homepage and admin use one value.
update site_banners
set placement = 'homepage_promo'
where placement in ('promo_banner', 'homepage_banner', 'home_promo', 'homepage-promo');

create index if not exists idx_site_banners_public_lookup
on site_banners (placement, is_active, sort_order, created_at desc);

-- Optional: use this if you want SQL to create the bucket instead of the dashboard.
-- insert into storage.buckets (id, name, public)
-- values ('site-media', 'site-media', true)
-- on conflict (id) do update set public = true;
