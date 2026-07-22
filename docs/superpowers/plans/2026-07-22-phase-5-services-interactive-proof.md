# Phase 5 Services and Interactive Proof Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Executor:** Claude Code. Do not implement until Yehia explicitly asks you to execute this plan.

**Goal:** Finish the client-services journey and add evidence-backed, progressively enhanced proof modules to all five flagship case studies.

**Architecture:** Keep routes and factual fallbacks server-rendered from typed repository content. Add small client islands only for media switching, on-demand Architecture X-Ray, Oxford model selection, and deterministic Study Planner replay. Store approved client captures locally; add no Phase 6 backend.

**Tech Stack:** Existing Next.js 16.2.10, React 19.2.7, TypeScript 6.0.3, Tailwind CSS 4.3.3, Vitest, Testing Library, Playwright, axe, Lighthouse, and Vercel. Add only `@xyflow/react@12.11.2`.

## Global Constraints

- Read `docs/superpowers/specs/2026-07-22-phase-5-services-interactive-proof-design.md` before editing; it is authoritative.
- Use `superpowers:using-git-worktrees` to create an isolated `phase-5-services-interactive-proof` worktree from updated `main`.
- Run package commands through `corepack pnpm`; the repository requires pnpm `>=11.13.1 <12`.
- Leave the user's `.claude/` and the brainstorming `.superpowers/` directory untouched and untracked.
- Claude Code may open and capture only `https://www.madarwears.com/` and `https://la-glosse.com/`.
- Do not open, capture, authenticate to, inspect, or modify Nexo (`https://bh9d1w-16.myshopify.com/`). Use only its approved name and URL in typed content.
- Shopify entries use screenshots/recordings and external links only: no iframe, Storefront API, product feed, Shopify token, reverse proxy, or arbitrary viewport scrubber.
- Do not claim conversions, revenue, traffic, response times, availability dates, or other unapproved outcomes.
- Keep `/services` and all static proof meaningful without JavaScript. Interactive modules enhance; they never replace factual fallback content.
- Do not add Neon, Drizzle, Resend, analytics, contact persistence, auth, admin UI, CMS, pricing, or live AI/model inference.
- No new code or dependency may enter the homepage client bundle because of Phase 5.
- Do not merge to `main` or promote a production deployment without Yehia's explicit approval.

---

### Task 1: Typed Services Content and Finished Route

**Files:**
- Create: `src/content/services.ts`
- Create: `src/features/services/services-page.tsx`
- Create: `src/features/services/offer-grid.tsx`
- Create: `src/features/services/process-section.tsx`
- Create: `src/features/services/testimonials.tsx`
- Modify: `src/app/services/page.tsx`
- Create: `tests/unit/phase-5-services-content.test.ts`

**Interfaces:**
- Produces `SERVICE_OFFERS`, `SERVICE_PROCESS`, `CLIENT_WORK`, `TESTIMONIALS`, and their exported readonly types.
- `Testimonials` returns `null` when `TESTIMONIALS.length === 0`; no reserved box appears in the DOM.

- [ ] **Step 1: Write the failing content contract test**

Assert these exact invariants in `tests/unit/phase-5-services-content.test.ts`:

```ts
expect(SERVICE_OFFERS.map(({ title }) => title)).toEqual([
  "Shopify stores, brief to first sale.",
  "Full-stack products, end to end.",
]);
expect(SERVICE_PROCESS.map(({ title }) => title)).toEqual([
  "Discovery",
  "Build",
  "Verification",
  "Launch and handover",
]);
expect(CLIENT_WORK.map(({ name }) => name)).toEqual(["Madar Wears", "La Glosse", "Nexo"]);
expect(CLIENT_WORK.filter(({ presentation }) => presentation === "captured")).toHaveLength(2);
expect(CLIENT_WORK.find(({ name }) => name === "Nexo")?.presentation).toBe("text-only");
expect(TESTIMONIALS).toEqual([]);
```

