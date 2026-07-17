# Phase 1 Foundation, Tooling, and Preview Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Executor:** Claude Code. Codex authored this plan but must not execute Phase 1.

**Goal:** Establish a production-grade Next.js foundation that installs deterministically, enforces repository quality, passes unit/browser/accessibility/performance checks, and produces a verified Vercel preview without implementing production pages.

**Architecture:** Create one Next.js 16 App Router application in the repository root. Keep the root route as a deliberately minimal, no-index Server Component used only to prove the application shell; Phase 2 owns the visual system and Phase 3 owns the production homepage. Tooling is local and deterministic: exact package versions, pnpm lockfile, strict TypeScript, ESLint, Prettier, Vitest, Testing Library, Playwright, axe, Lighthouse CI, GitHub Actions, and Vercel Git integration.

**Tech Stack:** Node.js 24 LTS, pnpm 11.13.1, Next.js 16.2.10, React 19.2.7, TypeScript 7.0.2, Tailwind CSS 4.3.3, shadcn/ui CLI 4.13.0-compatible configuration, Vitest 4.1.10, Playwright 1.61.1, axe-core 4.12.1, Lighthouse CI 0.15.1, tsx 4.23.1, Vercel CLI 56.3.1.

## Global Constraints

- Claude Code must begin from updated `main` and create an isolated `phase-1-foundation` worktree using `superpowers:using-git-worktrees`.
- Read `prd.md`, `handoff.md`, `docs/implementation/phase-1-inputs.md`, `docs/implementation/decision-register.md`, and the production roadmap before editing.
- Do not modify or delete the user's local `.claude/` directory. Never stage it.
- Do not copy HTML, CSS, JavaScript, or page structure from `mockups/` into `src/`. The mockups remain read-only visual references.
- Do not implement the production homepage, design system, navigation, modes, case studies, services, contact flow, analytics, database, authentication, Cloudinary integration, Recharts, or React Flow.
- Do not provision Neon, Cloudinary, Resend, or Neon Auth. Phase 1 may create only the Vercel project and preview/Git connection required by this phase.
- Keep `public/cv/Yehia_Alsaeed_CV_AI.pdf` unchanged.
- Pages and layouts are Server Components by default. Phase 1 must contain no `"use client"` directive.
- Use exact dependency versions and commit `pnpm-lock.yaml`. Do not install tools globally.
- Use native `URL` and TypeScript checks for Phase 1 environment handling; add no validation library.
- Every task ends with its own verification and commit. Do not combine task commits.
- Do not suppress errors with disabled tests, broad ESLint ignores, `@ts-ignore`, `@ts-expect-error`, or `|| true`.
- The tracked application must remain usable on Windows and Linux CI; package scripts must not rely on shell-specific environment assignment.
- Browser checks cover 360, 390, 768, 1024, 1440, and 1920 CSS pixels. The shell must have no horizontal overflow or overlapping text at any width.
- Required release thresholds are Lighthouse Performance >=95, Accessibility >=95, Best Practices >=90, SEO 100, LCP <=2.5s, and CLS <=0.1.
- These commands must pass from a clean checkout before Phase 1 can close:

```text
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm playwright test
```

## File Responsibility Map

