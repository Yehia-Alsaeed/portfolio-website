# Phase 2 Design System and Responsive Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Executor:** Claude Code. Codex authored this plan but must not execute Phase 2.

**Goal:** Translate the approved YA Monogram visual language into reusable, accessible production primitives and a responsive application shell without implementing the Phase 3 homepage or later data-backed features.

**Architecture:** Keep pages and visual primitives as Server Components by default, and isolate browser state to two client features: display-mode persistence and the command palette. Put design tokens in Tailwind-compatible CSS custom properties, expose focused primitives under `src/components/ui`, compose them through `src/components/layout`, and use route frames plus a directly reviewable `/design-system` gallery to prove the system before page content is built.

**Tech Stack:** Existing Node.js 24/pnpm 11/Next.js 16/React 19/TypeScript 6/Tailwind CSS 4 foundation; `next/font` for Archivo and JetBrains Mono; CVA and Radix Slot for button variants; Radix Dialog and cmdk for the accessible command palette; Vitest, Testing Library, Playwright, axe, and Lighthouse for verification.

## Global Constraints

- Begin from updated `main` and create an isolated `phase-2-design-system-shell` worktree with `superpowers:using-git-worktrees`.
- Do not modify, delete, or stage the user's local `.claude/` directory.
- Read `prd.md`, `handoff.md`, `docs/superpowers/specs/2026-07-17-portfolio-production-roadmap-design.md`, `docs/implementation/phase-1-report.md`, and this plan before editing.
- Treat `mockups/mockup-b-monogram.html`, `mockups/demo/style.css`, and `mockups/demo/qa/reference-monogram-1440.png` as visual references, not production source code. Do not copy the demo wholesale.
- Build the real shell in final locations. Do not add an under-construction message, temporary launch banner, artificial route hiding, or new `noindex` behavior.
- Remove Phase 1's foundation-preview copy and crawlability exception. Basic production metadata is allowed; the comprehensive SEO implementation remains Phase 8.
- `/`, `/projects`, and `/services` receive truthful route frames using the final shell and primitives. They must contain no fabricated project/service detail and no under-construction language. Later phases replace or extend their page bodies.
- `/design-system` remains directly accessible and unlinked from the primary navigation so it can be reviewed on Vercel. Phase 8 owns its removal before launch.
- Do not implement the Phase 3 monogram hero, homepage sections, `N` shortcut, Poster Mode, print-registration transitions, mode textures, or scroll-responsive rules.
- Do not implement GitHub data, case-study routes, live iframes, React Flow, Recharts, forms, analytics, Neon, Drizzle, Cloudinary, Resend, authentication, or admin UI.
- Server Components are the default. Only display-mode controls, command-palette behavior, and `app/error.tsx` may use `"use client"` in this phase.
- Use exact dependency versions. Add only `@radix-ui/react-dialog@1.1.19`, `@radix-ui/react-slot@1.3.0`, and `cmdk@1.1.1`.
- Preserve the approved color values: paper `#f1efe9`, ink `#111114`, dim `#6f6d68`, electric blue `#2b3cff`, and white accent ink `#ffffff`.
- Night mode uses paper `#111114`, ink/line `#f1efe9`, dim `#8b897f`, soft `rgba(241, 239, 233, 0.07)`, and electric blue `#2b3cff`.
- Mono mode keeps the Paper palette but maps accent to ink and accent ink to paper. Layout and typography must not change between modes.
- Typography uses Archivo for display/body and JetBrains Mono for metadata/controls. Letter spacing is never negative and font size never scales directly with viewport width.
- The content frame is `min(1360px, calc(100% - 56px))` on desktop and `calc(100% - 32px)` below 640px.
- Cards are not the page composition. Use open space, rules, rows, and cells; do not add gradients, blobs, rounded panels, nested cards, or decorative shadows.
- All interactive controls have visible keyboard focus, semantic names, and at least a 44px primary touch dimension where practical.
- Mode choice persists under localStorage key `ya-display-mode:v1`. Invalid or unavailable storage falls back to `paper` without throwing.
- The display mode must be applied before React hydration to avoid a Paper flash when Night or Mono is stored.
- The command palette opens with `Ctrl+K` or `Meta+K`, closes with Escape, traps focus through Radix Dialog, filters with cmdk, restores focus to its trigger, and never intercepts shortcuts while typing in an input, textarea, select, or contenteditable element.
- Required viewports are 360x800, 390x844, 768x1024, 1024x768, 1440x1000, and 1920x1080.
- At every required width and in every mode: no horizontal overflow, overlap, clipped labels, unreadable text, or layout shift caused by controls.
- Respect `prefers-reduced-motion: reduce`; all transitions and smooth scrolling become effectively instant.
- Preserve Phase 1 thresholds: Lighthouse Performance >=95, Accessibility >=95, Best Practices >=90, SEO 100, LCP <=2.5s, and CLS <=0.1.
- An unexplained JavaScript gzip increase greater than 10% over `185208` bytes blocks completion. The expected command-palette increase must be measured and justified in the Phase 2 report.
- Every task ends with targeted verification and one scoped commit. Do not combine task commits.
- Before handoff, `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm playwright test`, `pnpm measure:build`, and `pnpm lighthouse` must pass.
- Claude Code must stop after publishing a draft PR and Vercel preview. Do not merge or mark the PR ready until the user reviews the preview.

## File Responsibility Map