Also assert the source contains no six-slot placeholders, price/package copy, `Q3 2026`, `<iframe`, Shopify token, or fabricated result fields.

- [ ] **Step 2: Run the test and confirm the missing module failure**

Run: `corepack pnpm test tests/unit/phase-5-services-content.test.ts`

Expected: FAIL because `@/content/services` does not exist.

- [ ] **Step 3: Implement the typed content and Server Component composition**

Use these discriminated interfaces:

```ts
export type ServiceOffer = {
  index: "01" | "02";
  label: string;
  title: string;
  summary: string;
  capabilities: readonly string[];
};

export type ProcessStep = {
  index: "01" | "02" | "03" | "04";
  title: "Discovery" | "Build" | "Verification" | "Launch and handover";
  summary: string;
};

type ClientWorkBase = {
  name: "Madar Wears" | "La Glosse" | "Nexo";
  kind: "Shopify storefront";
  contribution: string;
  url: `https://${string}`;
};

export type ClientWork = ClientWorkBase &
  (
    | { presentation: "captured"; mediaKey: "madar-wears" | "la-glosse" }
    | { presentation: "text-only" }
  );

export type Testimonial = { quote: string; attribution: string };
```

Use `as const satisfies` for every collection. Copy the approved offer facts from `SERVICE_TEASERS` and the reviewed static services mockup, but replace its stale or unapproved claims. Use these process meanings:

- Discovery: establish audience, scope, constraints, budget range, deadline, and definition of done.
- Build: deliver visible increments through a staging environment.
- Verification: test critical journeys, responsive behavior, accessibility, performance, and failure states.
- Launch and handover: deploy, complete final QA, and hand over documentation and access.

`ServicesPage` renders one `h1`, the exact availability text `Available for select freelance projects.`, the two offers, four steps, client-work section, `<Testimonials items={TESTIMONIALS} />`, and inquiry actions to `/#contact` and `mailto:yehias3eed11@gmail.com`. Keep truthful canonical `/services` metadata in `src/app/services/page.tsx`. The empty testimonials collection must produce no wrapper or visible text.

- [ ] **Step 4: Pass the focused test and quality checks**

Run:

```powershell
corepack pnpm test tests/unit/phase-5-services-content.test.ts
corepack pnpm typecheck
```

Expected: both PASS.

- [ ] **Step 5: Commit the static services slice**

```powershell
git add src/content/services.ts src/features/services src/app/services/page.tsx tests/unit/phase-5-services-content.test.ts
git commit -m "feat: publish typed services page"
```

---

### Task 2: Approved Shopify Captures and Client-Work Presentation

**Files:**
- Create: `scripts/capture-client-work.ts`
- Create: `src/assets/client-work/madar-wears-desktop.jpg`
- Create: `src/assets/client-work/madar-wears-mobile.jpg`
- Create: `src/assets/client-work/la-glosse-desktop.jpg`
- Create: `src/assets/client-work/la-glosse-mobile.jpg`
- Create: `public/media/client-work/madar-wears.webm`
- Create: `public/media/client-work/la-glosse.webm`
- Create: `src/features/services/client-work-grid.tsx`
- Create: `src/features/services/client-work-media.tsx`
- Modify: `src/content/services.ts`
- Modify: `src/features/services/services-page.tsx`
- Create: `tests/unit/phase-5-client-work.test.tsx`

**Interfaces:**
- `CLIENT_WORK_MEDIA` maps only `madar-wears` and `la-glosse` to statically imported desktop/mobile images, poster image, and local WebM path.
- `ClientWorkMedia` receives `{ name, media }`; it never accepts an arbitrary remote URL.

```ts
export type ClientWorkMediaSet = {
  desktop: { src: StaticImageData; alt: string };
  mobile: { src: StaticImageData; alt: string };
  recording: { src: `/media/client-work/${string}.webm`; description: string };
};
```

- [ ] **Step 1: Write failing rendering and interaction tests**

Cover:

