# Phase 8 Quality Hardening Design

**Status:** Approved on July 27, 2026.

**Purpose:** Turn SEO, accessibility, security, performance, and browser compatibility into one measured release gate while preserving the portfolio's static public rendering, Swiss-grid visual system, privacy boundaries, and Vercel Hobby constraints.

**Execution owner:** Claude Code. The implementation plan must therefore be self-contained, use repository-relative paths and ordinary shell commands, state expected results and stop conditions, and never depend on Codex-only tools or conversation history.

**Sources of truth:**

1. `docs/superpowers/specs/2026-07-17-portfolio-production-roadmap-design.md` defines the Phase 8 deliverables, release metrics, engineering rules, and exit gate.
2. `docs/implementation/phase-7-report.md` records the shipped Phase 7 implementation and its remaining Preview verification.
3. `docs/implementation/decision-register.md` locks the architecture, hosting, visual system, analytics, data, and authentication decisions.
4. The Phase 7 merge commit on `main` is the implementation baseline.

## 1. Scope and Locked Decisions

Phase 8 will use one coordinated implementation plan with four mandatory review checkpoints. It will:

- close stale Phase 7 documentation and live-Preview verification carryovers before establishing a new baseline;
- make repository-wide formatting and linting ignore only local generated tool/worktree artifacts, without deleting or tracking those artifacts;
- remove the public `/design-system` review gallery and the unapproved `?scrollRules=1` scroll-progress experiment;
- complete crawl, canonical, structured-data, social-card, and CV-download behavior;
- audit and remediate the complete public and admin experience against WCAG 2.2 AA;
- audit and harden authentication boundaries, mutations, analytics, contact handling, headers, dependencies, secrets, frames, caching, and PII behavior;
- measure bundles, fonts, images, caching, database queries, Core Web Vitals proxies, and representative-route Lighthouse results before making performance changes;
- add Chromium, Firefox, desktop WebKit, and iPhone-style WebKit browser coverage;
- verify the result on a production-like Vercel Preview before the draft PR is eligible for review.

Phase 8 will not redesign the approved Swiss-grid visual system, add new public features, introduce a CMS, replace Neon Auth, add third-party analytics, add paid infrastructure, merge its PR, deploy Production, or create the Phase 9 release tag. It will not weaken a test, security boundary, privacy rule, or release target to make a gate pass.

The branch is `phase-8-quality-hardening` when Claude Code begins implementation. All commits must be authored only by `Yehia-Alsaeed <yehias3eed11@gmail.com>` and contain no co-author trailer or AI attribution.

## 2. Coordinated Delivery Order

The plan uses a baseline-first sequence so each later measurement has a trustworthy starting point:

1. **Readiness and carryovers:** isolate generated local directories from quality tools, reconcile the Phase 7 report with the merged PR, and execute the pending Phase 7 Preview checks.
2. **Measured baseline:** inventory public/admin routes, metadata, structured data, headers, browser coverage, bundles, images, fonts, cache behavior, query plans, axe results, and Lighthouse scores before changing production behavior.
3. **Public release surface:** remove temporary routes/experiments, then complete SEO, social images, structured data, and CV delivery.
4. **Accessibility:** fix semantic, keyboard, focus, screen-reader, zoom/reflow, contrast, touch-target, and reduced-motion findings without changing the approved visual direction.
5. **Security:** remediate evidence-backed auth, form, analytics, header, dependency, secret, frame, caching, and privacy findings.
6. **Performance:** optimize only measured bottlenecks and restore the roadmap's release thresholds.
7. **Browser and Preview acceptance:** run the complete browser matrix and production-like Preview gate, record evidence, and stop at a draft PR.

Each stage must leave independently reviewable evidence. A failure at one review checkpoint blocks later stages until it is resolved or explicitly recorded as an external manual dependency owned by Yehia.

## 3. Task 0: Readiness and Phase 7 Carryovers

Task 0 is a real implementation task, not administrative cleanup.

Quality commands currently traverse generated content under `.claude/`, `.superpowers/`, and nested `.worktrees/`. The implementation will add narrowly scoped entries to `.gitignore`, `.prettierignore`, and ESLint `globalIgnores` so `pnpm format:check` and `pnpm lint` inspect repository-owned source and documentation while ignoring those local artifacts. It will not remove, format, stage, or otherwise modify the generated directories.

The Phase 7 report will be reconciled with PR #8's merged state and successful GitHub/Vercel checks. The still-unproven Phase 7 acceptance items remain required:

- app-level anonymous, exact-admin, wrong-user, login, refresh, logout, expired-session, signup-blocking, and rate-limit behavior;
- Preview query-plan inspection for bounded analytics and inbox queries;
- synthetic inbox read/unread/delete behavior;
- admin self-exclusion from analytics;
- `noindex`, `no-store`, and absence from public navigation;
- keyboard, axe, 200% zoom, console, and responsive checks at 360, 390, 768, 1024, 1440, and 1920 CSS pixels.

Preview credentials and the Vercel protection bypass secret remain ephemeral and local. They must never enter shell output captured in the report, browser artifacts, git, GitHub Actions, or application environment variables. Synthetic Preview data must be uniquely marked and removed without touching inherited production records.

**Checkpoint 1:** Task 0 passes only when the tracked worktree is clean apart from its intended documentation/configuration changes, repository-wide quality commands no longer traverse generated tool/worktree artifacts, the Phase 7 report matches reality, and every carryover has evidence or an explicit external blocker.

## 4. SEO, Crawl, Social, and CV Delivery

Every indexable public route will have a truthful unique title, description, canonical URL, Open Graph fields, and Twitter-card fields. Metadata will continue to use `NEXT_PUBLIC_SITE_URL` through the validated `metadataBase`; local fallback URLs may be used only for local tests, never as Preview or Production canonical output.

The public route inventory is:

- `/`;
- `/projects`;
- the five generated `/projects/[slug]` case studies;
- `/services`;
- the branded not-found response.

`/admin`, `/admin/inbox`, `/admin/login`, API routes, the branded not-found response, missing case-study slugs, and removed development/review paths are not indexable and are excluded from the sitemap. `robots.ts` will name the sitemap and retain the admin disallow rule. `sitemap.ts` will emit only canonical public URLs with defensible modification dates; it will not invent update frequency or priority values.

The homepage will emit one valid `Person` JSON-LD graph sourced from `PROFILE` and existing evidence-backed content. It may include the canonical profile URL, role, Cairo location, GitHub, LinkedIn, and known skills, but no fabricated employer, credential, rating, award, image, or social account. `/services` will emit a conservative `Service`/`OfferCatalog` graph only for the two published offers and existing contact/provider facts. JSON-LD is serialized from typed, server-owned objects and escapes `<` to prevent script-context injection.

Dynamic `next/og` images will cover the site default, projects catalogue, services page, and each case study. Images use the existing typography and Swiss-grid visual language, contain only evidence-backed titles/labels, return 1200×630 output, and avoid remote runtime fetches. Generated-image tests will verify status, content type, cache policy, dimensions where inspectable, and route-specific text inputs.

The final CV remains `public/cv/Yehia_Alsaeed_CV_AI.pdf`. Both footer and command-palette paths continue to emit the allowlisted `cv_download` event. Browser and response tests will verify successful download, `application/pdf`, safe content disposition, no HTML fallback, and the expected filename.

`/design-system`, its command-palette entry, route tests, and public-route inventory entries will be removed. The entire `src/features/scroll-rules` feature, its layout render, CSS, query parameter, and tests will also be removed because the experiment was never approved.

## 5. Accessibility Standard and Review

The normative target is WCAG 2.2 Level AA. Automated axe and Lighthouse checks are necessary but not sufficient.

The review covers every public route, the branded 404, admin login, dashboard, and inbox in all three display modes where the mode applies. It verifies:

- one meaningful `h1`, correct landmark and heading order, meaningful page titles, and unambiguous link/control names;
- useful alternative text, decorative-image suppression, table semantics, form labels, status announcements, and error-summary behavior;
- complete keyboard operation, logical focus order, visible focus, focus restoration, and focus not obscured by sticky or modal content;
- command palette, dialogs, filters, proof interactions, chart alternatives, inbox actions, and confirmation flows without pointer-only behavior;
- text and non-text contrast in Paper, Night, and Mono modes;
- reflow and content usability at 200% browser zoom and 400% text-equivalent narrow layouts;
- minimum WCAG 2.2 AA target size/spacing, while preserving the roadmap's stronger practical 44-pixel target where layout permits;
- reduced-motion behavior for page transitions, monogram registration, proof animation, scrolling, and any animated status;
- prerecorded client-work video controls and equivalent descriptive text;
- screen-reader behavior with NVDA on Windows for representative public and admin journeys.

