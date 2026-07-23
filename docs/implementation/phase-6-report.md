# Phase 6 Implementation Report

**Status:** Draft PR opened and verified against a real Neon-backed Vercel Preview deployment. Not merged. No production migration, cron activation, or Resend enablement performed.

**PR:** https://github.com/Yehia-Alsaeed/portfolio-website/pull/7 (draft)
**Branch:** `worktree-phase-6-data-contact-analytics`
**Preview URL used for live verification:** `https://portfolio-website-git-worktr-8d63cf-yehias3eed11-5404s-projects.vercel.app`

## 1. Scope delivered

- Durable contact persistence: Server Action, native validation, honeypot, 3-per-hour atomic rate limit, atomic contact+event batch write, `after()`-scheduled (disabled) Resend adapter, prefilled-mailto fallback preserved for every failure state.
- First-party analytics: `page_view`, `project_click`, `cv_download`, `contact_submit`, `outbound_click` via a closed `POST /api/track`, non-blocking client tracker, daily-rotating HMAC visitor hash, 120-per-minute atomic rate limit, bot/`/admin` drop.
- Idempotent daily aggregation (`overall` + 7 dimensions), 90-day raw-event retention, expired rate-limit-bucket cleanup, all behind a timing-safe `CRON_SECRET`-gated `GET /api/maintenance`.
- `GET /api/health` minimal probe, safe structured failure logging with no PII/secrets/exceptions ever logged.
- Vercel-managed Neon Postgres provisioned via Marketplace, preview-per-branch database isolation, `vercel.json` cron (`17 3 * * *`, inactive until Production promotion).
- Resend fully implemented, deliberately left disabled (no `RESEND_API_KEY`/sender values set in any environment).

## 2. Dependencies (exact, approved versions)

`drizzle-orm@0.45.2`, `@neondatabase/serverless@1.1.0`, `@vercel/functions@3.7.5`, `drizzle-kit@0.31.10` (dev). No other dependency changes.

## 3. Schema and migration

Four application tables (`contact_messages`, `analytics_events`, `analytics_daily_aggregates`, `rate_limit_buckets`), three enums (`inquiry_type`, `analytics_event_type`, `aggregate_dimension`), committed migration `drizzle/0000_phase_6_foundation.sql`. `pnpm db:check` confirms consistency with the schema on every commit.

**Fresh-migration smoke test:** created a temporary Neon branch (`phase-6-fresh-migration-smoke`) from the still-empty primary branch, ran `db:migrate` twice (first applied, second was a no-op), confirmed exactly the 4 application tables plus Drizzle's own `drizzle.__drizzle_migrations` bookkeeping table existed, then deleted the branch. The `neondb_owner` password was rotated afterward since a connection string was briefly visible in a screenshot during this process.

## 4. Provider configuration

- Neon Free provisioned through the Vercel Marketplace ("Vercel-Managed Integration"), connected to Development/Preview/Production, Preview branch-per-deployment enabled, Production branching disabled (Production always uses the primary branch directly).
- `ANALYTICS_HASH_SALT` and `CRON_SECRET`: unique values present for both Preview and Production (confirmed via `vercel env ls` — names and scopes only, never values).
- `RESEND_API_KEY`, `CONTACT_NOTIFICATION_FROM`, `CONTACT_NOTIFICATION_TO`: confirmed absent from every environment.
- Protection Bypass for Automation configured; used once, in-memory only, for the live verification run below — never written to a tracked file.

## 5. Local secret-free gate (all green)

`pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test` (190/190 unit tests; one pre-existing, unrelated command-palette timing flake observed and reproduced as flaky both before and independent of this work), `pnpm db:check`, `pnpm build` (all page routes static/SSG; only `/api/health`, `/api/maintenance`, `/api/track` dynamic), `pnpm playwright test` (212/212 local e2e tests, 2 correctly gated behind live mode).

## 6. Live Preview verification (real Neon database)

Run against the PR's actual Preview deployment, using its real database, with a QA-marker (`c4ccb1cd-cfe9-48f1-9365-905948de2574`) embedded in test contact submissions for traceability:

| Check | Result |
|---|---|
| `GET /api/health` | `200 {"status":"ok"}` |
| Accepts `page_view`, `project_click`, `cv_download`, `outbound_click` shapes | `202` for all four |
| Rejects an unrecognized event payload | `400` |
| Analytics 120-per-minute rate limit | Confirmed: a `429` appears among 130 concurrent requests |
| Contact 3-per-hour rate limit | Confirmed via a real Playwright run — the exact `"Too many messages sent recently. Try again later, or email directly."` alert rendered after the shared per-IP budget was consumed across earlier debugging submissions |
| Contact success state | Confirmed — a real submission returned "Message saved," and axe found no WCAG A/AA violations in that state |
| Contact invalid state | Confirmed — real browser run, axe clean |
| `GET /api/maintenance` (correct secret) | `200`, idempotent across two consecutive runs (`aggregateRows: 0 -> 0`; `deletedBuckets` legitimately dropped from 6 to 0 as expired buckets were cleaned up on the first run) |
| `GET /api/maintenance` (missing/wrong secret) | `401`, no database call made |
| Bundle size vs. Phase 3 baseline | +1.04% gzip (21 files both before and after) — well under the 10% threshold |
| GitHub Actions `quality` workflow (format/lint/typecheck/test/db:check/build/Playwright/Lighthouse) | Pass |
| Vercel Preview build (runs `db:migrate` against its own fresh Neon branch) | Pass |

### Known limitation: direct-database verification and cleanup

Three planned checks — confirming and deleting the QA-marked `contact_messages`/`analytics_events` rows, and a final row-count sanity check on `analytics_daily_aggregates` — could not run from this shell. `vercel env pull` returns a `DATABASE_URL` that connects to an empty database (no tables), while the actual deployed Preview instance correctly reads and writes a database that does have the schema. This is architectural: Neon's Vercel integration injects the per-branch Preview connection string directly into the deployed Function's runtime; it is not a value stored anywhere `vercel env pull` can retrieve. The three affected rows are real, `visitorHash`/PII-free per design, and live only in the ephemeral Preview database branch tied to this PR, which Vercel deletes automatically once the branch becomes obsolete (per the "automatically delete obsolete preview branches" setting enabled during provisioning). Per Yehia's explicit decision, this was left as-is rather than pursued further.

## 7. Bugs found and fixed during this phase

- **`ANALYTICS_HASH_SALT` read outside try/catch** in both the contact Server Action and the track route — a missing salt threw uncaught instead of degrading to the designed `unavailable`/202-safe fallback. Fixed in both places.
- **Missing `noValidate` on the contact form** — native HTML5 validation could block submission before the custom validation/alert flow ever ran. Restored (the pre-Phase-6 form had it).
- **Honeypot positioned off-screen (`-left-[10000px]`)** tripped the existing "no element escapes the viewport" responsive check. Switched to the standard `sr-only` visually-hidden pattern, which stays in normal flow.
- **Test-file bug:** a bare `test.skip(condition, reason)` call placed between test declarations in `accessibility.spec.ts` skipped the *entire file* (24 tests), not just the intended single live-only test — Playwright applies a declarative skip to its whole enclosing scope. Moved inside the specific test bodies in both `accessibility.spec.ts` and `phase-6.spec.ts`.
- **Two tests simulated a "database unavailable" state** that cannot occur against a live, working Preview database; they now skip in live mode instead of failing on a contradiction.
- **Maintenance INSERT column list bug:** embedding Drizzle `Column` objects directly in an `INSERT INTO t (...)` target list rendered them table-qualified (`"table"."col"`), which Postgres rejects in that specific position (valid everywhere else — SELECT/WHERE/GROUP BY). Fixed with `sql.identifier()` for just the target column list. Found only because this phase's live-database gate exists; local mocked tests could not have caught it.
- **Verifier script robustness:** one failing check crashed the whole script and discarded every prior result. Each step is now isolated so partial failures are reported, not silently lost. The analytics-rate-limit probe was also switched from sequential to concurrent requests (130 sequential round-trips to a remote deployment can exceed the 60-second window before reaching the limit); and the maintenance-idempotency check now compares only `aggregateRows` rather than the full response, since `deletedEvents`/`deletedBuckets` are legitimately one-time counts that shrink on a second run.
- **`.gitignore` gap:** `.env.phase6-preview.local` (the file `vercel env pull` produces) matched no existing ignore pattern. Added `.env*.local`.

## 8. What remains for Yehia's explicit approval

- Mark the PR ready for review and merge.
- Run `db:migrate` against the Neon primary/production branch (only via a Production deployment's build; never manually).
- Activate the Production cron (happens automatically once a Production deployment containing `vercel.json`'s `crons` entry exists).
- Enable Resend (set `RESEND_API_KEY`, `CONTACT_NOTIFICATION_FROM`, `CONTACT_NOTIFICATION_TO`).
- Optionally: clean up the residual QA-marked rows in the Preview database (or leave them for automatic branch deletion).

None of the above were performed.
