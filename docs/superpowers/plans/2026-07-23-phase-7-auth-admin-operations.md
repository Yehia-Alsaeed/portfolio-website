# Phase 7 Auth and Admin Operations Implementation Plan

> **For Claude Code:** Execute this plan task-by-task with native isolated-worktree and task-tracking tools. The named Superpowers plugin is not required. Keep the checkbox steps current and stop only at the explicit production boundaries below.

**Executor:** Claude Code.

**Goal:** Ship a private, single-administrator operations area with secure Neon Auth sessions, decision-useful first-party analytics, and a reliable contact inbox while keeping the public portfolio static and fast.

**Architecture:** Neon Auth owns identities and sessions in its managed `neon_auth` schema. Next.js Proxy provides an optimistic `/admin/*` gate, while a cached server-only authorization layer independently protects every page, query, Server Action, and future admin route handler using one configured user ID. Dashboard reads combine daily aggregates with bounded raw-event windows; inbox reads use keyset pagination. The admin UI is a separate dynamic route tree, so Neon Auth and Recharts never enter public route rendering or public navigation bundles.

**Tech Stack:** Existing Next.js 16.2.10, React 19.2.7, TypeScript 6.0.3, Tailwind CSS 4.3.3, Drizzle 0.45.2, Neon serverless 1.1.0, Vitest, Testing Library, Playwright, axe, Lighthouse, GitHub Actions, and Vercel. Add exact current versions `@neondatabase/auth@0.4.2-beta` and `recharts@3.10.0`.

## Global Constraints

- Start only after Phase 6 is merged to `main`, its production migration and cron are verified, and `docs/implementation/phase-6-report.md` exists. Otherwise stop without changing external state.
- Create an isolated `phase-7-auth-admin-operations` worktree from freshly updated `main`; do not reuse the Phase 6 worktree.
- Read `prd.md` section 6.3, `docs/superpowers/specs/2026-07-17-portfolio-production-roadmap-design.md` Phase 7, the Phase 6 design/report/runbook, and `mockups/demo/admin.html` before editing.
- Follow `AGENTS.md` and `CLAUDE.md`: only `Yehia-Alsaeed <yehias3eed11@gmail.com>` may appear as author. Never add an AI co-author trailer or AI-associated email.
- Use `corepack pnpm`; pin exact dependency versions and commit the lockfile.
- Leave `.claude/` and `.superpowers/` untouched and untracked.
- Keep `/admin` absent from public navigation, the command palette, sitemap, and public calls to action. Every admin document must be `noindex, nofollow, noarchive`.
- Public pages must remain static/ISR. They must not read auth, cookies, request headers, admin queries, or Recharts during rendering.
- Proxy is only an early redirect. Authorization must also occur beside every sensitive read and mutation. A layout-only or client-only check is insufficient.
- Authorize by the immutable server-only `ADMIN_USER_ID`, not an email, client flag, or existence of any authenticated user.
- Public registration must be disabled before exposing the auth handler in any Preview. Do not add signup, password reset, social login, organization, role-management, CMS, public stats, or availability-management UI.
- Never create application-owned auth tables or write directly to `neon_auth`. Use Neon Auth APIs/Console only.
- Never log or expose passwords, session tokens, cookie values, visitor hashes, contact bodies, email addresses, auth provider bodies, environment values, or raw SQL parameters.
- All dashboard ranges are closed to `24h | 7d | 30d | 90d`; all queries use indexed time bounds and fixed limits. Never accept arbitrary SQL dimensions, sort columns, ranges, or page sizes from the client.
- Treat Phase 6's daily visitor metric correctly: multi-day visitors are the sum of daily unique visitors, not cross-day people.
- The admin must render truthful empty, loading, error, expired-session, unauthorized, signed-out, and rate-limited states. Never ship prototype/sample metrics.
- The Phase 7 PR remains draft. Do not merge, run the Phase 7 app migration on the primary branch manually, or promote a Production deployment without Yehia's later explicit approval.

## Locked Product Decisions

- Routes: `/admin/login`, `/admin` (overview), and `/admin/inbox`.
- Ranges: `24h`, `7d`, `30d`, `90d`; default `30d`.
- Overview cards: visitors, page views, contact submissions, and CV downloads.
- Trend: page views and visitors; hourly buckets for `24h`, UTC daily buckets otherwise.
- Breakdowns: top pages, sources/referrer domains, countries, devices, and browsers; eight rows each.
- Recent activity: latest 20 `project_click`, `cv_download`, and `contact_submit` events from at most the selected range.
- Inbox: newest first, 20 rows per page, opaque validated keyset cursor, unread count, read/unread toggle, message detail, and confirmed delete.
- Do not implement the prototype's “average time” metric: Phase 6 intentionally collects no duration data.
- Use the existing visual prototype as direction, not source data. Adapt its dense Swiss grid, sidebar, rules, typography, and responsive behavior to production tokens.

