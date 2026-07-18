# Phase 3 Recruiter-First Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Executor:** Codex. Codex must not implement Phase 3 until Yehia reviews and explicitly approves this plan.

**Goal:** Replace the Phase 2 identity frame with the complete recruiter-first homepage, preserve a clear one-action path to freelance services, and add the approved living-poster interactions without pulling Phase 4+ work forward.

**Architecture:** Keep all homepage content in typed repository modules and render the page as a Server Component composed from focused home-section components. Limit client JavaScript to contact mailto fallback, keyboard commands, Poster Mode, progressive page transitions, and the removable scroll experiment; keep visual entrance motion and material modes in CSS.

**Tech Stack:** Existing Next.js 16.2.10, React 19.2.7, strict TypeScript 6.0.3, Tailwind CSS 4.3.3, Radix Dialog, cmdk, Lucide, Vitest, Testing Library, Playwright, axe, Lighthouse, and Vercel. Add no dependency in Phase 3.

## Sources Of Truth

1. `prd.md` sections 3.1, 5.1, 5.6, and 5.8 define homepage purpose, order, and interactions.
2. `handoff.md` sections 1, 2, 4, 5, and the visual/cosmetic interaction history define approved copy and rejected ideas.
3. `mockups/demo/index.html`, `mockups/demo/style.css`, and `mockups/demo/qa/home-no-preview-{1440,390}.png` define the approved visual reference.
4. `docs/implementation/phase-2-report.md` and the merged implementation define the real reusable foundation.
5. This plan controls Phase 3 scope and execution order.

## Lean Execution Policy

- Do not create a unit test for every presentational component or repeat the six-width/mode matrix in multiple files.
- Use one content-contract test, one pure-interaction test file, two homepage E2E files, the existing shared responsive/axe suites, and the existing Lighthouse gate.
- Run targeted tests while developing each task. Run the complete quality suite once after implementation and once against the Vercel preview.
- Do not create snapshot tests for static JSX, duplicated accessibility tests already covered by axe, or tests for Tailwind class strings.
- Visual QA remains mandatory because this phase is frontend-heavy: inspect 390, 768, 1440, and 1920 screenshots in all three modes.
- Security/backend/database tests are not removed; those systems are simply outside Phase 3 and remain required in their owning phases.

## Global Constraints

