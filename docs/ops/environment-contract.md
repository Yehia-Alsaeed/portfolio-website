# Environment Contract

| Variable | Visibility | Owner/provider | First required phase | Local scope | Preview scope | Production scope | Absence behavior |
|---|---|---|---|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | public | Vercel/application | Phase 1 | Required for local links; defaults to `http://localhost:3000` | Required | Required | Fatal when the application generates public URLs |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | public | Cloudinary | Phase 4 | Optional until media integration; local media fallback | Required when media is enabled | Required when media is enabled | Fallback to local/reference media before Phase 4 |
| `DATABASE_URL` | server-only | Neon Postgres pooled connection | Phase 6 | Required when database integration is activated | Required | Required | Fatal once database integration is activated |
| `DATABASE_URL_UNPOOLED` | server-only | Neon Postgres direct connection | Phase 6 | Required for migrations when database integration is activated | Required for operational tasks | Required for operational tasks | Fatal for migration/administrative operations once activated |
| `GITHUB_TOKEN` | server-only | GitHub | Phase 4 | Optional until repository integration is activated | Required when repository integration is enabled | Required when repository integration is enabled | Fallback to stored project metadata |
| `CLOUDINARY_API_KEY` | server-only | Cloudinary | Phase 4 | Required for server-side media operations once activated | Required | Required | Fatal for server-side media operations once activated |
| `CLOUDINARY_API_SECRET` | server-only | Cloudinary | Phase 4 | Required for signed server-side media operations once activated | Required | Required | Fatal for signed server-side media operations once activated |
| `ANALYTICS_HASH_SALT` | server-only | Application-owned secret | Phase 6 | Required; unique local value | Required; unique preview value | Required; unique production value | Fatal when analytics integration is activated |
| `CRON_SECRET` | server-only | Application-owned secret | Phase 6 | Not required for local public-page development | Required; unique preview value | Required; unique production value | Maintenance route returns generic unauthorized |
| `RESEND_API_KEY` | server-only | Resend | Phase 6 | Optional | Optional; empty at launch | Optional; empty at launch | Persist contact message and skip notification |
| `CONTACT_NOTIFICATION_FROM` | server-only | Application owner | Phase 6 | Required only when notifications are enabled | Required only when notifications are enabled | Required only when notifications are enabled | Fatal only if notification delivery is explicitly enabled; otherwise persist only |
| `CONTACT_NOTIFICATION_TO` | server-only | Application owner | Phase 6 | Required when notifications are enabled | Required when notifications are enabled | Required when notifications are enabled | Fatal only if notification delivery is explicitly enabled; otherwise persist only |

## Rules

- Only variables beginning with `NEXT_PUBLIC_` may enter browser bundles.
- `.env.example` contains names and safe local defaults only.
- Local secrets live in `.env.local`, which Git ignores.
- Preview and production values live in Vercel environment settings.
- `RESEND_API_KEY` is optional; every other server variable becomes required in the phase that activates its integration.
- `RESEND_API_KEY`, `CONTACT_NOTIFICATION_FROM`, and `CONTACT_NOTIFICATION_TO` remain empty in Vercel at Phase 6 launch; Resend stays implemented but disabled until an explicit later decision.
- `ANALYTICS_HASH_SALT` and `CRON_SECRET` must differ between local, preview, and production.
- Provider-generated Neon Auth variable names are added verbatim in Phase 7 rather than guessed in advance.