---

### Task 1: Readiness, Dependencies, Environment Contract, and Index Migration

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Modify: `.env.example`
- Modify: `docs/ops/environment-contract.md`
- Modify: `docs/ops/free-tier-baseline.md`
- Modify: `src/lib/env/server.ts`
- Modify: `src/db/schema/contact.ts`
- Modify: `src/db/schema/analytics.ts`
- Create: the generated Phase 7 Drizzle migration and metadata
- Create: `tests/unit/phase-7-foundation.test.ts`

**Environment contract:**

```text
NEON_AUTH_BASE_URL       # provider-generated per Neon branch
NEON_AUTH_COOKIE_SECRET  # server-only, >=32 characters, stable across deployments
ADMIN_USER_ID            # immutable Neon Auth user ID, server-only
```

- [ ] **Step 1: Establish the isolated baseline**

Fetch `origin`, verify Phase 6's report and production verification, create the worktree from updated `main`, then run:

```powershell
corepack pnpm install --frozen-lockfile
corepack pnpm test
corepack pnpm typecheck
corepack pnpm build
```

Record any pre-existing failure before editing. Do not continue from a dirty or stale Phase 6 base.

- [ ] **Step 2: Verify versions and install only the approved packages**

Confirm the registry still reports the locked versions, then run:

```powershell
corepack pnpm add @neondatabase/auth@0.4.2-beta recharts@3.10.0
```

If either version is unavailable or its current API differs from the official v0.2+ `createNeonAuth` contract, stop and document the incompatibility; do not guess an auth API.

- [ ] **Step 3: Write a failing foundation test**

Assert that server environment readers:

- require all three variables with fixed messages that name only the missing variable;
- reject a cookie secret shorter than 32 characters;
- never echo supplied values;
- do not validate at module evaluation/build time.

Assert schema metadata includes:

```text
contact_messages_is_read_created_at_id_idx
analytics_daily_aggregates_dimension_event_type_date_value_idx
```

- [ ] **Step 4: Add bounded-query indexes and environment readers**

Add indexes:

```ts
index("contact_messages_is_read_created_at_id_idx").on(
  table.isRead,
  table.createdAt,
  table.id,
);

index("analytics_daily_aggregates_dimension_event_type_date_value_idx").on(
  table.dimension,
  table.eventType,
  table.date,
  table.dimensionValue,
);
```

Add typed readers for the three auth variables. Keep them lazy and server-only. Update the environment and free-tier docs with variable ownership, rotation rules, and Neon Auth's current free allowance. Never put a real ID, URL, or secret in example files.

- [ ] **Step 5: Generate and inspect the committed migration**

```powershell
corepack pnpm db:generate -- --name phase_7_admin_indexes
corepack pnpm db:check
```

The migration may add only the two application indexes. It must not create, alter, seed, or grant access to `neon_auth`.

- [ ] **Step 6: Verify and commit**

```powershell
corepack pnpm test tests/unit/phase-7-foundation.test.ts
corepack pnpm typecheck
corepack pnpm db:check
git diff --check
git add package.json pnpm-lock.yaml .env.example docs/ops src/lib/env/server.ts src/db/schema drizzle tests/unit/phase-7-foundation.test.ts
git commit -m "feat: prepare phase seven admin foundation"
```

Before committing, verify `git diff --cached` contains no environment values and `git log -1 --format='%B'` contains no co-author trailer.

---

### Task 2: Neon Auth Provisioning, Server Authorization, and Session States

**Files:**
- Create: `src/features/admin/auth/server.ts`
- Create: `src/features/admin/auth/authorize.ts`
- Create: `src/features/admin/auth/model.ts`
- Create: `src/features/admin/auth/login.ts`
- Create: `src/features/admin/auth/actions.ts`
- Create: `src/app/api/auth/[...path]/route.ts`
- Create: `src/app/admin/login/page.tsx`
- Create: `src/features/admin/login-form.tsx`
- Create: `src/proxy.ts`
- Modify: `src/db/queries/rate-limit.ts`
- Modify: `src/features/analytics/model.ts`
- Modify: `next.config.ts`
- Create: `tests/unit/phase-7-authorization.test.ts`
- Create: `tests/unit/phase-7-login.test.ts`
- Create: `tests/unit/phase-7-proxy.test.ts`