- At execution time, update `main`, create an isolated `phase-3-homepage` worktree, and leave `D:\portfolio website\.claude\` untouched and untracked.
- Preserve Vercel Hobby deployment and the existing Phase 2 dependency versions.
- Do not copy the static demo wholesale. Rebuild from typed data and existing production primitives.
- Do not implement GitHub API data, case-study routes, Cloudinary, Neon, Drizzle, Resend, analytics, authentication, or admin UI.
- Do not add project-preview imagery beside homepage rows; the rejected hover-preview feature must remain absent.
- Do not add a photo, separate About page, pricing, testimonials, blog, chatbot, booking, WhatsApp, newsletter, CMS, or other rejected features.
- Homepage order is fixed: monogram, positioning/actions, evidence stats, flagship work, experience/education/skills, services teaser, contact, global footer.
- The opening hierarchy is AI/ML recruiter-first. Shopify and full-stack services remain prominent through the secondary audience action and services section, not as a competing headline identity.
- All visible claims must come from the PRD, handoff, CV register, or repository inventory. No fabricated outcome, client name, testimonial, or metric.
- The five flagship rows link to their real GitHub repositories until Phase 4 creates case-study routes. No row may lead to a knowingly missing page.
- The contact form uses a real, dependency-free prefilled-email fallback. It must not pretend that database persistence exists; Phase 6 will add persistence while retaining email as graceful fallback.
- The homepage remains statically renderable. Server Components are the default.
- New `"use client"` boundaries are allowed only for contact mailto behavior, Poster Mode, page transitions, and scroll progress. Extend the existing display-mode/palette clients rather than duplicating state.
- The kinetic monogram finishes in approximately one second, never blocks content, uses CSS transforms/opacity only, and becomes static under reduced motion.
- Paper/Night/Mono keep identical layout. Material textures are static, subtle, low-contrast, and never applied over readable foreground text.
- Print-registration transitions last 400-650ms, preserve modified clicks, external links, downloads, hash navigation, browser history, and reduced-motion instant navigation.
- Scroll-responsive rules remain one disposable progress-line experiment, off by default, enabled only by `?scrollRules=1`, and removable by deleting one feature folder plus one layout render.
- Poster Mode uses exactly two authored layouts, real homepage data, no unrestricted randomness, no print/export, and restores focus/scroll when closed.
- `N` cycles Paper -> Night -> Mono -> Paper, but never fires while focus is in an input, textarea, select, contenteditable element, or while Ctrl/Meta/Alt is held.
- Command palette adds section navigation, copy-email, CV download, and Poster Mode without regressing Phase 2 filtering, focus restoration, or lazy loading.
- Every interactive control is keyboard accessible, visibly focused, semantically labelled, and touch-safe.
- Required widths remain 360, 390, 768, 1024, 1440, and 1920 CSS pixels with no overflow, overlap, clipping, or unreadably dense text.
- Preserve the approved full-width ruled rows and open sections. Do not add gradients, blobs, nested cards, oversized radii, generic icon decorations, or marketing-style feature-card grids.
- Keep the production homepage indexable. Do not add launch banners, under-construction copy, or `noindex`.
- Homepage metadata must retain a factual title/description and add a canonical `/`. Dynamic OG, sitemap, robots, and JSON-LD remain Phase 8.
- Preserve Lighthouse thresholds currently enforced in `lighthouserc.cjs`, including the approved 2900ms LCP ceiling; do not relax any threshold in this phase.
- An unexplained initial-route JavaScript increase greater than 10% blocks completion. Poster/palette code must remain lazy until invoked.
- Stop after a draft PR and verified Vercel preview. Do not merge or mark ready until Yehia reviews the implemented homepage.

## File Map

| Responsibility | Files |
|---|---|
| Typed facts | `src/content/profile.ts`, `src/content/homepage.ts` |
| Static homepage | `src/app/page.tsx`, `src/features/home/*.tsx`, `src/features/home/home.module.css` |
| Material assets | `public/textures/paper-fiber.webp`, `public/textures/mono-halftone.webp`, `src/app/globals.css` |
| Contact fallback | `src/features/contact/mailto.ts`, `src/features/contact/contact-form.tsx` |
| Keyboard/actions | `src/lib/keyboard.ts`, existing display-mode and command-palette files |
| Poster Mode | `src/features/poster-mode/poster-mode-provider.tsx`, `poster-mode-dialog.tsx` |
| Route transition | `src/features/page-transition/page-transition.tsx` |
| Disposable experiment | `src/features/scroll-rules/{config,scroll-progress}.ts(x)` |
| Focused tests | `tests/unit/phase-3-content.test.ts`, `phase-3-interactions.test.ts`, `tests/e2e/homepage.spec.ts`, `homepage-interactions.spec.ts`, existing responsive/axe suites |
| Evidence | `docs/implementation/phase-3-report.md`, `phase-3-{build,lighthouse}-baseline.json` |

---

### Task 1: Add reviewed typed content and the complete static homepage

**Files:**
- Create: `src/content/profile.ts`
- Create: `src/content/homepage.ts`
- Create: `src/features/home/monogram-hero.tsx`
- Create: `src/features/home/positioning-section.tsx`
- Create: `src/features/home/evidence-stats.tsx`
- Create: `src/features/home/featured-work.tsx`
- Create: `src/features/home/experience-section.tsx`
- Create: `src/features/home/services-teaser.tsx`
- Create: `src/features/home/contact-section.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/components/ui/project-row.tsx`
- Replace: `tests/unit/foundation-page.test.tsx` with `tests/unit/phase-3-content.test.ts`

**Interfaces:**

```ts
export type Profile = {
  name: string;
  email: string;
  location: string;
  role: string;
  status: string;
  githubUrl: string;
  linkedinUrl: string;
  cvUrl: string;
};

export type HomeStat = { value: string; label: string; detail?: string };
export type FeaturedProject = {
  index: string;
  name: string;
  category: string;
  year: string;
  href: `https://github.com/${string}`;
};
export type TimelineEntry = { period: string; title: string; meta: string; summary: string };
export type SkillGroup = { label: string; skills: readonly string[] };
export type ServiceTeaser = { index: string; label: string; title: string; summary: string; capabilities: readonly string[] };
```

- [ ] **Step 1: Create one focused failing content-contract test**

The test must assert the profile email/URLs, fixed homepage section order, exactly four approved stats, exactly five unique flagships with HTTPS GitHub links, three timeline entries, three skill groups, two service teasers, and absence of empty or invented values. It replaces the obsolete Phase 1 foundation-page test rather than adding parallel coverage.

Run: `pnpm vitest run tests/unit/phase-3-content.test.ts`

Expected: FAIL because the typed content modules do not exist.

- [ ] **Step 2: Implement the reviewed content modules**

Use the approved facts exactly:

- Positioning: `Yehia Alsaeed fine-tunes language models, trains vision systems, and ships full-stack and Shopify products end-to-end.` Supporting line: `CS (AI) graduate - British University in Egypt, 2026.`
- Actions: `View AI/ML work` -> `#work`; `Explore client services` -> `/services`.
- Stats: `17 / Projects on GitHub`; `0.93 / mIoU / HRNet segmentation`; `+0.66 / Exact match / Llama QLoRA`; `1+ yr / Freelance / Shopify + web`.
- Flagships and Phase 3 destinations: SkillBridge AI Interviewer -> `https://github.com/Yehia-Alsaeed/skillbridge-ai-interviewer`; Llama QLoRA Education QA -> `https://github.com/Yehia-Alsaeed/llama-qlora-education-qa`; AI Study Planner Agents -> `https://github.com/Yehia-Alsaeed/ai-study-planner-agents`; Oxford Pet Segmentation -> `https://github.com/Yehia-Alsaeed/oxford-pet-binary-segmentation`; Prestige Motors Showroom -> `https://github.com/Yehia-Alsaeed/prestige-motors-showroom`.
- Timeline: Dell Technologies Summer Academy (`Aug-Sep 2025`, `160+ hours`), Freelance Web Developer (`2025-2026`), and BSc (Hons) Informatics and Computer Science at the British University in Egypt (`Graduated 2026`, AI major).
- Skills: Languages (`Python`, `C++`, `Java`, `C#`, `TypeScript/JavaScript`, `SQL`); AI/ML (`PyTorch`, `LLM fine-tuning (QLoRA, PEFT)`, `CrewAI`, `Hugging Face`, `OpenAI APIs`, `computer vision`, `NLP`, `scikit-learn`); Web and tools (`React`, `Node.js`, `FastAPI`, `Express`, `MongoDB`, `REST APIs`, `Shopify/Liquid`, `Git`).
- Services: `Shopify, built to convert.` with `Custom themes and sections`, `Speed and SEO optimization`, `Launch to first sale`; and `Full-stack, end to end.` with `React/Node/MongoDB`, `LLM and CV integrations`, `Admin panels and auth`. Show no pricing.

Use `as const satisfies` so content remains immutable and type-checked. Do not create a CMS-shaped abstraction.

- [ ] **Step 3: Compose the semantic Server Component homepage**

`src/app/page.tsx` must export route metadata with canonical `/`, compose the eight sections in the fixed order, and contain one meaningful `h1` with accessible name `Yehia Alsaeed`. The giant monogram is the visible `h1`; the positioning statement remains a prominent paragraph.

Reuse `MetadataRow`, `StatCell`, `ProjectRow`, `RuledSection`, `Button`, and `ModeSwitcher`. Extend `ProjectRowProps.href` to the union of Next `Route` and the TypeScript template-literal type for `https://${string}`. Render an HTTPS destination as an `<a target="_blank" rel="noopener noreferrer">` while local routes retain Next `Link`.

Each section owns an id used by navigation: `work`, `experience`, `services`, and `contact`. Do not duplicate the global footer.

- [ ] **Step 4: Verify and commit the static content slice**

Run:

```powershell
pnpm vitest run tests/unit/phase-3-content.test.ts
pnpm lint
pnpm typecheck
git diff --check
git add src/content src/features/home src/app/page.tsx src/components/ui/project-row.tsx tests/unit/phase-3-content.test.ts tests/unit/foundation-page.test.tsx
git commit -m "feat: build recruiter-first homepage content"
```

Expected: the content contract passes, the homepage is statically renderable, and no Phase 4 route is required.

---

### Task 2: Match the approved responsive composition and material modes

**Files:**
- Create: `src/features/home/home.module.css`
- Create: `public/textures/paper-fiber.webp`
- Create: `public/textures/mono-halftone.webp`
- Modify: `src/app/globals.css`
- Modify: Task 1 home components only where class composition requires it

**Interfaces:** CSS Modules style homepage anatomy; global selectors style mode-specific page material.

- [ ] **Step 1: Implement the approved 1440px composition, then responsive layouts**

Match `home-no-preview-1440.png` for the frame, monogram proportions, metadata density, statement width, four-cell stats, full-width rows, timeline, services split, contact typography, and rule rhythm. Then deliberately adapt:

- 1024/768: retain readable two-column grids where they fit; collapse timeline details without compressing text.
- 390/360: compact monogram, two-column metadata/stats, three-column project rows reduced to index/name/arrow, stacked timeline/skills/services, wrapped email with no overflow.
- 1920: retain the 1360px frame rather than stretching content.

Use stable grid tracks, `clamp()` with rem endpoints, and `overflow-wrap:anywhere` only on the email. Keep cards square and ruled.

- [ ] **Step 2: Add the kinetic monogram with CSS-only progressive enhancement**

Render separate Y, A, and period spans. Animate Y and A into their final grid positions and stamp the period last; total sequence is 900-1100ms. Use transform/opacity only. Do not add pointer tracking, hero compression, or scroll listeners in v1 of the effect.

Under `prefers-reduced-motion: reduce`, remove animation and render the final mark immediately. Content below the hero must occupy its final layout from first paint so animation cannot create CLS.

- [ ] **Step 3: Create and apply lightweight material assets**

During execution, use the image generation skill to create two seamless, low-contrast square bitmap textures:

- Paper: warm off-white natural fiber with no stains, edges, objects, text, or lighting gradient.
- Mono: neutral black-on-transparent fine halftone/photocopy grain with no imagery or large dots.

Optimize each to a 256x256 WebP under 20KB. Apply them as low-opacity body background images rather than foreground overlays. Paper opacity must remain visually equivalent to <=0.06, Mono <=0.08, and Night uses no bitmap texture. Confirm computed text contrast remains unchanged.

- [ ] **Step 4: Perform visual inspection and commit**

Capture `/` at 390x844 and 1440x1000 in Paper/Night/Mono. Compare against both approved screenshots, correct visible drift, then run:

```powershell
pnpm lint
pnpm typecheck
pnpm build
git diff --check
git add src/features/home src/app/globals.css public/textures
git commit -m "feat: add responsive homepage art direction"
```

Expected: the page matches the approved visual language at desktop/mobile and materials do not reduce readability.

---

### Task 3: Complete contact, keyboard commands, and Poster Mode

**Files:**
- Create: `src/lib/keyboard.ts`
- Create: `src/features/contact/mailto.ts`
- Create: `src/features/contact/contact-form.tsx`
- Create: `src/features/poster-mode/poster-mode-provider.tsx`
- Create: `src/features/poster-mode/poster-mode-dialog.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/features/home/contact-section.tsx`
- Modify: `src/features/display-mode/provider.tsx`
- Modify: `src/features/command-palette/commands.ts`
- Modify: `src/features/command-palette/command-palette-panel.tsx`
- Modify: `src/features/command-palette/command-palette.tsx` only if shared status output belongs there
- Create: `tests/unit/phase-3-interactions.test.ts`

**Interfaces:**

```ts
export function isEditableTarget(target: EventTarget | null): boolean;
export function shouldCycleDisplayMode(event: Pick<KeyboardEvent, "key" | "altKey" | "ctrlKey" | "metaKey" | "target">): boolean;
export type ContactDraft = { inquiryType: string; name: string; email: string; message: string };
export function buildContactMailto(draft: ContactDraft): `mailto:${string}`;
export type PosterTemplate = "index" | "metric";
export function nextPosterTemplate(template: PosterTemplate): PosterTemplate;
export type PosterModeContextValue = { openPoster: () => void; closePoster: () => void };
```

- [ ] **Step 1: Add one focused failing pure-behavior test file**

Cover only regression-prone logic: editable-target detection, `N` eligibility with modifiers, safe percent-encoding of all contact fields, the fixed recipient, deterministic mode cycle, and the two-value Poster template cycle.

Run: `pnpm vitest run tests/unit/phase-3-interactions.test.ts`

Expected: FAIL until the shared helpers exist.

- [ ] **Step 2: Implement the real contact fallback**

Render native labelled fields for inquiry type (`Job opportunity`, `Freelance project`, `Collaboration`, `Other`), name, email, and message. Use `required`; `type="email"`; autocomplete `name` and `email`; maxlength 100 for name, 254 for email, and 5000 for message. Invalid submission renders a `role="alert"` summary and focuses it without clearing entered values.

On valid submit, generate a prefilled `mailto:yehias3eed11@gmail.com` URL with subject `Portfolio inquiry: <type> - <name>` and a body containing reply email and message. Navigate to it without storing or logging the submitted fields. Visible supporting copy says `Opens your email app. Direct email is always available above.` This remains a useful fallback after Phase 6 adds database persistence.

- [ ] **Step 3: Add `N`, copy-email, CV, and section commands**

Move editable-target detection out of the palette into `src/lib/keyboard.ts` and reuse it. Extend the display provider with one keydown listener for unmodified `N`; do not add a second mode state.

Extend `PaletteCommand` with typed `copy-email`, `download-cv`, and `poster-mode` actions plus navigation to `/#work`, `/#experience`, `/#services`, and `/#contact`. Clipboard failure reports the address through a concise `aria-live` result and navigates to the visible contact email. CV download uses a same-origin temporary anchor with `download` and announces `CV download started`; analytics remains Phase 6.

- [ ] **Step 4: Implement Poster Mode as a lazy accessible dialog**

Wrap `SiteShell` with `PosterModeProvider` inside the existing display provider. The command panel calls `openPoster()` for the Poster action. Lazy-load `poster-mode-dialog.tsx` only when first opened.

The dialog uses existing Radix primitives and real profile/homepage data. Template `index` emphasizes YA/name/role/location; template `metric` emphasizes YA plus the real `0.93 mIoU` and `17 projects` values. A `Remix poster` button alternates the two authored templates; `Close poster` and Escape exit. Opening/closing must not reset page scroll or display mode. Reduced motion removes entrance/exit animation.

- [ ] **Step 5: Verify and commit the interaction slice**

Run:

```powershell
pnpm vitest run tests/unit/phase-3-interactions.test.ts tests/unit/phase-2-command-palette.test.tsx tests/unit/phase-2-display-mode.test.tsx
pnpm lint
pnpm typecheck
git diff --check
git add src/lib/keyboard.ts src/features/contact src/features/poster-mode src/features/display-mode src/features/command-palette src/features/home/contact-section.tsx src/app/layout.tsx tests/unit/phase-3-interactions.test.ts
git commit -m "feat: add homepage actions and poster mode"
```

Expected: existing palette/mode tests still pass and no contact data leaves the browser except through the visitor-selected email client.

---

### Task 4: Add progressive route motion and the removable scroll experiment

**Files:**
- Create: `src/features/page-transition/page-transition.tsx`
- Create: `src/features/scroll-rules/config.ts`
- Create: `src/features/scroll-rules/scroll-progress.tsx`
- Modify: `src/components/layout/site-shell.tsx`
- Modify: `src/app/globals.css`
- Create: `tests/e2e/homepage-interactions.spec.ts`

**Interfaces:**

```ts
export const SCROLL_RULES_QUERY = "scrollRules";
export function PageTransition(): React.ReactNode;
export function ScrollProgress(): React.ReactNode;
```

- [ ] **Step 1: Implement a non-blocking print-registration transition**

Use one client component rendered by `SiteShell`. Intercept only unmodified same-origin left-click navigation without `download`, `target`, or same-page hash. Immediately show a fixed electric-blue plate/rule animation and call `router.push()` after 420ms. At 650ms, if the destination pathname was not reached, clear the layer and use `window.location.assign()` as the navigation fail-safe.

With reduced motion, do not prevent default navigation. Do not animate browser back/forward, external GitHub links, CV, contact hashes, or command actions. Phase 4 may add project-title carry-over after case-study routes exist; do not fake it now.

- [ ] **Step 2: Implement one isolated scroll experiment**

`ScrollProgress` renders nothing unless the current URL has `?scrollRules=1`. When enabled, show only a 2px electric-blue reading-progress line fixed at the top. Update a CSS transform through one passive scroll listener scheduled with `requestAnimationFrame`; clean up both listener and frame.

Hide it under reduced motion. It cannot modify section classes, spacing, document flow, or content. Default `/` must contain no progress element. Removal must require deleting `src/features/scroll-rules/` and one `<ScrollProgress />` render only.

- [ ] **Step 3: Add focused browser coverage and commit**

Add transition and experiment cases to `tests/e2e/homepage-interactions.spec.ts`: normal navigation reaches `/services`, browser Back returns home, modified/external/hash clicks are not delayed, reduced motion navigates instantly, default home has no progress line, and `/?scrollRules=1` updates the line after scrolling.

Run:

```powershell
pnpm playwright test tests/e2e/homepage-interactions.spec.ts
pnpm lint
pnpm typecheck
git diff --check
git add src/features/page-transition src/features/scroll-rules src/components/layout/site-shell.tsx src/app/globals.css tests/e2e/homepage-interactions.spec.ts
git commit -m "feat: add progressive homepage motion"
```

Expected: navigation remains correct with and without enhancement, and the scroll experiment is absent by default.

---

### Task 5: Consolidate homepage acceptance, performance evidence, and preview review

**Files:**
- Create: `tests/e2e/homepage.spec.ts`
- Complete: `tests/e2e/homepage-interactions.spec.ts`
- Modify: `tests/e2e/responsive.spec.ts`
- Modify: `tests/e2e/accessibility.spec.ts` only if route discovery is hard-coded
- Modify: `scripts/measure-build.ts`
- Modify: `scripts/measure-lighthouse.ts`
- Create: `docs/implementation/phase-3-build-baseline.json`
- Create: `docs/implementation/phase-3-lighthouse-baseline.json`
- Create: `docs/implementation/phase-3-report.md`

**Interfaces:** Produces the only full Phase 3 regression gate and preview evidence.

- [ ] **Step 1: Complete the two E2E journeys without duplicating Phase 2 coverage**

`homepage.spec.ts` covers:

- HTTP 200, production title/description/canonical, one `h1`, and fixed section order;
- primary CTA reaches `#work`; secondary CTA reaches `/services`;
- five flagship rows expose correct names and HTTPS destinations;
- experience, skills, two service offers, email, form labels, and footer links are visible;
- contact invalid state is accessible; exact mailto encoding remains owned by the pure interaction test;
- no console/page errors or rejected project-preview panel.

`homepage-interactions.spec.ts` covers:

- kinetic monogram final state and static reduced-motion state;
- `N` cycles modes and is ignored while typing;
- command palette section navigation, email action, CV action, and lazy Poster Mode;
- two Poster templates, Escape/focus restoration, and preserved scroll;
- Task 4 transition and scroll-experiment behavior.

Do not reproduce generic palette filtering, generic mode persistence, or all-route shell tests already owned by Phase 2.

- [ ] **Step 2: Reuse the existing responsive and axe matrices efficiently**

Keep the existing six-width overflow test for `/`. Add section visibility and email wrapping assertions there rather than creating another viewport loop. Add Paper/Night/Mono visual containment checks only at 390 and 1440 because Phase 2 already proved mode mechanics at every width.

The existing accessibility suite must continue running axe against `/` in all three modes. Add no duplicate homepage-only axe file.

- [ ] **Step 3: Capture and inspect the required visual matrix**

Capture full-page `/` screenshots at 390x844, 768x1024, 1440x1000, and 1920x1080 in Paper/Night/Mono, plus Poster Mode at 390 and 1440. Inspect against `home-no-preview-390.png`, `home-no-preview-1440.png`, and `reference-monogram-1440.png`.

Record at least: first viewport balance, next-section hint, monogram proportions, statement hierarchy, row density, timeline collapse, services order, contact wrapping, material subtlety, Night contrast, Mono treatment, and Poster readability. Fix all material mismatch before preview.

- [ ] **Step 4: Run the single complete local gate and record Phase 3 baselines**

Update only the measurement output filenames from `phase-2-*` to `phase-3-*`; preserve Phase 1/2 JSON files. Then run once:

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
git status --short
```

Expected: all gates pass, Lighthouse keeps the existing thresholds, and new Phase 3 JSON files contain real values.

- [ ] **Step 5: Commit quality evidence, open a draft PR, and verify Vercel**

```powershell
git add tests/e2e tests/unit scripts/measure-build.ts scripts/measure-lighthouse.ts docs/implementation/phase-3-build-baseline.json docs/implementation/phase-3-lighthouse-baseline.json
git commit -m "test: verify phase three homepage"
git push -u origin phase-3-homepage
gh pr create --draft --base main --head phase-3-homepage --title "Phase 3: recruiter-first homepage" --body "Builds the approved dual-audience homepage and living-poster interactions. Phase 4+ data and case-study work remain out of scope."
gh pr checks --watch
```

Create an explicit Vercel preview, set `PLAYWRIGHT_BASE_URL` to the returned URL, run the complete Playwright suite against it, and inspect the deployment until it is READY.

- [ ] **Step 6: Write the concise report and stop for review**

`docs/implementation/phase-3-report.md` must contain only:

- scope delivered and deferred;
- actual PR and Vercel links;
- unit/E2E counts and accessibility result;
- six-width result and the visual comparison ledger;
- Lighthouse scores/LCP/CLS and build delta from Phase 2;
- confirmation that Poster/palette chunks load lazily;
- the exact `?scrollRules=1` review URL and a reminder that the experiment is off by default;
- any real remaining warning.

Commit the report, push, wait for green checks, and report the final SHA. Stop. Do not mark the PR ready, merge, delete the branch, or remove the worktree until Yehia approves the preview and explicitly decides whether to keep or delete the scroll experiment.

---

## Phase 3 Completion Gate

Phase 3 is ready for user review when the real homepage is complete in the approved order, both audiences have a one-action path, all claims are traceable, contact has a truthful functional fallback, the four approved visual interactions work with reduced-motion fallbacks, the optional scroll line is off by default and independently removable, the focused test suite and existing shared gates pass, Lighthouse remains within budget, and a READY Vercel preview has been visually inspected.

## Final Scope Audit

Before handoff, inspect these commands rather than adding more tests:

```powershell
rg -n "use client" src
rg -n "under construction|coming soon|lorem|testimonial|price|pricing" src/app/page.tsx src/features/home src/content
rg -n "drizzle|neon|cloudinary|resend|recharts|react-flow|@xyflow" package.json src
git ls-files .env .env.local .vercel .next .lighthouseci .tmp .claude
git diff main...HEAD --stat
git log --oneline main..HEAD
```

Expected: client boundaries match this plan, rejected/fabricated copy is absent, Phase 4+ providers are absent, ignored files are untracked, and the diff contains only Phase 3 homepage work and evidence.
