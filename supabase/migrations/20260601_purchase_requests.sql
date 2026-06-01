-- Purchase callback requests from checkout.
-- Public users submit through the controlled SECURITY DEFINER RPC only.
-- Direct table access remains admin-only because phone numbers are private.

begin;

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
    where id = auth.uid()
      and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

create or replace function public.generate_purchase_request_number()
returns text
language sql
volatile
set search_path = public
as $$
  select 'REQ-' || to_char(clock_timestamp(), 'YYMMDDHH24MISSMS') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 4));
$$;

create table if not exists public.purchase_requests (
  id uuid primary key default gen_random_uuid(),
  request_number text not null unique default public.generate_purchase_request_number(),
  customer_name text not null,
  phone text not null,
  description text,
  preferred_contact_time text,
  preferred_contact_time_note text,
  source text not null default 'checkout',
  status text not null default 'new' check (status in (
    'new',
    'contacted',
    'message_sent_waiting_response',
    'follow_up_required',
    'price_confirmed',
    'waiting_for_payment',
    'payment_received',
    'completed',
    'cancelled'
  )),
  estimated_total numeric(14,0) not null default 0,
  admin_note text,
  next_follow_up_at timestamptz,
  last_contacted_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.purchase_request_items (
  id uuid primary key default gen_random_uuid(),
  purchase_request_id uuid not null references public.purchase_requests(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  product_model text,
  product_sku text,
  brand_name text,
  quantity int not null check (quantity > 0),
  unit_price numeric(14,0) not null check (unit_price >= 0),
  total_price numeric(14,0) not null check (total_price >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.purchase_request_activities (
  id uuid primary key default gen_random_uuid(),
  purchase_request_id uuid not null references public.purchase_requests(id) on delete cascade,
  action text not null,
  note text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists purchase_requests_created_at_idx on public.purchase_requests(created_at desc);
create index if not exists purchase_requests_status_idx on public.purchase_requests(status);
create index if not exists purchase_requests_phone_idx on public.purchase_requests(phone);
create index if not exists purchase_requests_next_follow_up_at_idx on public.purchase_requests(next_follow_up_at);
create index if not exists purchase_request_items_request_id_idx on public.purchase_request_items(purchase_request_id);
create index if not exists purchase_request_activities_request_id_idx on public.purchase_request_activities(purchase_request_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_purchase_requests_updated_at on public.purchase_requests;
create trigger set_purchase_requests_updated_at
before update on public.purchase_requests
for each row execute function public.set_updated_at();

alter table public.purchase_requests enable row level security;
alter table public.purchase_request_items enable row level security;
alter table public.purchase_request_activities enable row level security;

-- Remove only policies created by this migration so reruns are safe.
drop policy if exists "admins manage purchase requests" on public.purchase_requests;
drop policy if exists "admins manage purchase request items" on public.purchase_request_items;
drop policy if exists "admins manage purchase request activities" on public.purchase_request_activities;

create policy "admins manage purchase requests"
on public.purchase_requests
for all
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "admins manage purchase request items"
on public.purchase_request_items
for all
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "admins manage purchase request activities"
on public.purchase_request_activities
for all
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

-- Public checkout callback RPC.
-- Prices are recalculated inside PostgreSQL from active products; browser prices are ignored.
-- Direct anon INSERT/SELECT/UPDATE/DELETE policies are intentionally not created.
-- Drop first because older deployments returned uuid and PostgreSQL cannot alter a return type with CREATE OR REPLACE.
drop function if exists public.create_purchase_request(text, text, text, text, text, jsonb);

create function public.create_purchase_request(
  p_customer_name text,
  p_phone text,
  p_description text default null,
  p_preferred_contact_time text default 'در اولین فرصت',
  p_preferred_contact_time_note text default null,
  p_items jsonb default '[]'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request_id uuid;
  v_request_number text;
  v_created_at timestamptz;
  v_item jsonb;
  v_product record;
  v_quantity int;
  v_estimated_total numeric(14,0) := 0;
begin
  if char_length(trim(coalesce(p_customer_name, ''))) < 2 then
    raise exception 'invalid_customer_name';
  end if;

  if trim(coalesce(p_phone, '')) !~ '^09[0-9]{9}$' then
    raise exception 'invalid_phone';
  end if;

  if jsonb_typeof(coalesce(p_items, '[]'::jsonb)) <> 'array' then
    raise exception 'invalid_cart';
  end if;

  if jsonb_array_length(coalesce(p_items, '[]'::jsonb)) = 0 then
    raise exception 'empty_cart';
  end if;

  -- Lightweight anti-spam / accidental duplicate protection.
  -- A stronger IP-aware limiter or Turnstile can be added later at the API edge.
  if exists (
    select 1
    from public.purchase_requests
    where phone = trim(p_phone)
      and source = 'checkout'
      and created_at > now() - interval '90 seconds'
  ) then
    raise exception 'duplicate_request';
  end if;

  insert into public.purchase_requests (
    customer_name,
    phone,
    description,
    preferred_contact_time,
    preferred_contact_time_note,
    source,
    status,
    estimated_total
  ) values (
    trim(p_customer_name),
    trim(p_phone),
    nullif(trim(coalesce(p_description, '')), ''),
    coalesce(nullif(trim(coalesce(p_preferred_contact_time, '')), ''), 'در اولین فرصت'),
    nullif(trim(coalesce(p_preferred_contact_time_note, '')), ''),
    'checkout',
    'new',
    0
  ) returning id, request_number, created_at into v_request_id, v_request_number, v_created_at;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    begin
      v_quantity := greatest(1, least(100, (v_item ->> 'quantity')::int));
    exception when others then
      raise exception 'invalid_quantity';
    end;

    select
      p.id,
      p.name,
      p.model,
      p.sku,
      p.price,
      b.name as brand_name
    into v_product
    from public.products p
    left join public.brands b on b.id = p.brand_id
    where p.id = (v_item ->> 'productId')::uuid
      and coalesce(p.is_active, true) = true;

    if not found then
      raise exception 'invalid_or_inactive_product';
    end if;

    insert into public.purchase_request_items (
      purchase_request_id,
      product_id,
      product_name,
      product_model,
      product_sku,
      brand_name,
      quantity,
      unit_price,
      total_price
    ) values (
      v_request_id,
      v_product.id,
      v_product.name,
      v_product.model,
      v_product.sku,
      v_product.brand_name,
      v_quantity,
      greatest(0, coalesce(v_product.price, 0)),
      greatest(0, coalesce(v_product.price, 0)) * v_quantity
    );

    v_estimated_total := v_estimated_total + greatest(0, coalesce(v_product.price, 0)) * v_quantity;
  end loop;

  update public.purchase_requests
  set estimated_total = v_estimated_total
  where id = v_request_id;

  insert into public.purchase_request_activities (purchase_request_id, action)
  values (v_request_id, 'درخواست تماس از صفحه تسویه‌حساب ثبت شد');

  return jsonb_build_object(
    'id', v_request_id,
    'requestNumber', v_request_number,
    'createdAt', v_created_at
  );
end;
$$;

revoke all on function public.create_purchase_request(text, text, text, text, text, jsonb) from public;
grant execute on function public.create_purchase_request(text, text, text, text, text, jsonb) to anon, authenticated;

commit;
