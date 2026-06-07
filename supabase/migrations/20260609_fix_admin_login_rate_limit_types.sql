-- Repair and harden the PostgreSQL-backed /admin/login limiter schema.
-- Safe to run after 20260607_admin_login_rate_limits.sql.
-- Existing rows are preserved when their values can be cast safely.

alter table if exists public.admin_login_rate_limits
  add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'admin_login_rate_limits'
      and column_name = 'attempt_count'
      and data_type <> 'integer'
  ) then
    alter table public.admin_login_rate_limits
      alter column attempt_count type integer
      using attempt_count::integer;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'admin_login_rate_limits'
      and column_name = 'window_started_at'
      and data_type <> 'timestamp with time zone'
  ) then
    alter table public.admin_login_rate_limits
      alter column window_started_at type timestamptz
      using window_started_at::timestamptz;
  end if;
end $$;

create index if not exists idx_admin_login_rate_limits_window_started_at
  on public.admin_login_rate_limits (window_started_at);
