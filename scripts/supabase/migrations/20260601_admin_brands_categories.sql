-- Admin CRUD support for brands and categories.
-- Run once in Supabase SQL Editor before using /admin/brands or /admin/categories.

begin;

alter table public.brands
  add column if not exists description text,
  add column if not exists logo_url text,
  add column if not exists logo_alt_text text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists is_active boolean not null default true,
  add column if not exists updated_at timestamptz not null default now();

alter table public.categories
  add column if not exists description text,
  add column if not exists image_url text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists parent_id uuid null,
  add column if not exists image_alt_text text,
  add column if not exists homepage_image_url text,
  add column if not exists homepage_icon_url text,
  add column if not exists homepage_image_alt_text text,
  add column if not exists homepage_icon_alt_text text,
  add column if not exists homepage_title text,
  add column if not exists homepage_url text,
  add column if not exists show_on_homepage boolean not null default true,
  add column if not exists homepage_sort_order integer not null default 0,
  add column if not exists is_active boolean not null default true,
  add column if not exists updated_at timestamptz not null default now();

-- Add parent FK only when it has not already been created.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'categories_parent_id_fkey'
      and conrelid = 'public.categories'::regclass
  ) then
    alter table public.categories
      add constraint categories_parent_id_fkey
      foreign key (parent_id) references public.categories(id) on delete set null;
  end if;
end $$;

create index if not exists brands_slug_idx on public.brands(slug);
create index if not exists categories_slug_idx on public.categories(slug);
create index if not exists categories_parent_id_idx on public.categories(parent_id);

-- Reuse the existing admin helper when available. Create it safely when absent.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

alter table public.brands enable row level security;
alter table public.categories enable row level security;

drop policy if exists "public read brands" on public.brands;
drop policy if exists "public read active brands" on public.brands;
drop policy if exists "admin manage brands" on public.brands;
drop policy if exists "admins manage brands" on public.brands;
create policy "public read active brands"
on public.brands for select
to anon, authenticated
using (is_active = true);
create policy "admins manage brands"
on public.brands for all
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

drop policy if exists "public read categories" on public.categories;
drop policy if exists "public read active categories" on public.categories;
drop policy if exists "admin manage categories" on public.categories;
drop policy if exists "admins manage categories" on public.categories;
create policy "public read active categories"
on public.categories for select
to anon, authenticated
using (is_active = true);
create policy "admins manage categories"
on public.categories for all
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

commit;