```ts
expect(screen.getAllByRole("article")).toHaveLength(3);
expect(screen.getByRole("link", { name: /Open Madar Wears/ })).toHaveAttribute(
  "rel",
  "noopener noreferrer",
);
expect(screen.getByRole("link", { name: /Open La Glosse/ })).toBeVisible();
expect(screen.getByRole("link", { name: /Open Nexo/ })).toBeVisible();
expect(screen.queryByTitle(/Nexo/i)).not.toBeInTheDocument();
expect(container.querySelector("iframe")).toBeNull();
expect(container.querySelector("video[autoplay]")).toBeNull();
```

For Madar, click the labelled Mobile and Desktop controls and assert `aria-pressed` and the visible image alt text change. Assert the recording has `controls`, `muted`, `playsInline`, `preload="metadata"`, a poster, and adjacent descriptive text.

- [ ] **Step 2: Run the test and confirm it fails**

Run: `corepack pnpm test tests/unit/phase-5-client-work.test.tsx`

Expected: FAIL because the client-work components and media map do not exist.

- [ ] **Step 3: Build an allowlisted capture script and generate media**

The capture script must hard-code only:

```ts
const CAPTURE_TARGETS = [
  { key: "madar-wears", url: "https://www.madarwears.com/" },
  { key: "la-glosse", url: "https://la-glosse.com/" },
] as const;
```

Use Playwright Chromium to capture public homepages at `1440x900` and `390x844` as JPEG quality `82`, plus one muted WebM walkthrough per store. Do not add Nexo to this script. Do not capture account, cart, checkout, consent-detail, or admin pages. Keep recordings short and representative; do not simulate purchases.

Run:

```powershell
corepack pnpm exec playwright install chromium
corepack pnpm tsx scripts/capture-client-work.ts
```

Expected: exactly four JPEGs and two WebMs at the paths above; no other domain is requested. Keep each JPEG at or below 600 KB and each muted WebM at or below 5 MB by shortening the walkthrough or lowering capture quality, without adding another media dependency.

- [ ] **Step 4: Human-review the generated client media before publishing it**

Inspect every capture at original resolution. Confirm it contains no personal/customer data, admin state, credential, intrusive consent overlay, broken resource, or misleading crop. Present the six assets to Yehia and obtain approval before staging them. If approval is withheld, revise only the rejected captures.

- [ ] **Step 5: Implement the progressive media UI**

Render all three entries server-side. Madar and La Glosse receive labelled Desktop/Mobile controls and a separate `Watch short recording` disclosure; Nexo renders contribution text and its external link only. The initial HTML includes a useful desktop screenshot and text description. The video is not mounted until requested, uses no autoplay/audio, and failure leaves the screenshot visible.

Use square ruled styling consistent with the existing page. Do not copy the mockup's fake browser iframe or six placeholder cards.

- [ ] **Step 6: Verify and commit client work**

Run:

```powershell
corepack pnpm test tests/unit/phase-5-client-work.test.tsx
corepack pnpm typecheck
```

Expected: both PASS. Then:

```powershell
git add scripts/capture-client-work.ts src/assets/client-work public/media/client-work src/content/services.ts src/features/services tests/unit/phase-5-client-work.test.tsx
git commit -m "feat: showcase approved Shopify client work"
```

---

### Task 3: Typed Proof Data and No-JavaScript Fallbacks

**Files:**
- Create: `src/content/projects/proof.ts`
- Create: `src/features/case-study/proof/case-study-proof.tsx`
- Create: `src/features/case-study/proof/architecture-static.tsx`
- Modify: `src/features/case-study/case-study-page.tsx`
- Create: `tests/unit/phase-5-proof-data.test.ts`

**Interfaces:**