**Core interfaces:**

```ts
export type AdminAccess =
  | { status: "authorized"; user: { id: string; name?: string | null } }
  | { status: "anonymous" | "expired" | "unauthorized" };

export type LoginState = {
  status: "idle" | "invalid" | "rate-limited" | "unauthorized" | "unavailable";
  message: string;
  retryAfterSeconds?: number;
};

export const auth = createNeonAuth({
  baseUrl: readNeonAuthBaseUrl(),
  cookies: { secret: readNeonAuthCookieSecret() },
  logLevel: "silent",
});

export const getAdminAccess: () => Promise<AdminAccess>;
export const requireAdmin: () => Promise<{ id: string; name?: string | null }>;
```

- [ ] **Step 1: Provision Neon Auth without exposing credentials**

In the existing Vercel-managed Neon project:

1. Enable the current branchable Neon Auth integration on the primary branch.
2. Immediately disable public registration in Auth Configuration.
3. Enable email/password sign-in only; leave signup UI, OAuth, organizations, and optional plugins disabled.
4. Create exactly one administrator through Neon Console. Yehia enters and stores the password directly in his password manager/provider UI; it must never be pasted into chat, shell history, a repository file, or a report.
5. Copy only the immutable user ID into server-only `ADMIN_USER_ID`.
6. Generate `NEON_AUTH_COOKIE_SECRET` with a cryptographically secure tool and set it without printing it.
7. Confirm the Vercel integration supplies branch-specific `NEON_AUTH_BASE_URL` to Production and Previews.

Do not deploy Phase 7 code to Production. Auth data/configuration may exist on the primary branch so future Preview branches inherit it.

- [ ] **Step 2: Write failing authorization, login, and proxy tests**

Cover:

- no session → anonymous;
- provider error or stale session → expired/fail closed;
- valid session with a different user ID → unauthorized;
- only the exact `ADMIN_USER_ID` → authorized;
- every protected query/action dependency stops before database access when unauthorized;
- six login attempts from one request key in 15 minutes produce a fixed rate-limited state;
- invalid credentials and unknown email return the same generic message;
- password is never returned in action state or logs;
- `/admin/login` remains reachable anonymously;
- `/admin`, `/admin/inbox`, and unknown `/admin/*` routes pass through the auth gate;
- no public route matches Proxy.

- [ ] **Step 3: Configure the official Neon Auth server adapter**

Use `@neondatabase/auth/next/server` `createNeonAuth` with `logLevel: "silent"` so provider/network errors cannot put uncontrolled details into application logs; use only the project's fixed safe log codes if operational logging is needed. Export `auth.handler()` from `/api/auth/[...path]`. Add `export const dynamic = "force-dynamic"` to admin server route trees that call auth.

Implement `getAdminAccess` in a `server-only` module and wrap the request-local lookup in React `cache()`. Compare `session.user.id` using exact string equality with `ADMIN_USER_ID`. `requireAdmin` must fail closed with a typed error; it must not redirect from the data layer.

- [ ] **Step 4: Add Proxy as an optimistic first gate**

Use the SDK's official `auth.middleware({ loginUrl: "/admin/login" })` adapter. Match all `/admin/:path*`, explicitly allow `/admin/login`, and do not match `/api/auth`, public pages, assets, or analytics. Keep secure authorization in the DAL and actions regardless of Proxy.

- [ ] **Step 5: Implement the rate-limited login and logout actions**

Extend the existing atomic limiter to scope `"admin-login"` and a `900`-second fixed window. Limit to five attempts per request key; derive the HMAC key from the same normalized request facts without storing email or IP.

Validate exactly one string email and password, enforce conservative size limits, consume the limit before calling Neon Auth, then call `auth.signIn.email`. Validate the returned user ID before success; immediately sign out a non-admin account and return `unauthorized`. Logout calls Neon Auth, then redirects to `/admin/login?reason=signed-out`.

Use generic errors for invalid credentials/provider failures. Do not add “forgot password” or signup links.

- [ ] **Step 6: Build the accessible login and state UI**

Use a Server Component page plus a small `useActionState` form. Include:

- labeled email/password inputs with `autocomplete="username"` and `"current-password"`;
- pending button state;
- focused `role="alert"` summary for errors;
- distinct copy for expired, unauthorized, signed-out, and rate-limited states;
- no credential persistence in returned state;
- no public site header/footer.

Add an `X-Robots-Tag: noindex, nofollow, noarchive` header for `/admin/:path*` in `next.config.ts`.