| Area | Files | Responsibility |
|---|---|---|
| Dependencies | `package.json`, `pnpm-lock.yaml` | Exact accessible interaction dependencies |
| Fonts/tokens | `src/app/fonts.ts`, `src/app/globals.css` | Self-hosted font variables, color/spacing/type/focus tokens, resets |
| Primitive models | `src/components/ui/*.tsx` | Route-neutral buttons, fields, ruled sections, metadata, stats, rows, titles |
| Display mode | `src/features/display-mode/{model,boot-script,provider,mode-switcher}.ts(x)` | Typed modes, pre-hydration application, persistence, controls |
| Command palette | `src/components/ui/{dialog,command}.tsx`, `src/features/command-palette/*.tsx` | Accessible modal command infrastructure and application commands |
| Layout | `src/components/layout/{site-header,site-footer,site-shell}.tsx` | Responsive landmarks and shell composition |
| Routes | `src/app/{layout,page,loading,error,not-found}.tsx`, `src/app/{projects,services,design-system}/page.tsx` | Real shell frames, state boundaries, and review gallery |
| Tests | `tests/unit/phase-2-*.test.ts(x)`, `tests/e2e/{shell,modes,command-palette,design-system,responsive,accessibility}.spec.ts` | Contracts, keyboard behavior, modes, widths, and accessibility |
| Evidence | `docs/implementation/phase-2-report.md`, existing baseline JSON files | Preview links, visual ledger, bundle/Lighthouse comparison |

---

### Task 1: Establish exact dependencies, fonts, and design tokens

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Create: `src/app/fonts.ts`
- Modify: `src/app/globals.css`
- Create: `tests/unit/phase-2-tokens.test.ts`

**Interfaces:**
- Produces: `archivo.variable`, `jetBrainsMono.variable`, and the CSS token contract consumed by every later task.
- Consumes: Phase 1 package and CSS foundation.

- [ ] **Step 1: Create the isolated execution worktree and verify the baseline**

Run from the repository root:

```powershell
git fetch origin
git switch main
git pull --ff-only origin main
git worktree add -b phase-2-design-system-shell ..\portfolio-phase-2 main
Set-Location ..\portfolio-phase-2
git status --short --branch
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Expected: the new worktree is on `phase-2-design-system-shell`, all Phase 1 gates pass, and `.claude/` is absent from staged/tracked changes.

- [ ] **Step 2: Write the failing token contract test**

Create `tests/unit/phase-2-tokens.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const cssPath = fileURLToPath(new URL("../../src/app/globals.css", import.meta.url));
const css = readFileSync(cssPath, "utf8");

describe("Phase 2 design tokens", () => {
  it.each([
    ["--paper", "#f1efe9"],
    ["--ink", "#111114"],
    ["--dim", "#6f6d68"],
    ["--accent", "#2b3cff"],
    ["--accent-ink", "#ffffff"],
  ])("defines %s as %s", (token, value) => {
    expect(css).toContain(`${token}: ${value};`);
  });

  it("defines all three display modes and reduced-motion behavior", () => {
    expect(css).toContain(':root[data-mode="paper"]');
    expect(css).toContain(':root[data-mode="night"]');
    expect(css).toContain(':root[data-mode="mono"]');
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
  });
});
```

- [ ] **Step 3: Run the focused test and confirm the red state**

Run: `pnpm vitest run tests/unit/phase-2-tokens.test.ts`

Expected: FAIL because Phase 1 CSS does not contain the Phase 2 token contract.

- [ ] **Step 4: Install only the approved exact dependencies**

Run:

```powershell
pnpm add @radix-ui/react-dialog@1.1.19 @radix-ui/react-slot@1.3.0 cmdk@1.1.1 --save-exact
```

Expected: `package.json` and `pnpm-lock.yaml` change; no other dependency is added directly.

- [ ] **Step 5: Add optimized fonts**

Create `src/app/fonts.ts`:

```ts
import { Archivo, JetBrains_Mono } from "next/font/google";

export const archivo = Archivo({
  axes: ["wdth"],
  display: "swap",
  subsets: ["latin"],
  variable: "--font-archivo",
});

export const jetBrainsMono = JetBrains_Mono({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});
```

- [ ] **Step 6: Replace the foundation CSS with the exact global contract**

Replace `src/app/globals.css` with a Tailwind import followed by these required layers:

```css
@import "tailwindcss";

@theme inline {
  --font-sans: var(--font-archivo);
  --font-mono: var(--font-jetbrains-mono);
  --color-paper: var(--paper);
  --color-ink: var(--ink);
  --color-dim: var(--dim);
  --color-line: var(--line);
  --color-soft: var(--soft);
  --color-accent: var(--accent);
  --color-accent-ink: var(--accent-ink);
}

:root,
:root[data-mode="paper"] {
  --paper: #f1efe9;
  --ink: #111114;
  --dim: #6f6d68;
  --line: #111114;
  --soft: rgba(17, 17, 20, 0.06);
  --accent: #2b3cff;
  --accent-ink: #ffffff;
  --focus-ring: #2b3cff;
  --frame-width: 1360px;
  --frame-gutter: 28px;
  color-scheme: light;
}

:root[data-mode="night"] {
  --paper: #111114;
  --ink: #f1efe9;
  --dim: #8b897f;
  --line: #f1efe9;
  --soft: rgba(241, 239, 233, 0.07);
  --accent: #2b3cff;
  --accent-ink: #ffffff;
  --focus-ring: #6f7aff;
  color-scheme: dark;
}

:root[data-mode="mono"] {
  --paper: #f1efe9;
  --ink: #111114;
  --dim: #6f6d68;
  --line: #111114;
  --soft: rgba(17, 17, 20, 0.06);
  --accent: #111114;
  --accent-ink: #f1efe9;
  --focus-ring: #111114;
  color-scheme: light;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  min-width: 320px;
  min-height: 100%;
  scroll-behavior: smooth;
  background: var(--paper);
}

body {
  min-height: 100svh;
  margin: 0;
  background: var(--paper);
  color: var(--ink);
  font-family: var(--font-archivo), Arial, sans-serif;
  line-height: 1.55;
  transition: background-color 180ms ease, color 180ms ease;
}

button,
input,
select,
textarea {
  font: inherit;
}

a {
  color: inherit;
}

