-- Supabase security hardening for Saco Electric.
-- Run this after the existing site content and bulk price migrations.
-- It enables RLS, removes unsafe anon write policies, and restricts writes/uploads to profiles.role = 'admin'.

-- 1) Helper functions -------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- 2) Profiles hardening -----------------------------------------------------
alter table if exists public.profiles enable row level security;

-- Keep the role system explicit. This is safe if the constraint already exists.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_role_allowed_values'
  ) then
    alter table public.profiles
      add constraint profiles_role_allowed_values
      check (role in ('admin', 'customer'));
  end if;
exception
  when undefined_table then null;
end $$;

-- Ensure profiles.id can be linked to auth.users if it is not already.
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'profiles')
     and not exists (select 1 from pg_constraint where conname = 'profiles_id_auth_users_fkey') then
    alter table public.profiles
      add constraint profiles_id_auth_users_fkey
      foreign key (id) references auth.users(id) on delete cascade;
  end if;
exception
  when duplicate_object then null;
end $$;

drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile"
on public.profiles
for select
to authenticated
using (id = auth.uid() or public.is_admin());

drop policy if exists "Users update own non-role profile" on public.profiles;
create policy "Users update own non-role profile"
on public.profiles
for update
to authenticated
using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

-- 3) Public catalog tables --------------------------------------------------
alter table if exists public.brands enable row level security;
alter table if exists public.categories enable row level security;
alter table if exists public.products enable row level security;
alter table if exists public.product_images enable row level security;
alter table if exists public.product_specs enable row level security;
alter table if exists public.inventory enable row level security;

drop policy if exists "Public read brands" on public.brands;
create policy "Public read brands"
on public.brands for select to public using (true);

drop policy if exists "Admins manage brands" on public.brands;
create policy "Admins manage brands"
on public.brands for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Public read categories" on public.categories;
create policy "Public read categories"
on public.categories for select to public using (true);

drop policy if exists "Admins manage categories" on public.categories;
create policy "Admins manage categories"
on public.categories for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Public read active products" on public.products;
create policy "Public read active products"
on public.products for select to public using (is_active = true);

drop policy if exists "Admins manage products" on public.products;
create policy "Admins manage products"
on public.products for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Public read product images" on public.product_images;
create policy "Public read product images"
on public.product_images for select to public using (
  exists (
    select 1 from public.products
    where products.id = product_images.product_id
      and products.is_active = true
  )
);

drop policy if exists "Admins manage product images" on public.product_images;
create policy "Admins manage product images"
on public.product_images for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Public read product specs" on public.product_specs;
create policy "Public read product specs"
on public.product_specs for select to public using (
  exists (
    select 1 from public.products
    where products.id = product_specs.product_id
      and products.is_active = true
  )
);

drop policy if exists "Admins manage product specs" on public.product_specs;
create policy "Admins manage product specs"
on public.product_specs for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Public read safe inventory" on public.inventory;
create policy "Public read safe inventory"
on public.inventory for select to public using (
  exists (
    select 1 from public.products
    where products.id = inventory.product_id
      and products.is_active = true
  )
);

drop policy if exists "Admins manage inventory" on public.inventory;
create policy "Admins manage inventory"
on public.inventory for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- 4) Homepage/content/settings ---------------------------------------------
alter table if exists public.site_settings enable row level security;
alter table if exists public.homepage_sections enable row level security;
alter table if exists public.site_banners enable row level security;

drop policy if exists "Public read site settings" on public.site_settings;
create policy "Public read site settings"
on public.site_settings for select to public using (
  key in ('contact_info', 'social_links', 'manual_checkout', 'footer_info')
);

drop policy if exists "Admins manage site settings" on public.site_settings;
create policy "Admins manage site settings"
on public.site_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Public read active homepage sections" on public.homepage_sections;
create policy "Public read active homepage sections"
on public.homepage_sections for select to public using (is_active = true);

drop policy if exists "Admins manage homepage sections" on public.homepage_sections;
create policy "Admins manage homepage sections"
on public.homepage_sections for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Public read active site banners" on public.site_banners;
create policy "Public read active site banners"
on public.site_banners for select to public using (
  is_active = true
  and (starts_at is null or starts_at <= now())
  and (ends_at is null or ends_at >= now())
);

drop policy if exists "Admins manage site banners" on public.site_banners;
create policy "Admins manage site banners"
on public.site_banners for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- 5) Admin logs/history -----------------------------------------------------
alter table if exists public.admin_price_update_logs enable row level security;
alter table if exists public.product_price_history enable row level security;

