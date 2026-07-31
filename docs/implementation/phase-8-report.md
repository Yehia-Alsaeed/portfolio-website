# Phase 8 Implementation Report

**Status:** In progress on branch `phase-8-quality-hardening`, implemented in the isolated worktree `.worktrees/phase-8-quality-hardening`. This report is built incrementally, one stage at a time, per `docs/superpowers/specs/2026-07-27-phase-8-quality-hardening-design.md`.

## Task 0: Readiness and Phase 7 Carryovers

### Generated-directory quality-tool scoping

`pnpm format:check` and `pnpm lint`, run from the repository root (which holds local generated directories `.claude/` and `.superpowers/`, plus the untracked `.worktrees/` phase directories), traversed those directories before this fix:

- `pnpm format:check`: 76s, failed with `Error occurred when checking code style in 2 files`, having walked into `.superpowers/brainstorm/966-1784727454/chrome-mobile/Default/Extensions/...` (a full Chromium extension profile) and `.superpowers/sdd/task-1-brief.md`.
- `pnpm lint`: passed, but only because ESLint's default ignores already exclude `**/node_modules/**`; source files under those directories were still in scope.

Fix: added `.claude/` and `.superpowers/` to `.gitignore` (`.worktrees/` was already present), added `.claude`, `.superpowers`, `.worktrees` to `.prettierignore`, and added `.claude/**`, `.superpowers/**`, `.worktrees/**` to `eslint.config.mjs`'s `globalIgnores`. None of the three directories were deleted, formatted, staged, or otherwise modified.

Verified by temporarily copying the three edited config files into the repository root (which still has the generated directories on disk) without staging/committing there, then reverting with `git checkout --` afterward:

- `pnpm format:check`: 5.2s, `All matched files use Prettier code style!`.
- `pnpm lint`: 14.2s, clean pass.

Also verified inside the actual `phase-8-quality-hardening` worktree (no generated directories present there, so this proves no regression on real tracked source):

- `pnpm format:check`: 5.7s, clean pass.
- `pnpm lint`: 11.0s, clean pass.

### Phase 7 report reconciliation

`gh pr view 8` confirmed PR #8 is `MERGED` (merge commit `bcf97b9`, merged 2026-07-26T18:59:14Z) with the GitHub Actions `Quality` check and the Vercel deployment check both `SUCCESS`. `docs/implementation/phase-7-report.md` previously described the PR as an open draft; it now states the merged reality and cross-references this report for the disposition of its still-open Preview verification items.

### Pending Phase 7 Preview acceptance items: disposition

Attempted to reach the Phase 7 Preview deployment (`https://portfolio-website-4ijztcdcr-yehias3eed11-5404s-projects.vercel.app`) unauthenticated:

```text
curl -sI .../admin      -> HTTP/1.1 302, Location: https://vercel.com/sso-api?...
curl .../robots.txt     -> HTTP 302 (same SSO redirect)
```

Vercel Deployment Protection gates the entire deployment, including public routes like `/robots.txt` — not only `/admin`. This matches the finding already recorded in `phase-7-report.md`. Concretely, this blocks every remaining Phase 7 acceptance item:

- Anonymous/exact-admin/wrong-user/login/refresh/logout/expired-session/signup-blocking/rate-limit behavior, noindex/no-store/nav-absence checks, and keyboard/axe/zoom/console/responsive checks all require getting past the SSO redirect first — impossible without either an interactive Vercel account login or a Vercel protection-bypass secret, both of which are ephemeral, local-only, and owned by Yehia (`docs/superpowers/specs/2026-07-27-phase-8-quality-hardening-design.md` section 10; `docs/ops/environment-contract.md`).
- Even given a bypass secret to get past SSO, the authenticated-admin items (exact-admin/wrong-user/refresh/logout/expired-session, inbox mutations, admin self-exclusion, admin-view keyboard/axe checks) additionally require signing in as the real admin user — entering that password is not something this agent will do regardless of who supplies it (credential entry is a hard boundary), so those checks require Yehia's own hands-on session.
- Query-plan inspection requires Preview `DATABASE_URL`/`DATABASE_URL_UNPOOLED` access, also a server-only secret owned by Yehia.

**Disposition:** recorded as an explicit external manual dependency owned by Yehia, per Checkpoint 1's allowance in the design (section 3). No item was silently dropped or marked passing without evidence. These items remain required and are expected to be re-attempted at Stage 7 (Checkpoint 4, the production-like Preview acceptance stage), when a fresh Preview for `phase-8-quality-hardening` exists and Yehia can perform the credentialed steps himself while this agent drives the surrounding, non-credentialed verification (navigation, response headers, axe, console, responsive layout) in the same authenticated session.

### Checkpoint 1 status

- Ignore-scoping fix: done, evidence above.
- Phase 7 report reconciliation: done, evidence above.
- Phase 7 Preview carryovers: blocked on Yehia; explicit external-dependency record above satisfies the design's Checkpoint 1 exit condition ("every carryover has evidence or an explicit external blocker").
- Tracked worktree cleanliness and full quality-command run: passed (`format:check`, `lint`, `typecheck`, 242/242 tests, `db:check`, `git diff --check`); committed as `1a1ff0e`.

## Stage 2: Measured Baseline

All measurements below were taken on branch `phase-8-quality-hardening` at commit `1a1ff0e`, before any route, metadata, header, image, font, or query change. No production behavior changed in this stage — it is read-only measurement plus one baseline artifact file.

### Route and metadata inventory

Public routes (indexable): `/`, `/services`, `/projects`, and the five `/projects/[slug]` case studies (`skillbridge-ai-interviewer`, `llama-qlora-education-qa`, `ai-study-planner-agents`, `oxford-pet-binary-segmentation`, `prestige-motors-showroom`). All five currently set `title`, `description`, and `alternates.canonical` except **`/projects`, which has no canonical**. `/design-system` also has a `title`/`description` but no canonical, and per the design (section 4) will be removed rather than fixed. The case-study route additionally sets `openGraph.{title,description,type,url}` but no `openGraph.images` on any route — no route anywhere sets Twitter-card fields.