::selection {
  background: var(--accent);
  color: var(--accent-ink);
}

:focus-visible {
  outline: 3px solid var(--focus-ring);
  outline-offset: 4px;
}

.site-frame {
  width: min(var(--frame-width), calc(100% - (var(--frame-gutter) * 2)));
  margin-inline: auto;
}

.skip-link {
  position: fixed;
  top: 8px;
  left: 8px;
  z-index: 200;
  padding: 12px 16px;
  background: var(--accent);
  color: var(--accent-ink);
  font-family: var(--font-jetbrains-mono), monospace;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  transform: translateY(calc(-100% - 16px));
}

.skip-link:focus {
  transform: translateY(0);
}

@media (max-width: 639px) {
  :root {
    --frame-gutter: 16px;
  }
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }

  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
```

- [ ] **Step 7: Verify and commit Task 1**

Run:

```powershell
pnpm vitest run tests/unit/phase-2-tokens.test.ts
pnpm lint
pnpm typecheck
pnpm build
git diff --check
git add package.json pnpm-lock.yaml src/app/fonts.ts src/app/globals.css tests/unit/phase-2-tokens.test.ts
git commit -m "feat: establish phase two design tokens"
```

Expected: all commands pass and the first scoped commit is created.

---

### Task 2: Build route-neutral visual primitives

**Files:**
- Create: `src/components/ui/button.tsx`
- Create: `src/components/ui/form-field.tsx`
- Create: `src/components/ui/ruled-section.tsx`
- Create: `src/components/ui/metadata-row.tsx`
- Create: `src/components/ui/stat-cell.tsx`
- Create: `src/components/ui/project-row.tsx`
- Create: `src/components/ui/page-title.tsx`
- Create: `tests/unit/phase-2-primitives.test.tsx`

**Interfaces:**
- Produces: `Button`, `FormField`, `RuledSection`, `MetadataRow`, `StatCell`, `ProjectRow`, and `PageTitle` with the exact props below.
- Consumes: Task 1 tokens and existing `cn()` helper.

- [ ] **Step 1: Write failing semantic tests for every primitive**

Create `tests/unit/phase-2-primitives.test.tsx` that renders every component and asserts:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { MetadataRow } from "@/components/ui/metadata-row";
import { PageTitle } from "@/components/ui/page-title";
import { ProjectRow } from "@/components/ui/project-row";
import { RuledSection } from "@/components/ui/ruled-section";
import { StatCell } from "@/components/ui/stat-cell";

describe("Phase 2 primitives", () => {
  it("renders semantic controls and labelled data", () => {
    render(
      <>
        <Button>Send</Button>
        <FormField id="email" label="Email"><input id="email" /></FormField>
        <MetadataRow items={[{ label: "Role", value: "AI/ML Engineer" }]} />
        <StatCell label="Projects" value="17" />
      </>,
    );
    expect(screen.getByRole("button", { name: "Send" })).toBeVisible();
    expect(screen.getByLabelText("Email")).toBeVisible();
    expect(screen.getByText("Role")).toBeVisible();
    expect(screen.getByText("17")).toBeVisible();
  });

  it("keeps rows and titles route-neutral", () => {
    render(
      <>
        <PageTitle eyebrow="Portfolio" title="Yehia Alsaeed" subtitle="AI/ML Engineer" />
        <RuledSection title="Selected work" meta="2025 to 2026"><p>Body</p></RuledSection>
        <ProjectRow index="01" name="Example system" category="Machine learning" year="2026" href="/" />
      </>,
    );
    expect(screen.getByRole("heading", { level: 1, name: "Yehia Alsaeed" })).toBeVisible();
    expect(screen.getByRole("heading", { level: 2, name: "Selected work" })).toBeVisible();
    expect(screen.getByRole("link", { name: /Example system/ })).toHaveAttribute("href", "/");
  });
});
```

- [ ] **Step 2: Confirm the tests fail because the modules do not exist**

Run: `pnpm vitest run tests/unit/phase-2-primitives.test.tsx`

Expected: FAIL with unresolved `@/components/ui/*` imports.

- [ ] **Step 3: Implement the exact public interfaces**

Use these signatures; keep each file focused and do not create a barrel export:

```ts
export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean };

export type FormFieldProps = {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactElement<{ id?: string; "aria-describedby"?: string; "aria-invalid"?: boolean }>;
};

export type RuledSectionProps = {
  title: string;
  meta?: string;
  headingLevel?: 2 | 3;
  children: React.ReactNode;
};

export type MetadataItem = { label: string; value: React.ReactNode };
export type MetadataRowProps = { items: readonly MetadataItem[]; ariaLabel?: string };
export type StatCellProps = { label: string; value: string; detail?: string };
export type ProjectRowProps = { index: string; name: string; category: string; year: string; href: Route };
export type PageTitleProps = { eyebrow?: string; title: string; accent?: string; subtitle?: string };
```

Implementation requirements:

- `Button` uses CVA variants `primary`, `outline`, and `quiet`, sizes `default` and `icon`, square corners, mono uppercase labels, and Radix Slot for `asChild`.
- `FormField` clones exactly one form control, wires label/hint/error IDs, and sets `aria-invalid` only when `error` exists.
- `RuledSection` renders a semantic `section`, an `h2`/`h3`, optional right-aligned metadata, top/bottom rules, and children without a card wrapper.
- `MetadataRow` uses a semantic `dl`; four columns collapse to two below 820px and one only when content cannot fit at 360px.
- `StatCell` uses tabular mono numerals and no hover-only information.
- `ProjectRow` is one full-width `Link`; category/year hide visually below 820px but remain in an accessible name or visually hidden text.
- `PageTitle` renders exactly one configurable heading, supports an optional accent substring without HTML injection, and uses `clamp()` with rem endpoints rather than viewport-only font sizing.
- Put component-specific class strings in the component files. Shared colors, focus, frame, and typography variables stay in `globals.css`.