drop policy if exists "Admins manage price update logs" on public.admin_price_update_logs;
create policy "Admins manage price update logs"
on public.admin_price_update_logs for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins manage product price history" on public.product_price_history;
create policy "Admins manage product price history"
on public.product_price_history for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- 6) Future private/customer tables ----------------------------------------
-- These policies are conditional so the migration is safe before order tables exist.
-- If a future table has a user_id column, normal users can read/manage their own rows
-- and admins can manage all rows. Tables without user_id remain admin-only here.
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='orders') then
    execute 'alter table public.orders enable row level security';
    execute 'drop policy if exists "Users read own orders, admins read all" on public.orders';
    execute 'drop policy if exists "Admins manage orders" on public.orders';
    if exists (select 1 from information_schema.columns where table_schema='public' and table_name='orders' and column_name='user_id') then
      execute 'create policy "Users read own orders, admins read all" on public.orders for select to authenticated using (public.is_admin() or user_id = auth.uid())';
    end if;
    execute 'create policy "Admins manage orders" on public.orders for all to authenticated using (public.is_admin()) with check (public.is_admin())';
  end if;

  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='order_items') then
    execute 'alter table public.order_items enable row level security';
    execute 'drop policy if exists "Admins manage order items" on public.order_items';
    execute 'create policy "Admins manage order items" on public.order_items for all to authenticated using (public.is_admin()) with check (public.is_admin())';
  end if;

  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='payments') then
    execute 'alter table public.payments enable row level security';
    execute 'drop policy if exists "Admins manage payments" on public.payments';
    execute 'create policy "Admins manage payments" on public.payments for all to authenticated using (public.is_admin()) with check (public.is_admin())';
  end if;

  if exists (select 1 from information_schema.tables where table_schema='public' and table_name='addresses') then
    execute 'alter table public.addresses enable row level security';
    execute 'drop policy if exists "Users manage own addresses, admins manage all" on public.addresses';
    if exists (select 1 from information_schema.columns where table_schema='public' and table_name='addresses' and column_name='user_id') then
      execute 'create policy "Users manage own addresses, admins manage all" on public.addresses for all to authenticated using (public.is_admin() or user_id = auth.uid()) with check (public.is_admin() or user_id = auth.uid())';
    else
      execute 'create policy "Users manage own addresses, admins manage all" on public.addresses for all to authenticated using (public.is_admin()) with check (public.is_admin())';
    end if;
  end if;
end $$;

-- 7) Storage hardening ------------------------------------------------------
-- Remove old broad/anon upload policies created during local testing.
drop policy if exists "Allow upload product images" on storage.objects;
drop policy if exists "Allow update product images" on storage.objects;
drop policy if exists "Allow delete product images" on storage.objects;
drop policy if exists "Allow admin upload site media" on storage.objects;
drop policy if exists "Allow admin update site media" on storage.objects;
drop policy if exists "Allow admin delete site media" on storage.objects;
drop policy if exists "Admin upload site media" on storage.objects;
drop policy if exists "Admin update site media" on storage.objects;
drop policy if exists "Admin delete site media" on storage.objects;
drop policy if exists "Admins upload site media" on storage.objects;
drop policy if exists "Admins update site media" on storage.objects;
drop policy if exists "Admins delete site media" on storage.objects;

drop policy if exists "Public read product images bucket" on storage.objects;
create policy "Public read product images bucket"
on storage.objects
for select
to public
using (bucket_id = 'product-images');

drop policy if exists "Public read site media bucket" on storage.objects;
create policy "Public read site media bucket"
on storage.objects
for select
to public
using (bucket_id = 'site-media');

drop policy if exists "Admins upload public media buckets" on storage.objects;
create policy "Admins upload public media buckets"
on storage.objects
for insert
to authenticated
with check (
  bucket_id in ('product-images', 'site-media')
  and public.is_admin()
);

drop policy if exists "Admins update public media buckets" on storage.objects;
create policy "Admins update public media buckets"
on storage.objects
for update
to authenticated
using (
  bucket_id in ('product-images', 'site-media')
  and public.is_admin()
)
with check (
  bucket_id in ('product-images', 'site-media')
  and public.is_admin()
);

drop policy if exists "Admins delete public media buckets" on storage.objects;
create policy "Admins delete public media buckets"
on storage.objects
for delete
to authenticated
using (
  bucket_id in ('product-images', 'site-media')
  and public.is_admin()
);

-- 8) Recommended grants -----------------------------------------------------
-- Supabase APIs need grants plus RLS policies. Keep anon mostly read-only.
grant usage on schema public to anon, authenticated;
grant select on public.brands, public.categories, public.products, public.product_images, public.product_specs, public.inventory to anon, authenticated;
grant select on public.site_settings, public.homepage_sections, public.site_banners to anon, authenticated;
grant select, insert, update, delete on public.brands, public.categories, public.products, public.product_images, public.product_specs, public.inventory to authenticated;
grant select, insert, update, delete on public.site_settings, public.homepage_sections, public.site_banners to authenticated;
grant select, insert, update, delete on public.admin_price_update_logs, public.product_price_history to authenticated;
