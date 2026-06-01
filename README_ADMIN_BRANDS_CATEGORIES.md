# Admin brands and categories

Run this migration once in Supabase SQL Editor:

`supabase/migrations/20260601_admin_brands_categories.sql`

Admin routes:

- `/admin/brands`
- `/admin/brands/new`
- `/admin/brands/[id]/edit`
- `/admin/categories`
- `/admin/categories/new`
- `/admin/categories/[id]/edit`

Brand logos and category images are uploaded to the existing public `site-media` bucket. Existing Storage RLS must allow authenticated admins to upload/update/delete objects in that bucket.

Product create/edit forms also expose quick-add dialogs for creating a basic brand or category without leaving the form.
