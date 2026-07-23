# Phase 6 Data, Contact, and Analytics Design

**Status:** Approved on July 23, 2026.

**Purpose:** Add the smallest reliable backend needed for durable contact submissions and privacy-respecting first-party analytics without making any public page depend on database availability.

**Sources of truth:**

1. `prd.md` sections 6-9 define the admin-facing data needs, event contract, privacy rules, and initial model.
2. `docs/superpowers/specs/2026-07-17-portfolio-production-roadmap-design.md` defines the Phase 6 deliverables and exit gate.
3. `docs/ops/environment-contract.md` defines secret ownership and deployment behavior.
4. The shipped Phase 5 implementation on `main` is the frontend and performance baseline.

## 1. Scope and Locked Decisions

Phase 6 will:

- provision Neon Free through the Neon-managed Vercel integration;
- use one Neon project with the primary branch for production and automatically created, short-lived branches for Vercel preview deployments;
- use Drizzle as the application schema, migration, and typed-query owner;
- replace the mailto-only contact behavior with durable persistence while retaining prefilled email as the failure fallback;
- add first-party tracking for page views, project clicks, CV downloads, contact submissions, and approved outbound links;
- retain raw analytics events for 90 days and daily aggregates indefinitely;
- add once-daily aggregation, retention, rate-bucket cleanup, health checks, and safe structured failure logging;
- implement the optional Resend notification adapter but deploy it disabled.

Phase 6 will not add Neon Auth, admin routes, dashboards, inbox UI, Recharts, public analytics, cookies, third-party analytics, persistent cross-day visitor identity, or a separate API server. Merge, production migration, cron activation, and production promotion require Yehia's explicit approval after the draft PR is reviewed.

## 2. Runtime Architecture

All public routes remain static or ISR. Database work is limited to the contact Server Action, `POST /api/track`, `GET /api/health`, and the secured daily maintenance route. A sleeping or unavailable database must not prevent `/`, `/projects`, case studies, or `/services` from rendering.

Server-only code lives under `src/db/` and focused feature modules. UI components never import the database client or schema directly. Query modules expose narrow contact, analytics, rate-limit, health, and maintenance operations. The application runtime uses Drizzle with Neon's HTTP driver for one-shot and batch operations. Migration tooling uses the unpooled/direct connection URL.

The Neon-managed Vercel integration supplies an isolated database branch and connection variables to each preview deployment. Obsolete preview branches are deleted automatically. A Vercel-only build command applies committed migrations to the supplied branch before `next build`; the ordinary GitHub quality build remains secret-free and must not contact Neon.

## 3. Data Model

### `contact_messages`

- `id`: UUID primary key with a database default.
- `inquiry_type`: one of `Job opportunity`, `Freelance project`, `Collaboration`, or `Other`.
- `name`: trimmed text, maximum 100 characters.
- `email`: trimmed, normalized email text, maximum 254 characters.
- `message`: trimmed text, maximum 5,000 characters.
- `is_read`: boolean, default `false`, reserved for the Phase 7 inbox.
- `created_at`: timezone-aware creation timestamp.

Index `created_at` with `id` as a stable tie-breaker so Phase 7 can use bounded keyset pagination.

### `analytics_events`

- generated integer identifier;
- allowlisted event type;
- normalized internal pathname without query or fragment;
- external referrer domain only;
- two-letter country code when supplied by Vercel;
- normalized device, browser, operating-system, and screen-class values;
- 64-character daily visitor HMAC;
- allowlisted JSON metadata;
- timezone-aware creation timestamp.

Indexes cover `(created_at, id)`, `(type, created_at)`, `(path, created_at)`, and `(visitor_hash, created_at)`. Raw IP addresses, full referrer URLs, query strings, fragments, arbitrary outbound URLs, and form fields are never stored.

### `analytics_daily_aggregates`

Each row contains UTC date, event type, one dimension name, one normalized dimension value, event count, daily unique visitor count, and update time. The composite key is `(date, event_type, dimension, dimension_value)`.

