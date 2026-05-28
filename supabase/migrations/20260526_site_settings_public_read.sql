-- Public site settings policies.
-- Contact, footer, and manual checkout settings are intentionally public because
-- they are rendered on public pages. Only admins can write them.

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

alter table if exists public.site_settings enable row level security;

drop policy if exists "Public read site settings" on public.site_settings;
create policy "Public read site settings"
on public.site_settings
for select
to public
using (key in ('contact_info', 'footer_info', 'manual_checkout', 'site_contact', 'site_info', 'social_links'));

drop policy if exists "Admins manage site settings" on public.site_settings;
create policy "Admins manage site settings"
on public.site_settings
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());
