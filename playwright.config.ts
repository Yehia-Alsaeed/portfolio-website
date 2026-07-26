import { defineConfig, devices } from "@playwright/test";

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
