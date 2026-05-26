-- Admin bulk price update audit tables.
-- Run this in Supabase SQL Editor before using /admin/products/bulk-price-update.

create table if not exists admin_price_update_logs (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid null references auth.users(id) on delete set null,
  change_type text not null,
  percent numeric not null,
  target_type text not null,
  target_value text null,
  affected_count int not null default 0,
  rounding_mode text null,
  old_price_behavior text null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists product_price_history (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  old_price numeric(12,0),
  new_price numeric(12,0),
  changed_by uuid null references auth.users(id) on delete set null,
  reason text,
  created_at timestamptz not null default now()
);

alter table admin_price_update_logs enable row level security;
alter table product_price_history enable row level security;

drop policy if exists "Admins read price update logs" on admin_price_update_logs;
create policy "Admins read price update logs"
on admin_price_update_logs
for select
to authenticated
using (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin'));

drop policy if exists "Admins insert price update logs" on admin_price_update_logs;
create policy "Admins insert price update logs"
on admin_price_update_logs
for insert
to authenticated
with check (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin'));

drop policy if exists "Admins read product price history" on product_price_history;
create policy "Admins read product price history"
on product_price_history
for select
to authenticated
using (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin'));

drop policy if exists "Admins insert product price history" on product_price_history;
create policy "Admins insert product price history"
on product_price_history
for insert
to authenticated
with check (exists (select 1 from public.profiles where profiles.id = auth.uid() and profiles.role = 'admin'));