- [ ] **Step 7: Verify the provider is closed and commit**

Against a non-production Neon branch or provider test endpoint, verify direct email-signup requests are rejected while the one existing administrator can sign in. Never print provider responses.

```powershell
corepack pnpm test tests/unit/phase-7-authorization.test.ts tests/unit/phase-7-login.test.ts tests/unit/phase-7-proxy.test.ts
corepack pnpm typecheck
corepack pnpm build
git add src/features/admin src/app/api/auth src/app/admin/login src/proxy.ts src/db/queries/rate-limit.ts src/features/analytics/model.ts next.config.ts tests/unit/phase-7-authorization.test.ts tests/unit/phase-7-login.test.ts tests/unit/phase-7-proxy.test.ts
git commit -m "feat: secure the private admin session"
```

---

### Task 3: Bounded Admin Query Layer

**Files:**
- Create: `src/features/admin/analytics/model.ts`
- Create: `src/features/admin/analytics/ranges.ts`
- Create: `src/db/queries/admin-analytics.ts`
- Create: `src/db/queries/admin-contact.ts`
- Create: `tests/unit/phase-7-admin-ranges.test.ts`
- Create: `tests/unit/phase-7-admin-queries.test.ts`

**DTOs:**

```ts
export const ADMIN_RANGES = ["24h", "7d", "30d", "90d"] as const;
export type AdminRange = (typeof ADMIN_RANGES)[number];

export type AdminOverview = {
  range: AdminRange;
  totals: {
    visitors: number;
    pageViews: number;
    contactSubmissions: number;
    cvDownloads: number;
  };
  trend: Array<{ bucket: string; pageViews: number; visitors: number }>;
  breakdowns: {
    pages: BreakdownRow[];
    sources: BreakdownRow[];
    countries: BreakdownRow[];
    devices: BreakdownRow[];
    browsers: BreakdownRow[];
  };
  recentEvents: RecentEvent[];
};

export type ContactCursor = { createdAt: string; id: string };
export type ContactPage = {
  rows: ContactMessageDto[];
  unreadCount: number;
  nextCursor?: string;
};
```

- [ ] **Step 1: Write failing range, SQL-boundary, DTO, and authorization tests**

Assert:

- unknown/multiple ranges become `30d`;
- `24h` uses exactly 24 hourly buckets and raw events only;
- `7d`, `30d`, and `90d` use completed UTC daily aggregates plus today's bounded raw rows;
- every missing bucket is zero-filled;
- breakdowns are fixed to approved dimensions and `LIMIT 8`;
- recent events are fixed to three event types, selected-range cutoff, and `LIMIT 20`;
- inbox page size is exactly 20 and fetches at most 21 to determine `nextCursor`;
- invalid/base64-garbage/future cursors fail closed to the first page;
- cursor SQL uses `(created_at, id)` keyset ordering, never offset pagination;
- each exported read calls `requireAdmin` before `getDatabase`;
- DTOs omit visitor hashes and all fields not rendered.

- [ ] **Step 2: Implement closed range math**

Use UTC throughout. `24h` starts at `now - 24h`; multi-day ranges start at UTC midnight for the requested number of calendar days. Completed days come from `analytics_daily_aggregates`; the current incomplete day comes from `analytics_events`. Cap all dates to `now`.

Do not attempt cross-day deduplication. Document visitors as summed daily uniques in the DTO/UI help text.

- [ ] **Step 3: Implement overview queries with indexed filters**

Use fixed SQL selected by server code, never client-provided identifiers:

- visitor/page-view/CV totals from `overall`;
- contacts total from `contact_messages.created_at`;
- hourly trend from raw `page_view` rows for `24h`;
- daily trend from `overall/page_view` aggregate rows plus current-day raw rows;
- pages/referrers/countries/devices/browsers from the corresponding aggregate dimension plus current-day raw grouping;
- recent activity from bounded raw rows.

Run independent dashboard reads with `Promise.all`. Keep each response bounded and serialize only DTO primitives. Convert database `bigint` safely and reject values outside `Number.MAX_SAFE_INTEGER`.

- [ ] **Step 4: Implement the keyset inbox read**

Select only `id`, `inquiryType`, `name`, `email`, `message`, `isRead`, and `createdAt`. Order by `createdAt DESC, id DESC`; encode/decode a versioned base64url cursor with strict UUID and ISO-date validation. Never include a contact record in logs, analytics, URLs, or error messages.

- [ ] **Step 5: Verify explain plans on an isolated Preview branch**