Accessibility fixes preserve the approved visual system unless a visual token itself fails contrast, focus, or target requirements. Any required token change must be applied consistently across all three modes and documented with measured before/after contrast values.

## 6. Security and Privacy Hardening

The security review is evidence-driven and covers trust boundaries, not only dependency output.

Authentication and authorization checks will trace every admin page, route handler, Server Action, and query entry point to the exact configured admin-user check. Direct HTTP requests must not bypass UI restrictions. Signup routes remain blocked until Neon exposes and Yehia enables a verified provider-side restriction.

Contact, analytics, health, maintenance, and auth endpoints will be checked for body limits, content-type handling, duplicate fields, allowlists, rate-limit atomicity, generic errors, origin assumptions, cache behavior, bot handling, log redaction, and PII minimization. Database queries will be inspected for bounded ranges, keyset pagination, matching indexes, and parameterized input.

The response-header policy will define, test, and verify at least:

- `Content-Security-Policy`;
- `Strict-Transport-Security` on HTTPS Preview/Production responses;
- `X-Content-Type-Options: nosniff`;
- `Referrer-Policy`;
- a minimal `Permissions-Policy`;
- `frame-ancestors` and `object-src` restrictions;
- existing admin `X-Robots-Tag` and private `no-store` behavior.

Public static rendering is a locked performance constraint. A per-request nonce CSP would force public routes into dynamic rendering, so Phase 8 will first implement the strictest static-compatible policy supported by the actual production build. The policy will explicitly enumerate same-origin scripts/fonts, Cloudinary images, approved media, analytics connections, and required development-only exceptions. It will be tested in report-only form against the production build, then enforced only after representative public/admin journeys produce no unexplained violations. If framework-required inline script behavior prevents removal of `'unsafe-inline'`, the residual risk and rejected nonce trade-off will be documented rather than hidden.

Dependency review uses the lockfile, package-manager audit output, upstream advisories, and reachability in this application. A severity label alone does not prove exploitability, but a reachable high-severity issue blocks completion. Secrets and PII scans cover tracked source, built output, git diff, reports, browser artifacts, and the final commit message.

The site continues to render no third-party iframe. Frame tests verify both the absence of public embeds and the response policy that prevents hostile framing of this site.

## 7. Performance, Caching, and Query Review

Performance changes follow measurement. The baseline and final report will record:

- public route JavaScript chunks and gzip/raw totals using the existing build-measurement tooling;
- route-level client boundaries and expensive packages, especially React Flow and Recharts;
- responsive image source sets, dimensions, formats, Cloudinary transformations, and lazy/eager loading;
- self-hosted font files, subsets, weights, preload behavior, fallback metrics, and render timing;
- cache headers for static pages, metadata images, CV, media, health/auth/admin responses, and APIs;
- database query plans for analytics ranges, breakdowns, recent events, inbox pagination, rate limits, and maintenance;
- Lighthouse runs on `/`, `/projects`, one representative interactive case study, and `/services`.

Optimizations may adjust component boundaries, dynamic imports, image `sizes`, font loading, cache headers, or query/index shape. They may not remove content, make analytics blocking, weaken accessibility, duplicate data, add paid services, or make public rendering request-dependent.

The production-like Preview targets remain:

| Metric | Required target |
|---|---:|
| Largest Contentful Paint | ≤ 2.5 seconds at p75 |
| Interaction to Next Paint | ≤ 200 milliseconds at p75 |
| Cumulative Layout Shift | ≤ 0.1 at p75 |
| Lighthouse Performance | ≥ 95 |
| Lighthouse Accessibility | ≥ 95 with no critical axe violation |
| Lighthouse Best Practices | ≥ 90 |
| Lighthouse SEO | 100 |

Lighthouse runs use at least three runs per representative route and retain the median-run evidence. The temporary Phase 7 Lighthouse performance threshold of 0.90 and LCP allowance of 3400 milliseconds must be removed.

INP p75 is a field metric and cannot be truthfully established from a low-traffic Preview alone. Phase 8 will use repeatable synthetic keyboard/pointer interaction flows, long-task evidence, and available Lighthouse responsiveness diagnostics as the prelaunch proxy. The report must label that evidence as synthetic. Phase 9 and post-launch operations own confirmation of real-user INP p75 once enough eligible visits exist.

An unexplained public-route JavaScript increase above 10% from the accepted Phase 7 baseline blocks completion.

## 8. Browser and Production-like Preview Matrix

