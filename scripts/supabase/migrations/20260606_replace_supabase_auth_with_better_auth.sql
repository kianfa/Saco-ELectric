-- Replace application authentication with Better Auth while keeping Supabase PostgreSQL.
-- BACK UP THE DATABASE BEFORE APPLYING THIS MIGRATION.
-- Old Supabase Auth users are intentionally not migrated. The auth schema is retained
-- temporarily for rollback safety, but application runtime no longer reads it.

create extension if not exists pgcrypto;

create table if not exists public."user" (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  "emailVerified" boolean not null default false,
  image text,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists public.session (
  id uuid primary key default gen_random_uuid(),
  "expiresAt" timestamptz not null,
  token text not null unique,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  "ipAddress" text,
  "userAgent" text,
  "userId" uuid not null references public."user"(id) on delete cascade
);
create index if not exists session_user_id_idx on public.session ("userId");

create table if not exists public.account (
  id uuid primary key default gen_random_uuid(),
  "accountId" text not null,
  "providerId" text not null,
  "userId" uuid not null references public."user"(id) on delete cascade,
  "accessToken" text,
  "refreshToken" text,
  "idToken" text,
  "accessTokenExpiresAt" timestamptz,
  "refreshTokenExpiresAt" timestamptz,
  scope text,
  password text,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  unique ("providerId", "accountId")
);
create index if not exists account_user_id_idx on public.account ("userId");

create table if not exists public.verification (
  id uuid primary key default gen_random_uuid(),
  identifier text not null,
  value text not null,
  "expiresAt" timestamptz not null,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);
create index if not exists verification_identifier_idx on public.verification (identifier);

-- Rewire existing application foreign keys away from auth.users while retaining
-- orphaned historical rows. NOT VALID enforces the new relationship for future
-- inserts and updates without deleting older application records.
do $$
declare
  item record;
  updated_definition text;
begin
  for item in
    select conname, conrelid::regclass as table_name, pg_get_constraintdef(oid) as definition
    from pg_constraint
    where contype = 'f'
      and confrelid = 'auth.users'::regclass
      and connamespace = 'public'::regnamespace
  loop
    updated_definition := replace(item.definition, 'REFERENCES auth.users(id)', 'REFERENCES public."user"(id)');
    execute format('alter table %s drop constraint %I', item.table_name, item.conname);
    execute format('alter table %s add constraint %I %s not valid', item.table_name, item.conname, updated_definition);
  end loop;
end $$;

-- Better Auth sessions do not populate auth.uid(). Protected writes now run only
-- after server-side Better Auth authorization through the server-only Supabase
-- secret-key client. Remove direct DML grants from old Supabase JWT sessions.
do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles','brands','categories','products','product_images','product_specs',
    'inventory','site_banners','site_settings','homepage_categories',
    'admin_bulk_price_jobs','product_price_history','purchase_requests','purchase_request_items'
  ]
  loop
    if to_regclass('public.' || quote_ident(table_name)) is not null then
      execute format('revoke insert, update, delete on table public.%I from authenticated', table_name);
    end if;
  end loop;
end $$;

comment on table public."user" is 'Better Auth users. Application profiles.id matches user.id for new accounts.';