| Area | Files | Responsibility |
|---|---|---|
| Runtime and packages | `package.json`, `pnpm-lock.yaml`, `.npmrc`, `.nvmrc`, `.node-version` | Exact runtime, dependency, and script contract |
| Framework | `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `next-env.d.ts` | Next.js, strict TypeScript, Tailwind/PostCSS |
| Quality | `eslint.config.mjs`, `.prettierrc.json`, `.prettierignore` | Static analysis and deterministic formatting |
| shadcn foundation | `components.json`, `src/lib/utils.ts` | Future component registry contract and class merging only |
| Environment | `src/lib/env/public.ts` | Native parsing of currently active public configuration |
| Foundation route | `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css` | Minimal no-index server-rendered deployment shell |
| Unit tests | `vitest.config.ts`, `tests/setup.ts`, `tests/unit/**/*.test.ts(x)` | Pure utility and shell regression tests |
| Browser tests | `playwright.config.ts`, `tests/e2e/fixtures.ts`, `tests/e2e/*.spec.ts` | Visitor smoke, axe, reduced-motion, and viewport checks |
| Performance | `lighthouserc.cjs`, `scripts/measure-build.ts`, `scripts/measure-lighthouse.ts`, `docs/implementation/phase-1-*-baseline.json` | Reproducible initial build and Lighthouse measurements |
| CI | `.github/workflows/quality.yml` | Clean-install quality gate for pushes and pull requests |
| Handoff | `docs/implementation/phase-1-report.md` | Commands, CI, preview URL, and Phase 2 readiness evidence |

---

### Task 1: Create the deterministic Next.js foundation

**Files:**
- Modify: `.gitignore`
- Create: `.npmrc`
- Create: `.nvmrc`
- Create: `.node-version`
- Create: `package.json`
- Create: `pnpm-lock.yaml`
- Create: `next.config.ts`
- Create: `tsconfig.json`
- Create: `postcss.config.mjs`
- Create: `eslint.config.mjs`
- Create: `.prettierrc.json`
- Create: `.prettierignore`

**Interfaces:**
- Consumes: Phase 0 repository and `.env.example`
- Produces: Node 24/pnpm 11 project contract and scripts used by every later task

- [ ] **Step 1: Verify the execution boundary before scaffolding**

Run:

```powershell
git status --short --branch
git branch --show-current
git remote get-url origin
Test-Path package.json
```

Expected: the isolated worktree is on `phase-1-foundation`, `origin` is `https://github.com/Yehia-Alsaeed/portfolio-website.git`, tracked status is clean, and `package.json` does not exist.

- [ ] **Step 2: Extend ignored generated-output boundaries**

Append these entries to `.gitignore` without changing existing rules:

```gitignore
.tmp/
.lighthouseci/
reports/lighthouse/
```

Run:

```powershell
git check-ignore .tmp/check.txt .lighthouseci/lhr.json reports/lighthouse/report.html
```

Expected: all three paths are printed.

- [ ] **Step 3: Create the exact runtime and package contract**

Create `.npmrc`:

```ini
engine-strict=true
save-exact=true
```

Create `.nvmrc` and `.node-version`, each containing:

```text
24
```

Create `package.json`:

```json
{
  "name": "portfolio-website",
  "version": "0.1.0",
  "private": true,
  "packageManager": "pnpm@11.13.1",
  "engines": {
    "node": ">=24 <25",
    "pnpm": ">=11.13.1 <12"
  },
  "scripts": {
    "dev": "next dev",
    "dev:test": "next dev -p 3100",
    "build": "next build",
    "start": "next start",
    "start:test": "next start -p 3100",
    "lint": "eslint . --max-warnings=0",
    "lint:fix": "eslint . --fix",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "lighthouse": "lhci collect && lhci assert && tsx scripts/measure-lighthouse.ts",
    "measure:build": "tsx scripts/measure-build.ts"
  },
  "dependencies": {
    "class-variance-authority": "0.7.1",
    "clsx": "2.1.1",
    "lucide-react": "1.25.0",
    "next": "16.2.10",
    "react": "19.2.7",
    "react-dom": "19.2.7",
    "tailwind-merge": "3.6.0",
    "tw-animate-css": "1.4.0"
  },
  "devDependencies": {
    "@axe-core/playwright": "4.12.1",
    "@lhci/cli": "0.15.1",
    "@playwright/test": "1.61.1",
    "@tailwindcss/postcss": "4.3.3",
    "@testing-library/jest-dom": "6.9.1",
    "@testing-library/react": "16.3.2",
    "@testing-library/user-event": "14.6.1",
    "@types/node": "24.13.3",
    "@types/react": "19.2.17",
    "@types/react-dom": "19.2.3",
    "eslint": "10.7.0",
    "eslint-config-next": "16.2.10",
    "eslint-config-prettier": "10.1.8",
    "jsdom": "29.1.1",
    "postcss": "8.5.19",
    "prettier": "3.9.5",
    "prettier-plugin-tailwindcss": "0.8.1",
    "tailwindcss": "4.3.3",
    "tsx": "4.23.1",
    "typescript": "7.0.2",
    "vitest": "4.1.10"
  },
  "pnpm": {
    "onlyBuiltDependencies": [
      "esbuild",
      "sharp"
    ]
  }
}
```

- [ ] **Step 4: Create strict framework configuration**

Create `next.config.ts`:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  typedRoutes: true,
};

export default nextConfig;
```

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "es2022"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts"
  ],
  "exclude": ["node_modules"]
}
```

Create `postcss.config.mjs`:

```js
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

- [ ] **Step 5: Create lint and formatting configuration**

Create `eslint.config.mjs`:

```js
import { defineConfig, globalIgnores } from "eslint/config";
import prettier from "eslint-config-prettier/flat";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  {
    rules: {
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" }
      ],
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["mockups", "mockups/*", "@/../mockups/*"],
              message: "Production code must not import prototype files."
            }
          ]
        }
      ]
    }
  },
  prettier,
  globalIgnores([
    ".next/**",
    ".lighthouseci/**",
    ".tmp/**",
    "coverage/**",
    "playwright-report/**",
    "reports/lighthouse/**",
    "test-results/**"
  ])
]);
```

Create `.prettierrc.json`:

```json
{
  "plugins": ["prettier-plugin-tailwindcss"],
  "printWidth": 100,
  "semi": true,
  "singleQuote": false,
  "trailingComma": "all"
}
```

Create `.prettierignore`:

```text
.next
.lighthouseci
.tmp
coverage
node_modules
playwright-report
reports/lighthouse
test-results
mockups
public/cv
```

- [ ] **Step 6: Install exactly and verify lockfile determinism**

Run:

```powershell
corepack enable
corepack prepare pnpm@11.13.1 --activate
pnpm install
pnpm install --frozen-lockfile
pnpm exec next --version
pnpm exec tsc --version
```

Expected: the frozen install succeeds, Next reports `16.2.10`, TypeScript reports `7.0.2`, and `pnpm-lock.yaml` exists.

- [ ] **Step 7: Commit the deterministic foundation**

```powershell
git add .gitignore .npmrc .nvmrc .node-version package.json pnpm-lock.yaml next.config.ts tsconfig.json postcss.config.mjs eslint.config.mjs .prettierrc.json .prettierignore
git commit -m "chore: scaffold deterministic next foundation"
```

---

### Task 2: Add native environment handling and the shadcn foundation

**Files:**
- Create: `components.json`
- Create: `src/lib/env/public.ts`
- Create: `src/lib/utils.ts`
- Create: `vitest.config.ts`
- Create: `tests/setup.ts`
- Create: `tests/unit/public-env.test.ts`
- Create: `tests/unit/class-names.test.ts`

**Interfaces:**
- Produces: `resolveSiteUrl(value: string | undefined): URL`, `publicEnv.siteUrl: URL`, and `cn(...inputs: ClassValue[]): string`
- Consumes later: root metadata and future shadcn components

- [ ] **Step 1: Configure Vitest before writing implementation**

Create `vitest.config.ts`:

```ts
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    include: ["tests/unit/**/*.test.{ts,tsx}"],
    setupFiles: ["./tests/setup.ts"],
  },
});
```

Create `tests/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 2: Write failing environment and class-name tests**

