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
- Unit tests: 62 passing across 14 files (1 pre-existing, unrelated failure - see Warnings).
- Playwright: 161 passing, 0 failed, run against the production build (`next start`, CI mode with retries enabled) - homepage, projects catalogue, all 5 case studies, command palette, responsive/overflow sweep, accessibility/axe, display modes, design system, and shell boundaries.
- Playwright against the live Vercel preview: `tests/e2e/case-studies.spec.ts` and `tests/e2e/projects.spec.ts` (19 tests) run a second time directly against the deployed, Deployment-Protection-gated preview URL (bypassed via a "Protection Bypass for Automation" header, not by disabling protection). First run: 16/19 passed, 3 failed on a real bug - see below. After the fix and redeploy: **19/19 passed**.

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
- `pnpm lighthouse` (homepage, local production build, 3 runs): Performance 93, Accessibility 100, Best Practices 96, SEO 100. LCP 2859ms, CLS 0.
- Context: Phase 3's report left the Lighthouse LCP gate explicitly unresolved and deferred at Yehia's request (last recorded median 3028ms against a 2900ms budget; Phase 2's baseline LCP was 2852ms, no Phase 3 Lighthouse baseline JSON was ever committed). Phase 4 did not touch the homepage route or its bundle, and this run's 2859ms LCP / 93 performance score is consistent with that already-known, already-deferred variance - not a new regression introduced by this phase.

### Live preview Lighthouse (single run each, per Task 6's spot-check requirement)

Run directly against the deployed Vercel preview (bypass header, real Cloudinary images, real GitHub data) rather than the local build:

| Page | Performance | Accessibility | Best Practices | SEO | LCP | CLS |
| --- | --- | --- | --- | --- | --- | --- |
| `/projects` | 93 | 100 | 93 | 54 | 2761ms | 0 |
| `/projects/oxford-pet-binary-segmentation` (heaviest case study, 3 images) | 91 | 100 | 96 | 61 | 3096ms | 0 |

Performance, Accessibility, and CLS all match the local baseline within normal run-to-run noise. The SEO and Best Practices gaps are both explained and **neither is a Phase 4 regression**:

- **SEO (54/61 vs. 100 locally):** Vercel automatically sends `X-Robots-Tag: noindex` and injects `<meta name="robots" content="noindex">` on every non-production deployment, specifically so preview URLs never get indexed - confirmed via response headers. This would not happen on the production domain. Separately, `/robots.txt` has never existed on this site at any phase (confirmed empty history across all commits/branches), so Lighthouse's `robots-txt` audit also fails here - a pre-existing gap, not something Phase 4 introduced or regressed.
- **Best Practices (93/96 on `/projects`):** two causes, both pre-existing sitewide, not new to Phase 4's code: (1) `errors-in-console` - a single `favicon.ico` 404, because the site has never had a favicon file at any phase; (2) `font-size` - the site's existing global `text-[0.6875rem]` (11px) monospace/uppercase label styling, used in the header, footer, and badges since earlier phases, covers 41.88% of this page's text and crosses Lighthouse's 12px legibility threshold. Both are flagged in Warnings below as pre-existing, out-of-scope-for-this-phase findings.

## Cloudinary Status

**Now verified live and working end-to-end.** Yehia created a Cloudinary account, uploaded all 8 approved assets under their exact allowlisted Public IDs, and configured `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` and `GITHUB_TOKEN` as Preview environment variables in Vercel. Verification against the deployed preview confirmed:

- All 8 expected URLs (`https://res.cloudinary.com/cqmnouky/image/upload/f_auto,q_auto,c_limit,w_1600/<publicId>` for `skillbridge-interview`, `skillbridge-results`, `prestige-home`, `prestige-collection`, `pets-fcn`, `pets-segnet`, `pets-hrnet`, `study-planner-architecture`) return HTTP 200.
- The rendered case-study HTML's `<img>` `src`/`srcSet` route through Next's image optimizer to the real cloud name with the exact right Public IDs (checked directly on the SkillBridge case study page).
- The local-fallback path (`mockups/demo/assets/*`) remains the safety net if the cloud name is ever unset again; both paths are unit-tested.

## Review Links

- Draft PR: https://github.com/Yehia-Alsaeed/portfolio-website/pull/4
- Vercel preview: https://portfolio-website-git-worktr-3f163a-yehias3eed11-5404s-projects.vercel.app (Deployment Protection is on - Vercel's default "Standard Protection" for the Hobby plan; sign in with your Vercel account to view it directly, or use the Protection Bypass header for automation).

## Bug Found And Fixed During Preview Verification

Running the Phase 4 Playwright specs against the live preview (with a real `GITHUB_TOKEN`, for the first time against real GitHub data instead of the local fallback) surfaced a real bug the fallback-only local gate could never have caught: 3 of 19 tests failed because the catalogue's live-merged category counts didn't match the approved distribution.

**Root cause:** `buildCatalogue()` replaces a project's curated fallback topics entirely with its live GitHub topics when a live repo is found (`topics = live?.topics ?? record.topics`). The curated fallback topics were written with specific, unambiguous tokens (e.g. `"fullstack"`, `"game-ai"`) chosen to map cleanly through `TOPIC_CATEGORY_MAP`. The real GitHub topics are more specific/verbose and mostly don't share that vocabulary, so several projects silently drifted:

- `skillbridge-ai-interviewer` carries both `computer-vision` and `llm` topics on GitHub; `mapTopicsToCategory` returns whichever comes first alphabetically, which resolved to Computer Vision instead of the intended LLM category.
- `prestige-motors-showroom` (real topics: `mern`, `express`, `react`, `mongodb`...) and `trip-mate-travel-planner-app` (real topics: `flutter`, `android`, `firebase`...) both fell through to "Other" instead of "Full-Stack" - none of their real topics matched the map.
- `game-tree-alpha-beta-board-game` (real topics: `board-game`, `artificial-intelligence`, `minimax`...) fell through to "Other" instead of "Games" for the same reason.

**Fix:** added `"skillbridge-ai-interviewer": "llm"` to `CATEGORY_OVERRIDES` (an ambiguous, multi-topic repo needs an explicit editorial call, matching the approved case-study framing) and three new specific, unambiguous tokens to `TOPIC_CATEGORY_MAP` (`mern`, `flutter`, `board-game` → their correct categories) in [catalogue.ts](../../src/features/projects/catalogue.ts) and [overrides.ts](../../src/content/projects/overrides.ts). Added a regression test in `phase-4-project-data.test.ts` that replicates the real live topic sets so this can't silently regress again. Committed (`d95bdc6`) and pushed to the same branch; Vercel redeployed the same preview URL automatically. Re-ran the full Playwright suite against the fixed preview: **19/19 passed**.

## Warnings

- `tests/unit/phase-2-shell.test.tsx` fails with `TypeError: default is not a function` in `src/app/fonts.ts`'s `localFont()` call - a pre-existing Vitest/jsdom mock issue confirmed present on `main` before any Phase 4 work; unrelated to this phase.
- Next.js prints a workspace-root inference warning (multiple lockfiles detected: the repo root and this worktree) on every build/dev/start. Cosmetic; does not affect output. Fixable later via `turbopack.root` in `next.config.ts` if it becomes annoying.
- Two pre-existing Phase 2/3 e2e tests (command-palette Ctrl+K open, the `N`-key mode-cycling shortcut) flaked once each under heavy parallel load earlier in this session, unrelated to any Phase 4 code; both passed cleanly in isolation and in the final clean 161/161 CI-mode run.
- `scripts/measure-build.ts` and `scripts/measure-lighthouse.ts` both have their output path hardcoded to `docs/implementation/phase-3-*-baseline.json` rather than deriving it from the current phase. Every phase's gate run silently overwrites the same two files with that phase's own numbers - this is evidently the established, repeated pattern (Phase 3's report itself cites a self-computed delta the same way), so this report did too, but the literal filenames are stale by one phase. Worth parameterizing later; not fixed here as it's outside Task 6's scope.
- The site has never had a `/robots.txt` route or a favicon file, at any phase (confirmed via empty git history for both across all commits/branches). Both surfaced now only because the live-preview Lighthouse check happened to look for them; neither is new to Phase 4 or caused by it. Worth adding in a later phase.
- The live preview's Cloudinary cloud name and GitHub token are Preview-scoped only (per Yehia's Vercel configuration); Production has not been touched and still has neither configured. This is expected for a draft PR's preview and not a gap in this phase's work.

## Deferred

- Phase 5 interactive proof modules (Architecture X-Ray, Model Comparison Microscope, Agent Run Replay, live iframe embed/viewport scrubber) - explicitly out of scope per the plan.
- Real build-period dates for four of five case studies (Llama QLoRA, AI Study Planner, Oxford Pet, Prestige Motors) - Yehia will supply these during final pre-launch tweaks.
- Adding `/robots.txt` and a favicon - pre-existing sitewide gaps surfaced by this phase's Lighthouse check but predating it; not fixed here as they're outside Task 6's scope.
