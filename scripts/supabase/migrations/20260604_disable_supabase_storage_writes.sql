-- Disable Supabase Storage writes for the host-backed media pipeline.
--
-- The application stores every new upload in MEDIA_UPLOAD_DIR and writes a
-- public /uploads/... URL to PostgreSQL. Existing Supabase-hosted image URLs
-- remain readable for backward compatibility, so read-only policies may stay.
--
-- Apply this migration to existing deployments after updating the application.

-- Product-image policies used by older project revisions.
drop policy if exists "Allow upload product images" on storage.objects;
drop policy if exists "Allow update product images" on storage.objects;
drop policy if exists "Allow delete product images" on storage.objects;

-- Site-media policies used by older project revisions.
drop policy if exists "Allow admin upload site media" on storage.objects;
drop policy if exists "Allow admin update site media" on storage.objects;
drop policy if exists "Allow admin delete site media" on storage.objects;
drop policy if exists "Admin upload site media" on storage.objects;
drop policy if exists "Admin update site media" on storage.objects;
drop policy if exists "Admin delete site media" on storage.objects;
drop policy if exists "Admins upload site media" on storage.objects;
drop policy if exists "Admins update site media" on storage.objects;
drop policy if exists "Admins delete site media" on storage.objects;

-- Shared write policies created by the former hardening migration.
drop policy if exists "Admins upload public media buckets" on storage.objects;
drop policy if exists "Admins update public media buckets" on storage.objects;
drop policy if exists "Admins delete public media buckets" on storage.objects;

-- Keep public read compatibility for legacy hosted files. These policies do not
-- allow uploads, updates, or deletions through Supabase Storage.
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