Dimensions are stored separately as `overall`, `path`, `referrer`, `country`, `device`, `browser`, `os`, and `screen`. This supports Phase 7's overview, time series, and breakdowns without storing the cardinality-heavy cross-product of every dimension. Because visitor HMACs rotate daily, a multi-day "visitors" value is explicitly the sum of daily unique visitors, not persistent cross-day identity.

### `rate_limit_buckets`

Each bucket contains scope, HMAC request key, fixed-window start, request count, and expiry time. The composite key is `(scope, key_hash, window_start)`, with an expiry index for maintenance. An atomic insert-or-increment returns the current count so parallel serverless invocations cannot bypass the limit.

## 4. Contact Workflow

The existing form becomes a progressively enhanced Server Action form using React `useActionState`. It preserves the current four inquiry types, 100/254/5,000-character limits, direct-email link, and prefilled-mail fallback.

The action performs these checks in order:

1. Enforce the configured Server Action body limit of 16 KB.
2. Read and trim scalar fields; reject duplicate fields, files, unknown inquiry types, invalid email shape, empty values, or values above their maximum lengths.
3. Derive a request key with HMAC-SHA256 over request address and user agent using `ANALYTICS_HASH_SALT`; neither raw value is retained.
4. Atomically enforce three contact attempts per request key per fixed one-hour window.
5. Treat a populated honeypot as an ordinary successful submission while storing no message or analytics event.
6. Atomically persist the contact message and a PII-free `contact_submit` analytics event.

Validation failures return field errors and a focusable summary. Pending state disables repeat submission without hiding the form. Success clears the fields and announces that the message was saved. Rate-limit and database failures preserve the visitor's draft and expose the prefilled email fallback. User-facing failures never contain provider, SQL, stack, or secret details.

After persistence succeeds, Next.js `after()` may call the Resend adapter. An empty `RESEND_API_KEY` disables delivery. When configured later, the adapter uses a contact-ID idempotency key and explicit sender/recipient environment values. Notification failure emits only a safe structured error code and never changes the successful form result.

## 5. Analytics Contract

The root layout mounts one small client tracker. It posts same-origin JSON to `POST /api/track` with `keepalive: true`, never awaits the request, never prevents default navigation, and ignores browser-side delivery failure.

Accepted events are:

| Event | Client payload | Stored metadata |
|---|---|---|
| `page_view` | pathname, screen class, current document referrer | no arbitrary metadata; external referrer is reduced to its domain |
| `project_click` | pathname, approved project slug, `github` or `live-demo` | project slug and destination enum |
| `cv_download` | pathname, `footer` or `command-palette` | placement enum |
| `contact_submit` | none; produced by the contact action | none |
| `outbound_click` | pathname and approved destination identifier | `github-profile`, `linkedin`, or an approved client-work slug |

The tracking route rejects non-JSON or bodies above 2 KB, unknown fields, unknown event types, invalid paths, unknown identifiers, arbitrary metadata, and query/fragment data. Country and request address come from Vercel request headers. Device, browser, and OS are normalized from the user agent. The client supplies only the current screen-class enum.

The visitor identifier is `HMAC-SHA256(UTC date + request address + user agent, ANALYTICS_HASH_SALT)`. It rotates at the UTC day boundary and is never sent to the browser. The request-rate key omits the date and is used only inside expiring buckets.

Known bot user agents, all `/admin` paths, malformed traffic, and browsers with `ya.analytics.excluded=1` in local storage are not recorded. Yehia's one-time self-exclusion command is documented in the operations guide. Phase 7 will additionally exclude authenticated admin sessions. The tracking route allows 120 attempts per request key per fixed one-minute window.

## 6. Maintenance, Health, and Logging

Vercel invokes a secured maintenance route once daily in UTC, within the timing precision allowed by Hobby. It accepts only `Authorization: Bearer $CRON_SECRET`; missing or incorrect authorization returns a generic unauthorized response.

Each maintenance run is idempotent:

1. Recompute and upsert all aggregate rows for retained, completed UTC days.
2. Delete raw analytics events older than 90 days only after aggregate upserts succeed.
3. Delete expired rate-limit buckets.