- [ ] **Step 4: Verify semantics and commit Task 2**

Run:

```powershell
pnpm vitest run tests/unit/phase-2-primitives.test.tsx
pnpm lint
pnpm typecheck
git diff --check
git add src/components/ui tests/unit/phase-2-primitives.test.tsx
git commit -m "feat: add swiss grid interface primitives"
```

Expected: tests pass, no component has route-specific project data, and the second commit is created.

---

### Task 3: Implement pre-hydration display-mode persistence

**Files:**
- Create: `src/features/display-mode/model.ts`
- Create: `src/features/display-mode/boot-script.ts`
- Create: `src/features/display-mode/provider.tsx`
- Create: `src/features/display-mode/mode-switcher.tsx`
- Create: `tests/unit/phase-2-display-mode.test.tsx`

**Interfaces:**
- Produces: `DisplayMode`, `DISPLAY_MODES`, `DISPLAY_MODE_STORAGE_KEY`, `parseDisplayMode`, `nextDisplayMode`, `DISPLAY_MODE_BOOT_SCRIPT`, `DisplayModeProvider`, `useDisplayMode`, and `ModeSwitcher`.
- Consumes: Task 1 mode token selectors.

- [ ] **Step 1: Write failing model and interaction tests**

Create tests covering the exact contract:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { DISPLAY_MODE_STORAGE_KEY, nextDisplayMode, parseDisplayMode } from "@/features/display-mode/model";
import { ModeSwitcher } from "@/features/display-mode/mode-switcher";
import { DisplayModeProvider } from "@/features/display-mode/provider";

describe("display modes", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.dataset.mode = "paper";
  });

  it("parses storage safely and cycles deterministically", () => {
    expect(parseDisplayMode("night")).toBe("night");
    expect(parseDisplayMode("invalid")).toBe("paper");
    expect(nextDisplayMode("paper")).toBe("night");
    expect(nextDisplayMode("night")).toBe("mono");
    expect(nextDisplayMode("mono")).toBe("paper");
  });

  it("applies and persists an explicit choice", async () => {
    const user = userEvent.setup();
    render(<DisplayModeProvider><ModeSwitcher /></DisplayModeProvider>);
    await user.click(screen.getByRole("button", { name: "Night display mode" }));
    expect(document.documentElement).toHaveAttribute("data-mode", "night");
    expect(localStorage.getItem(DISPLAY_MODE_STORAGE_KEY)).toBe("night");
  });
});
```

- [ ] **Step 2: Run the tests and confirm missing-module failures**

Run: `pnpm vitest run tests/unit/phase-2-display-mode.test.tsx`

Expected: FAIL because the display-mode feature does not exist.

- [ ] **Step 3: Implement the pure model and boot script**

`model.ts` must use this data contract:

```ts
export const DISPLAY_MODES = ["paper", "night", "mono"] as const;
export type DisplayMode = (typeof DISPLAY_MODES)[number];
export const DISPLAY_MODE_STORAGE_KEY = "ya-display-mode:v1";

export function parseDisplayMode(value: string | null | undefined): DisplayMode {
  return DISPLAY_MODES.find((mode) => mode === value) ?? "paper";
}

export function nextDisplayMode(mode: DisplayMode): DisplayMode {
  return DISPLAY_MODES[(DISPLAY_MODES.indexOf(mode) + 1) % DISPLAY_MODES.length];
}
```

`boot-script.ts` must export a static, dependency-free IIFE string that reads the same storage key, accepts only the three modes, sets `document.documentElement.dataset.mode`, updates `colorScheme`, catches storage errors, and falls back to Paper. Do not interpolate user-controlled values.

- [ ] **Step 4: Implement the smallest client boundary**

`provider.tsx` must:

- use `"use client"`;
- expose `{ mode, setMode, cycleMode }` through context;
- initialize from the already-applied `<html data-mode>` value after mount;
- update the dataset, `style.colorScheme`, and localStorage inside one `applyMode` function;
- catch localStorage failures without hiding the visual update;
- throw a clear error when `useDisplayMode()` is used outside its provider.

`mode-switcher.tsx` must render a labelled group of three text buttons, use `aria-pressed`, preserve `Paper / Night / Mono` presentation, and provide accessible names like `Paper display mode`.

- [ ] **Step 5: Verify persistence and commit Task 3**

Run:

```powershell
pnpm vitest run tests/unit/phase-2-display-mode.test.tsx
pnpm lint
pnpm typecheck
git diff --check
git add src/features/display-mode tests/unit/phase-2-display-mode.test.tsx
git commit -m "feat: add persistent display modes"
```

Expected: the tests pass and display-mode code is the only new client feature so far.

---

### Task 4: Build the accessible command-palette shell

**Files:**
- Create: `src/components/ui/dialog.tsx`
- Create: `src/components/ui/command.tsx`
- Create: `src/features/command-palette/commands.ts`
- Create: `src/features/command-palette/command-palette.tsx`
- Create: `src/features/command-palette/command-palette-panel.tsx`
- Create: `src/features/command-palette/command-palette-trigger.tsx`
- Create: `tests/unit/phase-2-command-palette.test.tsx`

**Interfaces:**
- Produces: `PaletteCommand`, `SITE_COMMANDS`, `CommandPalette`, and `CommandPaletteTrigger`.
- Consumes: Radix Dialog, cmdk, Next router, and `useDisplayMode()`.

- [ ] **Step 1: Write failing command and keyboard tests**

Test that:

```tsx
it("opens, filters, runs a command, closes, and restores focus", async () => {
  const user = userEvent.setup();
  render(<DisplayModeProvider><CommandPalette /></DisplayModeProvider>);
  const trigger = screen.getByRole("button", { name: "Open command palette" });
  await user.click(trigger);
  const search = screen.getByRole("combobox", { name: "Search commands" });
  await user.type(search, "night");
  await user.click(screen.getByRole("option", { name: "Use Night mode" }));
  expect(document.documentElement).toHaveAttribute("data-mode", "night");
  expect(trigger).toHaveFocus();
});
```

Add a second test that dispatches `Ctrl+K`, expects the dialog to open, presses Escape, and expects it to close. Add a third test proving `Ctrl+K` in a text input is not intercepted.

- [ ] **Step 2: Confirm the red state**

Run: `pnpm vitest run tests/unit/phase-2-command-palette.test.tsx`

Expected: FAIL with missing command-palette modules.

- [ ] **Step 3: Add local shadcn-style Dialog and Command wrappers**

Implement focused wrappers around `@radix-ui/react-dialog` and `cmdk`; do not add a broad component library. Required exports:

```ts
export { Dialog, DialogTrigger, DialogPortal, DialogOverlay, DialogContent, DialogTitle, DialogDescription, DialogClose };
export { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandShortcut };
```

Requirements:

- square 2px rule border, Paper/Night token background, no rounded corners;
- overlay `rgba(0, 0, 0, 0.5)` with a restrained 2px blur;
- content width `min(640px, calc(100vw - 32px))`, top aligned at 14svh, and max-height constrained to the viewport;
- visible Dialog title and concise description for screen readers;
- an icon-only close button uses Lucide `X` and the accessible label `Close command palette`;
- cmdk input has a 44px minimum height and list items expose the `option` role supplied by cmdk;
- no hand-written focus trap, arrow-key loop, or Escape handler that duplicates Radix/cmdk behavior.

- [ ] **Step 4: Define typed commands and behavior**

Use this model:

```ts
export type PaletteCommand =
  | { id: string; group: "Navigate"; label: string; keywords: readonly string[]; kind: "navigate"; href: "/" | "/projects" | "/services" | "/design-system" }
  | { id: string; group: "Display"; label: string; keywords: readonly string[]; kind: "display-mode"; mode: DisplayMode };
