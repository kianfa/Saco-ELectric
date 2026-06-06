# Runtime timeout profiles

The application uses bounded timeout profiles for slow hosting or network connections. No timeout is unlimited.

```env
EXTERNAL_REQUEST_TIMEOUT_MS=20000
AUTH_REQUEST_TIMEOUT_MS=25000
PUBLIC_DATA_TIMEOUT_MS=20000
ADMIN_MUTATION_TIMEOUT_MS=30000
FILE_OPERATION_TIMEOUT_MS=15000
```

## Profiles

| Variable | Default | Applied to |
| --- | ---: | --- |
| `EXTERNAL_REQUEST_TIMEOUT_MS` | 20000 ms | Default fallback for external operations without a narrower profile |
| `AUTH_REQUEST_TIMEOUT_MS` | 25000 ms | Supabase Auth validation and authenticated profile lookups |
| `PUBLIC_DATA_TIMEOUT_MS` | 20000 ms | Public settings, categories, banners, footer-related reads |
| `ADMIN_MUTATION_TIMEOUT_MS` | 30000 ms | Protected admin create, update, delete, and toggle operations |
| `FILE_OPERATION_TIMEOUT_MS` | 15000 ms | Local image directory creation, writes, cleanup, and deletes |

Missing, invalid, less-than-500ms, or greater-than-120000ms environment values fall back to the profile default. Compatible Supabase PostgREST builders receive `AbortSignal.timeout(...)` signals so network operations are cancelled at the deadline. User-facing timeout failures remain Persian and do not expose internal details.

Verify the source wiring with:

```bash
npm run debug:timeout-profiles
```

Build with Webpack using:

```bash
npm run build -- --webpack
```
