-- Free-form product variants with server-authoritative prices.
-- Products without active variants continue to use products.price unchanged.

begin;

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  label text not null check (btrim(label) <> ''),
  price numeric not null check (price >= 0),
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_product_variants_product_id
  on public.product_variants(product_id);

create unique index if not exists idx_product_variants_product_label_unique
  on public.product_variants(product_id, lower(btrim(label)));

alter table public.product_variants enable row level security;

drop policy if exists "public reads active product variants" on public.product_variants;
create policy "public reads active product variants"
  on public.product_variants for select
  to anon, authenticated
  using (is_active = true);

grant select on public.product_variants to anon, authenticated;

alter table public.purchase_request_items
  add column if not exists variant_id uuid references public.product_variants(id) on delete set null,
  add column if not exists variant_label text;

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
  v_variant record;
  v_variant_id uuid;
  v_variant_label text;
  v_unit_price numeric(14,0);
  v_quantity int;
  v_estimated_total numeric(14,0) := 0;
begin
  if char_length(trim(coalesce(p_customer_name, ''))) < 2 then raise exception 'invalid_customer_name'; end if;
  if trim(coalesce(p_phone, '')) !~ '^09[0-9]{9}$' then raise exception 'invalid_phone'; end if;
  if jsonb_typeof(coalesce(p_items, '[]'::jsonb)) <> 'array' then raise exception 'invalid_cart'; end if;
  if jsonb_array_length(coalesce(p_items, '[]'::jsonb)) = 0 then raise exception 'empty_cart'; end if;

  if exists (select 1 from public.purchase_requests where phone = trim(p_phone) and source = 'checkout' and created_at > now() - interval '90 seconds') then
    raise exception 'duplicate_request';
  end if;

  insert into public.purchase_requests (customer_name, phone, description, preferred_contact_time, preferred_contact_time_note, source, status, estimated_total)
  values (trim(p_customer_name), trim(p_phone), nullif(trim(coalesce(p_description, '')), ''), coalesce(nullif(trim(coalesce(p_preferred_contact_time, '')), ''), 'در اولین فرصت'), nullif(trim(coalesce(p_preferred_contact_time_note, '')), ''), 'checkout', 'new', 0)
  returning id, request_number, created_at into v_request_id, v_request_number, v_created_at;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    begin
      v_quantity := greatest(1, least(100, (v_item ->> 'quantity')::int));
    exception when others then raise exception 'invalid_quantity'; end;

    select p.id, p.name, p.model, p.sku, p.price, b.name as brand_name
    into v_product
    from public.products p
    left join public.brands b on b.id = p.brand_id
    where p.id = (v_item ->> 'productId')::uuid and coalesce(p.is_active, true) = true;
    if not found then raise exception 'invalid_or_inactive_product'; end if;

    v_variant_id := null;
    v_variant_label := null;
    v_unit_price := greatest(0, coalesce(v_product.price, 0));

    if exists (select 1 from public.product_variants pv where pv.product_id = v_product.id and pv.is_active = true) then
      begin v_variant_id := nullif(v_item ->> 'variantId', '')::uuid;
      exception when others then raise exception 'invalid_variant'; end;
      if v_variant_id is null then raise exception 'variant_required'; end if;
      select pv.id, pv.label, pv.price into v_variant
      from public.product_variants pv
      where pv.id = v_variant_id and pv.product_id = v_product.id and pv.is_active = true;
      if not found then raise exception 'invalid_or_inactive_variant'; end if;
      v_variant_label := v_variant.label;
      v_unit_price := greatest(0, coalesce(v_variant.price, 0));
    elsif nullif(v_item ->> 'variantId', '') is not null then
      raise exception 'invalid_variant';
    end if;

    insert into public.purchase_request_items (purchase_request_id, product_id, product_name, product_model, product_sku, variant_id, variant_label, brand_name, quantity, unit_price, total_price)
    values (v_request_id, v_product.id, v_product.name, v_product.model, v_product.sku, v_variant_id, v_variant_label, v_product.brand_name, v_quantity, v_unit_price, v_unit_price * v_quantity);
    v_estimated_total := v_estimated_total + v_unit_price * v_quantity;
  end loop;

  update public.purchase_requests set estimated_total = v_estimated_total where id = v_request_id;
  insert into public.purchase_request_activities (purchase_request_id, action) values (v_request_id, 'درخواست تماس از صفحه تسویه‌حساب ثبت شد');
  return jsonb_build_object('id', v_request_id, 'requestNumber', v_request_number, 'createdAt', v_created_at);
end;
$$;

revoke all on function public.create_purchase_request(text, text, text, text, text, jsonb) from public;
grant execute on function public.create_purchase_request(text, text, text, text, text, jsonb) to anon, authenticated;

commit;