Apply the Phase 7 migration to the Preview branch only. Run `EXPLAIN (ANALYZE, BUFFERS)` with representative bounded queries and confirm the intended indexes are available. Small/empty tables may legitimately choose sequential scans; the predicates and indexes must still match. Record query shapes and timings, not row contents.

- [ ] **Step 6: Pass focused checks and commit**

```powershell
corepack pnpm test tests/unit/phase-7-admin-ranges.test.ts tests/unit/phase-7-admin-queries.test.ts
corepack pnpm typecheck
corepack pnpm db:check
git add src/features/admin/analytics src/db/queries/admin-analytics.ts src/db/queries/admin-contact.ts tests/unit/phase-7-admin-ranges.test.ts tests/unit/phase-7-admin-queries.test.ts
git commit -m "feat: add bounded admin data queries"
```

---

### Task 4: Admin Shell, Analytics Dashboard, and Recharts

**Files:**
- Create: `src/app/admin/layout.tsx`
- Create: `src/app/admin/page.tsx`
- Create: `src/app/admin/loading.tsx`
- Create: `src/app/admin/error.tsx`
- Create: `src/features/admin/admin-shell.tsx`
- Create: `src/features/admin/admin.module.css`
- Create: `src/features/admin/analytics/dashboard.tsx`
- Create: `src/features/admin/analytics/range-control.tsx`
- Create: `src/features/admin/analytics/trend-chart.tsx`
- Create: `src/features/admin/analytics/breakdown-table.tsx`
- Create: `src/features/admin/analytics/recent-events.tsx`
- Modify: `src/app/robots.ts`
- Create: `tests/unit/phase-7-dashboard.test.tsx`
- Create: `tests/e2e/phase-7-admin-dashboard.spec.ts`

- [ ] **Step 1: Write failing component and browser tests**

Cover:

- authorized dashboard renders four real DTO totals and default `30d`;
- range links preserve only a valid range;
- empty data shows zeroes and useful empty copy, never sample numbers;
- query rejection reaches the admin error boundary with retry;
- chart has an accessible name and an adjacent semantic data table/summary;
- sidebar marks Overview/Inbox correctly and logout is keyboard reachable;
- `<meta name="robots">` and response header prevent indexing;
- public header, footer, command palette, and route lists contain no `/admin`;
- no admin HTML or browser state exposes password, session, hash, or raw provider detail.

- [ ] **Step 2: Build the separate private shell**

Use the prototype's compact sidebar, ruled grid, metric cards, monochrome/accent palette, and strong typography through existing design tokens. Do not mount `SiteShell`. At narrow widths, turn the sidebar into a compact top region without hiding navigation or logout.

The admin layout calls `requireAdmin` before rendering content, handles anonymous/expired/unauthorized states with redirects to the corresponding login state, and exports dynamic/noindex metadata.

- [ ] **Step 3: Build the Server Component dashboard**

Parse awaited `searchParams`, load the DTO once, and pass serializable data into focused presentational components. Use native links or a GET form for ranges so reload/back/forward work. Add explanatory copy that visitors are daily uniques and that `ZZ` means unknown.

Render all five breakdown tables and recent activity. Use `Intl.DisplayNames` for known country codes with a deterministic fallback. Render timestamps with explicit locale/time-zone behavior and machine-readable `<time dateTime>`.

- [ ] **Step 4: Add Recharts only to the admin client chunk**

Implement `ResponsiveContainer` with two lines/areas for page views and visitors. Set `isAnimationActive={false}` for deterministic rendering/reduced-motion safety and enable Recharts' accessibility layer if supported by the pinned version.

Provide an accessible textual summary or visually available table for the same trend data; the SVG alone is not the only representation. Do not import Recharts from any public layout, shared barrel, or public component.

- [ ] **Step 5: Implement loading, empty, and recoverable error states**

Use a layout-stable skeleton with fixed chart/card dimensions. `error.tsx` must be a client error boundary with a retry button and generic message; never display the thrown message. Empty states preserve all headings and explain that tracking data will appear after real activity.

- [ ] **Step 6: Pass responsive, accessibility, and bundle checks**

Run the focused tests and inspect `/admin` at 360, 768, 1024, and 1440 CSS pixels. Verify keyboard order, visible focus, 200% zoom, high-contrast readability, and no horizontal document overflow. Confirm the production build places Recharts only in admin-related chunks and public bundle measurements remain within the Phase 6 baseline tolerance.

- [ ] **Step 7: Commit**