```

`SITE_COMMANDS` contains Home, Projects, Services, Design system, Use Paper mode, Use Night mode, and Use Mono mode. Do not add copy-email, CV, Poster Mode, or `N` shortcuts; those belong to Phase 3.

`CommandPalette` is the lightweight coordinator. It owns open state, the trigger, and one document keydown listener for `Ctrl+K`/`Meta+K`. Ignore the shortcut when the event target is an input, textarea, select, or contenteditable element.

`command-palette-panel.tsx` imports Radix Dialog and cmdk, uses `useRouter().push()` for navigation, uses `setMode()` for display commands, and closes after selection. Load this panel with `React.lazy(() => import("./command-palette-panel"))` only after the palette first opens; keep it mounted after the first load so repeated opening is immediate. Export the panel as a default export for `React.lazy`. The trigger, keyboard listener, and mode provider must remain usable while the panel chunk loads.

- [ ] **Step 5: Verify and commit Task 4**

Run:

```powershell
pnpm vitest run tests/unit/phase-2-command-palette.test.tsx
pnpm lint
pnpm typecheck
pnpm build
git diff --check
git add src/components/ui/dialog.tsx src/components/ui/command.tsx src/features/command-palette tests/unit/phase-2-command-palette.test.tsx
git commit -m "feat: add accessible command palette shell"
```

Expected: tests pass, the command palette is the only use of Radix Dialog/cmdk, and the fourth commit is created.

---

### Task 5: Compose the final responsive shell and truthful route frames

**Files:**
- Create: `src/components/layout/site-header.tsx`
- Create: `src/components/layout/site-footer.tsx`
- Create: `src/components/layout/site-shell.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/page.tsx`
- Create: `src/app/projects/page.tsx`
- Create: `src/app/services/page.tsx`
- Replace: `tests/unit/foundation-page.test.tsx`
- Create: `tests/unit/phase-2-shell.test.tsx`

**Interfaces:**
- Produces: responsive global landmarks and real route frames at `/`, `/projects`, and `/services`.
- Consumes: Tasks 1-4 fonts, primitives, modes, and palette.

- [ ] **Step 1: Replace the Phase 1 unit contract with failing shell tests**

Delete the foundation-marker assertions. Test `SiteShell` and pages for:

- one skip link targeting `#main-content`;
- one banner landmark, one navigation landmark named `Primary`, one main landmark, and one contentinfo landmark;
- logo link accessible name `Yehia Alsaeed home`;
- Home, Projects, Services, and Contact navigation labels;
- exactly one `h1` per route;
- no `Foundation preview`, `under construction`, or fabricated details.

Run: `pnpm vitest run tests/unit/foundation-page.test.tsx tests/unit/phase-2-shell.test.tsx`

Expected: FAIL because the final shell and route frames do not exist.

- [ ] **Step 2: Implement layout components with final responsive behavior**

`SiteHeader` requirements:

- logo `YA.` with the period using `var(--accent)`;
- desktop navigation uses the final labels Home, Projects, Services, Contact, then the command-palette trigger;
- Contact links to `/#contact`; the footer owns `id="contact"` and exposes the approved email link so the destination works before Phase 3;
- at <=767px, wrap into two stable rows rather than adding a hamburger menu in this phase;
- use `aria-current="page"` from a small client-free `pathname` prop passed by route layouts only if available; otherwise omit it rather than moving the whole header client-side;
- all links and controls retain at least 44px touch height.

`SiteFooter` requirements:

- copyright `2026 - Yehia Alsaeed`;
- approved email link `yehias3eed11@gmail.com` inside the footer contact target;
- external GitHub and LinkedIn links from the approved handoff;
- CV link points to `/cv/Yehia_Alsaeed_CV_AI.pdf` with `download`, but no analytics behavior yet;
- external links include safe `rel` values and visible focus.