Create `tests/unit/public-env.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { resolveSiteUrl } from "@/lib/env/public";

describe("resolveSiteUrl", () => {
  it("uses the safe local URL when the value is absent", () => {
    expect(resolveSiteUrl(undefined).href).toBe("http://localhost:3000/");
  });

  it("normalizes an explicit HTTP or HTTPS origin", () => {
    expect(resolveSiteUrl(" https://portfolio.example/path ").origin).toBe(
      "https://portfolio.example",
    );
  });

  it("rejects non-HTTP protocols", () => {
    expect(() => resolveSiteUrl("ftp://portfolio.example")).toThrow(
      "NEXT_PUBLIC_SITE_URL must use http or https",
    );
  });
});
```

Create `tests/unit/class-names.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { cn } from "@/lib/utils";

describe("cn", () => {
  it("merges conditional values and resolves Tailwind conflicts", () => {
    expect(cn("px-2", false && "hidden", "px-4")).toBe("px-4");
  });
});
```

Run:

```powershell
pnpm test
```

Expected: FAIL because `@/lib/env/public` and `@/lib/utils` do not exist.

- [ ] **Step 3: Implement the minimal environment and utility interfaces**

Create `src/lib/env/public.ts`:

```ts
const LOCAL_SITE_URL = "http://localhost:3000";

export function resolveSiteUrl(value: string | undefined): URL {
  const url = new URL(value?.trim() || LOCAL_SITE_URL);

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("NEXT_PUBLIC_SITE_URL must use http or https");
  }

  return url;
}

export const publicEnv = {
  siteUrl: resolveSiteUrl(process.env.NEXT_PUBLIC_SITE_URL),
} as const;
```

Create `src/lib/utils.ts`:

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

Create `components.json`:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "registries": {}
}
```

- [ ] **Step 4: Verify tests and shadcn configuration**

Run:

```powershell
pnpm test
pnpm dlx shadcn@4.13.0 info
pnpm lint
pnpm typecheck
```

Expected: both unit tests pass, shadcn identifies a Next.js project using `components.json`, and lint/typecheck pass.

- [ ] **Step 5: Commit the environment and registry foundation**

```powershell
git add components.json src/lib vitest.config.ts tests/setup.ts tests/unit
git commit -m "test: establish environment and shadcn foundations"
```

---

### Task 3: Build the minimal no-index Server Component shell

**Files:**
- Create: `src/app/globals.css`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `tests/unit/foundation-page.test.tsx`

**Interfaces:**
- Consumes: `publicEnv.siteUrl`
- Produces: static `/` route with one `h1`, `data-foundation-shell="true"`, and no client JavaScript authored by the project

- [ ] **Step 1: Write the failing shell test**

Create `tests/unit/foundation-page.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import FoundationPage from "@/app/page";