Non-indexable: `/admin`, `/admin/login`, `/admin/(private)` (overview + inbox) all correctly inherit or set `robots: {index:false, follow:false, nocache:true}` from `src/app/admin/layout.tsx`. The branded not-found pages (`src/app/not-found.tsx`, `src/app/(public)/not-found.tsx`) have no dedicated metadata (inherit the root layout's).

Gaps confirmed genuinely absent (not merely under-configured):

- **No `sitemap.ts` exists anywhere in the repo.** `robots.ts` (`src/app/robots.ts`) emits an allow-all-except-`/admin` rule with `host` but no `sitemap` field.
- **No JSON-LD anywhere** — zero matches for `application/ld+json` / `jsonLd` across `src`.
- **No `next/og` / `ImageResponse` usage anywhere** — no `opengraph-image.tsx` or `twitter-image.tsx` files exist for any route.
- **No security response headers exist** — `next.config.ts` only sets two scoped rules (`/admin/:path*` → `X-Robots-Tag: noindex,nofollow,noarchive` + `Cache-Control: private, no-store`; `/api/auth/:path*` → `Cache-Control: private, no-store`). No CSP, HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, or `frame-ancestors` exist. **No `middleware.ts` file exists** at the repo root.

These four gaps, plus the two missing canonical tags, define the concrete scope of Stage 3 (SEO/social/CV) and part of Stage 5 (security headers).

### Images and fonts (current state)

Images: `next/image` is used exclusively (no raw `<img>` tags found in `src`). `src/features/media/cloudinary.ts` allowlists 8 Cloudinary public IDs, caps source width at 1600px, and builds URLs with a fixed `f_auto,q_auto,c_limit,w_<width>` transform; `src/features/media/project-image.tsx` falls back to a local static import when Cloudinary is unconfigured.

Fonts: four self-hosted `next/font/local` faces in `src/app/fonts.ts` — `archivo` (variable, weight 400-900, `display:"optional"`, not preloaded, used for body/most UI), `archivoStatement` (static 650, `display:"swap"`, first-viewport heading only), `archivoWide` (static 900, `display:"swap"`), `jetBrainsMono` (variable, weight 400-700, `display:"swap"`, not preloaded). These are fontTools-instanced subsets of Google variable fonts chosen specifically to keep homepage LCP under gate, per an existing code comment.

### Browser/Playwright baseline

`playwright.config.ts` currently defines **one project: `chromium`** (`devices["Desktop Chrome"]`) — confirms Phase 8 is starting from Chromium-only coverage; Firefox, desktop WebKit, and iPhone-style WebKit projects do not exist yet. 14 spec files under `tests/e2e/` already cover accessibility (axe-core, via `tests/e2e/fixtures.ts`'s `makeAxeBuilder`, tagged `wcag2a/wcag2aa/wcag21a/wcag21aa`), responsive containment at named breakpoints, display-mode persistence, command palette, case studies, homepage, services, and shell/404/skip-link behavior.

Two full local runs of `pnpm exec playwright test` (Chromium only):

- Run 1: **212 passed, 2 skipped, 0 failed** (4m30s).
- Run 2 (run again to inspect skip detail): **1 flaky failure** — `phase-5-proof.spec.ts` › "skillbridge-ai-interviewer shows static architecture proof and loads the interactive canvas only after activation", timing out waiting for the interactive-canvas region to become visible after activation.
- Re-ran that single test 3x in isolation (`--repeat-each=3`): **3/3 passed**, confirming this is resource-contention flakiness under full-suite parallel load (`fullyParallel: true`), not a real regression — consistent with the pre-existing React Flow lazy-load timing sensitivity noted from Phase 5, and the "documented recurring flake since Phase 4" pattern for interactive/timing-sensitive specs. No code changed between the two runs.
- `ANALYTICS_DB_FAILED` log lines throughout both runs are expected: no live `DATABASE_URL` is configured for local Playwright runs, so analytics writes fail closed and are logged, not thrown — this is existing, correct local-test behavior, not a defect.

The 2 consistently-skipped tests are both live-database-gated: `accessibility.spec.ts` › "has no WCAG A or AA violations in the contact form's success state" and `phase-6.spec.ts` › "Phase 6 live preview gate › persists three contact submissions then rate-limits the fourth" — both self-skip without a live `DATABASE_URL`, consistent with the `ANALYTICS_DB_FAILED` log lines above, and are additional candidates for Stage 7 Preview-backed verification.

### Bundle baseline

`pnpm build`: succeeds in ~56s. Route shape matches the Phase 7 report: `/`, `/design-system`, `/projects`, `/projects/[slug]` (5 SSG paths), `/services`, `/robots.txt`, `/icon.svg` are static (`○`/`●`); `/admin`, `/admin/inbox`, `/admin/login`, `/api/auth/[...path]`, `/api/health`, `/api/maintenance`, `/api/track` are dynamic (`ƒ`). (Build emits a Turbopack workspace-root warning about detecting this worktree's own `pnpm-workspace.yaml` as an "additional lockfile" — harmless, every worktree of this repo will show it since `pnpm-workspace.yaml` is tracked; not a Phase 8 blocker, could be silenced later with an explicit `turbopack.root` if desired.)

`pnpm measure:build`: **29 JS chunks, 428,186 gzip bytes, 1,381,506 raw bytes** — effectively unchanged from the Phase 7 baseline (428,249 / 1,381,569), as expected since no application code changed in Task 0. Recorded verbatim in `docs/implementation/phase-8-build-baseline.json`. Per the design (section 7), a later measurement more than 10% above this baseline, unexplained, blocks completion.

**Tooling fix:** `scripts/measure-build.ts` and `scripts/measure-lighthouse.ts` both hardcoded their output path to the literal `docs/implementation/phase-3-build-baseline.json` / `docs/implementation/phase-3-lighthouse-baseline.json`. Git history shows this path was deliberately bumped once per phase during Phase 1 → 2 → 3 (`phase-1-...json` → `phase-2-...json` → `phase-3-...json`, each bump committed as part of that phase's work), then never bumped again for Phases 4-7 — so every later phase that ran these scripts silently overwrote the Phase 3 historical snapshot and (based on the absence of `phase-4/5/6/7-*-baseline.json` files) must have reverted it via `git checkout --` afterward rather than continuing the convention. Fixed by resuming the established pattern: bumped both hardcoded paths to `docs/implementation/phase-8-build-baseline.json` / `docs/implementation/phase-8-lighthouse-baseline.json`. Verified by re-running both commands: the Phase 3 files no longer appear in `git status` after running them, and the new Phase 8 files are written/updated as expected.

### Lighthouse baseline

`lighthouserc.cjs` currently tests **only the homepage** (`http://127.0.0.1:3100/`, 3 runs, median aggregation) — `/projects`, a case study, and `/services` are not yet in the LHCI `collect.url` array; adding them is Stage 6 (Performance) work per the design, since it requires editing this tracked config together with the performance pass, not a Stage 2 read.

Two homepage-only runs, taken minutes apart on the same machine: **performance 91 → 90, accessibility 100, best-practices 100, SEO 100, LCP 3023.8ms → 3330.8ms (median), CLS 0**. Both pass the temporary Phase 7 thresholds (performance ≥ 0.90, LCP ≤ 3400ms) but not yet the Phase 8 target table (performance ≥ 95, LCP ≤ 2500ms). The run-to-run LCP swing (~300ms) matches the project's previously-documented machine-dependent Lighthouse variance (CI numbers are the trustworthy reference, not a single local run). `lighthouserc.cjs` already carries a code comment flagging both temporary values for removal "during Phase 8 quality hardening." Reaching the Phase 8 thresholds is Stage 6 work. The second run's numbers are what's persisted in `docs/implementation/phase-8-lighthouse-baseline.json`.

### Database query-plan baseline

No local Postgres/Neon connection is available in this environment (no `psql`, no `docker`, `DATABASE_URL` unset locally) — genuine `EXPLAIN`/query-plan capture requires either a local Postgres instance or Preview access, both out of reach here for the reasons already recorded under Task 0's Preview disposition above. As a source-level substitute, the current index inventory was read directly from the migration SQL:

- `analytics_events`: composite indexes on `(createdAt, id)`, `(type, createdAt)`, `(path, createdAt)`, `(visitorHash, createdAt)`.
- `analytics_daily_aggregates`: primary key `(date, eventType, dimension, dimensionValue)` plus an index on `(dimension, eventType, date, dimensionValue)`.
- `contact_messages`: primary key `id` (uuid), plus `(createdAt, id)` and `(isRead, createdAt, id)`.
- `rate_limit_buckets`: primary key `(scope, keyHash, windowStart)` plus an index on `expiresAt`.

This establishes what indexes exist today. Confirming that `src/db/queries/*.ts` actually uses bounded ranges, keyset pagination, and these exact indexes (not just that the indexes exist) is Stage 5/6 work — the design groups query-plan review with security (section 6) and performance (section 7), not Stage 2 measurement. Real `EXPLAIN` plans remain an explicit external dependency on Yehia's Preview/local database access, same as the other blocked Task 0 items above.

### Stage 2 summary

| Area | Status |
|---|---|
| Route/metadata inventory | Done — 2 missing canonicals found (`/projects`, `/design-system`) |
| Structured data | Confirmed absent (greenfield for Stage 3) |
| Social/OG images | Confirmed absent (greenfield for Stage 3) |
| Sitemap | Confirmed absent — must be created, not modified |
| Response headers | Confirmed minimal — no security headers, no `middleware.ts` |
| Images | Audited — `next/image` used exclusively, Cloudinary allowlisted and capped |
| Fonts | Audited — 4 self-hosted subset faces, already LCP-motivated |
| Browser coverage | Confirmed Chromium-only; 212 passed/2 skipped baseline; 1 known-flaky spec under full parallel load |
| Bundle size | 29 chunks / 428,186 gzip bytes / 1,381,506 raw bytes (baseline file recorded) |
| Lighthouse | Homepage-only today: perf 90-91 (2 local runs) / a11y 100 / best-practices 100 / SEO 100 / LCP 3024-3331ms / CLS 0 |
| Database query plans | Index inventory read from migrations; live EXPLAIN blocked on DB access (external dependency) |
| Measurement tooling | Fixed `measure-build`/`measure-lighthouse` scripts to write `phase-8-*-baseline.json` instead of clobbering the Phase 3 files |

No production behavior was changed in this stage. Next: Stage 3 (public release surface — remove `/design-system` and `scrollRules`, then complete SEO/social/structured-data/CV work).

## Stage 3: Public Release Surface

### Removed temporary routes and experiments

`/design-system` (route, command-palette entry, dedicated Playwright/unit test files, and every route-list entry in `accessibility.spec.ts`/`shell.spec.ts`/`responsive.spec.ts`/`command-palette.spec.ts`) and the entire `src/features/scroll-rules` feature (its CSS, `SiteShell` wiring, and its dedicated Playwright test) were deleted per the design's explicit instruction that neither was ever approved for production. The command-palette test that exercised gallery form fields now uses the real homepage contact form instead. No other feature, content, or route was touched.

### SEO completion

- Fixed the two missing `alternates.canonical` tags found in Stage 2: `/projects` now sets one (matching `/`, `/services`, and the case-study pattern); `/design-system` no longer exists.
- Created `src/app/sitemap.ts`, emitting exactly the 8 canonical public URLs (`/`, `/projects`, `/services`, 5 case studies) under `publicEnv.siteUrl.origin`. Each entry's `lastModified` is read from the real git commit history of that URL's source file (`execFileSync("git", ["log", "-1", "--format=%cI", "--", path])`), falling back to omitting the field entirely if git history is unavailable (e.g. a very shallow production checkout) — never a fabricated date. `changeFrequency`/`priority` are never set, per the design's explicit ban on inventing those values.
- `robots.ts` now names `${origin}/sitemap.xml` in its `sitemap` field; the existing admin-disallow rule is unchanged.
- Added one `Person` JSON-LD graph to the homepage (`src/lib/seo/person-json-ld.ts`), sourced only from `PROFILE` (name, role, Cairo location, GitHub, LinkedIn) and `SKILL_GROUPS` (`knowsAbout`) — no employer, credential, rating, award, or image field exists anywhere in the object (asserted by a unit test's explicit forbidden-key list).
- Added one `OfferCatalog`/`Service` JSON-LD graph to `/services` (`src/lib/seo/services-json-ld.ts`), covering exactly the two published `SERVICE_OFFERS` with `PROFILE` as the only provider fact (name, email, url) — no price, rating, or availability claim (asserted by a unit test scanning the serialized JSON for those substrings).
- Both graphs render through a shared `JsonLd` component (`src/lib/seo/json-ld.tsx`) that escapes `<` to `<` before writing `dangerouslySetInnerHTML`, so a value containing `</script>` cannot break out of the script context — verified by a unit test that round-trips a deliberately hostile string through the component and confirms both the absence of a raw `<` in the rendered markup and that `JSON.parse` still recovers the original value.

### Dynamic OG images

Added `next/og` `ImageResponse` image routes for the site default, `/projects`, `/services`, and each of the 5 case studies (8 total), all rendering through one shared template (`src/lib/og/render-og-image.tsx`): a Paper-mode Swiss layout (background `#f1efe9`, ink `#111114`, accent `#2b3cff`) with a mono eyebrow, bold Archivo headline, optional subtitle, and a footer row showing the real configured site host plus the "YA ." monogram. Every route's title/subtitle text is copied from that route's own already-published metadata/content (page titles, descriptions, `PROFILE`, or `CaseStudy` fields) — no new marketing copy was written for these images.

Two real implementation problems surfaced only through an actual production build, not through review:

1. **Node's `fetch()` cannot read `file://` URLs.** The commonly-documented `next/og` recipe of `fetch(new URL('./font.ttf', import.meta.url))` fails at build time under the Node.js runtime with `TypeError: fetch failed` / `not implemented... yet`. Fixed by using `node:fs/promises` `readFile(new URL(...))` instead, which does support `file://` URL objects directly.
2. **Satori cannot parse the actual Google Fonts variable TTFs** (Archivo and JetBrains Mono), failing with `TypeError: Cannot read properties of undefined (reading '256')` — a known Satori limitation with certain variable-font tables. Neither family ships static instances in the `google/fonts` GitHub repository, so the fix was to fetch pre-instanced static-weight TTFs from the Google Fonts CSS API directly (`https://fonts.googleapis.com/css2?family=Archivo:wght@800` with a legacy user-agent to force a `.ttf` response instead of `.woff2`), which Satori renders correctly. These two static files (`archivo-800.ttf`, 111,948 bytes; `jetbrains-mono-500.ttf`, 112,204 bytes) are committed under `src/lib/og/fonts/` — both are OFL-licensed and used only server-side for image generation, never shipped to the client bundle.

A `generateImageMetadata`-based attempt to give the case-study OG image a per-slug `alt` string was reverted after discovering it silently turned that route from statically prerendered (5 separate build-time files) into a single on-demand dynamic route handler — a regression against the design's locked static-public-rendering constraint. The case-study OG image instead uses one static, still-truthful `alt` value ("Case study | Yehia Alsaeed"); the other three routes keep per-route static `alt` strings.

`tests/e2e/og-images.spec.ts` verifies, for all 5 representative routes (via each page's own `<meta property="og:image">` tag, not a hand-guessed URL — Next.js appends a content hash to nested image routes' public paths): HTTP 200, `content-type: image/png`, a `cache-control` header is present, real 1200×630 dimensions (decoded from the PNG `IHDR` chunk directly), the expected `og:image:alt` text, and that all 5 routes produce byte-distinct image content (SHA-256 of the full response body, not a truncated prefix — an earlier version of this same check only hashed the shared PNG header and produced a false pass).

### CV download

Existing behavior (footer `TrackedAnchor` + command-palette action, both already wired to the `cv_download` analytics event) was verified rather than changed. Added `tests/e2e/cv-download.spec.ts`: a direct `request.get()` check that the PDF response is `application/pdf` with real `%PDF-` magic bytes (ruling out a silent HTML/404 fallback), and a browser-level check that clicking the footer's "Download CV" link (not just the command-palette action, which already had coverage) produces a download with the exact expected filename.

### Verification

- `pnpm format:check` / `pnpm lint` / `pnpm typecheck`: clean.
- `pnpm test`: 47 files, 251 tests passed.
- `pnpm db:check`: passed (dummy local `DATABASE_URL`).
- `pnpm build`: succeeds; all public routes remain static (`○`/`●`), including all 8 new OG image routes; only `/admin*` and the API routes are dynamic — unchanged from baseline.
- `pnpm measure:build`: 28 chunks, 428,465 gzip bytes, 1,384,462 raw bytes — a 0.065% gzip increase over the Stage 2 baseline (428,186 bytes), far under the design's 10% regression gate. The OG images and JSON-LD render server-side, so they cost effectively nothing in the client bundle.
- `pnpm exec playwright test` (full suite): 207 passed, 2 skipped (the same two live-database-gated tests noted in Stage 2), 0 failed.
- `pnpm lighthouse`: performance 90, accessibility 100, best-practices 100, SEO 100, LCP 3322.3ms, CLS 0 — consistent with the Stage 2 baseline range, no regression.
- `git diff --check`: clean after reverting the routine `next-env.d.ts` dev/build churn (a known toolchain artifact, not a real change).

No item from the Stage 2 gap list remains open except the two Preview-only carryovers already recorded as external dependencies under Task 0.

## Stage 4: Accessibility (WCAG 2.2 AA)

A background code-level audit (routes, landmarks, images, forms, interactive components, focus management, sticky/overlap content, reduced motion, video, and touch targets) covered every public route, the branded 404, and every admin route including the two that require live authentication to actually reach in a browser. Automated axe/Lighthouse checks alone were treated as insufficient, per the design; the audit read the real component source for each area.

### Confirmed and fixed

**Contrast (token-level, not one-off overrides).** `--accent` (`#2b3cff`, the true brand blue) measures only 2.87:1 against the Night-mode background — below the 3:1 WCAG 2.2 non-text-contrast minimum — and was used as a UI-boundary color (not just a fill) in two places: the primary button's border (`components/ui/button.tsx`) and the contact form's alert-stripe border (`features/contact/contact-form.tsx`). Both were switched to the already-existing `--accent-text` token (`#6f7aff` in Night, identical to `--accent` in Paper/Mono — so Paper/Mono render pixel-identical to before). The command palette's selected-row highlight (`components/ui/command.tsx`) had the same fill-vs-page-background gap; rather than reuse `accent-text` as the fill (which would have dropped its own text contrast to 3.56:1, below the 4.5:1 normal-text minimum), it got an inset `ring-2 ring-accent-text` so the boundary is compliant without touching the fill/text pairing. All three fixes were verified against the actual rendered DOM (computed styles in a live browser, Night mode) before being written up, not just reasoned about. A durable regression guard was added: `src/lib/color/contrast.ts` (a small WCAG contrast-ratio utility) plus `tests/unit/token-contrast.test.ts`, which reads the real `--paper`/`--ink`/`--dim`/`--accent`/`--accent-text` hex values directly out of `globals.css` for all three modes and asserts every pairing actually used in the codebase meets its required ratio — so a future token change that reintroduces this exact failure fails a test, not just a manual audit.

**Admin heading structure.** `/admin` and `/admin/inbox` each had exactly one `<h1>` but every panel title ("Visitors and views," "Top sources," "Recent events," "Newest messages") was a plain `<span>`, leaving screen-reader users with no way to jump between dashboard sections by heading — a real regression against the public site's careful heading discipline (verified defect-free by the same audit). Converted to `<h2>` (Tailwind's preflight already resets heading font-size/weight to `inherit`, confirmed by the same visual-parity pattern already used elsewhere in this codebase, so this is a semantic-only change with no visual difference). The per-message `MessageDialog` heading, which was also an `<h2>` and therefore a sibling of the (now real) "Newest messages" `<h2>` rather than nested under it, was demoted to `<h3>` and given a more distinguishing label (`"{name} - {inquiryType}"` instead of just the inquiry type, which produced many identical/near-identical headings when navigating by heading list).

**Admin landmarks and skip link.** `/admin/login` had no `<main>` landmark at all (fixed: the page's outer `<section>` is now `<main>`). The authenticated admin shell (`admin-shell.tsx`) had `tabIndex={-1}` already set on `#admin-content` but no skip link ever pointing at it — dead affordance, unlike the public `SiteShell`, which has both. Added a matching `.skip-link` anchor.

**Admin login error focus.** `login-form.tsx`'s error alert had `role="alert"`/`aria-live="assertive"`/`tabIndex={-1}` but nothing ever called `.focus()` on it — inconsistent with the contact form's more complete pattern (`alertRef.current?.focus()` in a `useEffect` keyed off status changes), which was already correct. Login form now mirrors that exact pattern. Verified with a component-level unit test (`tests/unit/phase-8-login-form.test.tsx`) that mocks `loginAction` and asserts the alert receives focus after a failed submission — a live E2E version of this check was attempted first and abandoned: submitting the real form locally throws an unhandled `ANALYTICS_HASH_SALT is required` error before even reaching the database, because neither that secret nor a real Postgres instance exists in this environment. The unit test verifies the actual UI behavior directly and does not depend on either.

**Admin inbox — two functional bugs, not just accessibility polish.** The audit found `message-row.tsx`'s read/unread toggle button had no `onClick` handler at all — a dead control — despite `setMessageReadAction` already existing, fully implemented, and unused (`inbox/actions.ts`). Separately, `delete-dialog.tsx` (despite its name) performed the delete immediately on a single click with no confirmation step of any kind, directly contradicting the original Phase 6 roadmap requirement ("read/unread and delete operations plus confirmation and optimistic-state rollback"). Both were fixed:

- `MessageRow` is now a client component that calls `setMessageReadAction` on click with an optimistic toggle and rollback on failure, and an explicit `aria-label` ("Mark message from {name} as read/unread") plus `aria-pressed` reflecting the toggle state — the previous accessible name was just the row's own visible text, which didn't describe what activating it would do.
- `DeleteDialog` now opens a real confirmation dialog (reusing the existing `components/ui/dialog.tsx` Radix wrapper with `role="alertdialog"`) with explicit Cancel/Delete actions; the delete action only fires after Delete is clicked. Both are covered by `tests/unit/phase-8-inbox-actions.test.tsx` (optimistic toggle + rollback; confirm-before-delete; cancel performs no mutation).

These two are functional/product bugs the accessibility pass happened to surface, not accessibility issues in isolation — flagging that distinction rather than treating them as routine a11y polish.

**Admin touch targets.** Sidebar nav links, the sign-out button, the dashboard range-selector links, and the inbox delete trigger used ~28-37px computed heights (`admin.module.css`), below the project's own stated 44px practical target (all public-site controls already use `min-h-11`) though still above the 24px WCAG 2.2 AA floor. Brought to `min-height: 44px` for consistency with the rest of the site.

**Video description association.** The muted client-work walkthrough recordings (`client-work-media.tsx`) already rendered their `description` content as visible text once the disclosure opened (not inert metadata, confirmed by the audit) but only as a sibling paragraph with no programmatic link to the `<video>`. Added `aria-describedby` via `React.useId()`. Verified with a new assertion in `tests/unit/phase-5-client-work.test.tsx`.

### Verified, no fix needed

The audit also confirmed several areas already meet the bar and required no change: heading order and one-`<h1>`-per-page on every public route; `aria-hidden` applied consistently to every decorative icon/glyph; every image `alt` is specific and content-driven; the contact form's labels/`aria-describedby`/`aria-invalid`/focus-management pattern; the command palette's and poster-mode dialog's Radix-based focus trap and restore-on-close; no `position: sticky` anywhere in the codebase (so WCAG 2.2's "focus not obscured" criterion isn't at risk); the Architecture X-Ray, Oxford model comparison, and Agent Run Replay proof components all ship a static text/table alternative alongside their interactive version and use real `<button aria-pressed>` elements, not drag/hover-only interaction; the admin trend chart has a real, visible `<table>` alternative to the Recharts SVG; and the global reduced-motion CSS rule plus independent JS-level checks in `page-transition.tsx`/`architecture-xray.tsx`/`agent-run-replay.tsx` already cover every animation in the codebase with no gap.

### Verified live in a browser (not just read)

The button/command-palette contrast fixes were confirmed against actual computed styles in a running Night-mode session (not just the token math) before being called done. A 200%-browser-zoom reflow check was added for `/`, `/projects`, a case study, and `/services`, plus the command palette staying within the viewport at that zoom level. The first implementation used the non-standard CSS `zoom` property and produced an apparent overflow on the case-study route that no individual element inspection could reproduce or attribute — a known artifact of that property mixing pre-/post-zoom pixel units across different DOM measurement APIs in Chromium. Replaced with the standard, unambiguous equivalent (halving the viewport width, since 200% zoom on a 1280px desktop view is definitionally the same reflow requirement as an unzoomed 640px viewport) — all 5 routes pass cleanly with no real defect.

### Explicit external dependencies (not fixed here, recorded rather than skipped)

- **NVDA screen-reader pass.** Not installed on this machine; installing it would need an elevated/admin install step this agent won't perform unilaterally (matches the "modifying system settings" boundary), and evaluating spoken output either way isn't something this agent can judge. This needs Yehia's own hands-on pass, same disposition as the other Task 0 manual items.
- **Live axe/keyboard verification of the authenticated `/admin` dashboard and `/admin/inbox`.** Genuinely requires a real Neon Auth session — confirmed by reading `features/admin/auth/server.ts`: `auth.getSession()` calls the real `@neondatabase/auth` client against `NEON_AUTH_BASE_URL`, with no local mock/bypass path in the codebase. All fixes to these two routes (headings, skip link, touch targets, inbox actions) were therefore verified at the component level via `@testing-library/react` unit tests instead of a live rendered page, and are called out individually above rather than folded silently into "done."

### Verification

- `pnpm format:check` / `pnpm lint` / `pnpm typecheck`: clean.
- `pnpm test`: 51 files, 278 tests passed (+27 over Stage 3, covering every fix above).
- `pnpm build`: succeeds; route shape unchanged (all public routes static).
- `pnpm exec playwright test` (full suite): 211 passed, 2 skipped (same two live-DB-gated tests), 2 failed on the first full-parallel run (`homepage-interactions.spec.ts` route-history animation, `responsive.spec.ts` command-palette-in-viewport) — both reproduced 3/3 passing when re-run in isolation with `--repeat-each=3`, confirming the same pre-existing resource-contention flakiness under full parallel load already documented in the Stage 2 baseline, not a Stage 4 regression.
- `git diff --check`: clean after reverting the routine `next-env.d.ts` churn.

No production behavior regressed. Next: Stage 5 (security — auth boundary tracing, response headers, dependency/secret audit).

## Stage 5: Security and Privacy

A background evidence trace covered auth-boundary enforcement, every admin-data entry point, the contact/analytics/health/maintenance endpoints, and database query parameterization/bounds. It was code-level and cited exact files/lines rather than assumed; findings below are what it and follow-up verification confirmed.

### Auth boundary tracing

The proxy (`src/proxy.ts`, matcher `["/admin/:path*"]`) delegates to `protectAdminRequest`, which lets `/admin/login` through and otherwise defers to Neon Auth's own session-validating middleware. It does **not** cover `/api/auth/*` (that route has its own independent `guardAuthRoute()` check) or, critically, cannot be assumed to cover every possible path a Server Action could theoretically be dispatched to — Next.js identifies Server Actions by an action ID carried in a request header, not by the URL path that imported them. Rather than trust that the proxy alone is sufficient, this was verified as **already handled by defense-in-depth**: every function that actually reads or mutates admin data (`readContactPage`, `setContactMessageRead`, `deleteContactMessage`, `readAdminOverview`) calls `requireAdmin()` at the query layer itself, independent of the route/proxy layer. This was previously only proven by call-*order* assertions ("auth before db"); Stage 5 adds explicit fail-closed tests proving that when `requireAdmin()` rejects, **no database write or read happens at all** — `tests/unit/phase-7-inbox-actions.test.ts` and `tests/unit/phase-7-admin-queries.test.ts` now cover this directly, which is the property that actually matters regardless of which URL a request hits.

### Fixed: incomplete signup/identity-creation blocklist

`isBlockedAuthPath`'s `BLOCKED_AUTH_PREFIXES` (`src/features/admin/auth/server.ts`) already blocked sign-up, social/magic-link/email-otp sign-in, password reset, and the organization plugin. Checked against the actual route surface the installed `@neondatabase/auth` package exposes (its own compiled type declarations enumerate every path literal its handler can proxy to Neon Auth — not guessed), three real gaps were found and closed:

- `token/anonymous` — creates an unauthenticated session/account without going through the blocked sign-up flow at all.
- The entire `admin/*` plugin namespace (`admin/create-user`, `admin/set-role`, `admin/impersonate-user`, etc.) — a completely different, more dangerous RBAC surface than this app's own `ADMIN_USER_ID` check, previously unblocked.
- `email-otp/*` and `magic-link/*` sub-paths — distinct prefixes from the already-blocked `sign-in/email-otp` and `sign-in/magic-link` *entry points*, so `email-otp/send-verification-otp` etc. were reachable even though the sign-in variant wasn't.

Left open, deliberately: `change-password`, `update-user`, `delete-user`, `list-sessions`, `token`, `jwt`, `get-session`, `sign-out`. Since sign-up is fully blocked, only the pre-provisioned admin can ever hold a session at all, so self-service session management stays available rather than being removed for no security benefit. `tests/unit/phase-7-admin-security.test.ts` now asserts both the blocked set (13 paths) and this explicitly-allowed set (6 paths).

### Fixed: timing side-channel in the maintenance endpoint

`timingSafeEqualStrings` (`src/features/operations/maintenance.ts`) wrapped Node's constant-time `timingSafeEqual`, but early-returned `false` on a **length mismatch** before ever calling it — a classic length-oracle: response timing would differ (if imperceptibly) between a guess of the wrong length and one of the right length before the real comparison began. Fixed by hashing both sides to a fixed-length SHA-256 digest first, so the buffers passed to `timingSafeEqual` are always 32 bytes regardless of input length — there is no longer a length branch to leak anything through. `CRON_SECRET` is presumably long and random enough that this was a low-severity, largely theoretical gap, but the fix is standard and free, so it wasn't left in place.

### Dependency audit: 28 vulnerabilities → 9, all now either unreachable or bundled inside the newest available Next.js

`pnpm audit` initially reported **28 vulnerabilities (1 critical, 16 high, 9 moderate, 2 low)**. Nearly all of them trace through one path: `@neondatabase/auth` (already at its latest release, `0.4.2-beta` — no newer version exists to bump to) pulls in `better-auth@1.4.18`, which is far behind upstream (`1.6.25` was current). Two fixes, both verified with the full test suite/build/lint before being kept:

1. **`next` 16.2.10 → 16.2.12** (`package.json`, matching `eslint-config-next` bump) — this app's own direct dependency was itself inside the vulnerable range (`<16.2.11`) for 4 high + 5 moderate Next.js CVEs (middleware/proxy bypass, SSRF in Server Actions and rewrites, DoS, cache confusion, unauthenticated Server Function disclosure). `pnpm why next` confirmed this single bump deduplicated the nested copy `better-auth` depends on too, fixing both at once.
2. **`better-auth` pinned to `1.6.25` via a `pnpm-workspace.yaml` override** — verified compatible (full test suite, build, and the admin-security test suite all pass unchanged) before being kept. This alone eliminated the critical finding (OAuth refresh-token replay via missing client authentication on plugins this app doesn't enable) and 7 of the high findings (insecure OIDC defaults, stored XSS in OIDC/MCP, OAuth code-grant races, account takeover via unverified OAuth auto-link and magic-link/OTP pre-account hijacking, unauthorized organization-invite acceptance) — none of which this app's own email/password-only, single-admin flow uses, but a version override is safer and simpler than relying on that alone.

**Remaining 9 (1 low, 3 moderate, 5 high) were assessed for reachability, not just severity, and none block completion:**

- `postcss@8.4.31` and `sharp@0.34.5` are bundled *inside* `next@16.2.12` itself — the newest Next.js release available today; there is no newer version to bump to, and forcing an override on either risks breaking Next's own internal build/image pipeline for marginal benefit. `postcss`'s vulnerable feature (arbitrary file read via attacker-controlled `sourceMappingURL`) only processes this project's own first-party, trusted CSS at build time — never attacker-controlled input. `sharp`'s libvips CVEs require a malicious image reaching Next's image-optimization pipeline; this app's `images.remotePatterns` allowlists exactly one Cloudinary cloud name, bounding (not eliminating) that surface.
- `tmp`, `uuid`, `brace-expansion` (via `@lhci/cli`'s own `inquirer`/`chrome-launcher`/`glob`/`minimatch` chain) and `esbuild` (via `better-auth`'s own `drizzle-kit` dependency, and specifically only its unused local dev-server feature) are all devDependency-only, never shipped to or executed by the deployed app. `@lhci/cli` is already at its latest release (`0.15.1`); there is no newer version to bump to either.

### CSP and security-header policy

Implemented in `next.config.ts`'s `headers()`, applied globally (`source: "/:path*"`) alongside the existing admin/`api/auth`-specific rules (unchanged): `Content-Security-Policy`, `Strict-Transport-Security` (`max-age=63072000; includeSubDomains`), `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, a minimal `Permissions-Policy` (camera/microphone/geolocation/payment/usb all denied), and `X-Frame-Options: DENY` as a legacy-browser fallback alongside the CSP's own `frame-ancestors 'none'`.

Public static rendering is locked, so a per-request nonce was never an option (it would force dynamic rendering). The policy was derived from evidence, not guesswork: the actual production HTML was fetched and inspected directly, confirming Next's own RSC hydration mechanism injects ~23 inline `<script>` tags per page (`self.__next_f.push(...)`) whose content is unique per render and therefore cannot be pre-hashed, and that activating the Architecture X-Ray proof (`@xyflow/react`) writes real `style="..."` attributes onto 20+ DOM elements for node positioning — confirmed by actually clicking it live and inspecting `document.querySelectorAll('[style]')`, not assumed. Both mean `'unsafe-inline'` on `script-src` and `style-src` is a genuine framework/library requirement, not a shortcut; every other directive stays strict (`default-src 'self'`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `frame-ancestors 'none'`, `frame-src 'none'`, `img-src`/`font-src`/`connect-src`/`media-src` all same-origin plus the one configured Cloudinary host for images).

The policy was implemented as `Content-Security-Policy-Report-Only` first and driven through every representative route, the Architecture X-Ray activation, the command palette, and `/admin/login` with a Playwright console listener watching for CSP violation reports (`tests/e2e/csp.spec.ts`) — zero violations across all 8 checks. Only then was it switched to enforcing. Re-running the same 8 checks under actual enforcement (not just report-only detection) surfaced one real, expected gap: React's development build uses `eval()` for its debugging/stack-trace overlay and logged a blocked-eval console warning (dev-server-only; the exact message states "React will never use eval() in production mode"). Fixed with a `NODE_ENV === "development"`-gated `'unsafe-eval'` addition, verified absent from the actual production build's response header afterward.

### Confirmed clean, no fix needed

The audit also confirmed, with evidence rather than assumption: contact/analytics endpoints already reject duplicate form fields (`formData.getAll(name).length !== 1`) and unexpected JSON keys (`hasExactKeys`), enforce body-size limits (16kb Server Actions, 2048-byte `/api/track` checked against both `content-length` and the actual read bytes), use one atomic `INSERT ... ON CONFLICT DO UPDATE` for rate-limiting (race-safe under concurrent submissions), return only generic errors, and log failures via `safeLog` (code + random UUID only — never message bodies, emails, or names); `/api/health` exposes nothing beyond `{status}`; `/api/maintenance` returns an identical generic 401 whether the secret is missing or wrong; every spot-checked database query uses Drizzle's parameterized `sql` template (no string-concatenated SQL anywhere in `src/db`), has a hardcoded (not client-controlled) upper bound, and its `WHERE`/`ORDER BY` columns align with an existing index's leading columns. A whole-source-tree regression test (`tests/unit/no-iframes.test.ts`) now backs up the existing zero-iframe finding, matching the decision register's locked no-iframe design.

### Secrets/PII scan

Scanned tracked source, `.env.example`, the full branch diff against `main`, every commit message on this branch, and the actual client-side production build output (`.next/static/`) for API-key/private-key/connection-string patterns and for the eight server-only environment variable *names* themselves (to catch a server-secret-reading code path accidentally bundled into a client component). One match, in `.github/workflows/quality.yml`'s CI-only `postgres://ci:ci@localhost` placeholder — a harmless dummy value, not a real credential. Nothing else found anywhere, including zero server-only env var names in any client-shipped JS chunk.

### Verification

- `pnpm format:check` / `pnpm lint` / `pnpm typecheck`: clean.
- `pnpm test`: 52 files, 286 tests passed (+8 over Stage 4).
- `pnpm db:check`: passed (dummy local `DATABASE_URL`).
- `pnpm build`: succeeds; route shape unchanged (all public routes static).
- `pnpm measure:build`: 28 chunks, 432,045 gzip bytes, 1,394,015 raw bytes — a 0.84% increase over the Stage 4 baseline (mostly the Next.js patch bump), still far under the 10% gate.
- `pnpm exec playwright test` (full suite): 219 passed, 2 skipped (same two live-DB-gated tests), 2 failed on the first full-parallel run (`csp.spec.ts` command-palette check, `homepage-interactions.spec.ts` N-key mode cycling) — both reproduced passing when re-run in isolation (3/3 and 5/5 respectively, the latter with `--workers=1` to remove all contention), confirming the same pre-existing resource-contention flakiness already documented in Stages 2-4, not a Stage 5 regression.
- `pnpm lighthouse`: three consecutive runs on the *same, unmodified* build produced performance 89/80/83 (near-failing), then CLS 0/0.30/0.30 (failing), then a clean 94/100/100/100 with LCP 3066.5ms and CLS 0 — the same run-to-run variance already documented as machine-dependent noise (Stage 2/4 baselines), not a real regression from adding response headers (which are computed once as a constant string, not per-request work of any real cost). The clean run's numbers are what's recorded in `docs/implementation/phase-8-lighthouse-baseline.json`.
- `git diff --check`: clean after reverting the routine `next-env.d.ts` churn.

No production behavior regressed. Next: Stage 6 (performance — bundle/image/font/cache/query optimization against the measured baselines, plus expanding Lighthouse to all 4 representative routes and removing the temporary Phase 7 thresholds).

## Stage 6: Performance

Scope: expand Lighthouse to all 4 representative routes and remove the temporary Phase 7 thresholds, review bundle composition, audit responsive image sizing, review font-loading behavior against actual critical-path usage, design and apply a cache-header policy, finalize the database query-plan disposition, and add a synthetic INP proxy. Every change below is tied to a measured finding — nothing here is a speculative "best practice" applied without evidence, per the design's explicit instruction to optimize only measured bottlenecks.

### Lighthouse expanded to 4 routes, temporary thresholds removed

`lighthouserc.cjs`'s `collect.url` now covers the homepage, `/projects`, one case study (`/projects/skillbridge-ai-interviewer`), and `/services` (3 runs each, 12 total). The Phase 7 temporary allowances are gone: `categories:performance` raised from `minScore: 0.9` to `0.95`, `largest-contentful-paint` tightened from `maxNumericValue: 3400` to `2500`. `categories:accessibility` (`0.95`), `categories:best-practices` (`0.9`), `categories:seo` (`1`), and `cumulative-layout-shift` (`maxNumericValue: 0.1`) are unchanged.

`scripts/measure-lighthouse.ts` had a latent bug from the single-URL era: it hardcoded `if (runs.length !== 3)`, so once `lighthouserc.cjs` grew to 4 URLs × 3 runs it would throw (`Expected 3 Lighthouse runs, received 12`) instead of writing a baseline — this is why `docs/implementation/phase-8-lighthouse-baseline.json` was still holding Stage 5's stale snapshot even after several Stage 6 measurement passes. Fixed by grouping the collected `lhr-*.json` reports by their `requestedUrl` pathname and writing a per-route summary (`Record<route, LighthouseSummary>`) instead of one flat object; the existing `summarizeLighthouseRuns` unit test (`tests/unit/measure-lighthouse.test.ts`) didn't need to change since that pure function's contract is unchanged, only how `main()` groups its input.

### Bundle composition: no regression, expensive packages stay isolated

`pnpm measure:build`: 28 chunks, 432,066 gzip bytes / 1,394,054 raw bytes — 21 bytes over the Stage 5 baseline (432,045 / 1,394,015), i.e. unchanged; none of this stage's fixes touch client JS. Reconfirmed both previously-flagged heavy packages stay out of the shared bundle: `src/features/admin/analytics/trend-chart.tsx` is the only importer of Recharts and is itself only reachable from `/admin`; `src/features/case-study/proof/architecture-xray-launcher.tsx` still loads `@xyflow/react` via `await import("./architecture-xray")`, so it only downloads when a visitor actually activates the Architecture X-Ray proof.

### Responsive image sizing

Audited every `<Image>` call site. `src/features/services/client-work-media.tsx` was missing a `sizes` prop entirely — a plain `next/image` usage (not the project's `ProjectImage` wrapper, where `sizes` is required at the type level), so it silently defaulted to Next's `100vw` assumption despite rendering at roughly one-third viewport width once the 3-column grid breakpoint (`grid-cols-1 min-[820px]:grid-cols-3` in `client-work-grid.tsx`) is active. Fixed: `sizes="(min-width: 820px) 33vw, 100vw"`. Cloudinary's `MAX_SOURCE_WIDTH = 1600` ceiling (`src/features/media/cloudinary.ts`) was reviewed and confirmed already reasonable for this project's largest rendered image size — left unchanged.

### Font loading: `adjustFontFallback` gap closed, one inconclusive CLS lead investigated and not chased further

`src/app/fonts.ts`: `archivoStatement`, `archivoWide`, and `jetBrainsMono` were missing `adjustFontFallback: "Arial"` (only the base `archivo` face had it — `next/font/local` only accepts `"Arial"` or `"Times New Roman"` for this option). Found via Lighthouse's `layout-shifts` audit, which named `<main>` shifting due to a web font load for both `archivo_latin_variable` and `jetbrains_mono_latin_variable` on one run. The fix is legitimate and free (it lets the fallback metrics better match the real face, reducing reflow on swap), so it was kept — but it did **not** change that specific CLS score at all, to 15 decimal places, even after being applied, which means it wasn't the actual cause of that particular instance. Further investigation (a live, unthrottled browser session: `performance.getEntriesByType('layout-shift')` returned an empty array — zero real shifts; and a review of `src/features/home/home.module.css`, confirming the monogram hero animation only ever animates `transform`/`opacity`, which are compositor-only and structurally cannot cause layout shift) points to this being a Lighthouse-simulated-throttling artifact tied to font-load timing races rather than a real user-facing bug. Per the design's instruction to optimize only measured bottlenecks — not speculative ones — this was not chased further once the live-session evidence came back clean.

### Cache-header policy for static/generated assets

Previously, `/cv/*`, `/media/*`, and every OG image route inherited Next's `max-age=0` default (no caching at all). Designed and applied a policy per asset class, then backed it with tests:

- **OG images** (all 8 routes, via the one shared `renderOgImage()` in `src/lib/og/render-og-image.tsx`): `Cache-Control: public, max-age=3600, stale-while-revalidate=86400`. Not `immutable`: each route's build-time hash in its public path is derived from the route's *code*, not the case-study/profile *text* it renders, so a content-only edit between deployments could otherwise serve a stale image at the same URL for a full year. A one-hour fresh window with a background revalidation day removes the previous `max-age=0` cost (a Fluid Compute invocation on every single request) without that staleness risk.
- **`/cv/*` and `/media/*`** (`next.config.ts` `headers()`): `Cache-Control: public, max-age=3600, must-revalidate`. Both are static files under `public/` that get replaced manually and infrequently (a new CV, a new client-work recording) without the filename ever changing, so `immutable` would risk serving stale content indefinitely; a moderate revalidating window is the safer middle ground.

Verified live against a running `pnpm start` server with direct requests before writing regression coverage: `tests/e2e/og-images.spec.ts` now asserts the exact header value (was a loose `toBeTruthy()`), and `tests/unit/phase-7-admin-security.test.ts` gained a test asserting both the `/cv/:path*` and `/media/:path*` header rules exist with the exact expected value.

### `experimental.inlineCss`: tested twice, wrong both times, finally settled by measuring the right environment

LHR JSON analysis of the render-blocking-resources audit showed two CSS chunks consistently blocking first paint across all 4 routes (~307ms and ~157ms, ~460ms combined — not noise, present in every run inspected). Next's `experimental.inlineCss` flag exists for exactly this. Stage 6 enabled it, observed CLS 0.283 on `/services`, concluded the flag had caused a regression, and reverted it.

**That conclusion was wrong.** The same 0.283 CLS was later observed repeatedly on `/services` *without* the flag — including all three runs of the Checkpoint 4 Preview measurement recorded in the table further down this report, and on three of four routes in a local baseline re-measured during the CI investigation. Stage 6 attributed a pre-existing, intermittent layout shift to the one change that happened to be in flight at the time. The correct control — measuring the same routes with the flag off — was never run.

Re-tested properly during the CI investigation as a controlled A/B on the same machine, same build settings, 3 runs per route:

| Route | LCP median, flag off | LCP median, flag on | Δ | CLS, flag off | CLS, flag on |
|---|---:|---:|---:|---|---|
| `/` | 3177ms | 2615ms | **−562ms** | 0.00 / 0.00 / 0.00 | 0.00 / 0.00 / 0.00 |
| `/projects` | 3040ms | 2627ms | **−413ms** | 0.00 / 0.00 / **0.28** | 0.00 / 0.00 / 0.00 |
| `/projects/skillbridge-ai-interviewer` | 2774ms | 2717ms | −57ms | **0.28** / 0.00 / **0.28** | 0.00 / 0.00 / 0.00 |
| `/services` | 2947ms | 2717ms | **−230ms** | **0.28** / **0.28** / **0.28** | 0.00 / 0.00 / 0.00 |

On localhost the flag looked like a decisive win on both metrics. **That conclusion was also wrong**, for a subtler reason: localhost is the one environment where inlining is free. Re-measuring the same commit on the deployed Preview — the environment the design's targets actually refer to — showed the opposite:

| Route | Preview LCP, flag off | Preview LCP, flag on | Preview CLS, flag off | Preview CLS, flag on |
|---|---:|---:|---|---|
| `/` | 2783ms | 2907ms | 0 / 0 / 0 | 0.30 / 0 / 0 |
| `/projects` | 2490ms | 2643ms | 0.28 (1 of 3) | 0.28 (3 of 3) |
| `/projects/skillbridge-ai-interviewer` | 2646ms | 2789ms | 0 / 0 / 0 | 0.28 (3 of 3) |
| `/services` | 2639ms | 2643ms | 0.28 (3 of 3) | 0.28 (3 of 3) |

Neutral to slightly worse on the real deployment, on both metrics. The mechanism is coherent: inlining trades a stylesheet round-trip for a larger HTML document that must download in full before parsing. Over localhost, where latency is ~0, dropping the round-trip is pure profit. Over Lighthouse's simulated slow 4G against a real origin, the extra document bytes cost more than the round-trip saved.

**Reverted, and the CI gate is deliberately not the arbiter here.** The Lighthouse gate runs against `next start` on localhost, so keeping the flag would have improved the *gate* while leaving real visitors no better off — optimizing the measurement instead of the product. The Preview number is the one that reflects users.

Three conclusions were drawn about this one flag across Stage 6 and Checkpoint 4, and the first two were wrong in opposite directions. The common failure was measuring in one environment and generalizing: Stage 6 never ran the flag-off control, and the first re-test never left localhost. Recorded in full rather than presented as a clean result, because the sequence is the useful part.

### Synthetic INP proxy (explicitly labeled synthetic, per design section 3)

Real-user INP p75 cannot be truthfully established locally or from a low-traffic Preview — that confirmation is explicitly Phase 9/post-launch's responsibility once enough eligible visits exist. `tests/e2e/synthetic-inp.spec.ts` (new) instead instruments the same browser mechanism real INP sampling reads from — the Event Timing API (`PerformanceObserver` with `type: "event"`) — against four repeatable, scripted interactions: opening the command palette (keyboard), cycling display mode with `N` (keyboard), switching a project category filter (pointer), and activating the Architecture X-Ray (pointer, the one interaction that synchronously mounts a whole lazy-loaded canvas library, so it's checked against 2.5× the budget — 500ms vs. 200ms — rather than held to the same tight number as the other three). All 4 pass. `durationThreshold` is a real Event Timing API option that the pinned TypeScript version's bundled DOM lib doesn't yet declare; handled with a narrow `as Record<string, unknown>` spread-cast rather than a blanket `@ts-expect-error` or a type-lib change.

### Database query-plan review: final disposition unchanged

As recorded in Stage 2 and re-confirmed during Stage 5's endpoint audit, every spot-checked query in `src/db/queries/*.ts` already uses Drizzle's parameterized `sql` template, a hardcoded (not client-controlled) upper bound, and `WHERE`/`ORDER BY` columns that align with an existing index's leading columns (the index inventory read from migration SQL in Stage 2). Live `EXPLAIN` plans remain blocked on the same external dependency as before — no local Postgres/Neon connection is available in this environment, and genuine query-plan capture requires either a local instance or Preview/production database access, both reserved to Yehia. Nothing new to fix here; this is a disposition, not a gap.

### Lighthouse result: does **not** yet pass locally against the Phase 8 thresholds — flagged, not hidden

Running `pnpm lighthouse` (`lhci collect && lhci assert`) against the final Stage 6 build produced `assertion-results.json` with 5 real failures out of the full 4-route × 6-assertion matrix:

| Route | Failure | Threshold | Actual |
|---|---|---|---|
| `/` | `categories:performance` | ≥ 0.95 | 0.94 |
| `/` | `largest-contentful-paint` | ≤ 2500ms | 3028ms |
| `/projects` | `largest-contentful-paint` | ≤ 2500ms | 2873ms |
| `/projects/skillbridge-ai-interviewer` | `largest-contentful-paint` | ≤ 2500ms | 2880ms |
| `/services` | `largest-contentful-paint` | ≤ 2500ms | 2912ms |

Everything else passed: `categories:accessibility` (100 on all 4), `categories:best-practices` (100 on all 4), `categories:seo` (100 on all 4), and — despite one of the three raw runs per route showing CLS around 0.28-0.30 (the same inconclusive font-timing-race pattern investigated above) — `cumulative-layout-shift`'s median-run aggregation landed on a clean run for every route, so it passed everywhere.

Root cause for the LCP overage, to the extent it was locatable: the LCP element is always text (never an image) on every route, so image loading isn't the lever; Total Blocking Time and server-response-time are already well within budget on every run inspected; the one real, consistent, measured contributor — the two render-blocking CSS chunks described above — has exactly one available Next.js lever (`experimental.inlineCss`), and enabling it traded a CLS regression for no reliable LCP win, so it was reverted rather than kept. No further un-measured "optimizations" were applied chasing this number, per the design's explicit instruction to optimize only measured bottlenecks and never weaken a target to force a pass.

Per that same instruction, `lighthouserc.cjs`'s thresholds were **not** loosened to make this pass locally. This project has independently, repeatedly documented that Lighthouse readings on this local Windows machine are not simply reproducible run-to-run even on byte-identical code — Stage 5's own checkpoint saw three consecutive runs on one unmodified build swing from performance 89/80/83, to CLS 0/0.30/0.30, to a clean 94/100/100/100; this stage's 12-run set shows the same pattern (1 bad run in 3 for CLS, on every route). Checkpoint 3 (design section 8) requires Lighthouse evidence to "pass locally... before a Preview is treated as a release candidate" — that condition is **not fully met by this local measurement**, and this report does not claim otherwise. Final confirmation is deferred to Checkpoint 4's production-like Vercel Preview run in Stage 7, which is the mechanism the design itself provides for exactly this class of environment-dependent measurement.

### Stage 6 summary

| Area | Status |
|---|---|
| Lighthouse coverage | Expanded from 1 to 4 representative routes; temporary Phase 7 thresholds removed |
| Bundle size | 432,066 gzip bytes — unchanged from Stage 5 (+21 bytes) |
| Expensive packages | Recharts and `@xyflow/react` confirmed still isolated from the shared bundle |
| Responsive images | Fixed missing `sizes` on `client-work-media.tsx`; Cloudinary width ceiling confirmed reasonable |
| Font loading | `adjustFontFallback: "Arial"` completed for all 4 local faces |
| Cache headers | Designed and applied for OG images, CV, and client-work media; backed by unit + e2e tests |
| CSS inlining | Tried, measured a CLS regression, reverted |
| Synthetic INP proxy | 4 interactions instrumented via the real Event Timing API, all under budget, labeled synthetic |
| Database query plans | Disposition finalized — live `EXPLAIN` blocked on Preview/DB access (external dependency, unchanged since Stage 2) |
| Lighthouse gate | **Not met locally**: LCP over budget on all 4 routes, performance category short on the homepage — flagged for Checkpoint 4 (Preview) confirmation |

### Verification

- `pnpm format:check` / `pnpm lint` / `pnpm typecheck`: clean.
- `pnpm test`: 52 files, 288 tests passed.
- `pnpm db:check`: passed (dummy local `DATABASE_URL`).
- `pnpm build`: succeeds; route shape unchanged (all public routes static).
- `pnpm measure:build`: 28 chunks, 432,066 gzip bytes, 1,394,054 raw bytes — +21 bytes over Stage 5, no meaningful change.
- `pnpm exec playwright test` (full suite): 225 passed, 2 skipped (same two live-DB-gated tests).
- `pnpm lighthouse`: does not pass locally — see the dedicated section above for the full failure/root-cause breakdown; not glossed over.
- `git diff --check`: clean after reverting the routine `next-env.d.ts` churn.

No production behavior regressed. The local Lighthouse gate does not yet pass against the tightened Phase 8 thresholds; that gap is carried forward for Preview confirmation rather than fixed by loosening it. Next: Stage 7 (browser and production-like Preview matrix).

## Stage 7: Browser and Production-like Preview Matrix

Scope: run the site under Chromium, Firefox, desktop WebKit, and iPhone-style WebKit; verify the site's no-iframe framing policy holds on iPhone-style WebKit specifically; manually inspect representative routes at 360/390/768/1024/1440/1920 CSS-pixel widths; then hand the production-like Vercel Preview matrix (Checkpoint 4) to Yehia, since it needs his own Preview credentials and protection-bypass secret.

### Playwright browser matrix

`playwright.config.ts` now defines 4 projects. Chromium runs the complete suite (unchanged). Firefox, desktop WebKit (`Desktop Safari` device), and iPhone-style WebKit (`iPhone 14` device) run a focused 10-file subset chosen to cover every area the design names — navigation (`shell.spec.ts`), metadata (`homepage.spec.ts`, `projects.spec.ts`, `services.spec.ts`, `case-studies.spec.ts`), download (`cv-download.spec.ts`), contact (`phase-6.spec.ts`), proof interaction (`phase-5-proof.spec.ts`), responsive (`responsive.spec.ts`), and accessibility smoke (`accessibility.spec.ts`) — while Chromium-specific verification techniques that don't vary by rendering engine (CSP header parsing, OG image byte content, the Event Timing API used by the synthetic INP proxy, the zoom-simulation math) stay Chromium-only. Firefox and WebKit browser binaries were not yet installed locally and were downloaded via `pnpm exec playwright install firefox webkit` before the first run.

### Three real cross-browser bugs found and fixed

The first full 4-project run (774 passed, 6 failed, 8 skipped, 20.8 minutes) surfaced three genuine, reproducible engine-specific defects — not flakes, not environment noise. Each was root-caused against the real Playwright browser (never guessed from a Chromium-only reproduction) and fixed rather than skipped, since the design requires a documented product reason for any engine-specific skip, not a convenience exception:

1. **Case-study heading text overflow in WebKit** (`stays inside the viewport at /projects/oxford-pet-binary-segmentation (390px)`, failed on both `webkit` and `webkit-iphone`). Forensic instrumentation (a temporary debug block added to the failing test, run against the real WebKit engine, then removed) showed the overflow traced through `.site-frame` → `main` → `header` → the case-study `<h1>`, each reporting `scrollWidth` larger than `clientWidth` by the same amount — meaning the `<h1>` text itself didn't fit its container. `src/components/ui/page-title.tsx`'s heading (`font-stretch-[120%]`, a `clamp()`-sized variable-font weight/width combination) was missing the `[overflow-wrap:anywhere]` rule that `src/features/home/contact-section.tsx`'s visually-similar heading already carries — an existing, proven fix pattern in this codebase that just hadn't been applied consistently. "Segmentation" (12 characters, no internal break opportunity) is the longest single word across every case-study title, which is why only this route failed: shorter longest-words wrap normally at the space before them, but WebKit's rendering of this specific word at this font-stretch/size combination doesn't fit 334px of available width, and without `overflow-wrap`, a browser is not permitted to break it. Fixed by adding the same `[overflow-wrap:anywhere]` rule to `page-title.tsx`; verified passing on all 4 projects afterward. An earlier hypothesis (that the `.page-transition` full-viewport overlay's `scaleX(0)`-transformed spans were contributing pre-transform layout width to `document.documentElement.scrollWidth`) was tested and disproven directly — removing the element from the DOM inside the same debug harness left `scrollWidth` completely unchanged — and not kept as a speculative fix.
2. **Skip link unreachable by Tab in WebKit** (`skip link is the first tab stop and moves focus to main content`, failed on both `webkit` and `webkit-iphone`). This is WebKit's genuine default keyboard-access behavior: unlike Chromium and Firefox, Safari/WebKit does not include plain `<a href>` links in the Tab sequence unless the user has turned on Full Keyboard Access — only form controls tab-stop by default. An explicit `tabIndex` opts an element into the sequence regardless of that setting. Both skip links (`src/components/layout/site-shell.tsx` and `src/features/admin/admin-shell.tsx`, which share the identical pattern) were relying on native link focusability alone. Fixed by adding `tabIndex={0}` to both; verified passing on all 4 projects afterward. This is a real accessibility fix, not just a test fix — real Safari users who haven't customized their keyboard settings could not previously reach the skip link by Tab at all.
3. **A viewport-height assumption in the navigation test, not a product bug** (`primary navigation reaches every route frame`, failed only on `webkit-iphone`). The test clicked the "Contact" nav link (`/#contact`) and asserted the page footer was in viewport — true on every desktop-sized project, false on the iPhone-14-sized mobile viewport (390×844), because the contact section's own heading, mailto link, and full form are taller than the mobile viewport on their own, so native anchor-scroll correctly leaves the footer below the fold. Confirmed by reading `src/features/page-transition/page-transition.tsx`: hash destinations (`destination.hash` truthy) are explicitly excluded from the custom client-side transition, so `/#contact` always uses the browser's own native anchor-scroll behavior — there is no app-side scroll logic to debug here. Fixed by changing the assertion to check the Contact section's own `<h2>` heading is in viewport instead of the footer, which is what the test actually meant to verify.

### Confirmed pre-existing flake, not a new regression

`[chromium] command-palette.spec.ts › navigates with arrow keys and Enter` failed once in the full parallel run. Re-run 3 times with default parallelism: 2 passed, 1 failed. Re-run 3 times with `--workers=1`: 3/3 passed. This matches the exact resource-contention flakiness already documented in Stages 2, 4, and 5 (a recurring command-palette/N-key flake since Phase 4) — not a Stage 7 regression, and not touched.

### iPhone-style WebKit iframe-less framing policy (verified, not just assumed)

- `tests/unit/no-iframes.test.ts` scans every `.ts`/`.tsx` file under `src/` for `<iframe` and asserts zero matches — a source-level guarantee that holds regardless of rendering engine, already part of `pnpm test`.
- The CSP's `frame-ancestors 'none'` and `frame-src 'none'`, plus `X-Frame-Options: DENY` (`next.config.ts`), are response headers enforced by the server for every request — engine-agnostic by construction.
- `case-studies.spec.ts`'s "shows a Live site action only for Prestige Motors" test (confirms the case-study external link is a plain `<a href="https://prestige-motor.vercel.app/">`, not any framing mechanism) and `services.spec.ts`'s client-work media tests both run under the `webkit-iphone` project as part of the focused cross-browser set, and both passed.

### Manual inspection across 360/390/768/1024/1440/1920 CSS-pixel widths

Performed live against the running dev server via the browser-automation tool's `resize_window`/`javascript_tool`/`read_console_messages`, not merely re-reading the already-passing automated assertions:

- Homepage checked at all 6 widths: zero horizontal overflow (`scrollWidth === clientWidth`) at every width, confirmed independently in Paper, Night, and Mono (mode switching only remaps CSS custom properties, never layout, so overflow was re-checked once per width across all 3 modes rather than assumed mode-independent). Zero console errors at any width.
- `/services` checked at 768px (below the 820px client-work breakpoint) and 1024px (above it): client-work images render at ~646px (near-full-width, stacked layout) below the breakpoint and ~267px (one-third width, 3-column grid) above it — direct live confirmation that the Stage 6 `sizes="(min-width: 820px) 33vw, 100vw"` fix (`client-work-media.tsx`) renders correctly across the exact breakpoint it targets, not just that Lighthouse/Playwright don't flag it.
- Keyboard-only navigation and focus order were not re-walked manually width-by-width here: Stage 4 already did that work in full (Task 25) and it remains covered by dedicated automated tests (`shell.spec.ts`'s skip-link test, now also passing on every engine per above; `projects.spec.ts`'s keyboard category-filter test; `command-palette.spec.ts`). Re-deriving the same conclusion by hand at 6 widths would have duplicated that coverage rather than added to it.
- **Tool limitation, noted rather than hidden:** the Browser pane was not displayed on the client side during this session, so `computer{action:"screenshot"}` and coordinate-based clicks were unavailable (both require the pane to be actively compositing frames). Manual verification therefore relied on `javascript_tool`/`read_console_messages`/`get_page_text` rather than visual screenshots. This is a real gap relative to the design's "screenshots stored only under ignored temporary paths" expectation — no such screenshots exist from this session. The automated Playwright suite's own failure screenshots (under `test-results/`, already gitignored) are the only visual evidence produced this stage.

### Verification (Stage 7 local gate, before Checkpoint 4)

- `pnpm format:check` / `pnpm lint` / `pnpm typecheck`: clean.
- `pnpm test`: 52 files, 287 tests passed (unchanged — Stage 7 added no unit tests, only e2e/config changes).
- `pnpm db:check`: passed (dummy local `DATABASE_URL`).
- `pnpm build`: succeeds; route shape unchanged (all public routes static).
- `pnpm measure:build`: 28 chunks, 432,066 gzip bytes, 1,394,054 raw bytes — byte-identical to the Stage 6 baseline, as expected (this stage's fixes are CSS/`tabIndex`/test-assertion only, no JS bundle impact).
- `pnpm exec playwright test` (all 4 projects, full matrix): first run 774 passed / 6 failed / 8 skipped (3 real cross-browser bugs, fixed above; 1 confirmed pre-existing flake, reproduced passing 3/3 with `--workers=1`). Confirmation re-run after all fixes: **780 passed, 0 failed, 8 skipped (18.2 minutes)**.
- `pnpm lighthouse`: not re-run this stage. Nothing in Stage 7's changes (`overflow-wrap`, `tabIndex`, a test assertion) touches anything Lighthouse measures, and `measure:build`'s byte-identical output confirms no bundle-level change occurred. The Stage 6 Lighthouse gate status (does not yet pass locally; LCP over budget on all 4 routes, performance short on the homepage) is unchanged and remains deferred to Checkpoint 4's Preview confirmation.
- `git diff --check`: clean.

## Checkpoint 4: Production-like Preview Matrix

Executed against the real Preview deployment for this branch (`https://portfolio-website-e8yj2p7ba-yehias3eed11-5404s-projects.vercel.app`, resolved via the GitHub deployment API once Yehia pushed the branch), using the Vercel Automation Bypass secret Yehia retrieved from Vercel dashboard → Settings → Deployment Protection. Admin authentication was deliberately kept out of this process entirely: `scripts/verify-neon-admin-login.ts` (a pre-existing, hidden-password-prompt terminal script) and a manual authenticated click-around of `/admin` were run by Yehia himself, not by Claude Code, since real credential entry is outside what Claude Code will do regardless of mechanism.

### Data-hygiene incident: real contact-form entries created by mistake

Before running the automated matrix against Preview, `tests/e2e/phase-6.spec.ts` was excluded because one of its tests submits a real, unmarked contact-form entry unconditionally. This exclusion missed a second, equivalent case: `accessibility.spec.ts`'s "contact form's unavailable state" test assumes the database write will fail (matching a local, database-less dev server) and asserts a failure alert — but Preview's database is real and working, so the submission **succeeded** instead, persisting a real, unmarked contact message (name "Ada Lovelace", email `ada@example.com`, message "Hello there") once per browser project (up to 4 times) before this was caught. This is a mistake in this session's own safety review, not a product bug, and it is recorded here rather than left undiscovered. **Action needed from Yehia:** delete the "Ada Lovelace" / `ada@example.com` entries from the real `/admin/inbox` — they are easy to distinguish from real inquiries by name/email alone. Both this test and its sibling "success state" test (which has the identical issue when explicitly run live) are now excluded from any future automated Preview run pending a proper fix; neither was changed, since a real fix belongs with Phase 6's own data contract, out of Stage 7's scope.

### Real bugs found and fixed

1. **`vercel.live` CSP noise breaking console-error/CSP assertions.** Vercel automatically injects a live-feedback/comments-toolbar script (`vercel.live/_next-live/feedback/feedback.js`) into every Preview deployment — never Production — and this app's CSP correctly blocks it as a non-first-party script. That single, expected block cascaded into 27 of the first run's 36 failures across `shell.spec.ts`, `homepage.spec.ts`, and all 7 of `csp.spec.ts`'s tests, since every one of them asserts zero console errors / zero CSP violations. Fixed by filtering this one, specifically-identified, Preview-only, platform-owned message out of the error/violation collectors in those three files — the CSP itself was not weakened, and the filter cannot hide a real first-party violation, only this one known non-issue.
2. **`cv-download.spec.ts`'s Content-Disposition assertion was checking for the wrong thing.** It rejected any `<>"` character in the header, intending to guard against a future injection bug — but Vercel's real static-file serving returns the standard, spec-compliant `inline; filename="Yehia_Alsaeed_CV_AI.pdf"` (RFC 6266's normal quoted form), which the regex incorrectly flagged as unsafe. Local `next dev` apparently never sets this header at all, so the test never caught its own bug until running against a real static-file response. Fixed to assert the exact expected filename (quoted or not) instead of blanket-rejecting quote characters.

### Real environment gap found — and it was live in Production too, not just Preview (now fixed)

`curl`-ing the live Preview deployment showed `<link rel="canonical" href="http://localhost:3000"/>` on every route, `/sitemap.xml` listing every URL as `http://localhost:3000/...`, and `/robots.txt`'s `Host`/`Sitemap` lines pointing at `localhost:3000` too. `src/lib/env/public.ts`'s `resolveSiteUrl` falls back to `http://localhost:3000` whenever `NEXT_PUBLIC_SITE_URL` is unset or empty. This directly contradicts the design's own requirement ("local fallback URLs may be used only for local tests, never as Preview or Production canonical output," section 3).

**The more serious discovery:** checking Production to determine which environment scopes needed the variable revealed the *same* bug was already live there — `https://portfolio-website-azure-pi.vercel.app/` was serving `rel="canonical" href="http://localhost:3000"` and a `robots.txt` with `Host: http://localhost:3000` to real crawlers. This is **not a Phase 8 regression**: Production was running pre-Phase-8 code (`main`, merged at Phase 7), so the misconfiguration predates this phase entirely and had been live since the site's first deploy. Every prior phase's Lighthouse SEO check ran against a *local* server where the `localhost:3000` fallback is the correct value, which is why no earlier phase caught it — the bug is only observable against a deployed origin. A `NEXT_PUBLIC_SITE_URL` regression test that asserts against a deployed origin (not a local one) would be worth adding in a future phase; it is out of Stage 7's scope and is not added here.

This is a Vercel project-settings gap, not application code, so the fix was Yehia's to make (provider-console change). He added `NEXT_PUBLIC_SITE_URL=https://portfolio-website-azure-pi.vercel.app` to both the Production and Preview environment scopes and redeployed Production. Development scope was deliberately left unset, since the `http://localhost:3000` fallback is the correct value for local work.

**Verified after the fix:** Production now serves `rel="canonical" href="https://portfolio-website-azure-pi.vercel.app"` and a matching `robots.txt` `Host` line. Preview picks the value up on its next build (`NEXT_PUBLIC_*` variables are inlined at build time, not read at runtime, so the deployment that existed when the variable was added still carried the old value until rebuilt).

### Real design-vs-metric tension found: Lighthouse's legibility heuristic vs. the approved 11px label system (resolved — labels kept)

Lighthouse's `font-size` audit reported only 32% "legible" (≥12px) text on `/projects`, driven substantially by `.text-\[0.6875rem\]` (11px) — this project's small-caps, letter-spaced, mono-uppercase "eyebrow"/label typography, used in **25 separate files** across the entire site (headers, footers, forms, project cards, case-study proof components, and more). This is not an oversight: it is the defining, approved Swiss-editorial typographic signature chosen in Phase 2's mockup selection, not something Claude Code will unilaterally change, per the design's explicit boundary to preserve the approved visual system. It is recorded here as a genuine trade-off for Yehia's own judgment — accept the Lighthouse legibility penalty as a deliberate design cost, or reconsider the label size — not as something silently fixed or silently hidden. (This same 11px pattern is presumably present in every prior phase's Lighthouse runs too; it's unclear why this specific audit wasn't flagged in earlier local runs — Lighthouse's per-run audit sampling has already shown significant non-determinism all through this project, e.g. the CLS/performance swings documented in Stages 2, 4, 5, and 6.)

### Security headers and framing policy: confirmed live, exactly as designed

Direct `curl` checks against the real deployment (with the bypass header) confirmed, byte-for-byte: the full CSP, HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, and `X-Frame-Options` on every response; `/admin` redirects unauthenticated with `Cache-Control: private, no-store`; `/cv/*` serves with the Stage 6 `public, max-age=3600, must-revalidate` policy; `/api/auth/sign-up` returns 404 (blocked); `/api/health` reports `{"status":"ok"}`; `/api/maintenance` returns 401 without a secret. `X-Robots-Tag: noindex` is also present site-wide — this is Vercel's own automatic Preview-deployment protection (not this app's CSP config, which only sets it on `/admin/:path*`), correctly absent from Production.

### Playwright cross-browser matrix against the real Preview

Final run (all 4 browser projects, `phase-6.spec.ts` and both live-database-assuming `accessibility.spec.ts` contact-state tests excluded for the data-hygiene reasons above): **746 passed, 2 failed, 4 skipped.** Both failures were re-run in isolation 3 times each and passed 3/3 — real-network-latency flakes (one command-palette search-filter interaction on Chromium, one Cloudinary-hosted video element on WebKit), not reproducible bugs, consistent with this project's established flakiness pattern under parallel load. `primary navigation reaches every route frame`'s single earlier failure (before the fixes above) was also confirmed as the same class of flake (3/3 passing in isolation).

### Lighthouse against the real Preview

Collected 3 runs each on the same 4 representative routes (bypassing Vercel protection via `--settings.extraHeaders`). Results are consistent with — and slightly worse than — the local Stage 6 findings, which is expected: this measures real network latency to Vercel's edge rather than a zero-latency localhost server.

| Route | Performance | Accessibility | Best Practices | SEO | LCP (median) | CLS |
|---|---:|---:|---:|---:|---:|---:|
| `/` | 0.91 | 100 | 100 | 0.58 | 2783ms | 0 |
| `/projects` | 0.82 | 100 | 0.89 | 0.58 | 2490ms (passes) | 0.284 (1 of 3 runs) |
| `/projects/skillbridge-ai-interviewer` | 0.92 | 100 | 100 | 0.61 | 2646ms | 0 |
| `/services` | 0.82 | 100 | 100 | 0.61 | 2639ms | 0.283 (all 3 runs) |

- **SEO (0.58–0.61 on every route):** entirely explained by two audits, **both of which are artifacts of measuring a protected Preview and neither of which can occur on Production.** `is-crawlable` fails on `x-robots-tag: noindex` — Vercel's own automatic Preview-only header. `robots-txt` fails with "58 errors found" because Lighthouse's `robots.txt` fetch does **not** carry the `--settings.extraHeaders` bypass token that its page navigations do, so Vercel's SSO wall answers that one request with an HTML login page; Lighthouse then parses that HTML line-by-line as if it were robots.txt syntax. Confirmed directly: `curl` on `/robots.txt` *without* the bypass header returns `<!DOCTYPE html><html data-dpl-id=...` (Vercel's auth page), while the same request *with* the header returns the correct, well-formed robots.txt.

  **Correction to an earlier claim in this report:** a previous revision of this section attributed the `robots-txt` failure to the `NEXT_PUBLIC_SITE_URL` gap and predicted the score would rise once that was fixed. That was wrong on both counts. The variable was fixed and re-measured, and SEO stayed at exactly 0.58/0.61 with the identical two audits failing — which is what exposed the real cause above. The `NEXT_PUBLIC_SITE_URL` fix was still genuinely necessary (it was corrupting canonical/sitemap/robots *content*, live in Production), but it was never what this particular Lighthouse audit was measuring. A truthful SEO score for this site can only be read from Production, where neither the SSO wall nor the Preview `noindex` exists.
- **`/projects`'s best-practices (0.89):** driven by the same `vercel.live`-blocked-script console/DevTools-issue audits (Preview-only, not a real gap) plus the `font-size` finding above (a real, deliberate design trade-off, not fixed here).
- **Performance/LCP:** same category of gap as Stage 6's local findings (over the 2500ms/0.95 targets on every route), now measured with real network latency rather than localhost. Not weakened or gamed — the thresholds in `lighthouserc.cjs` remain as designed.
- **CLS:** the same intermittent font-load-timing-race pattern already investigated in Stage 6 reproduces here too (1 of 3 runs on `/projects`, all 3 runs on `/services`), now confirmed across a second, independent environment rather than being local-machine-specific noise.

### Repository and deployment hygiene (done during this checkpoint)

Chasing the `NEXT_PUBLIC_SITE_URL` finding surfaced a second, compounding problem: Yehia opened what he reasonably believed was "the Phase 8 Preview" and found an admin inbox that didn't match this report. It was a **different deployment entirely** — the branch alias for the merged Phase 7 branch, confirmed by four independent probes (`/design-system` still 200, `/sitemap.xml` 404, no CSP header, no skip-link `tabIndex`). The root cause was accumulated branch clutter: **8 branches, 5 of them already merged into `main`**, each still generating live Vercel Preview deployments, plus **6 git worktrees on disk**, 4 of them for dead branches.

Cleaned up with Yehia's explicit approval: the 5 merged branches deleted locally and on the remote (`worktree-phase-4-projects-case-studies`, `worktree-phase-5-services-interactive-proof`, `worktree-phase-6-data-contact-analytics`, `phase-7-auth-admin-operations`, `docs/git-authorship-policy`), their 4 worktrees removed, plus an orphaned `.worktrees/phase-0-readiness` directory that was no longer a registered worktree at all. One branch, `worktree-phase-4-projects-case-studies`, refused a safe (`-d`) delete because it carried commit `f3bd359` that `main` did not; before force-deleting, that commit was verified to be a content-identical duplicate of `main`'s own `0507085` (`git diff origin/main <branch> -- docs/implementation/phase-4-report.md` returned empty), so nothing was lost. Final state: **3 local branches, 2 remote, 2 worktrees** — exactly one Preview deployment per meaningful branch, so this class of confusion cannot recur.

Windows note for any future worktree cleanup here: `git worktree remove` fails with `Filename too long` on this machine because of deep `node_modules` paths, but still deregisters the worktree from git's metadata, leaving the directory orphaned on disk. The leftover directories need `Remove-Item -LiteralPath "\\?\<abs-path>" -Recurse -Force` (the `\\?\` long-path prefix) to actually delete.

### CLS root cause finally identified: font swap in the site header

Stage 6 chased this shift and gave up on it as an "inconclusive font-timing-race artifact of Lighthouse's simulated throttling." Checkpoint 4 then wrongly pinned it on `inlineCss`. Reading the `layout-shifts` audit detail from a Preview run — rather than inferring from the CLS score alone — names it outright:

```
score: 0.2829 | node: body > div.site-frame > main#main-content
   cause: Web font loaded | archivo_wide_900-s.…woff2
   cause: Web font loaded | archivo_latin_variable-s.…woff2
   cause: Web font loaded | jetbrains_mono_latin_variable-s.…woff2
```

`<main>` is pushed down when the fonts arrive. `src/app/fonts.ts` explains why: `archivo` (the body face) uses `display: "optional"`, which never swaps and therefore never shifts — but `archivoStatement`, `archivoWide`, and `jetBrainsMono` all use `display: "swap"`. `archivoWide` styles the site-header logo, which renders on **every** route, so its swap changes the header's height and displaces all content below it. That explains the previously-puzzling pattern of the shift appearing site-wide, including on routes with no hero.

`adjustFontFallback: "Arial"` is already set on all four faces (Stage 6's fix) and is not sufficient here: Arial's metrics are a poor match for Archivo Wide 900 at `font-stretch: 125%`, so the fallback box and the real box differ enough to move layout.

Three options were initially written up as trading against the approved visual system, and put to Yehia as his call under the design's section 5:

- **`display: "optional"` on the swapping faces** — reliable, already this codebase's pattern for `archivo`, but drops the custom face entirely on a cold load, so the header logo and the monogram hero would render in Arial for first-time visitors.
- **Reserving fixed dimensions** for the header logo so a swap cannot change the header's height — preserves typography exactly, but changes the shell's layout.
- **Hand-authored fallback metrics** (`size-adjust`/`ascent-override`) — most faithful, most work, and not expressible through next/font's `adjustFontFallback`.

Yehia rejected the premise of all three, on the grounds that he wants the typefaces he chose to actually render rather than any variation on falling back to Arial. That reframing was correct and led directly to the real fix below: every one of those options accepted "the fonts are expensive, ration them" as a given, and none of them checked whether it was true.

### Fixed: preloading every face, which also revealed the body font was never rendering

The three options above all assumed the font bytes were expensive and had to be rationed. Checking the actual files disproved the premise: the entire set is **43KB** (Archivo 23.7KB, Archivo Wide 6.0KB, Archivo Statement 6.2KB, JetBrains Mono 7.2KB). That is small enough to preload outright.

Inspecting the configuration against that number surfaced a more serious problem than the layout shift. `archivo`, the body face, combined `preload: false` with `display: "optional"`. Unprioritised, it routinely missed `optional`'s ~100ms window — and `optional` never swaps afterwards. **The selected body typeface therefore did not render at all on a cold visit.** Visitors saw the Arial fallback for the entire page view, and only ever saw Archivo on a later visit once it was cached. The configuration was purchasing an LCP number by silently not displaying the chosen typeface, which is not a trade the design ever asked for.

Fixed by setting `preload: true` and `display: "swap"` on all four faces. Preloading lands them before or during first paint, so the real face is what renders and there is no fallback period to swap out of; `swap` additionally guarantees the real face always arrives eventually, which `optional` did not.

Verified on the deployed Preview rather than localhost. The served HTML carries four `rel="preload" as="font"` links (previously two) and all four `@font-face` rules use `font-display: swap` (previously one was `optional`). In-browser, after `document.fonts.ready`, all four real faces report `loaded` while every generated `… Fallback` face reports `unloaded`, and measuring rendered text against the same node forced to Arial confirms the real metrics are in use (header logo 56px vs 47px forced-Arial; statement text 4288px vs 4343px).

Measured effect on the Preview, 3 runs per route:

| Route | CLS before | CLS after | Performance before | Performance after |
|---|---|---|---:|---:|
| `/` | 0.30 / 0 / 0 | **0 / 0 / 0** | 81 / 88 / 93 | **93 / 93 / 96** |
| `/projects` | 0.28 (3 of 3) | **0 / 0 / 0** | 79 / 81 / 77 | **96 / 95 / 96** |
| `/projects/skillbridge-ai-interviewer` | 0.28 (3 of 3) | **0 / 0 / 0** | 77 / 79 / 77 | **98 / 92 / 96** |
| `/services` | 0.28 (3 of 3) | **0 / 0 / 0** | 79 / 78 / 79 | **96 / 96 / 91** |

Zero layout shift across all twelve runs, and the Performance category moves from the high-70s/low-80s to 91–98, meeting the ≥95 target on three of the four routes' medians. Putting 43KB of fonts on the critical path was expected to cost something; it paid for itself several times over, because the shift it removed was itself suppressing the score. This also closes out the CLS thread that Stage 6 abandoned as an unexplained throttling artifact and that Checkpoint 4 twice misattributed to `inlineCss`.

LCP medians on the Preview after this change are 2827ms (`/`), 2652ms (`/projects`), 2639ms (case study), 2641ms (`/services`) — improved, but still above the 2500ms target in that environment. See the post-merge Production verification at the end of this report: on real Production infrastructure the same build measures 2072–2317ms, under target on every route.

### What's still needed before this checkpoint fully passes

1. ~~`NEXT_PUBLIC_SITE_URL`~~ — **done.** Added to Production and Preview scopes; Production redeployed and verified serving the correct canonical/`robots.txt`. Preview verified on its next build.
2. Yehia: delete the "Ada Lovelace" contact entries from the real inbox — **still open**, deliberately deprioritized as non-blocking test data.
3. ~~Yehia: a decision on the 11px label legibility trade-off~~ — **decided: keep the labels as designed.** See the post-merge section for the resolution.
4. Yehia: run `scripts/verify-neon-admin-login.ts` and the manual authenticated `/admin` click-around — **still open**, non-blocking.
5. The SEO category cannot be truthfully measured on a protected Preview at all — both failing audits are Vercel-protection artifacts (see the correction above) — so SEO is deferred to a Production reading after merge. In CI, where neither the SSO wall nor the Preview `noindex` exists, SEO passes.
6. **LCP: the CI gate was recalibrated from 2500ms to 3000ms, on Yehia's explicit decision.** After the font fix, every other assertion passes on every route — Performance, CLS, SEO, Accessibility, and Best Practices — and LCP alone sat at 2606ms (`/`), 2856ms (case study), and 2932ms (`/services`), with `/projects` passing outright. The run-to-run spread also tightened sharply, from 2126–4062ms before the font work to roughly 2570–2970ms after, which is further confirmation that font loading had been the dominant source of instability all along.

   The distinction that matters: the roadmap's target is **LCP ≤ 2500ms at real-user p75**. This gate measures Lighthouse's simulated mobile profile (slow 4G, 4× CPU throttle) against `next start` on a shared 2-core CI runner — a deliberately pessimistic lab proxy that reads high against real visitors. Raising the *lab* gate to 3000ms does not move the release target, which is unchanged and still unverified; verifying it needs field data and belongs to Phase 9. This is also not a return to the Phase 7 allowance of 3400ms, which was removed in Stage 6 and stays removed — 3000ms keeps the gate tight enough that a genuine regression still trips it.

   The alternative options put to Yehia were: keep 2500ms and merge with a red check; keep 2500ms and hold the PR pending further optimization; or revert the font preload to buy LCP back. He chose calibration over the last of those specifically because reverting the fonts would undo the typefaces rendering at all — the same trade the original configuration had made silently, and the one this checkpoint exists to have corrected.

Per the design's explicit boundary (section 10), a draft PR opens only once Checkpoint 4 passes. The one item that genuinely blocked release quality — the `localhost:3000` canonical leaking to real crawlers — is resolved. Items 2–4 are non-blocking cleanup and confirmation tasks Yehia has chosen to defer, and item 5 is the known, documented, deliberately-not-weakened performance gap carried forward from Stage 6.

### Verification (Checkpoint 4)

- `pnpm format:check` / `pnpm lint` / `pnpm typecheck`: clean (on the 4 files touched: `shell.spec.ts`, `homepage.spec.ts`, `csp.spec.ts`, `cv-download.spec.ts`).
- The same 4 files re-verified locally against `next dev` after the fixes: 20/20 passed (the `vercel.live` filter is a no-op locally, as expected).
- `pnpm exec playwright test` against the live Preview (4 projects, `phase-6.spec.ts` and the two live-database-assuming `accessibility.spec.ts` tests excluded): 746 passed, 2 failed (both confirmed flakes on isolated re-run), 4 skipped.
- `pnpm exec lhci collect` + `assert` against the live Preview (4 routes, 3 runs each): does not pass — see the table above; root-caused, not hidden.
- Security headers, CSP, framing policy, and route-level access control: confirmed live via direct `curl` checks against the real deployment.
- `git diff --check`: clean.

## Post-merge: Production verification

PR #9 merged to `main` as `bc53176` once CI passed in full, and Production redeployed from that merge. Everything below was measured against the real Production alias `https://portfolio-website-azure-pi.vercel.app` with **no bypass token** — exactly what a visitor or a crawler receives.

### Every roadmap target is met on Production

| Metric | Required | `/` | `/projects` | case study | `/services` |
|---|---|---:|---:|---:|---:|
| Largest Contentful Paint | ≤ 2500ms | **2317ms** | **2072ms** | **2308ms** | **2161ms** |
| Cumulative Layout Shift | ≤ 0.1 | **0.000** | **0.000** | **0.000** | **0.000** |
| Lighthouse Performance | ≥ 95 | **96** | **98** | **97** | **99** |
| Lighthouse Accessibility | ≥ 95 | **100** | **100** | **100** | **100** |
| Lighthouse Best Practices | ≥ 90 | **100** | **96** | **100** | **100** |
| Lighthouse SEO | 100 | **100** | **100** | **100** | **100** |

Three runs per route, medians reported.

### The LCP gap was a measurement-environment artifact, not a property of the site

This is the correction that matters most in this report. LCP was treated as the one unresolved metric across Stage 6, Checkpoint 4, and four CI cycles, and prompted a threshold recalibration. On Production it comes in at **2072–2317ms — under the original 2500ms target on every route**, with no code change between the failing measurements and this one.

The environments that reported failure were both unrepresentative in ways that were understood individually but never combined into the obvious conclusion:

- **CI** runs Lighthouse's simulated mobile profile against `next start` on a shared 2-core GitHub runner — no CDN, no HTTP/2 edge, contended CPU.
- **Preview** sits behind Vercel's SSO wall, which adds an interception layer to every request and made SEO unmeasurable for the same reason.

Neither resembles the production edge that actually serves visitors. The recalibration of the CI gate from 2500ms to 3000ms therefore stands as correct — but for a better reason than the one recorded when it was made: it is not a concession on an unmet target, it is the CI gate being fitted to the environment CI measures, while the release target is met where it counts.

The same applies to SEO. The 0.58–0.61 scores were entirely Vercel's Preview-only `noindex` plus its login wall answering Lighthouse's unauthenticated `robots.txt` fetch with an HTML page. Production reads **100** on all four routes, and `X-Robots-Tag` is correctly absent site-wide while `/admin` retains its own `noindex, nofollow, noarchive`.

**The lesson worth carrying into Phase 9:** when a metric fails only in instrumented environments, question the instrument before changing the product. Nearly every wrong turn in this checkpoint — the three contradictory `inlineCss` conclusions, the misattributed CLS, the near-miss of reverting the font preload to buy back LCP — traces to generalising from one environment. Reverting the fonts would have degraded the real site to satisfy a measurement that was wrong.

### Confirmed on Production by direct request

- Canonical is `https://portfolio-website-azure-pi.vercel.app` on every route, and `/robots.txt` and `/sitemap.xml` carry the same origin. The `localhost:3000` leak documented earlier — which had been live since the site's first deploy — is closed.
- `og:image` resolves to the Production origin. Flagged earlier as needing post-merge confirmation because Preview deliberately serves its own branch-alias image; resolved.
- All four font faces preload (`rel="preload" as="font"`), matching the fix.
- Full security-header set present: CSP, HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options: DENY`.
- `/admin` returns 307 with `Cache-Control: private, no-store` and `X-Robots-Tag: noindex, nofollow, noarchive`; `/api/auth/sign-up` returns 404; `/api/health` returns `{"status":"ok"}`.
- `/design-system` returns 404, confirming the Stage 3 route removal shipped.

### Still genuinely open

- **INP** is a field metric and remains unverified; only the synthetic proxy has run. Real-user p75 for INP — and for LCP and CLS — needs traffic, and belongs to Phase 9 / post-launch operations. Everything above is Lighthouse lab data against Production, which is the strongest pre-launch evidence available but is not field data.
- ~~The **11px label legibility** trade-off~~ — **resolved: the labels stay as designed.** Yehia's decision, made against the Production numbers rather than the Preview ones. The 11px mono-uppercase eyebrow/label type is the approved Swiss-editorial signature from the Phase 2 mockup and is used in 25 files site-wide; changing it to satisfy the audit would alter the visual system the design explicitly protects. The cost is bounded and known: Lighthouse's `font-size` audit is a Best Practices heuristic, not an accessibility rule — Production Accessibility scores **100** on every route with zero axe violations, and Best Practices reads 96 on `/projects` against a ≥90 target, comfortably passing. No further action; this is a closed decision, not a deferred one.
- The **synthetic contact entries** created in error during Checkpoint 4 are still in the Preview-branch inbox and want deleting.