`SiteShell` requirements:

```tsx
export type SiteShellProps = { children: React.ReactNode };
```

It renders the skip link, `.site-frame`, header, `<main id="main-content" tabIndex={-1}>`, footer, and the command palette. Do not put shell sections in cards.

- [ ] **Step 3: Update the root layout and pre-hydration mode application**

`src/app/layout.tsx` must:

- apply `${archivo.variable} ${jetBrainsMono.variable}` to `<html>`;
- set `lang="en"`, `data-mode="paper"`, and `suppressHydrationWarning`;
- inject `DISPLAY_MODE_BOOT_SCRIPT` in `<head>` before interactive React code;
- wrap `SiteShell` in `DisplayModeProvider`;
- use production metadata title `Yehia Alsaeed | AI/ML Engineer and Web Developer` and a factual description;
- remove `robots: { index: false, follow: false }`.

Do not add schema markup, sitemap, dynamic OG, or analytics in this phase.

- [ ] **Step 4: Create truthful route frames in their final locations**

Use `PageTitle`, `MetadataRow`, and `RuledSection` with only these approved facts:

- `/`: title `Yehia Alsaeed`; subtitle `AI/ML Engineer and Web Developer`; metadata Role `AI/ML Engineer + Web Dev`, Base `Cairo, Egypt`, Status `Open to roles and clients`, Display `<ModeSwitcher />`.
- `/projects`: title `Projects`; subtitle `Technical work across AI, machine learning, and full-stack systems`; one ruled section titled `Project index` with the factual scope `AI, computer vision, data, distributed systems, and full-stack engineering.` Do not mention implementation phases.
- `/services`: title `Services`; subtitle `Shopify, full-stack web, and applied AI development`; one ruled section titled `Client services` with concise inquiry-oriented scope but no prices, claims, cards, or contact form.

The route frames are real semantic pages, not launch notices. Keep them visually restrained because Phase 3-5 own their full content.

- [ ] **Step 5: Verify shell composition and commit Task 5**

Run:

```powershell
pnpm vitest run tests/unit/foundation-page.test.tsx tests/unit/phase-2-shell.test.tsx
pnpm lint
pnpm typecheck
pnpm build
git diff --check
git add src/app/layout.tsx src/app/page.tsx src/app/projects src/app/services src/components/layout tests/unit/foundation-page.test.tsx tests/unit/phase-2-shell.test.tsx
git commit -m "feat: compose responsive portfolio shell"
```

Expected: all routes build statically, foundation-preview copy is gone, and the fifth commit is created.

---

### Task 6: Add branded loading, error, and not-found boundaries

**Files:**
- Create: `src/app/loading.tsx`
- Create: `src/app/error.tsx`
- Create: `src/app/not-found.tsx`
- Create: `tests/unit/phase-2-boundaries.test.tsx`

**Interfaces:**
- Produces: accessible route states inside the Task 5 shell.
- Consumes: Button and PageTitle primitives.

- [ ] **Step 1: Write failing boundary tests**

Test that loading exposes `role="status"` and text `Loading page`; error exposes `role="alert"`, a `Try again` button that calls `reset`, and a Home link; not-found includes one `h1` named `404`, text `Page not found`, Home, and Projects links.

Run: `pnpm vitest run tests/unit/phase-2-boundaries.test.tsx`

Expected: FAIL because the boundary modules do not exist.

- [ ] **Step 2: Implement restrained branded states**

Requirements:

- `loading.tsx` is a Server Component with a ruled skeleton, fixed block dimensions, `aria-live="polite"`, and no spinner dependency or continuous animation.
- `error.tsx` is the required Client Component, accepts `{ error, reset }`, logs the error once in an effect, shows a generic safe message, and never prints stack/message details to visitors.
- `not-found.tsx` uses the Mockup B 404 composition: oversized `4`, accent `0`, `4`, mono explanatory line, and square primary/outline actions.
- All three fit at 360px without clipping and reuse tokens/primitives rather than duplicating a separate theme.

- [ ] **Step 3: Verify and commit Task 6**

Run:

```powershell
pnpm vitest run tests/unit/phase-2-boundaries.test.tsx
pnpm lint
pnpm typecheck
pnpm build
git diff --check
git add src/app/loading.tsx src/app/error.tsx src/app/not-found.tsx tests/unit/phase-2-boundaries.test.tsx
git commit -m "feat: add branded application boundaries"
```

Expected: boundary tests pass and the sixth commit is created.

---

### Task 7: Build the directly reviewable design-system gallery

**Files:**
- Create: `src/app/design-system/page.tsx`
- Create: `tests/unit/phase-2-gallery.test.tsx`
- Create: `tests/e2e/design-system.spec.ts`

**Interfaces:**
- Produces: `/design-system`, a deterministic route for visual, responsive, mode, and state review.
- Consumes: every Phase 2 primitive and interaction.

- [ ] **Step 1: Write failing gallery coverage**

Unit test one `h1` named `Design system`, section headings `Typography`, `Actions`, `Form controls`, `Metadata`, `Statistics`, `Project rows`, `Page title`, and `Display modes`, plus labels for Name, Email, Inquiry type, and Message.

E2E test `/design-system` for HTTP 200, all section headings visible, each control keyboard focusable, and no console/page errors.

Run:

```powershell
pnpm vitest run tests/unit/phase-2-gallery.test.tsx
pnpm playwright test tests/e2e/design-system.spec.ts
```

Expected: FAIL because the gallery route does not exist.

- [ ] **Step 2: Compose the gallery without route-specific production claims**

The gallery must include:

- Archivo display levels (`Display`, `H1`, `H2`, body) and JetBrains Mono metadata;
- primary, outline, quiet, disabled, and icon button states;
- text input, email input, native select, textarea, hint, error, disabled, and focus states;
- one four-cell metadata row;
- a four-cell stat grid using neutral specimen values, explicitly labelled `Component specimen` so they are not read as portfolio claims;
- one ProjectRow specimen using `Example system`, not a fabricated real project;
- PageTitle with and without an accent substring;
- Paper/Night/Mono switcher;
- command-palette trigger and concise keyboard instructions only inside this internal review route;
- a ruled spacing scale specimen for 4, 8, 12, 16, 24, 32, 48, and 64px.

Use open ruled bands, not a card grid. The gallery is directly accessible on preview and production during development but absent from primary navigation.

- [ ] **Step 3: Verify and commit Task 7**

Run:

```powershell
pnpm vitest run tests/unit/phase-2-gallery.test.tsx
pnpm playwright test tests/e2e/design-system.spec.ts
pnpm lint
pnpm typecheck
pnpm build
git diff --check
git add src/app/design-system tests/unit/phase-2-gallery.test.tsx tests/e2e/design-system.spec.ts
git commit -m "feat: add design system review gallery"
```

Expected: the gallery is static, deterministic, accessible, and the seventh commit is created.

---

### Task 8: Expand browser gates, measure regressions, and publish the preview

**Files:**
- Modify: `tests/e2e/foundation.spec.ts` (rename to `tests/e2e/shell.spec.ts`)
- Create: `tests/e2e/modes.spec.ts`
- Create: `tests/e2e/command-palette.spec.ts`
- Modify: `tests/e2e/responsive.spec.ts`
- Modify: `tests/e2e/accessibility.spec.ts`
- Modify: `lighthouserc.cjs`
- Modify: `scripts/measure-build.ts`
- Modify: `scripts/measure-lighthouse.ts`
- Create: `docs/implementation/phase-2-build-baseline.json` only through `pnpm measure:build`
- Create: `docs/implementation/phase-2-lighthouse-baseline.json` only through `pnpm lighthouse`
- Create: `docs/implementation/phase-2-report.md`

**Interfaces:**
- Produces: full Phase 2 browser acceptance evidence, updated measurements, draft PR, and Vercel preview.
- Consumes: all prior tasks and Phase 1 CI/Vercel integration.

- [ ] **Step 1: Replace the foundation smoke test with final shell journeys**

`shell.spec.ts` must verify `/`, `/projects`, `/services`, `/design-system`, and a guaranteed missing path all return the intended shell/state without console or page errors. Assert header/main/footer landmarks, one `h1`, skip-link behavior, and working navigation.

- [ ] **Step 2: Add mode persistence and hydration tests**

`modes.spec.ts` must:

- select Night, reload, and assert `data-mode="night"` before checking visible state;
- navigate from `/` to `/projects` and assert persistence;
- select Mono and assert the accent computed color equals ink;
- inject invalid storage before navigation and assert Paper fallback with no page error;
- block localStorage through `page.addInitScript` and assert controls still change the visible mode without crashing.

- [ ] **Step 3: Add command-palette keyboard tests**

`command-palette.spec.ts` must exercise mouse trigger, `Control+K`, platform-neutral `Meta+K`, search filtering, arrow navigation, Enter selection, Escape close, focus restoration, navigation, display-mode command, and non-interception inside gallery form fields.

- [ ] **Step 4: Expand responsive and accessibility matrices**

For all six required viewports, test `/`, `/design-system`, and `/missing-phase-2-route` for:

- `scrollWidth <= clientWidth`;
- no element with a bounding box outside the viewport by more than one CSS pixel, excluding Radix portals while closed;
- visible logo, `h1`, primary navigation, and footer;
- command palette contained within viewport when open;
- no text button below 44px touch height unless it is an inline text link.

Run axe on `/`, `/projects`, `/services`, `/design-system`, and the 404 in Paper, Night, and Mono. Assert zero WCAG A/AA violations.

Under reduced motion, inspect computed `scroll-behavior` and transition/animation durations and assert the page remains usable.

- [ ] **Step 5: Preserve Phase 1 measurements and remove the obsolete Lighthouse crawlability exception**

Change only the output path in `scripts/measure-build.ts` from `phase-1-build-baseline.json` to `phase-2-build-baseline.json`. Change only the output path in `scripts/measure-lighthouse.ts` from `phase-1-lighthouse-baseline.json` to `phase-2-lighthouse-baseline.json`. The Phase 1 JSON files are historical evidence and must not change.

Delete `skipAudits: ["is-crawlable"]` and its Phase 1 comment from `lighthouserc.cjs`. Keep `/` as the measured route, keep every threshold, and keep the three-run median behavior unchanged.

- [ ] **Step 6: Run the complete local gate and generate fresh measurements**

Run:

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

Expected: all commands pass; baseline JSON files contain fresh numeric values; SEO is 100 without skipping crawlability.

- [ ] **Step 7: Enforce the bundle budget explicitly**

Read the new `gzipBytes` from `docs/implementation/phase-2-build-baseline.json` and calculate:

```text
increasePercent = ((newGzipBytes - 185208) / 185208) * 100
```

The Phase 1 script measures every emitted chunk, including lazy chunks, so this percentage is a conservative artifact inventory rather than initial-route JavaScript. If the inventory increase is greater than 10%, identify the exact cmdk/Radix chunks, verify through browser network entries that those chunks are not requested before the palette first opens, and record both facts. If they load eagerly, fix the Task 4 boundary before continuing. Record the final raw/gzip totals, percentage, lazy-load network result, and Lighthouse result in the report.

- [ ] **Step 8: Capture and inspect the visual matrix**

Capture full-page screenshots of `/design-system`, `/`, and the 404 at 390x844, 768x1024, 1440x1000, and 1920x1080 in Paper/Night/Mono. Save temporary captures under `.tmp/phase-2-visual/`; never commit them.

Compare the 1440 Paper render against:

- `mockups/demo/qa/reference-monogram-1440.png` for palette, rules, frame, typography, and density;
- `mockups/demo/qa/home-no-preview-1440.png` for header/footer and responsive shell language.

Write a fidelity ledger with at least these eight rows: frame width/gutters, Archivo proportions, mono metadata, token colors, rule weights, control corners, navigation wrapping, and 390px text/control fit. Fix every material mismatch before continuing.

- [ ] **Step 9: Commit automated tests and measurement evidence**

Run:

```powershell
git add tests/e2e lighthouserc.cjs scripts/measure-build.ts scripts/measure-lighthouse.ts docs/implementation/phase-2-build-baseline.json docs/implementation/phase-2-lighthouse-baseline.json
git commit -m "test: verify phase two responsive shell"
```

Expected: the eighth scoped commit contains only tests and measurement configuration/results.

- [ ] **Step 10: Push a draft PR and verify the Vercel preview**

Run:

```powershell
git push -u origin phase-2-design-system-shell
gh pr create --draft --base main --head phase-2-design-system-shell --title "Phase 2: design system and responsive shell" --body "Implements the approved Phase 2 design system and shell plan. Homepage content, data services, and later proof features remain out of scope."
gh pr checks --watch
```

Create an explicit Vercel preview so the verification command receives a deterministic URL:

```powershell
$deployOutput = pnpm dlx vercel@56.3.1 deploy --yes --no-color 2>&1
$previewUrl = ([regex]::Matches(($deployOutput -join "`n"), 'https://[^ ]+\.vercel\.app')).Value | Select-Object -Last 1
if (-not $previewUrl) { throw "Vercel did not return a preview URL" }
$env:PLAYWRIGHT_BASE_URL = $previewUrl
pnpm playwright test
pnpm dlx vercel@56.3.1 inspect $env:PLAYWRIGHT_BASE_URL
Remove-Item Env:PLAYWRIGHT_BASE_URL
```

- [ ] **Step 11: Create and commit the Phase 2 report with real evidence**

Create `docs/implementation/phase-2-report.md` with these exact sections:

- `# Phase 2 Design System and Shell Report`
- `## Scope Result`: state that the design system/shell are complete, Phase 3 homepage and provider features are absent, and no temporary under-construction or launch-hiding behavior was added.
- `## Routes Reviewed`: list `/`, `/projects`, `/services`, `/design-system`, and the 404.
- `## Verification`: enter the observed unit/Playwright counts, all-six-width result, three-mode axe result, four Lighthouse scores, LCP, CLS, raw/gzip JavaScript bytes, and calculated percentage change from Phase 1.
- `## Visual Fidelity Ledger`: include an evidence table with exactly eight rows for frame width/gutters, Archivo proportions, mono metadata, token colors, rule weights, control corners, navigation wrapping, and 390px text/control fit. Each row records the reference observation, rendered observation, and resulting fix or pass.
- `## Delivery`: use the actual Markdown-linked PR URL, actual HTTPS Vercel preview URL, the verified implementation SHA from `git rev-parse HEAD` before the report commit, and GitHub quality-check result.
- `## Phase 3 Readiness`: state that Phase 3 planning may begin only after user review and merge approval.

Do not commit guessed values, unavailable links, instructional prose, or empty evidence cells.

Run:

```powershell
git add docs/implementation/phase-2-report.md
git commit -m "docs: record phase two preview evidence"
git push
gh pr checks --watch
```

Expected: the report contains only observed evidence and the draft PR checks return green.

- [ ] **Step 12: Rerun final gates and stop**

Run:

```powershell
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm playwright test
git diff --check
git status --short --branch
git log --oneline main..HEAD
```

Claude Code must report the PR URL, preview URL, final SHA, test counts, Lighthouse results, bundle delta, and fidelity-ledger summary. Stop for user review. Do not merge, mark ready, delete the branch, or remove the worktree.

---

## Phase 2 Completion Gate

Phase 2 is complete only when all eight scoped commits exist, the draft PR is current, GitHub Actions is green, the Vercel preview is READY, the preview passes the complete Playwright suite, all three modes persist without hydration flash, the command palette is keyboard-complete, every required viewport is clean, axe has no A/AA violations, Lighthouse and bundle gates pass, and the user has reviewed the preview.

## Final Claude Code Audit

Run and inspect:

```powershell
rg -n 'under construction|Foundation preview|noindex|index: false' src lighthouserc.cjs
rg -n 'drizzle|neon|cloudinary|resend|recharts|react-flow|@xyflow' package.json src
rg -n 'use client' src
git ls-files .env .env.local .vercel .next .lighthouseci .tmp .claude
git diff main...HEAD --stat
git log --oneline main..HEAD
```

Expected:

- The first two searches return no matches.
- `"use client"` appears only in display-mode files, command-palette files/wrappers that require it, and `src/app/error.tsx`.
- No ignored local/provider/test output or `.claude/` file is tracked.
- The diff contains only Phase 2 dependencies, tokens, primitives, shell/routes, boundaries, gallery, tests, measurements, and report.
- The log contains eight scoped implementation commits plus one final evidence-link commit if the preview URL was unavailable before Task 8's first commit.

## Official References

- Next.js font optimization and CSS variables: `https://nextjs.org/docs/app/api-reference/components/font`
- Next.js App Router error handling: `https://nextjs.org/docs/app/getting-started/error-handling`
- shadcn Command component: `https://ui.shadcn.com/docs/components/radix/command`
- Radix Dialog behavior and accessibility: `https://www.radix-ui.com/primitives/docs/components/dialog`
- Radix accessibility overview: `https://www.radix-ui.com/primitives/docs/overview/accessibility`
- Playwright accessibility testing: `https://playwright.dev/docs/accessibility-testing`
- Next.js React performance guidance already installed as the Vercel React best-practices skill.
