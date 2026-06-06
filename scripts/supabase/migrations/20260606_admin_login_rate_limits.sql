-- Persistent brute-force protection for /admin/login.
-- Keys are SHA-256 hashes of IP address + normalized email; raw IP addresses are not stored.

create table if not exists public.admin_login_rate_limits (
  key text primary key,
  attempt_count integer not null default 0,
  window_started_at timestamptz not null
);

create index if not exists admin_login_rate_limits_window_started_at_idx
  on public.admin_login_rate_limits (window_started_at);

comment on table public.admin_login_rate_limits is
  'Persistent admin-login attempt windows keyed by a SHA-256 digest of IP address and normalized email.';

alter table public.admin_login_rate_limits enable row level security;
revoke all on table public.admin_login_rate_limits from public, anon, authenticated;
