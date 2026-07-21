# Phase 4 Delivery Report

## Delivered

- Resilient project catalogue: typed contracts, 17 reviewed fallback records, manual override hooks (flagships, categories, live URLs, ordering), and a server-only GitHub adapter that merges live repo data over the fallback catalogue and falls back completely on any fetch failure (missing token, non-2xx, timeout/network error, malformed payload).
- Server-rendered `/projects` catalogue with a client-side category filter (All + six approved categories) that syncs `?category=<slug>` via `history.replaceState`/`useSyncExternalStore` and reconstructs on reload/back/forward. Full 17-project catalogue remains reachable with JavaScript disabled.
- Five reviewed flagship case studies (SkillBridge AI Interviewer, Llama QLoRA Education QA, AI Study Planner Agents, Oxford Pet Segmentation, Prestige Motors Showroom), grounded directly in repository READMEs/results docs (fetched via `gh api`, not the old static demo copy) and the reviewed CV. Every published metric is traced in `docs/content/phase-4-claim-ledger.md`. **Content reviewed and approved by Yehia** before the routes were built; the `period` field is intentionally blank on four of five case studies pending real build dates he will supply before launch.
- Static `/projects/[slug]` routes for the five approved slugs (`generateStaticParams` + `dynamicParams = false`; every other slug is a real 404 resolved at the routing layer, not a client-side redirect). Shared editorial template: metadata strip, problem/constraints, approach, architecture/stack, results, limitations, reproducibility, approved media, repository/live actions, and previous/next navigation.
- Cloudinary-with-local-fallback media pipeline: allowlisted `publicId`s, fixed `f_auto,q_auto,c_limit,w_<width>` transformation, validated cloud-name env var, and a statically-imported local fallback (real dimensions, no layout shift) when Cloudinary is unconfigured. No client-side image state machine.
- Homepage flagship rows and command-palette actions wired to the new internal case-study routes.
- A real, pre-existing no-JavaScript regression was found and fixed during verification (not merely worked around): the root `loading.tsx` Suspense boundary, combined with any `async` Server Component (the new case-study pages' `await params`, and `/projects`' GitHub fetch), deferred all page content behind a client-only streaming swap — a no-JS visitor saw only a loading skeleton forever. Fixed by removing `loading.tsx` (redundant with the existing page-transition system) and rebuilding the catalogue filter's URL sync on `useSyncExternalStore` instead of `useSearchParams()`.

## Content Approval

Presented to Yehia before Task 4 began: five summaries, results tables, limitations, and the full claim ledger. Approved with one change — the `period` field's timing was corrected per his direction (GitHub push dates do not reflect actual build dates); SkillBridge's real period ("Oct 2025 - Jun 2026") was supplied directly, the other four are deliberately left blank for him to fill in before launch.

## GitHub Fallback Proof

`tests/unit/phase-4-project-data.test.ts` unit-tests every failure mode without ever calling the real GitHub API (fetch is mocked): missing token, non-2xx response, network error/timeout, malformed payload, and malformed array items all resolve to the complete 17-project fallback catalogue with the correct category counts (LLM 3, CV 2, ML 5, Full-Stack 2, Games 3, Distributed 2) and all 5 flagships present. Separately verified with a dummy `GITHUB_TOKEN` set at build time: the token value has zero matches anywhere in `.next/static` (client bundles) or rendered HTML; the string "GITHUB_TOKEN" (the variable name, not the secret) appears only in server-only SSR execution chunks, never shipped to the browser.

## Route And Test Counts

- Routes: `/`, `/projects`, `/projects/[slug]` (5 static paths, SSG via `generateStaticParams`), `/services`, `/design-system`, `/_not-found`.
- Unit tests: 61 passing across 14 files (1 pre-existing, unrelated failure - see Warnings).
- Playwright: 161 passing, 0 failed, run against the production build (`next start`, CI mode with retries enabled) - homepage, projects catalogue, all 5 case studies, command palette, responsive/overflow sweep, accessibility/axe, display modes, design system, and shell boundaries.

## Responsive And Accessibility Result