Running maintenance twice produces the same aggregate counts. If aggregation fails, retention deletion does not run. Vercel does not retry failed cron invocations, so the next daily run recomputes every retained completed day and naturally catches up.

`GET /api/health` performs only a minimal database probe. It returns generic healthy or unavailable status, disables caching, and exposes no connection, schema, region, timing, or exception details.

Structured server logs use fixed event codes, request IDs, and success/failure classes. They never include contact fields, email addresses, IP addresses, user agents, visitor hashes, metadata payloads, database URLs, authorization values, or provider responses containing PII.

## 7. Environment and Provider Configuration

The environment contract will include:

- `DATABASE_URL`: server-only pooled/runtime Neon connection.
- `DATABASE_URL_UNPOOLED`: server-only direct migration connection.
- `ANALYTICS_HASH_SALT`: required, random, and unique in local, preview, and production environments.
- `CRON_SECRET`: required for preview and production maintenance calls and at least 16 random characters.
- `RESEND_API_KEY`: optional and empty at launch.
- `CONTACT_NOTIFICATION_FROM`: required only when Resend is enabled.
- `CONTACT_NOTIFICATION_TO`: required only when Resend is enabled.

No secret is prefixed with `NEXT_PUBLIC_`, committed, printed, or returned to the browser. Local public-page development remains possible without database variables; database-backed actions return their designed unavailable state.

## 8. Testing and Acceptance

Automated coverage includes:

- validation, duplicate-field rejection, HMAC determinism and UTC rotation, bot filtering, path normalization, metadata allowlists, user-agent classification, and self-exclusion;
- contact success, honeypot, rate limit, database failure, notification failure, and mailto fallback behavior;
- tracking acceptance/drop behavior, atomic rate-limit behavior, health responses, maintenance authorization, aggregation idempotency, and retention ordering;
- accessible form summaries, live status, pending behavior, preserved drafts, and keyboard operation;
- non-blocking page-view, project, CV, and outbound navigation tracking;
- migration consistency checks and a real migration against both an initially empty database and an isolated preview branch.

The preview gate submits a uniquely marked test inquiry, verifies and then removes it, confirms every allowlisted event shape, proves unknown metadata is rejected, exercises both rate limits, runs maintenance twice, and confirms no production rows were created. It also runs axe, the full browser suite, responsive inspection at 360, 390, 768, 1024, 1440, and 1920 pixels, Lighthouse, and the route bundle comparison.

The phase passes only when `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, Playwright, Drizzle migration checks, and the production-like preview gate pass. An unexplained public-route JavaScript increase above 10%, a blocking analytics request, a database-dependent public render, leaked PII, a non-idempotent maintenance run, or a contact submission lost solely because Resend is unavailable blocks completion.

## 9. Delivery Boundary

Claude Code will produce `docs/implementation/phase-6-report.md` with schema and migration evidence, provider configuration performed, preview branch isolation, safe-failure results, rate-limit results, maintenance idempotency, accessibility and responsive checks, bundle/Lighthouse comparison, CI status, and any remaining manual production step.

The implementation ends at a verified draft PR. It must not merge the PR, run the production migration, activate the production cron, enable Resend, or promote production without Yehia's explicit approval.

## 10. Current Platform References

- [Neon serverless driver](https://neon.com/docs/serverless/serverless-driver)
- [Neon-managed Vercel preview branches](https://neon.com/blog/neon-vercel-native-integration)
- [Drizzle migrations](https://orm.drizzle.team/docs/migrations)
- [Drizzle with Neon](https://orm.drizzle.team/docs/connect-neon)
- [Next.js forms and Server Actions](https://nextjs.org/docs/app/guides/forms)
- [Next.js `after()`](https://nextjs.org/docs/app/api-reference/functions/after)
- [Vercel Cron Jobs usage and Hobby limits](https://vercel.com/docs/cron-jobs/usage-and-pricing)
- [Vercel Cron Job security](https://vercel.com/docs/cron-jobs/manage-cron-jobs)
- [Vercel geolocation headers](https://vercel.com/kb/guide/geo-ip-headers-geolocation-vercel-functions)

