# Phase 6 Operations Runbook

Operational procedures for the Neon-backed contact and analytics system introduced in Phase 6.
See `docs/ops/environment-contract.md` for variable ownership and `docs/superpowers/specs/2026-07-23-phase-6-data-contact-analytics-design.md` for the design this runbook implements.

## 1. Database topology

- One Neon project, provisioned through the Vercel-managed Neon integration (Storage/Marketplace).
- The Neon **primary branch** backs Production only. It must never carry a manual migration run from a workstation; only the Vercel Production build (via `buildCommand` in `vercel.json`) migrates it.
- Every Preview deployment receives its own **automatically created, short-lived Neon branch**, seeded from the primary branch and deleted automatically once the deployment is obsolete. The Vercel Preview build migrates that branch before `next build` runs.
- Local development uses a developer's own Neon branch or a local Postgres instance via `DATABASE_URL`/`DATABASE_URL_UNPOOLED` in `.env.local` (git-ignored). Public pages render without either variable set.

## 2. Checking environment variable presence (never values)

Run this from a shell with the target environment's variables loaded (for example after `vercel env pull`). It never echoes a value:

```powershell
foreach ($name in "DATABASE_URL","DATABASE_URL_UNPOOLED","ANALYTICS_HASH_SALT","CRON_SECRET","RESEND_API_KEY","CONTACT_NOTIFICATION_FROM","CONTACT_NOTIFICATION_TO") {
  $value = [Environment]::GetEnvironmentVariable($name)
  if ($value) { Write-Output "$name: present (length $($value.Length))" } else { Write-Output "$name: absent" }
}
```

## 3. Preview migration, health, and maintenance checks

Against an isolated Preview branch only (never Production):

```powershell
corepack pnpm dlx vercel@56.5.0 env pull .env.phase6-preview.local --environment=preview --git-branch=<branch>
node --env-file=.env.phase6-preview.local -e "process.exit(0)"   # sanity check the file loads
$env:VERCEL_ENV = 'preview'
```

1. Confirm the Preview build already applied `drizzle/0000_phase_6_foundation.sql` (Vercel's build log for that deployment shows the migration step).
2. `GET /api/health` on the Preview URL returns `200 {"status":"ok"}`.
3. `GET /api/maintenance` on the Preview URL with `Authorization: Bearer <preview CRON_SECRET>` returns `200` with `{ aggregateRows, deletedEvents, deletedBuckets }`.
4. Delete `.env.phase6-preview.local` when finished; it is git-ignored but should not linger on disk.

## 4. Visitor self-exclusion (Yehia's own browsing)

Run once in the browser devtools console on the deployed site to stop recording your own visits:

```js
localStorage.setItem("ya.analytics.excluded", "1");
```

Reverse it with:

```js
localStorage.removeItem("ya.analytics.excluded");
```

This is a per-browser, per-device local flag; it is not synced or stored server-side.

## 5. Database outage fallback

If Neon is unreachable:

- Public pages (`/`, `/projects`, case studies, `/services`) keep rendering — they never read the database.
- The contact form shows its `unavailable` state with the visitor's draft preserved and a prefilled `mailto:` link, so no inquiry is silently lost.
- `POST /api/track` returns a generic `202` even on insert failure; no visitor-facing error appears.
- `GET /api/health` reports `503 {"status":"unavailable"}` — this is the signal to check the Neon dashboard and Vercel integration status.

## 6. Disabling the cron without deleting data

To pause maintenance without losing rows:

- Remove the `crons` entry from `vercel.json` (or disable the Cron Job in the Vercel dashboard) and redeploy Production.
- Existing `contact_messages`, `analytics_events`, and `analytics_daily_aggregates` rows are untouched; only future scheduled runs stop.
- Re-enabling the cron immediately catches up: each run recomputes every retained, completed UTC day, so a gap in cron execution does not lose aggregate accuracy (raw events for retained days are still present until the 90-day cutoff).

## 7. Rotating `ANALYTICS_HASH_SALT` and `CRON_SECRET`

- Rotating `ANALYTICS_HASH_SALT` changes the HMAC visitor hash and the rate-limit key going forward. It does **not** alter any stored `contact_messages` or `analytics_events` rows — only future visitor/rate identities compute differently. Existing rows keep their old hash values, which simply become permanently unlinkable to new hashes (expected; there is no persistent cross-rotation visitor identity by design).
- Rotating `CRON_SECRET` only affects authorization for `GET /api/maintenance`; update the value in Vercel's environment settings for the relevant environment(s) before the next scheduled run, or the cron call will 401 until updated.
- Rotate by setting a new value in Vercel's environment variable UI (or interactive CLI) for the environment, then redeploy that environment. Never print, log, or commit the new value.

## 8. Resend stays disabled

`RESEND_API_KEY`, `CONTACT_NOTIFICATION_FROM`, and `CONTACT_NOTIFICATION_TO` remain empty in every Vercel environment at Phase 6 launch. The adapter (`src/features/contact/notify.ts`) is fully implemented and no-ops when `RESEND_API_KEY` is unset. Enabling delivery in a later phase requires only setting the three variables — no code change — and is an explicit decision Yehia makes separately.

## 9. Production migration, merge, and rollback boundaries

- The Phase 6 PR stays a **draft PR**. Do not mark it ready for review, merge it, or promote a deployment to Production as part of this phase's implementation.
- Do not run `db:migrate` against the Neon primary/production branch. Only a Production deployment's `buildCommand` (defined in `vercel.json`) may do so, and only after Yehia's explicit approval to promote.
- Do not activate the Production cron (it activates automatically only once a Production deployment containing `vercel.json`'s `crons` entry exists — this itself requires the explicit promotion decision above).
- If a Production migration ever needs to be rolled back, restore from a Neon branch/point-in-time recovery snapshot taken before the migration; Drizzle does not auto-generate down-migrations for this schema.