Playwright will define Chromium, Firefox, desktop WebKit, and iPhone-style WebKit projects. The full critical-path suite will run in Chromium; focused navigation, metadata, download, contact, proof-interaction, responsive, reduced-motion, and accessibility smoke coverage will run in every engine. Engine-specific skips require a documented product reason, not a timeout or convenience exception.

Manual inspection covers 360, 390, 768, 1024, 1440, and 1920 CSS-pixel widths. Representative routes are checked in Paper, Night, and Mono where applicable, with browser zoom, keyboard-only navigation, slow network, console/page errors, and screenshots stored only under ignored temporary paths.

Because the shipped site intentionally contains no third-party iframe, iPhone-style WebKit acceptance verifies that client-work media and external links work without creating an iframe and that the site's framing policy is enforced.

**Checkpoint 2:** SEO, route removal, social cards, structured data, CV delivery, and accessibility pass focused automated and manual review before security/performance changes begin.

**Checkpoint 3:** Security, privacy, cache, dependency, bundle, image, font, query-plan, and representative-route Lighthouse evidence pass locally before a Preview is treated as a release candidate.

**Checkpoint 4:** The production-like Preview passes the complete route, browser, accessibility, security-header, privacy, performance, and regression matrix. Any credential-gated check must be performed with ephemeral local values and leave no artifact.

## 9. Testing and Evidence

Implementation follows test-driven changes where behavior is deterministic:

1. add or change a focused test and prove the expected failure;
2. make the smallest implementation change;
3. prove the focused test passes;
4. run the affected domain suite;
5. run the checkpoint gate before committing the stage.

Required automated gates are:

```text
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm db:check
pnpm build
pnpm measure:build
pnpm exec playwright test
pnpm lighthouse
git diff --check
```

The implementation plan will name the exact focused tests for each task, expected failure reason, files to modify, interfaces produced, checkpoint commands, and commit message. Commands that require Preview secrets or admin credentials must state how output is kept secret and what can safely be recorded.

The final `docs/implementation/phase-8-report.md` will include:

- Task 0 carryover disposition;
- removed temporary/debug paths and experiments;
- route/metadata/sitemap/robots/JSON-LD/social-card inventory;
- accessibility audit matrix and manual NVDA results;
- security boundary, header, dependency, secret, PII, and query-plan conclusions;
- bundle, image, font, cache, Lighthouse, and synthetic responsiveness comparisons;
- cross-browser and responsive results;
- exact verification commands and outcomes;
- Preview URL and CI check links without credentials;
- remaining Phase 9 production-only actions.

## 10. Claude Code Handoff and Delivery Boundary

The implementation plan is written for Claude Code executing from a fresh checkout. It will:

- begin by reading `AGENTS.md`, `CLAUDE.md`, this design, the roadmap, Phase 7 report, decision register, and environment contract;
- verify `main` and create an isolated `phase-8-quality-hardening` worktree/branch before editing;
- preserve user-owned untracked files and never delete `.claude/`, `.superpowers/`, or existing worktrees;
- use exact repository-relative paths, small test-backed tasks, and review checkpoints;
- verify `Yehia-Alsaeed <yehias3eed11@gmail.com>` before every commit;
- never add `Co-Authored-By`, AI attribution, credentials, PII, synthetic inbox contents, or browser artifacts to git;
- open a draft PR only after Checkpoint 4 passes;
- stop before merge, Production deployment, Production database mutation, provider configuration changes, or release tagging.

Yehia retains authority for Preview credentials, manual admin authentication, Vercel protection bypass values, provider-console changes, PR merge, and Production promotion.

## 11. Primary References

- [Next.js 16 metadata and Open Graph images](https://nextjs.org/docs/app/getting-started/metadata-and-og-images)
- [Next.js metadata file conventions](https://nextjs.org/docs/app/api-reference/file-conventions/metadata)
- [Next.js response headers](https://nextjs.org/docs/app/api-reference/config/next-config-js/headers)
- [Next.js Content Security Policy](https://nextjs.org/docs/app/guides/content-security-policy)
- [Next.js data security](https://nextjs.org/docs/app/guides/data-security)
- [WCAG 2.2 Recommendation](https://www.w3.org/TR/WCAG22/)
- [WCAG 2.2 techniques](https://www.w3.org/WAI/WCAG22/Techniques/)
- [OWASP Secure Headers Project](https://owasp.org/www-project-secure-headers/)
- [OWASP Content Security Policy Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)