```powershell
corepack pnpm test tests/unit/phase-7-dashboard.test.tsx
corepack pnpm exec playwright test tests/e2e/phase-7-admin-dashboard.spec.ts
corepack pnpm typecheck
corepack pnpm build
git add src/app/admin src/features/admin src/app/robots.ts tests/unit/phase-7-dashboard.test.tsx tests/e2e/phase-7-admin-dashboard.spec.ts
git commit -m "feat: build the private analytics dashboard"
```

---

### Task 5: Contact Inbox and Authorized Mutations

**Files:**
- Create: `src/app/admin/inbox/page.tsx`
- Create: `src/features/admin/inbox/model.ts`
- Create: `src/features/admin/inbox/actions.ts`
- Create: `src/features/admin/inbox/inbox.tsx`
- Create: `src/features/admin/inbox/message-row.tsx`
- Create: `src/features/admin/inbox/message-dialog.tsx`
- Create: `src/features/admin/inbox/delete-dialog.tsx`
- Modify: `src/db/queries/admin-contact.ts`
- Create: `tests/unit/phase-7-inbox-actions.test.ts`
- Create: `tests/unit/phase-7-inbox.test.tsx`
- Create: `tests/e2e/phase-7-admin-inbox.spec.ts`

**Mutations:**

```ts
export type InboxMutationResult =
  | { status: "success"; id: string }
  | { status: "invalid" | "unauthorized" | "not-found" | "unavailable"; message: string };

export async function setMessageReadAction(
  id: string,
  isRead: boolean,
): Promise<InboxMutationResult>;

export async function deleteMessageAction(id: string): Promise<InboxMutationResult>;
```

- [ ] **Step 1: Write failing query, action, and interaction tests**

Assert:

- malformed UUIDs never reach auth/database;
- valid mutations call `requireAdmin` before database access;
- update/delete uses `WHERE id = validatedUuid` and returns not-found for zero rows;
- no action accepts name/email/message from the client;
- opening an unread message marks it read optimistically;
- toggling read/unread rolls back exactly on action failure;
- delete requires an explicit confirmation and rolls the removed row back in original order on failure;
- success revalidates `/admin` and `/admin/inbox`;
- failure is announced in an `aria-live` region and focus returns predictably;
- empty inbox and final-page states are truthful.

- [ ] **Step 2: Implement minimal authorized mutations**

Validate UUIDs before use, then authorize, then mutate. Return fixed result codes only. Never return a deleted row or provider error. Use `revalidatePath` after success so overview contact totals and unread count stay accurate.

Do not add bulk delete, search, export, reply sending, or editable contact content.

- [ ] **Step 3: Build the paginated inbox**

Render newest-first rows with status, inquiry type, sender name, subject preview, and date. The dialog shows the full escaped plain-text message, email as a `mailto:` link, and exact received time. Preserve line breaks with CSS; never use `dangerouslySetInnerHTML`.

Use opaque `cursor` links for Next/previous navigation only if a validated cursor exists. Do not place contact data in the URL.

- [ ] **Step 4: Add optimistic state with exact rollback**

Use React transitions/optimistic state so read toggles and deletes respond immediately. Capture the prior row and index before mutation. On any non-success or rejected promise, restore that exact state, announce the failure, and keep the dialog usable. Disable duplicate mutation controls while pending.

Delete confirmation must name only the sender already visible to the authenticated admin, use the existing accessible Dialog primitive, and default focus to Cancel.

- [ ] **Step 5: Verify against Preview-only data**

Submit one clearly synthetic contact through the Preview public form, sign in, verify it appears unread, mark it read/unread, paginate if data permits, and delete only that synthetic record. Never edit or delete inherited real messages.

- [ ] **Step 6: Pass checks and commit**

```powershell
corepack pnpm test tests/unit/phase-7-inbox-actions.test.ts tests/unit/phase-7-inbox.test.tsx
corepack pnpm exec playwright test tests/e2e/phase-7-admin-inbox.spec.ts
corepack pnpm typecheck
git add src/app/admin/inbox src/features/admin/inbox src/db/queries/admin-contact.ts tests/unit/phase-7-inbox-actions.test.ts tests/unit/phase-7-inbox.test.tsx tests/e2e/phase-7-admin-inbox.spec.ts
git commit -m "feat: add the private contact inbox"
```

---

### Task 6: Admin Self-Exclusion and End-to-End Security Regression

