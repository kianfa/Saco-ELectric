-- Homepage category cards management.
-- Run this after the existing site content/security migrations.

alter table public.categories
  add column if not exists homepage_title text,
  add column if not exists homepage_image_url text,
  add column if not exists homepage_icon_url text,
  add column if not exists homepage_url text,
  add column if not exists show_on_homepage boolean not null default true,
  add column if not exists homepage_sort_order int not null default 0,
  add column if not exists is_active boolean not null default true,
  add column if not exists updated_at timestamptz not null default now();

create index if not exists categories_homepage_visibility_idx
  on public.categories (is_active, show_on_homepage, homepage_sort_order, name);

insert into public.homepage_sections (
  section_key,
  title,
  subtitle,
  description,
  metadata,
  is_active,
  sort_order,
  created_at,
  updated_at
)
values (
  'homepage_categories',
  'دسته‌بندی تجهیزات',
  'انتخاب سریع تجهیزات برق صنعتی بر اساس دسته‌بندی',
  null,
  '{}'::jsonb,
  true,
  1,
  now(),
  now()
)
on conflict (section_key) do update
set
  title = coalesce(homepage_sections.title, excluded.title),
  subtitle = coalesce(homepage_sections.subtitle, excluded.subtitle),
  updated_at = now();

alter table public.categories enable row level security;
alter table public.homepage_sections enable row level security;

-- Keep policies compatible with the security hardening migration.
drop policy if exists "Public read categories" on public.categories;
create policy "Public read categories"
on public.categories
for select
to public
using (true);

drop policy if exists "Admins manage categories" on public.categories;
create policy "Admins manage categories"
on public.categories
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public read active homepage sections" on public.homepage_sections;
create policy "Public read active homepage sections"
on public.homepage_sections
for select
to public
using (is_active = true);

drop policy if exists "Admins manage homepage sections" on public.homepage_sections;
create policy "Admins manage homepage sections"
on public.homepage_sections
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

grant select on public.categories, public.homepage_sections to anon, authenticated;
grant select, insert, update, delete on public.categories, public.homepage_sections to authenticated;