```ts
export type ProofNode = {
  id: string;
  label: string;
  technology: string;
  responsibility: string;
  input: string;
  output: string;
  position: { x: number; y: number };
};
export type ProofEdge = { id: string; source: string; target: string; label?: string };
export type ArchitectureProof = {
  slug: CaseStudy["slug"];
  title: string;
  nodes: readonly ProofNode[];
  edges: readonly ProofEdge[];
  readingOrder: readonly string[];
};
export function getArchitectureProof(slug: string): ArchitectureProof | undefined;
export function validateArchitectureProof(proof: ArchitectureProof): readonly string[];
```

- [ ] **Step 1: Write the failing proof-integrity tests**

Assert exactly five proofs with the five `CASE_STUDIES` slugs. For each proof assert unique node/edge IDs, every edge endpoint exists, `readingOrder` contains every node exactly once, all text is non-empty, and `validateArchitectureProof(proof)` returns `[]`. Assert the required node labels from the approved design are represented.

- [ ] **Step 2: Confirm the test fails, then implement the typed datasets**

Run: `corepack pnpm test tests/unit/phase-5-proof-data.test.ts`

Expected: FAIL because the proof module does not exist.

Build the five datasets strictly from `src/content/projects/case-studies.ts` and repository evidence already approved in Phase 4. Do not add metrics or architectural claims that are absent from those sources.

- [ ] **Step 3: Render the static proof in every case study**

Within `03 - Architecture and stack`, keep the existing prose and add `CaseStudyProof`. `ArchitectureStatic` renders:

- an ordered list following `readingOrder`, with label, technology, responsibility, input, and output; and
- a compact relationships list derived from `edges`.

This complete HTML remains visible without JavaScript. A missing proof returns `null` without breaking the case study, although the unit invariant prevents that state for the five approved slugs.

- [ ] **Step 4: Verify and commit the static proof layer**

Run:

```powershell
corepack pnpm test tests/unit/phase-5-proof-data.test.ts
corepack pnpm playwright test tests/e2e/case-studies.spec.ts
```

Expected: unit PASS; existing case-study journeys PASS.

```powershell
git add src/content/projects/proof.ts src/features/case-study src/features/case-study/case-study-page.tsx tests/unit/phase-5-proof-data.test.ts
git commit -m "feat: add static architecture proof"
```

---

### Task 4: On-Demand Architecture X-Ray

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Create: `src/features/case-study/proof/architecture-xray-launcher.tsx`
- Create: `src/features/case-study/proof/architecture-xray.tsx`
- Create: `src/features/case-study/proof/architecture-node.tsx`
- Modify: `src/features/case-study/proof/case-study-proof.tsx`
- Create: `tests/unit/phase-5-architecture-interaction.test.tsx`

**Interfaces:**
- `ArchitectureXRayLauncher({ proof })` renders an explicit load button and imports `ArchitectureXRay` only after activation.
- `ArchitectureXRay({ proof })` maps typed proof nodes/edges into React Flow and reports the selected node's full accessible details.

- [ ] **Step 1: Add the single approved dependency**

Run: `corepack pnpm add @xyflow/react@12.11.2`

Expected: only `package.json` and `pnpm-lock.yaml` dependency records change.

- [ ] **Step 2: Write the failing launcher interaction test**

Mock the dynamic canvas and assert:

```ts
expect(screen.queryByRole("region", { name: /Interactive architecture/ })).toBeNull();
await user.click(screen.getByRole("button", { name: /Explore interactive architecture/ }));
expect(await screen.findByRole("region", { name: /Interactive architecture/ })).toBeVisible();
```

Also assert loading/error status is announced without removing the static proof.

- [ ] **Step 3: Implement the lazy canvas and accessible node details**

Call `import("./architecture-xray")` from the launch-button handler, store the resolved component in state, and catch rejection into an announced error state. Configure React Flow as a read-only diagram: no connect/delete mutation, bounded pan/zoom, fit view, labelled controls, keyboard-focusable custom nodes, and no minimap. Selecting a node sets `aria-pressed="true"` and updates an adjacent `aria-live="polite"` detail panel. Reduced motion disables animated edges and traversal.

Import `@xyflow/react/dist/style.css` only from the X-Ray module boundary. The static ordered proof stays above the launcher and never hides.

