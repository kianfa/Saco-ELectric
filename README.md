# v0-industrial-electrical-homepage

This is a [Next.js](https://nextjs.org) project bootstrapped with [v0](https://v0.app).

## Built with v0

This repository is linked to a [v0](https://v0.app) project. You can continue developing by visiting the link below -- start new chats to make changes, and v0 will push commits directly to this repo. Every merge to `main` will automatically deploy.

[Continue working on v0 →](https://v0.app/chat/projects/prj_sc7WcPoiD3OAFuKCAw0MvUBrVrZt)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Learn More

To learn more, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [v0 Documentation](https://v0.app/docs) - learn about v0 and how to use it.

<a href="https://v0.app/chat/api/kiro/clone/kianfa/v0-industrial-electrical-homepage" alt="Open in Kiro"><img src="https://pdgvvgmkdvyeydso.public.blob.vercel-storage.com/open%20in%20kiro.svg?sanitize=true" /></a>


## Dynamic sitemap and robots.txt

Configure the canonical public deployment URL:

```env
NEXT_PUBLIC_SITE_URL=https://example.com
```

Set this to the real production domain in deployment. Next.js dynamically generates `/sitemap.xml` and `/robots.txt` from `app/sitemap.ts` and `app/robots.ts`; do not add a physical XML file. The sitemap includes real public storefront routes, active product pages, and active category destinations using the existing filtered-products URL pattern. Successful admin product and category mutations invalidate the sitemap cache automatically. Private `/admin/`, `/account/`, `/auth/`, and `/api/` routes are excluded from crawler access.

## Host filesystem media storage

Supabase temporarily remains the PostgreSQL/PostgREST provider for application tables only. Runtime authentication is handled exclusively by Better Auth. New image uploads are saved on the hosting server and their public `/uploads/...` URLs are stored in the database.

Configure production with an absolute persistent directory:

```env
MEDIA_UPLOAD_DIR=/home/USERNAME/public_html/uploads
NEXT_PUBLIC_MEDIA_BASE_URL=/uploads
```

`MEDIA_UPLOAD_DIR` must be a permanent writable directory. The Node.js process must have write permission, and your web server must expose that directory from the URL prefix configured by `NEXT_PUBLIC_MEDIA_BASE_URL`. Do not point the setting at an ephemeral serverless filesystem.

For local development only, omitting `MEDIA_UPLOAD_DIR` falls back to `public/uploads` inside the project. `NEXT_PUBLIC_MEDIA_BASE_URL` defaults to `/uploads`.

Legacy Supabase-hosted image URLs and older plain `site-media/...` paths remain supported for display. Only new uploads use host filesystem paths such as `/uploads/products/product-slug/image-uuid.webp` and `/uploads/site-media/banners/banner-123.webp`.

Supabase Storage buckets are not required for new uploads. Do not configure Storage write policies for the new media pipeline. Existing buckets may remain available only so legacy image URLs continue to display.

For an existing Supabase deployment, apply `supabase/migrations/20260604_disable_supabase_storage_writes.sql` to remove historical Storage insert, update, and delete policies. It intentionally keeps read-only compatibility for legacy hosted images.

## Performance diagnostics

Admin login routes intentionally use a minimal root layout and do not fetch storefront settings. Storefront routes load cached public settings from `app/(storefront)/layout.tsx` with a 60-second revalidation window. Protected admin pages perform an authoritative Better Auth session check and `profiles.role = 'admin'` verification in the protected server layout and in protected Server Actions.

To print concise server-side timings temporarily:

```env
DEBUG_PERFORMANCE=true
```

Timing logs never include passwords, cookies, tokens, session objects, database URLs, or keys. Disable the flag after diagnosis.

Measure Supabase network latency independently from Next.js rendering:

```bash
pnpm debug:supabase-latency
```

The diagnostic script reports repeated DNS and lightweight Supabase table-query timings with min, max, and average durations. It does not call Supabase Auth endpoints or print credentials.

Compare development and production behavior:

```bash
pnpm dev
pnpm build
pnpm start
```

Then request:

```txt
/admin/login
/admin/products
/api/auth/customer/status
```

Apply the reviewed non-destructive performance index migration manually after taking a database backup:

```txt
supabase/migrations/20260605_optimize_admin_performance.sql
```

## Homepage duplicate-request diagnostics

The storefront shares customer auth status and footer categories through layout-level providers so the loading shell and resolved page do not independently refetch the same data. For the audit details and runtime verification commands, see `docs/HOMEPAGE_DUPLICATE_REQUEST_FIX_REPORT.md`.

Run the dependency-free structural check with:

```bash
pnpm debug:homepage-request-sources
```


## Admin new-product route diagnostics

For a dependency-free source audit of `/admin/products/new`, run:

```bash
pnpm debug:admin-new-product-route
```

Enable temporary server-stage logging with:

```env
DEBUG_PERFORMANCE=true
EXTERNAL_REQUEST_TIMEOUT_MS=20000
AUTH_REQUEST_TIMEOUT_MS=25000
PUBLIC_DATA_TIMEOUT_MS=20000
ADMIN_MUTATION_TIMEOUT_MS=30000
FILE_OPERATION_TIMEOUT_MS=15000
```


## Runtime timeout profiles for slow networks

The application keeps bounded timeout protection while allowing slower hosting connections. Configure these values in production:

```env
EXTERNAL_REQUEST_TIMEOUT_MS=20000
AUTH_REQUEST_TIMEOUT_MS=25000
PUBLIC_DATA_TIMEOUT_MS=20000
ADMIN_MUTATION_TIMEOUT_MS=30000
FILE_OPERATION_TIMEOUT_MS=15000
```

Timeout purposes:

- `EXTERNAL_REQUEST_TIMEOUT_MS`: default fallback for external requests without a more specific profile.
- `AUTH_REQUEST_TIMEOUT_MS`: Better Auth session validation and authenticated profile lookups.
- `PUBLIC_DATA_TIMEOUT_MS`: public storefront reads such as settings, categories, banners, and footer data.
- `ADMIN_MUTATION_TIMEOUT_MS`: protected admin create, update, delete, and toggle operations.
- `FILE_OPERATION_TIMEOUT_MS`: local filesystem media directory creation, writes, replacement cleanup, and deletes.

Missing, non-numeric, unreasonably small, or excessively large values fall back to safe bounded defaults. Timeouts are never unlimited. Compatible Supabase PostgREST requests receive abort signals so timed-out network work is cancelled rather than left running in the background.

## Better Auth authentication

Runtime authentication is handled by Better Auth with PostgreSQL-backed sessions and secure HTTP-only cookies. Supabase remains temporarily in use for application-table queries through PostgREST, but not for login, registration, logout, session reads, password reset, cookie handling, or new media storage. Replace the remaining `supabase.from(...)` calls with direct PostgreSQL queries or an ORM when moving the application database to the self-hosted PostgreSQL server.

Required server environment values:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE
BETTER_AUTH_SECRET=replace-with-a-long-random-secret-at-least-32-characters
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=https://example.com
SUPABASE_SECRET_KEY=your-server-only-supabase-secret-key
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=
MEDIA_UPLOAD_DIR=./public/uploads
NEXT_PUBLIC_MEDIA_BASE_URL=/uploads
```

Back up the PostgreSQL database, then apply:

```bash
psql "$DATABASE_URL" -f supabase/migrations/20260606_replace_supabase_auth_with_better_auth.sql
```

Create the first admin with environment variables and `npm run auth:create-admin`. See `docs/BETTER_AUTH_CUTOVER.md` for the cutover and future PostgreSQL-host move instructions.
