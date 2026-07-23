import { defineConfig, devices } from "@playwright/test";

const externalBaseUrl = process.env.PLAYWRIGHT_BASE_URL;
const localBaseUrl = "http://localhost:3100";
const bypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET?.trim() || undefined;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["line"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: externalBaseUrl ?? localBaseUrl,
    screenshot: "only-on-failure",
    // The bypass secret must never enter a trace artifact, so tracing is
    // forced off whenever it is present rather than merely defaulting.
    trace: bypassSecret ? "off" : "retain-on-failure",
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
