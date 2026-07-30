import { defineConfig, devices } from "@playwright/test";

// The full suite runs on Chromium. Firefox, desktop WebKit, and iPhone-style
// WebKit run only this focused subset - one representative file per area the
// design calls out (navigation, metadata, download, contact, proof
// interaction, responsive, reduced motion, accessibility smoke) - rather than
// re-running Chromium-specific verification techniques (CSP header parsing,
// OG image byte content, the Event Timing API, zoom-simulation math) that
// don't vary by rendering engine.
const crossBrowserFocusedTests = [
  "shell.spec.ts",
  "homepage.spec.ts",
  "projects.spec.ts",
  "services.spec.ts",
  "case-studies.spec.ts",
  "cv-download.spec.ts",
  "phase-5-proof.spec.ts",
  "phase-6.spec.ts",
  "responsive.spec.ts",
  "accessibility.spec.ts",
];

const externalBaseUrl = process.env.PLAYWRIGHT_BASE_URL;
const localBaseUrl = "http://localhost:3100";
const bypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET?.trim() || undefined;
const hasLiveSecret = Boolean(
  bypassSecret ||
  process.env.PLAYWRIGHT_ADMIN_EMAIL?.trim() ||
  process.env.PLAYWRIGHT_ADMIN_PASSWORD?.trim(),
);

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["line"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: externalBaseUrl ?? localBaseUrl,
    screenshot: hasLiveSecret ? "off" : "only-on-failure",
    trace: hasLiveSecret ? "off" : "retain-on-failure",
    video: hasLiveSecret ? "off" : "retain-on-failure",
    ...(bypassSecret
      ? {
          extraHTTPHeaders: {
            "x-vercel-protection-bypass": bypassSecret,
            "x-vercel-set-bypass-cookie": "true",
          },
        }
      : {}),
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      testMatch: crossBrowserFocusedTests,
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      testMatch: crossBrowserFocusedTests,
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "webkit-iphone",
      testMatch: crossBrowserFocusedTests,
      use: { ...devices["iPhone 14"] },
    },
  ],
  ...(externalBaseUrl
    ? {}
    : {
        webServer: {
          command: process.env.CI ? "pnpm start:test" : "pnpm dev:test",
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
          url: localBaseUrl,
        },
      }),
});
