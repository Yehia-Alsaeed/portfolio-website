import { expect, test, type Page } from "@playwright/test";

// Vercel injects its own live-feedback/comments toolbar script
// (vercel.live/_next-live/feedback/feedback.js) only on Preview
// deployments - never in Production - and this CSP correctly blocks it
// since it's not a first-party script. That's the CSP working as designed
// against a script this app never asked for, not a real app violation, so
// it's excluded here rather than making this assertion permanently
// unpassable on Preview.
function isKnownPreviewOnlyNoise(message: string): boolean {
  return message.includes("vercel.live");
}

function collectCspViolations(page: Page): string[] {
  const violations: string[] = [];
  page.on("console", (message) => {
    if (
      message.type() === "error" &&
      /content security policy|csp/i.test(message.text()) &&
      !isKnownPreviewOnlyNoise(message.text())
    ) {
      violations.push(message.text());
    }
  });
  page.on("pageerror", (error) => {
    if (
      /content security policy|csp/i.test(error.message) &&
      !isKnownPreviewOnlyNoise(error.message)
    ) {
      violations.push(error.message);
    }
  });
  return violations;
}

const ROUTES = ["/", "/projects", "/projects/skillbridge-ai-interviewer", "/services"] as const;

for (const route of ROUTES) {
  test(`reports no CSP violations at ${route}`, async ({ page }) => {
    const violations = collectCspViolations(page);
    await page.goto(route);
    await page.waitForLoadState("networkidle");

    expect(violations).toEqual([]);
  });
}

test("reports no CSP violations with the command palette open", async ({ page }) => {
  const violations = collectCspViolations(page);
  await page.goto("/");

  await page.keyboard.press("Control+KeyK");
  await expect(page.getByRole("dialog")).toBeVisible();

  expect(violations).toEqual([]);
});

test("reports no CSP violations on /admin/login", async ({ page }) => {
  const violations = collectCspViolations(page);
  await page.goto("/admin/login");
  await expect(page.getByRole("heading", { level: 1, name: "Admin login" })).toBeVisible();

  expect(violations).toEqual([]);
});

test("response enforces the CSP with the expected directives", async ({ request }) => {
  const response = await request.get("/");
  const csp = response.headers()["content-security-policy"];

  expect(csp).toBeTruthy();
  expect(response.headers()["content-security-policy-report-only"]).toBeUndefined();
  expect(csp).toContain("default-src 'self'");
  expect(csp).toContain("object-src 'none'");
  expect(csp).toContain("frame-ancestors 'none'");
});