describe("FoundationPage", () => {
  it("renders one factual identity heading inside the foundation marker", () => {
    const { container } = render(<FoundationPage />);

    expect(screen.getByRole("heading", { level: 1, name: "Yehia Alsaeed" })).toBeVisible();
    expect(container.querySelectorAll("h1")).toHaveLength(1);
    expect(container.querySelector("main")).toHaveAttribute("data-foundation-shell", "true");
  });
});
```

Run `pnpm test`.

Expected: FAIL because `src/app/page.tsx` does not exist.

- [ ] **Step 2: Implement the root layout and metadata**

Create `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import type { ReactNode } from "react";

import { publicEnv } from "@/lib/env/public";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: publicEnv.siteUrl,
  title: "Yehia Alsaeed | Foundation Preview",
  description: "Foundation preview for Yehia Alsaeed's portfolio application.",
  robots: {
    follow: false,
    index: false,
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 3: Implement the intentionally minimal route**

Create `src/app/page.tsx`:

```tsx
export default function FoundationPage() {
  return (
    <main data-foundation-shell="true">
      <div>
        <p>Foundation preview</p>
        <h1>Yehia Alsaeed</h1>
      </div>
    </main>
  );
}
```

Create `src/app/globals.css`:

```css
@import "tailwindcss";

:root {
  color-scheme: light dark;
  font-family: Arial, Helvetica, sans-serif;
}

* {
  box-sizing: border-box;
}

html,
body {
  min-height: 100%;
}

body {
  margin: 0;
}

main[data-foundation-shell="true"] {
  display: grid;
  min-height: 100svh;
  place-items: center;
  padding: 24px;
}

main[data-foundation-shell="true"] > div {
  max-width: 720px;
  text-align: center;
}

h1,
p {
  margin: 0;
}

h1 {
  margin-top: 12px;
  font-size: clamp(2rem, 8vw, 5rem);
  letter-spacing: 0;
  line-height: 1;
}
```

This CSS is a disposable foundation shell, not the Phase 2 design system. Do not add colors, cards, gradients, animation, navigation, or prototype-derived styling.

- [ ] **Step 4: Verify static rendering and scope boundaries**

Run:

```powershell
pnpm test
pnpm lint
pnpm typecheck
pnpm build
rg -n '"use client"|mockups/' src
```

Expected: tests/lint/typecheck/build pass; the search returns no matches; build output lists `/` as a static route.

- [ ] **Step 5: Commit the shell**

```powershell
git add src/app tests/unit/foundation-page.test.tsx
git commit -m "feat: add minimal server-rendered foundation shell"
```

---

### Task 4: Establish Playwright, axe, and responsive acceptance tests

**Files:**
- Create: `playwright.config.ts`
- Create: `tests/e2e/fixtures.ts`
- Create: `tests/e2e/foundation.spec.ts`
- Create: `tests/e2e/accessibility.spec.ts`
- Create: `tests/e2e/responsive.spec.ts`

**Interfaces:**
- Consumes: local server by default or `PLAYWRIGHT_BASE_URL` for a deployed preview
- Produces: Chromium smoke, axe, reduced-motion, and six-width overflow gates

- [ ] **Step 1: Create environment-aware Playwright configuration**

Create `playwright.config.ts`:

```ts
import { defineConfig, devices } from "@playwright/test";

const externalBaseUrl = process.env.PLAYWRIGHT_BASE_URL;
const localBaseUrl = "http://127.0.0.1:3100";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["line"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: externalBaseUrl ?? localBaseUrl,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: externalBaseUrl
    ? undefined
    : {
        command: process.env.CI ? "pnpm start:test" : "pnpm dev:test",
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        url: localBaseUrl,
      },
});
```

- [ ] **Step 2: Create a shared WCAG A/AA axe fixture**

Create `tests/e2e/fixtures.ts`:

```ts
import AxeBuilder from "@axe-core/playwright";
import { test as base } from "@playwright/test";

type AxeFixture = {
  makeAxeBuilder: () => AxeBuilder;
};

export const test = base.extend<AxeFixture>({
  makeAxeBuilder: async ({ page }, use) => {
    await use(() =>
      new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]),
    );
  },
});

export { expect } from "@playwright/test";
```

- [ ] **Step 3: Add route and reduced-motion smoke tests**

Create `tests/e2e/foundation.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("renders the static foundation shell without browser errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  const response = await page.goto("/");

  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1, name: "Yehia Alsaeed" })).toBeVisible();
  await expect(page.locator("main[data-foundation-shell='true']")).toBeVisible();
  expect(errors).toEqual([]);
});

test("remains readable when reduced motion is requested", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
```

- [ ] **Step 4: Add accessibility and viewport tests**

Create `tests/e2e/accessibility.spec.ts`:

```ts
import { expect, test } from "./fixtures";

test("has no automated WCAG A or AA violations", async ({ page, makeAxeBuilder }) => {
  await page.goto("/");
  const result = await makeAxeBuilder().analyze();
  expect(result.violations).toEqual([]);
});
```

Create `tests/e2e/responsive.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

const viewports = [
  { name: "mobile-360", width: 360, height: 800 },
  { name: "mobile-390", width: 390, height: 844 },
  { name: "tablet-portrait", width: 768, height: 1024 },
  { name: "tablet-landscape", width: 1024, height: 768 },
  { name: "desktop", width: 1440, height: 1000 },
  { name: "wide-desktop", width: 1920, height: 1080 },
] as const;

for (const viewport of viewports) {
  test(`has no horizontal overflow at ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/");

    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));

    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
}
```

- [ ] **Step 5: Install Chromium and run the browser gate**

Run:

```powershell
pnpm exec playwright install chromium
pnpm build
pnpm playwright test
```

Expected: 10 Chromium tests pass with no retries required locally.

- [ ] **Step 6: Commit browser acceptance coverage**

```powershell
git add playwright.config.ts tests/e2e
git commit -m "test: add browser accessibility and viewport gates"
```

---

### Task 5: Add the GitHub Actions quality gate

**Files:**
- Create: `.github/workflows/quality.yml`

**Interfaces:**
- Consumes: exact pnpm lockfile and package scripts
- Produces: required pull-request and `main` status check named `quality`

- [ ] **Step 1: Create the least-privilege workflow**

Create `.github/workflows/quality.yml`:

```yaml
name: Quality