**Files:**
- Modify: `src/app/api/track/route.ts`
- Modify: `src/features/analytics/track-request.ts`
- Modify: `src/features/contact/actions.ts`
- Modify: `src/features/contact/submit-contact.ts`
- Modify: `src/db/queries/contact.ts`
- Modify: `playwright.config.ts`
- Create: `tests/unit/phase-7-self-exclusion.test.ts`
- Create: `tests/unit/phase-7-admin-security.test.ts`
- Create: `tests/e2e/phase-7-admin-auth.spec.ts`
- Modify: `tests/e2e/accessibility.spec.ts`

- [ ] **Step 1: Write failing self-exclusion and security tests**

Cover:

- an authorized admin session makes `/api/track` return the same generic `202` without rate-limit or analytics inserts;
- anonymous/expired sessions keep Phase 6 tracking behavior;
- a contact submitted by the admin is persisted but does not insert `contact_submit`;
- public contact behavior remains atomic contact-plus-event when anonymous;
- direct invocation of every admin query/action while anonymous or wrong-user returns no data and performs no mutation;
- auth handler signup remains disabled;
- admin responses contain `Cache-Control: private, no-store` where appropriate;
- logout invalidates access; an expired/removed session cannot refresh admin HTML;
- neither public nor admin analytics records `/admin` paths.

- [ ] **Step 2: Exclude authenticated admin activity at the server boundary**

Before analytics rate limiting/insertion, call a non-throwing optional session helper. If the exact admin is authenticated, return the existing privacy-preserving success response without writing an event.

For contact submission, continue persisting the message but make its analytics insert optional when the exact admin session is present. Keep anonymous contact+event persistence in one batch. Do not make public page rendering dynamic and do not expose an auth flag to client JavaScript.

- [ ] **Step 3: Harden cache and browser-test artifacts**

Set private/no-store semantics on admin/auth responses without changing public static caching. When a live admin password or Vercel bypass secret is present, force Playwright trace, screenshot, and video capture off. Tests must never interpolate credentials into titles, assertions, attachments, HTML reports, or console output.

Keep live auth credentials in one temporary git-ignored environment file only long enough to run Preview verification, then securely delete that file in the same shell. Do not store the production credential in GitHub Actions or Vercel application variables.

- [ ] **Step 4: Exercise complete auth states**

With unit/integration tests and the isolated Preview:

1. Anonymous `/admin` redirects to login.
2. Wrong credentials show the generic invalid state.
3. Correct administrator login reaches Overview and survives refresh.
4. A forged/wrong user ID is rejected in tests.
5. Removed/invalid session returns to the expired state.
6. Logout prevents back/refresh access to cached admin HTML.
7. Repeated wrong attempts reach the rate-limited state; run this last.
8. Direct signup remains rejected.

Never weaken the configured limiter to make the test faster.

- [ ] **Step 5: Run focused security/accessibility checks and commit**

```powershell
corepack pnpm test tests/unit/phase-7-self-exclusion.test.ts tests/unit/phase-7-admin-security.test.ts
corepack pnpm exec playwright test tests/e2e/phase-7-admin-auth.spec.ts tests/e2e/phase-7-admin-dashboard.spec.ts tests/e2e/phase-7-admin-inbox.spec.ts tests/e2e/accessibility.spec.ts
corepack pnpm typecheck
corepack pnpm build
git add src/app/api/track src/features/analytics src/features/contact src/db/queries/contact.ts playwright.config.ts tests/unit/phase-7-self-exclusion.test.ts tests/unit/phase-7-admin-security.test.ts tests/e2e
git commit -m "test: secure phase seven admin operations"
```

---

### Task 7: Full Gate, Operations Runbook, Preview Verification, and Draft PR

**Files:**
- Create: `docs/ops/phase-7-admin-runbook.md`
- Create: `docs/implementation/phase-7-report.md`
- Modify: `docs/implementation/decision-register.md`
- Modify only as required by measured results: `lighthouserc.cjs`, build baselines, or related test fixtures

- [ ] **Step 1: Write the operations runbook**

Document without values:

- enabling/disabling registration and verifying exactly one administrator;
- admin-user ID replacement and immediate session revocation;
- cookie-secret rotation and required redeployment;
- login-rate-limit behavior and recovery;
- Auth/Neon outage behavior;
- Preview branch auth lifecycle;
- inbox deletion boundary and Neon restore procedure;
- how to verify noindex/no-store;
- how to confirm admin activity is excluded;
- production migration/promotion and rollback order.

State that rotating `ADMIN_USER_ID` or deleting/disabling the Neon Auth user is the emergency access-revocation control.

- [ ] **Step 2: Run the complete local gate**

```powershell
corepack pnpm format:check
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test
corepack pnpm db:check
corepack pnpm build
corepack pnpm measure:build
corepack pnpm exec playwright test
corepack pnpm lighthouse
git diff --check
```