- Axe (WCAG A/AA): zero violations at `/`, `/projects`, `/projects/skillbridge-ai-interviewer`, `/services`, `/design-system`, and the branded 404, across Paper, Night, and Mono (18 checks).
- Heading order: no skipped levels at `/projects` or the SkillBridge case study (axe's WCAG tags don't cover the heading-order best-practice rule, so this is checked explicitly).
- Viewport overflow: no horizontal scroll at 360/390/768/1024/1440/1920px across `/`, `/projects`, both representative case studies, `/design-system`, and the 404 page.
- Display-mode visual sweep: `/projects`, SkillBridge, and Prestige Motors all contained (no overflow) at 390/768/1440/1920px in Paper, Night, and Mono (48 checks).
- No-JavaScript: all 5 case studies and the full 17-project catalogue remain fully readable with JavaScript disabled (heading, primary action, and navigation all present in the initial HTML - this is exactly the regression described above, now fixed and covered by a permanent test).
- Keyboard: category filter chips are operable by keyboard; command palette, skip link, and every interactive design-system specimen are keyboard-reachable.
- Reduced motion: transitions and scroll behavior collapse under `prefers-reduced-motion`, verified while navigating.

## Build And Lighthouse

- `pnpm measure:build`: 19 files, 239,409 gzip bytes / 771,168 raw bytes (`.next/static/chunks/**/*.js`). The Phase 3 baseline (recovered from git history, since this script overwrites the same file every phase - see Warnings) was 18 files, 242,343 gzip bytes / 781,746 raw bytes. Phase 4 is **2,934 gzip bytes (1.2%) smaller** despite adding the full catalogue and case-study feature set, because the new routes are almost entirely Server Components - only the catalogue filter ships client JS.
- `pnpm lighthouse` (homepage, 3 runs): Performance 93, Accessibility 100, Best Practices 96, SEO 100. LCP 2859ms, CLS 0.
- Context: Phase 3's report left the Lighthouse LCP gate explicitly unresolved and deferred at Yehia's request (last recorded median 3028ms against a 2900ms budget; Phase 2's baseline LCP was 2852ms, no Phase 3 Lighthouse baseline JSON was ever committed). Phase 4 did not touch the homepage route or its bundle, and this run's 2859ms LCP / 93 performance score is consistent with that already-known, already-deferred variance - not a new regression introduced by this phase.

## Cloudinary Status

`NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` is not set in this local environment, so every case-study image renders via the statically-imported local fallback (`mockups/demo/assets/*`, the same tracked files referenced in `docs/content/asset-register.md` - no redundant copies). The Cloudinary code path (`next.config.ts` remote pattern, `buildCloudinaryImageUrl`) is implemented and unit-tested but has not been exercised against a real Cloudinary account. Needs a real cloud name configured in the Vercel preview to verify end-to-end.

## Review Links

- Draft PR: https://github.com/Yehia-Alsaeed/portfolio-website/pull/4
- Vercel preview: pending.

**Not yet done:** configuring `GITHUB_TOKEN`/`NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` in the Vercel preview and deploying. These need real secret values I do not have and should not handle - Vercel's own CLI isn't installed in this environment either. Waiting on Yehia to configure the preview env vars himself (or share a preview URL once it's deployed) before running the Phase 4 Playwright/Lighthouse spot-check against it.

## Warnings

- `tests/unit/phase-2-shell.test.tsx` fails with `TypeError: default is not a function` in `src/app/fonts.ts`'s `localFont()` call - a pre-existing Vitest/jsdom mock issue confirmed present on `main` before any Phase 4 work; unrelated to this phase.
- Next.js prints a workspace-root inference warning (multiple lockfiles detected: the repo root and this worktree) on every build/dev/start. Cosmetic; does not affect output. Fixable later via `turbopack.root` in `next.config.ts` if it becomes annoying.
- Two pre-existing Phase 2/3 e2e tests (command-palette Ctrl+K open, the `N`-key mode-cycling shortcut) flaked once each under heavy parallel load earlier in this session, unrelated to any Phase 4 code; both passed cleanly in isolation and in the final clean 161/161 CI-mode run.
- `scripts/measure-build.ts` and `scripts/measure-lighthouse.ts` both have their output path hardcoded to `docs/implementation/phase-3-*-baseline.json` rather than deriving it from the current phase. Every phase's gate run silently overwrites the same two files with that phase's own numbers - this is evidently the established, repeated pattern (Phase 3's report itself cites a self-computed delta the same way), so this report did too, but the literal filenames are stale by one phase. Worth parameterizing later; not fixed here as it's outside Task 6's scope.

## Deferred

- Phase 5 interactive proof modules (Architecture X-Ray, Model Comparison Microscope, Agent Run Replay, live iframe embed/viewport scrubber) - explicitly out of scope per the plan.
- Real build-period dates for four of five case studies (Llama QLoRA, AI Study Planner, Oxford Pet, Prestige Motors) - Yehia will supply these during final pre-launch tweaks.
- Live end-to-end Cloudinary verification - needs a real cloud name in the Vercel preview.
- Vercel preview deployment and its env var configuration - pending Yehia's own entry of the real `GITHUB_TOKEN`/`NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` values.
