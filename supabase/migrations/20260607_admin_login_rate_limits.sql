-- PostgreSQL-backed admin login rate limit state.
-- Keys are SHA-256 hashes of IP address + normalized email and never store raw IP addresses.

create table if not exists public.admin_login_rate_limits (
  key text primary key,
  attempt_count integer not null default 0 check (attempt_count >= 0),
  window_started_at timestamptz not null
);

create index if not exists idx_admin_login_rate_limits_window_started_at
  on public.admin_login_rate_limits (window_started_at);

comment on table public.admin_login_rate_limits is
  'Server-side admin login rate limit state. The key is a hash of IP address and normalized email.';

comment on column public.admin_login_rate_limits.key is
  'Rate-limit key, e.g. admin-login:<sha256(ip:normalized_email)>. Raw IP addresses are not stored.';