Run browser and Lighthouse gates from a production build, not only `next dev`. If a known flaky test fails, reproduce it independently and record evidence; do not weaken assertions, retries, or thresholds.

- [ ] **Step 3: Perform an explicit security and privacy review**

Search the diff and built output for:

```text
ADMIN_USER_ID
NEON_AUTH_COOKIE_SECRET
password
session_token
visitorHash
Co-Authored-By
```

Expected: variable names and legitimate code/tests may appear; no values, credentials, captured PII, AI attribution, sample dashboard data, or browser artifacts appear. Verify every exported admin read/mutation has a server authorization test.

- [ ] **Step 4: Push and create the draft PR**

Push the feature branch and open a **draft** PR titled:

```text
Phase 7: secure admin analytics and contact operations
```

The PR body lists auth/data boundaries, migration, tests, Preview URL, manual Neon configuration, known limitations, and rollback. It must not contain credentials, user IDs, contact contents, or AI attribution.

- [ ] **Step 5: Verify the real Preview deployment**

Confirm the Vercel Preview received its isolated Neon branch and branch-specific `NEON_AUTH_BASE_URL`, then:

- verify anonymous, login, refresh, logout, expired, unauthorized-test, and rate-limited states;
- verify direct signup is rejected;
- verify dashboard `24h/7d/30d/90d`, empty and populated states, all breakdowns, recent events, and chart/table parity;
- verify one synthetic inbox record through read/unread/delete;
- verify 360/768/1024/1440 widths, keyboard-only use, 200% zoom, axe, and zero console/page errors;
- verify `/admin` has no public links and emits noindex/no-store;
- verify admin activity creates no analytics rows;
- verify `/`, `/projects`, one case study, `/services`, and contact submission remain healthy.

Delete only Preview-created synthetic data and the temporary local credential file. Never mutate inherited production records.

- [ ] **Step 6: Finish the report and wait**

Record exact commands, commit SHAs, CI links/status, Preview URL, migration name, query-plan conclusion, responsive/a11y results, production-build checks, and any reproduced flakes in `docs/implementation/phase-7-report.md`.

```powershell
git add docs/ops/phase-7-admin-runbook.md docs/implementation/phase-7-report.md docs/implementation/decision-register.md
git commit -m "docs: report phase seven delivery"
git push
gh pr checks --watch
git status --short
git log -1 --format='%an <%ae>%n%B'
```

Expected: clean tracked worktree; only approved untracked local tool directories may remain; every required check is green; commit author is Yehia only; the PR stays draft. Stop and wait for Yehia's later merge/Production instruction.

## Final Acceptance Checklist

- [ ] Public registration is demonstrably disabled and exactly one configured user ID is authorized.
- [ ] Anonymous, expired, and wrong-user sessions cannot read or mutate admin data through pages, actions, or direct requests.
- [ ] Login is rate-limited and errors do not enumerate users or leak provider detail.
- [ ] `/admin` is private, no-store, noindex, and absent from public navigation.
- [ ] Dashboard ranges, totals, trend, five breakdowns, recent activity, loading, empty, and error states are truthful and bounded.
- [ ] Recharts is accessible, responsive, deterministic, and isolated from public bundles.
- [ ] Inbox uses keyset pagination and accessible read/unread/delete flows with exact optimistic rollback.
- [ ] Authenticated admin activity is excluded from analytics without making public rendering dynamic.
- [ ] New query predicates have matching indexes and Preview query plans were inspected.
- [ ] Full unit, integration, browser, axe, build, Lighthouse, migration, CI, and live Preview gates pass.
- [ ] No secrets, credentials, PII artifacts, sample metrics, or AI authorship entered git history or the PR.
- [ ] No Phase 7 migration or deployment was promoted to Production and the PR remains draft.

## Primary References

- Neon Auth SDK migration/current server contract: https://neon.com/docs/auth/migrate/from-auth-v0.1
- Neon Auth SDK v0.2+ release: https://neon.com/docs/changelog/2026-01-30
- Neon Auth on Vercel Preview branches: https://neon.com/docs/changelog/2026-01-16
- Branchable Neon Auth model: https://neon.com/docs/changelog/2025-12-12
- Next.js authentication and DAL guidance: https://nextjs.org/docs/app/guides/authentication
- Next.js 16 Proxy guidance: https://nextjs.org/docs/app/getting-started/proxy
- Next.js Server Action security: https://nextjs.org/docs/app/api-reference/directives/use-server