on:
  push:
    branches: [main]
  pull_request:

permissions:
  contents: read

concurrency:
  group: quality-${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  quality:
    name: quality
    runs-on: ubuntu-latest
    timeout-minutes: 20

    steps:
      - name: Check out repository
        uses: actions/checkout@v6

      - name: Install pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 11.13.1
          run_install: false

      - name: Set up Node.js
        uses: actions/setup-node@v6
        with:
          node-version: 24
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Check formatting
        run: pnpm format:check

      - name: Lint
        run: pnpm lint

      - name: Typecheck
        run: pnpm typecheck

      - name: Run unit tests
        run: pnpm test

      - name: Build production application
        run: pnpm build

      - name: Install Chromium
        run: pnpm exec playwright install --with-deps chromium

      - name: Run browser tests
        run: pnpm playwright test

      - name: Run Lighthouse baseline gate
        run: pnpm lighthouse
```

- [ ] **Step 2: Validate the workflow through local equivalents**

Run in this exact order:

```powershell
pnpm install --frozen-lockfile
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm playwright test
```

Expected: every command exits 0.

- [ ] **Step 3: Commit CI**

```powershell
git add .github/workflows/quality.yml
git commit -m "ci: enforce phase one quality gates"
```

---

### Task 6: Measure and record the initial build and Lighthouse baselines

**Files:**
- Create: `lighthouserc.cjs`
- Create: `scripts/measure-build.ts`
- Create: `scripts/measure-lighthouse.ts`
- Create: `tests/unit/measure-build.test.ts`
- Create: `tests/unit/measure-lighthouse.test.ts`
- Create: `docs/implementation/phase-1-build-baseline.json` (generated)
- Create: `docs/implementation/phase-1-lighthouse-baseline.json` (generated)

**Interfaces:**
- Produces: deterministic JSON with raw/gzip JavaScript totals and median Lighthouse values
- Consumes: `.next/static/chunks/**/*.js` and `.lighthouseci/lhr-*.json`

- [ ] **Step 1: Write failing tests for measurement functions**

Create `tests/unit/measure-build.test.ts`:

```ts
// @vitest-environment node

import { gzipSync } from "node:zlib";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { measureJavaScript } from "../../scripts/measure-build";

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) =>
      rm(directory, { force: true, recursive: true }),
    ),
  );
});

describe("measureJavaScript", () => {
  it("counts only JavaScript files and reports raw and gzip totals", async () => {
    const root = await mkdtemp(join(tmpdir(), "portfolio-build-metrics-"));
    temporaryDirectories.push(root);
    const nested = join(root, "nested");
    await mkdir(nested);

    const first = Buffer.from("console.log('first');");
    const second = Buffer.from("console.log('second');");
    await writeFile(join(root, "first.js"), first);
    await writeFile(join(nested, "second.js"), second);
    await writeFile(join(root, "styles.css"), "body {}");

    const result = await measureJavaScript(root);

    expect(result.fileCount).toBe(2);
    expect(result.totalBytes).toBe(first.byteLength + second.byteLength);
    expect(result.gzipBytes).toBe(
      gzipSync(first).byteLength + gzipSync(second).byteLength,
    );
    expect(result.files.map(({ file }) => file)).toEqual(["first.js", "nested/second.js"]);
  });
});
```

Create `tests/unit/measure-lighthouse.test.ts`:

```ts
// @vitest-environment node

