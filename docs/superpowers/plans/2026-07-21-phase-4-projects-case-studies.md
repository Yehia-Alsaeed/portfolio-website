# Phase 4 Projects And Case Studies Implementation Plan

> **For Claude Code:** Use `superpowers:executing-plans` in one session. Run with `claude --model sonnet --effort medium`. Do not dispatch subagents unless blocked; they multiply context and token use.

**Goal:** Publish the resilient 17-project catalogue and five evidence-first flagship case studies.

**Architecture:** Keep reviewed case-study copy and fallback project records in typed repository modules. Fetch public repository metadata server-side from GitHub with daily revalidation, merge it with manual overrides, and fall back completely to checked-in data on any API failure. Render `/projects` and all case studies as Server Components; only URL filter controls may be client-side.

**Stack:** Existing Next.js 16, React 19, strict TypeScript, Tailwind 4, Vitest, Playwright and Vercel. Use native `fetch`, `next/image`, and existing UI primitives. Add no GitHub or Cloudinary SDK.

## Lean Execution Rules

- Follow this plan, `prd.md` sections 5.2-5.3, and the roadmap Phase 4 section. Do not redesign approved scope.
- Use one Claude Sonnet session, six meaningful commits, targeted tests during tasks, and one full quality run at the end.
- Do not generate exhaustive snapshots, class-name tests, repeated per-component tests, or duplicate accessibility suites.
- Preserve desktop, tablet, mobile, keyboard, accessibility, SEO, security, resilience, and performance requirements.
- Do not implement Phase 5 proof interactions: React Flow, Architecture X-Ray, model microscope, agent replay, iframe window, or viewport scrubber.
- Do not implement Phase 6+ database, forms, analytics, auth, admin, Recharts, Drizzle, Neon, or Resend work.
- Never fabricate metrics, outcomes, repository facts, client claims, or screenshots. Trace every public claim to a repository file, CV register, asset register, or approved existing copy.
- Leave `D:\portfolio website\.claude\` untouched and untracked. Work from an isolated `phase-4-projects-case-studies` worktree based on current `main`.

## Task 1: Typed Project Data And Resilient GitHub Adapter

**Create:**

- `src/features/projects/model.ts` - project/category contracts and six approved categories.
- `src/content/projects/fallback.ts` - checked-in records for the 17 approved repositories.
- `src/content/projects/overrides.ts` - flagship slugs, display copy, category overrides, ordering, live URLs and hidden/archive rules.
- `src/features/projects/github.ts` - server-only GitHub fetch and normalization.
- `src/features/projects/catalogue.ts` - deterministic merge and fallback entry point.
- `tests/unit/phase-4-project-data.test.ts` - one focused contract/resilience suite.

**Requirements:**

- Use `GET /users/Yehia-Alsaeed/repos?type=owner&sort=updated&per_page=100` with `Accept: application/vnd.github+json`, optional `Authorization: Bearer ${GITHUB_TOKEN}`, and `next: { revalidate: 86400 }`.
- Keep `GITHUB_TOKEN` server-only. Never expose it through props, logs, errors, `NEXT_PUBLIC_*`, or a browser fetch.
- Exclude forks, archived repositories, and explicit hidden overrides. Map GitHub topics to the six approved categories, then apply manual overrides. Unknown future topics remain visible under `All` as `Other`; do not guess a technical category.
- Merge live stars, description, topics, language, homepage URL and updated date into reviewed fallback records. A missing token, non-2xx response, timeout, malformed payload, or rate limit returns the complete fallback catalogue without breaking rendering.
- Preserve the 17 approved projects and category counts documented in `mockups/demo/projects.html`. Flagships route internally; non-flagships route to GitHub.
- Tests cover all 17 unique repositories/slugs, five flagships, category mapping, override precedence, unknown-topic handling, GitHub success, and total fallback on failure. Mock `fetch`; do not call GitHub in tests.

**Commit:** `feat: add resilient project catalogue`

## Task 2: Responsive `/projects` Catalogue

**Create/modify:**

- `src/features/projects/project-filters.tsx` - the only catalogue client boundary.
- `src/features/projects/project-card.tsx` - semantic project summary and links.
- `src/app/projects/page.tsx` - Server Component catalogue page.
- `src/app/projects/projects.module.css` - route-specific responsive layout only if shared tokens are insufficient.
- `tests/e2e/projects.spec.ts` - catalogue and filtering journey.

**Requirements:**

- Match Mockup B's ruled, typographic language without nested cards, hover previews, gradients, or decorative imagery.
- Show name, reviewed description, category, primary language/topics, stars, GitHub action, live action when approved, and `Case study` for flagships.
- Filters are `All` plus the six approved categories. Store selection in `?category=<slug>` using `history.replaceState`; reload/back/forward must reconstruct it. Invalid values resolve to `All`. Announce result count and show a useful empty state.
- Server-render the complete catalogue before enhancement so content and links work without JavaScript. Filtering may enhance client-side; do not fetch GitHub from the browser.
- Verify keyboard operation, focus visibility, external-link semantics, no horizontal overflow, and meaningful density at 390, 768, 1440 and 1920px.
- E2E covers initial render, URL filtering/restoration, counts, empty/invalid state behavior, five internal flagship links, external GitHub/live links, and JavaScript-disabled access to all records.

**Commit:** `feat: build project catalogue`

## Task 3: Reviewed Case-Study Content Contract

**Create:**

- `src/content/projects/case-studies.ts` - five typed case studies and media references.
- `docs/content/phase-4-claim-ledger.md` - concise claim-to-source ledger.
- Extend `tests/unit/phase-4-project-data.test.ts`.

**Requirements:**

- Include exactly: SkillBridge AI Interviewer, Llama QLoRA Education QA, AI Study Planner Agents, Oxford Pet Segmentation, and Prestige Motors Showroom.
- Each record includes slug, title, summary, role, period, type, stack, problem, constraints, approach, architecture narrative, results, limitations, reproducibility, media, repository URL, optional approved live URL, and previous/next slug.
- Research the five public repositories and their README/source artifacts before drafting. Existing demo copy is a starting point, not authority. Record each metric and material claim in the ledger with an exact repository URL/path or approved document source.
- Phrase absent evidence honestly. Use `Not measured`, a limitation, or omit the field instead of inventing impact. Do not expose secrets, personal data, identifiable unapproved people, or unapproved client information.
- Use only assets approved in `docs/content/asset-register.md`. Preserve its alt-text intent and visibility restrictions.
- Unit tests enforce five unique slugs, valid navigation, HTTPS links, required sections, media alt text, known metric values, and a ledger entry for every metric.

**User checkpoint:** Claude must present the five summaries, metrics, limitations and claim ledger to Yehia for content approval before Task 4. Do not publish unreviewed generated copy.

**Commit:** `content: add reviewed flagship case studies`

## Task 4: Static Case-Study Routes And Media Delivery

**Create/modify:**

- `src/app/projects/[slug]/page.tsx` - `generateStaticParams`, `generateMetadata`, and case-study render.
- `src/features/case-study/case-study-page.tsx` - shared semantic template.
- `src/features/case-study/case-study.module.css` - responsive editorial layout.
- `src/features/media/cloudinary.ts` - allowlisted URL builder for `f_auto,q_auto,c_limit,w_<width>`.
- `src/features/media/project-image.tsx` - `next/image` wrapper with Cloudinary/local fallback.
- `next.config.ts` - Cloudinary remote pattern scoped to the configured cloud name.
- `src/lib/env/public.ts` and `.env.example` - optional validated cloud-name support.
- `tests/unit/phase-4-media.test.ts` - transformation and fallback tests.
- `tests/e2e/case-studies.spec.ts` - shared route behavior.

**Requirements:**

- Generate only the five known slugs and call `notFound()` for everything else. Each page has a unique title, description, canonical URL and open-graph text metadata; dynamic OG images remain Phase 8.
- Render one `h1`, metadata strip, problem, role/constraints, approach, architecture/stack, results, limitations, reproducibility, approved media, repository/live actions, and previous/next navigation.
- Pages must remain fully understandable without JavaScript. Reserve image dimensions, use responsive `sizes`, lazy-load below-fold media, and never place image binaries in a database.
- Build Cloudinary URLs only from validated cloud names, allowlisted public IDs, numeric widths and fixed transformations. When the cloud name is absent locally, render the approved imported fallback asset; require valid Cloudinary configuration on preview/production. Reuse the existing tracked files in `mockups/demo/assets`; do not create redundant source copies or a client-side image state machine.
- Do not add Phase 5 interactive proof placeholders that imply functionality. Static architecture text and approved screenshots are sufficient.
- Wire homepage flagship rows and command-palette project actions to the new internal routes. Reuse the existing transition system without delaying navigation.
- E2E loops through all five pages for HTTP/metadata/headings/actions, then checks JavaScript-disabled readability. Responsive/visual assertions focus on `/projects`, SkillBridge, and Prestige at 390, 768 and 1440 because they share the template.

**Commit:** `feat: publish flagship case studies`

## Task 5: Integration, Accessibility And Failure States

**Modify:**

- Existing command-palette, accessibility and responsive tests only where route lists are centralized.
- Add `tests/e2e/projects-resilience.spec.ts` only if GitHub failure cannot be covered cleanly in unit tests.

**Requirements:**

- Confirm GitHub unavailable/rate-limited behavior still renders all fallback records and five case studies.
- Confirm no server token appears in rendered HTML, browser requests, build output, or client bundles.
- Run axe on `/projects` and one representative case study in Paper, Night and Mono. Shared template coverage is sufficient; do not repeat axe across all five pages.
- Check no-JavaScript navigation, keyboard filters/actions, reduced motion, image alt text, heading order, focus, contrast and overflow.
- Visually inspect `/projects`, SkillBridge and Prestige at 390, 768, 1440 and 1920 in all three display modes. Fix layout/content problems; do not produce a permanent screenshot archive.

**Commit:** `test: cover phase four project journeys`

## Task 6: One Final Gate, Preview And Handoff

Run the complete local gate once:

```powershell
pnpm format
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm playwright test
pnpm measure:build
pnpm lighthouse
git diff --check
```

Then:

1. Push `phase-4-projects-case-studies` and open one draft PR.
2. Configure `GITHUB_TOKEN` and `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` in the Vercel preview without printing values. Cloudinary API key/secret are needed only for upload tooling, never public delivery.
3. Deploy one Vercel preview. Run only the Phase 4 project/case-study Playwright files against it plus one Lighthouse check on `/projects` and the heaviest case study.
4. Write `docs/implementation/phase-4-report.md` containing the PR/preview URLs, delivered/deferred scope, content approval, GitHub fallback proof, route/test counts, responsive/accessibility result, Lighthouse/build delta, Cloudinary status, and real warnings.
5. Commit the report and stop for Yehia's review. Do not merge or delete the worktree until explicitly approved.

**Commit:** `docs: record phase four delivery`

## Completion Gate

Phase 4 is review-ready when `/projects` remains useful during a GitHub outage, all five case studies are statically generated and readable without JavaScript, every metric is traceable and user-approved, Cloudinary media has a working local fallback, internal project navigation is complete, required responsive/accessibility/performance checks pass, and the Vercel preview is ready.