- [ ] **Step 4: Verify lazy behavior and commit**

Run:

```powershell
corepack pnpm test tests/unit/phase-5-architecture-interaction.test.tsx
corepack pnpm typecheck
```

Expected: both PASS.

```powershell
git add package.json pnpm-lock.yaml src/features/case-study/proof tests/unit/phase-5-architecture-interaction.test.tsx
git commit -m "feat: add on-demand architecture x-ray"
```

---

### Task 5: Oxford Microscope and Study Planner Replay

**Files:**
- Modify: `src/content/projects/proof.ts`
- Create: `src/features/case-study/proof/model-comparison-static.tsx`
- Create: `src/features/case-study/proof/model-microscope.tsx`
- Create: `src/features/case-study/proof/agent-replay-static.tsx`
- Create: `src/features/case-study/proof/agent-run-replay.tsx`
- Modify: `src/features/case-study/proof/case-study-proof.tsx`
- Create: `tests/unit/phase-5-specialized-proof.test.tsx`

**Interfaces:**

```ts
export type ModelComparison = {
  id: "fcn" | "segnet" | "hrnet";
  label: string;
  imagePublicId: "pets-fcn" | "pets-segnet" | "pets-hrnet";
  miou: string;
  inferenceTime: string;
  parameters: string;
  note: string;
};
export type AgentReplayStep = {
  id: "profiler" | "generator" | "critic" | "optimizer";
  label: string;
  instruction: string;
  input: string;
  output: string;
  decision: string;
};
```

- [ ] **Step 1: Ground and test the deterministic datasets**

For Oxford, copy only the fixed values already present in `CASE_STUDIES` and the Phase 4 claim ledger. For Study Planner, retrieve the repository's published sample files at the current `main` SHA and record that SHA in a comment above the replay data; never call an AI API:

```powershell
$studyPlannerSha = gh api repos/Yehia-Alsaeed/ai-study-planner-agents/commits/main --jq '.sha'
gh api -H "Accept: application/vnd.github.raw+json" "repos/Yehia-Alsaeed/ai-study-planner-agents/contents/examples/sample_input.json?ref=$studyPlannerSha"
gh api -H "Accept: application/vnd.github.raw+json" "repos/Yehia-Alsaeed/ai-study-planner-agents/contents/examples/sample_output.md?ref=$studyPlannerSha"
```

Assert three models in FCN/SegNet/HRNet order and four replay steps in Profiler/Generator/Critic/Optimizer order. Assert the HRNet values `0.9306`, `0.0633s`, and `11.44M`, and assert the replay includes the complete four-stage handoff without an API key or timing claim.

Run: `corepack pnpm test tests/unit/phase-5-specialized-proof.test.tsx`

Expected: FAIL before the modules exist.

- [ ] **Step 2: Implement complete static fallbacks**

`ModelComparisonStatic` renders all three approved images and a semantic comparison table. `AgentReplayStatic` renders the complete four-stage ordered transcript. Both remain in the initial HTML and are the source of truth.

- [ ] **Step 3: Add small deterministic enhancements**

`ModelMicroscope` lets the visitor select FCN, SegNet, or HRNet while holding the evaluation frame constant; buttons expose `aria-pressed`. `AgentRunReplay` offers direct stage buttons plus Play/Reset, advances through the four fixed stages, announces progress, and cancels timers on reset/unmount. Reduced motion makes Play advance only on explicit user action rather than timed animation.

Render these enhancements only on their matching slugs. Do not add React Flow, network calls, model execution, or API keys to either module.

- [ ] **Step 4: Verify and commit specialized proof**

Run:

```powershell
corepack pnpm test tests/unit/phase-5-specialized-proof.test.tsx
corepack pnpm typecheck
```

Expected: both PASS.

```powershell
git add src/content/projects/proof.ts src/features/case-study/proof tests/unit/phase-5-specialized-proof.test.tsx
git commit -m "feat: add deterministic technical proof modules"
```

