-- Incremental upgrade for the two-path checkout finalization UX.
-- Adds a public-safe tracking number and upgrades the controlled callback RPC.

begin;

create or replace function public.generate_purchase_request_number()
returns text
language sql
volatile
set search_path = public
as $$
  select 'REQ-' || to_char(clock_timestamp(), 'YYMMDDHH24MISSMS') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 4));
$$;

alter table public.purchase_requests
  add column if not exists request_number text;

update public.purchase_requests
set request_number = public.generate_purchase_request_number()
where request_number is null or btrim(request_number) = '';

alter table public.purchase_requests
  alter column request_number set default public.generate_purchase_request_number(),
  alter column request_number set not null;

create unique index if not exists purchase_requests_request_number_uidx
  on public.purchase_requests(request_number);

-- PostgreSQL cannot change a function return type with CREATE OR REPLACE.
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