import { describe, expect, it } from "vitest";

import {
  summarizeLighthouseRuns,
  type LighthouseRun,
} from "../../scripts/measure-lighthouse";

function run(
  performance: number,
  accessibility: number,
  bestPractices: number,
  seo: number,
  lcp: number,
  cls: number,
): LighthouseRun {
  return {
    categories: {
      accessibility: { score: accessibility },
      "best-practices": { score: bestPractices },
      performance: { score: performance },
      seo: { score: seo },
    },
    audits: {
      "cumulative-layout-shift": { numericValue: cls },
      "largest-contentful-paint": { numericValue: lcp },
    },
  };
}

describe("summarizeLighthouseRuns", () => {
  it("returns median category scores and metrics", () => {
    const result = summarizeLighthouseRuns([
      run(0.96, 0.97, 0.91, 1, 1800, 0.02),
      run(0.98, 0.99, 0.95, 1, 1500, 0.01),
      run(0.97, 0.98, 0.93, 1, 1600, 0.015),
    ]);

    expect(result).toEqual({
      runs: 3,
      scores: {
        performance: 97,
        accessibility: 98,
        bestPractices: 93,
        seo: 100,
      },
      metrics: {
        largestContentfulPaintMs: 1600,
        cumulativeLayoutShift: 0.015,
      },
    });
  });
});
```

Run `pnpm test`.

Expected: FAIL because both scripts are missing.

- [ ] **Step 2: Implement the build measurement script**

Create `scripts/measure-build.ts`:

```js
import { gzipSync } from "node:zlib";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";

type FileMeasurement = {
  file: string;
  gzipBytes: number;
  rawBytes: number;
};

export type BuildMeasurement = {
  fileCount: number;
  gzipBytes: number;
  scope: string;
  totalBytes: number;
  files: FileMeasurement[];
};

async function listJavaScriptFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await listJavaScriptFiles(path)));
    if (entry.isFile() && entry.name.endsWith(".js")) files.push(path);
  }

  return files.sort();
}

export async function measureJavaScript(chunksDirectory: string): Promise<BuildMeasurement> {
  const files = await listJavaScriptFiles(chunksDirectory);
  const measurements = await Promise.all(
    files.map(async (file) => {
      const content = await readFile(file);
      return {
        file: relative(chunksDirectory, file).replaceAll("\\", "/"),
        gzipBytes: gzipSync(content).byteLength,
        rawBytes: content.byteLength,
      };
    }),
  );

  return {
    fileCount: measurements.length,
    gzipBytes: measurements.reduce((sum, value) => sum + value.gzipBytes, 0),
    scope: ".next/static/chunks/**/*.js",
    totalBytes: measurements.reduce((sum, value) => sum + value.rawBytes, 0),
    files: measurements,
  };
}

async function main() {
  const output = resolve("docs/implementation/phase-1-build-baseline.json");
  const result = await measureJavaScript(resolve(".next/static/chunks"));
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(result, null, 2)}\n`);
  console.log(JSON.stringify(result));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
```

- [ ] **Step 3: Implement the Lighthouse collection and summary script**

Create `lighthouserc.cjs`:

```js
module.exports = {
  ci: {
    collect: {
      numberOfRuns: 3,
      startServerCommand: "pnpm start:test",
      startServerReadyPattern: "Ready in|Local:",
      url: ["http://127.0.0.1:3100/"],
    },
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: 0.95, aggregationMethod: "median-run" }],
        "categories:accessibility": ["error", { minScore: 0.95 }],
        "categories:best-practices": ["error", { minScore: 0.9 }],
        "categories:seo": ["error", { minScore: 1 }],
        "largest-contentful-paint": [
          "error",
          { maxNumericValue: 2500, aggregationMethod: "median" }
        ],
        "cumulative-layout-shift": [
          "error",
          { maxNumericValue: 0.1, aggregationMethod: "median" }
        ]
      }
    }
  }
};
```

Create `scripts/measure-lighthouse.ts`:

```js
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";

type LighthouseCategory = { score: number };
type LighthouseAudit = { numericValue: number };

export type LighthouseRun = {
  categories: Record<string, LighthouseCategory>;
  audits: Record<string, LighthouseAudit>;
};

type LighthouseSummary = {
  runs: number;
  scores: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
  };
  metrics: {
    largestContentfulPaintMs: number;
    cumulativeLayoutShift: number;
  };
};

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const value = sorted[Math.floor(sorted.length / 2)];
  if (value === undefined) throw new Error("Cannot calculate a median without values");
  return value;
}

export function summarizeLighthouseRuns(runs: LighthouseRun[]): LighthouseSummary {
  if (runs.length === 0) throw new Error("At least one Lighthouse run is required");

  const category = (name: string): number =>
    median(
      runs.map((run) => {
        const value = run.categories[name];
        if (!value) throw new Error(`Missing Lighthouse category: ${name}`);
        return value.score * 100;
      }),
    );
  const audit = (name: string): number =>
    median(
      runs.map((run) => {
        const value = run.audits[name];
        if (!value) throw new Error(`Missing Lighthouse audit: ${name}`);
        return value.numericValue;
      }),
    );

  return {
    runs: runs.length,
    scores: {
      performance: category("performance"),
      accessibility: category("accessibility"),
      bestPractices: category("best-practices"),
      seo: category("seo"),
    },
    metrics: {
      largestContentfulPaintMs: audit("largest-contentful-paint"),
      cumulativeLayoutShift: audit("cumulative-layout-shift"),
    },
  };
}

async function main() {
  const reportDirectory = resolve(".lighthouseci");
  const files = (await readdir(reportDirectory))
    .filter((file) => file.startsWith("lhr-") && file.endsWith(".json"))
    .sort();
  const runs = await Promise.all(
    files.map(
      async (file) =>
        JSON.parse(await readFile(resolve(reportDirectory, file), "utf8")) as LighthouseRun,
    ),
  );

  if (runs.length !== 3) throw new Error(`Expected 3 Lighthouse runs, received ${runs.length}`);

  const output = resolve("docs/implementation/phase-1-lighthouse-baseline.json");
  const result = summarizeLighthouseRuns(runs);
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(result, null, 2)}\n`);
  console.log(JSON.stringify(result));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
```

- [ ] **Step 4: Pass the typed measurement tests**

Run:

```powershell
pnpm test
```

Expected: all unit tests pass, including exact raw-byte sums and median selection.

- [ ] **Step 5: Generate and validate both tracked baselines**

Run:

```powershell
pnpm build
pnpm measure:build
pnpm lighthouse
Get-Content docs/implementation/phase-1-build-baseline.json
Get-Content docs/implementation/phase-1-lighthouse-baseline.json
```

Expected: both JSON files contain numeric values; Lighthouse meets every Global Constraint threshold; no `.next` or `.lighthouseci` output is staged.

- [ ] **Step 6: Commit performance tooling and evidence**

```powershell
git add lighthouserc.cjs scripts tests/unit/measure-build.test.ts tests/unit/measure-lighthouse.test.ts docs/implementation/phase-1-build-baseline.json docs/implementation/phase-1-lighthouse-baseline.json
git commit -m "perf: record phase one quality baselines"
```

---

### Task 7: Publish and verify the Phase 1 preview handoff

**Files:**
- Create: `docs/implementation/phase-1-report.md`
- Local only, never commit: `.vercel/`, `.tmp/vercel-preview.txt`

**Interfaces:**
- Consumes: GitHub repository, passing feature branch, Vercel CLI session
- Produces: connected Vercel project, preview URL, passing remote browser smoke, passing GitHub Actions, and Phase 2 authorization evidence

- [ ] **Step 1: Run the complete clean-checkout gate**

Run:

```powershell
pnpm install --frozen-lockfile
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

Expected: every command exits 0; only the generated baseline updates, if any, are visible and they must be reviewed before recommitting.

- [ ] **Step 2: Verify Vercel identity and link the project**

Run:

```powershell
pnpm dlx vercel@56.3.1 whoami
pnpm dlx vercel@56.3.1 link --yes --project portfolio-website
git check-ignore .vercel/project.json
```

Expected: the intended Vercel account is shown, linking succeeds, and `.vercel/project.json` is ignored.

- [ ] **Step 3: Connect the GitHub repository**

Run:

```powershell
pnpm dlx vercel@56.3.1 git connect https://github.com/Yehia-Alsaeed/portfolio-website
```

Expected: Vercel confirms the current project is connected to `Yehia-Alsaeed/portfolio-website`.

- [ ] **Step 4: Push the feature branch and open a draft pull request**

Run:

```powershell
git push -u origin phase-1-foundation
gh pr create --draft --base main --head phase-1-foundation --title "Phase 1: production foundation and preview" --body "Implements the approved Phase 1 foundation plan. No production pages or provider-backed application features are included."
gh pr checks --watch
```

Expected: the `quality` check passes and Vercel exposes a preview deployment for the pull request.

- [ ] **Step 5: Resolve and smoke-test the preview URL**

If the Git-connected preview URL is not printed by `gh pr checks`, create one explicitly and save the complete output:

```powershell
New-Item -ItemType Directory -Force .tmp | Out-Null
pnpm dlx vercel@56.3.1 deploy --yes --no-color 2>&1 | Tee-Object .tmp/vercel-preview.txt
```