---

### Task 6: Focused Browser Gate, Performance Proof, and Delivery Report

**Files:**
- Create: `tests/e2e/services.spec.ts`
- Create: `tests/e2e/phase-5-proof.spec.ts`
- Modify: `tests/e2e/case-studies.spec.ts`
- Create: `docs/implementation/phase-5-report.md`

**Interfaces:** Browser tests validate public behavior only; the report records commands, results, approved media, known limitations, preview URL, and measured bundle/Lighthouse output.

- [ ] **Step 1: Add focused Phase 5 browser journeys**

Cover:

- `/services`: HTTP 200, metadata/canonical, one `h1`, exact availability, two offers, four process steps, exactly three client articles, captured media only for Madar/La Glosse, text-only Nexo, safe external links, no iframe, no autoplay, and contact CTA.
- Media: keyboard-switch Madar between Desktop/Mobile; open/close the recording; screenshot remains when video is aborted.
- All five case studies: static architecture proof visible; launcher loads the interactive canvas only after activation.
- Oxford: select each model and verify approved metrics/image label.
- Study Planner: select stages, Play, Reset, and verify deterministic progress.
- No JavaScript: services content, both client screenshots, all five static architectures, all Oxford comparisons, and complete Study Planner transcript remain readable.
- Responsive containment: `/services`, SkillBridge X-Ray, Oxford, and Study Planner at 390, 768, and 1440px only.
- Accessibility: axe on `/services`, SkillBridge, Oxford, and Study Planner in the default mode; explicit heading-order and keyboard checks. Existing shared mode tests continue covering unchanged shell modes.

- [ ] **Step 2: Run the focused production browser gate**

```powershell
corepack pnpm build
$env:CI='1'
corepack pnpm playwright test tests/e2e/services.spec.ts tests/e2e/case-studies.spec.ts tests/e2e/phase-5-proof.spec.ts
Remove-Item Env:CI
```

Expected: build PASS and all selected browser tests PASS with zero page/console errors.

- [ ] **Step 3: Run the single complete repository gate and measurements**

```powershell
corepack pnpm format:check
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test
corepack pnpm measure:build
corepack pnpm lighthouse
```

Expected: all PASS against the production build created in Step 2. Compare against `docs/implementation/phase-4-report.md`; investigate any material homepage regression before proceeding. Confirm in a browser network trace that the X-Ray JavaScript request begins only after `Explore interactive architecture` is activated and that the homepage loads no Phase 5 proof chunk.

- [ ] **Step 4: Perform the compact visual and security review**

Inspect `/services` at 390/768/1440 and representative proof routes at 390/1440 in Paper, Night, and Mono only where new content materially changes. Confirm captures remain legible, video controls fit, diagrams do not overflow, selected states remain clear, and reduced motion is respected.

Run:

```powershell
rg -n -i "iframe|storefront api|shopify.*token|password|customer|revenue|conversion|Q3 2026|awaiting client" src tests
git ls-files .env .env.local .vercel .next .claude .superpowers
git diff main...HEAD --check
```

Expected: no forbidden implementation/claim/secret matches in Phase 5 code; no ignored private/generated directory tracked; clean diff check.

- [ ] **Step 5: Write the delivery report and commit**

Record actual results, not expected values, in `docs/implementation/phase-5-report.md`. Include the two captured-store approvals, Nexo text-only constraint, all proof-module evidence sources, dependency/version, accessibility/performance results, and any truthful warning.

```powershell
git add tests/e2e docs/implementation/phase-5-report.md
git commit -m "test: verify phase five delivery"
```

- [ ] **Step 6: Push a draft PR and verify Preview only**

Push the feature branch, open a draft PR, wait for Quality and Vercel checks, then verify the preview routes and capture fallback. Do not mark ready, merge, or promote Production without Yehia's explicit approval.

Expected handoff: draft PR URL, green CI/Vercel status, preview URL, concise test/measurement summary, approved captures, and any remaining risk.