Extract the final `https://*.vercel.app` URL from the output and set it for browser verification:

```powershell
$previewUrl = ((Get-Content .tmp/vercel-preview.txt | Select-String 'https://[^ ]+\.vercel\.app' -AllMatches).Matches.Value | Select-Object -Last 1)
if (-not $previewUrl) { throw 'No Vercel preview URL found' }
$env:PLAYWRIGHT_BASE_URL = $previewUrl
pnpm playwright test
pnpm dlx vercel@56.3.1 inspect $previewUrl
Remove-Item Env:PLAYWRIGHT_BASE_URL
```

Expected: the URL is HTTPS, deployment state is `READY`, and all browser tests pass against the deployed preview.

- [ ] **Step 6: Create the Phase 1 report with real evidence**

Create `docs/implementation/phase-1-report.md` with these sections and actual values from the completed commands:

```markdown
# Phase 1 Foundation Report

## Scope Result

- Foundation status: Complete
- Production pages implemented: No
- Provider-backed application features provisioned: No

## Runtime

- Node.js: 24 LTS
- pnpm: 11.13.1
- Next.js: 16.2.10
- React: 19.2.7

## Verification

- `pnpm format:check`: pass
- `pnpm lint`: pass
- `pnpm typecheck`: pass
- `pnpm test`: pass
- `pnpm build`: pass
- `pnpm playwright test`: pass locally and against preview
- Lighthouse thresholds: pass
- Six-width overflow matrix: pass

## Delivery

- GitHub pull request: record the actual pull-request URL
- Vercel preview: record the actual HTTPS preview URL
- GitHub `quality` check: pass
- Vercel deployment state: READY

## Baselines

- Build metrics: `docs/implementation/phase-1-build-baseline.json`
- Lighthouse metrics: `docs/implementation/phase-1-lighthouse-baseline.json`

## Phase 2 Readiness

Approved to write the Phase 2 design-system and responsive-shell implementation plan after this pull request is reviewed and merged.
```

Replace the two "record the actual" sentences with real Markdown links before committing. Do not commit an unavailable or guessed URL.

- [ ] **Step 7: Commit the evidence and rerun final checks**

```powershell
git add docs/implementation/phase-1-report.md docs/implementation/phase-1-build-baseline.json docs/implementation/phase-1-lighthouse-baseline.json
git commit -m "docs: record phase one preview verification"
git push
gh pr checks --watch
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm playwright test
git status --short --branch
```

Expected: all checks pass, the branch tracks `origin/phase-1-foundation`, and tracked status is clean.

- [ ] **Step 8: Stop for review; do not merge automatically**

Claude Code must report:

```text
Pull request URL
Vercel preview URL
Final commit SHA
Unit test count
Playwright test count
Lighthouse scores and LCP/CLS
Build raw/gzip JavaScript totals
Any non-blocking warning
```

The user must review the preview before Claude Code marks the pull request ready or merges it. After approval, use `superpowers:finishing-a-development-branch`; do not invent a separate integration workflow.

---

## Phase 1 Completion Gate

Phase 1 is complete only when all seven task commits exist, the draft pull request is current, GitHub Actions passes, a Vercel preview is `READY`, the preview passes Playwright, both tracked baseline JSON files contain real measurements, and the repository contains no production page implementation or Phase 2+ service code.

## Final Claude Code Audit

Before handing the preview to the user, Claude Code must run and inspect all of the following:

```powershell
rg -n '"use client"|mockups/' src
rg -n 'drizzle|neon|cloudinary|resend|recharts|react-flow' package.json src
git ls-files .env .env.local .vercel .next .lighthouseci .tmp
git diff main...HEAD --stat
git log --oneline main..HEAD
```

Expected:

- The first two searches return no matches.
- The ignored-provider/output file query returns no tracked files.
- The diff contains only Phase 1 foundation, tooling, tests, CI, measurements, and report files.
- The log contains the seven scoped commits from this plan.

## Official References

- Next.js installation and Node requirements: `https://nextjs.org/docs/app/getting-started/installation`
- Next.js 16 upgrade/runtime behavior: `https://nextjs.org/docs/app/guides/upgrading/version-16`
- shadcn/ui installation and CLI: `https://ui.shadcn.com/docs/installation` and `https://ui.shadcn.com/docs/cli`
- Playwright web server: `https://playwright.dev/docs/test-webserver`
- Playwright axe testing: `https://playwright.dev/docs/accessibility-testing`
- Lighthouse CI configuration: `https://github.com/GoogleChrome/lighthouse-ci/blob/main/docs/configuration.md`
- Vercel CLI: `https://vercel.com/docs/cli`
- Vercel Git deployments: `https://vercel.com/docs/git`
- GitHub Node.js CI: `https://docs.github.com/en/actions/tutorials/build-and-test-code/nodejs`
