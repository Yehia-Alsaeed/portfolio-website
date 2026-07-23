import { expect, test } from "./fixtures";

const ROUTES = [
  "/",
  "/projects",
  "/projects/skillbridge-ai-interviewer",
  "/services",
  "/design-system",
  "/missing-phase-2-route",
] as const;
const MODES = ["paper", "night", "mono"] as const;

for (const mode of MODES) {
  for (const route of ROUTES) {
    test(`has no WCAG A or AA violations at ${route} in ${mode} mode`, async ({
      page,
      makeAxeBuilder,
    }) => {
      await page.addInitScript((storedMode) => {
        localStorage.setItem("ya-display-mode:v1", storedMode);
      }, mode);

      await page.goto(route);
      await expect(page.locator("html")).toHaveAttribute("data-mode", mode);

      const result = await makeAxeBuilder().analyze();
      expect(result.violations).toEqual([]);
    });
  }
}

test("honors reduced motion while staying fully usable", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const { bodyTransition, scrollBehavior } = await page.evaluate(() => ({
    bodyTransition: getComputedStyle(document.body).transitionDuration,
    scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
  }));
  expect(scrollBehavior).toBe("auto");
  // transition-duration expands to one value per transition property, and
  // Chrome may serialize 0.01ms in scientific notation ("1e-05s").
  for (const duration of bodyTransition.split(",")) {
    const value = duration.trim();
    const milliseconds = value.endsWith("ms")
      ? Number.parseFloat(value)
      : Number.parseFloat(value) * 1000;
    expect(milliseconds).toBeLessThanOrEqual(10);
  }

  await page.getByRole("button", { name: "Night display mode" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-mode", "night");

  await page
    .getByRole("navigation", { name: "Primary" })
    .getByRole("link", { name: "Projects" })
    .click();
  await expect(page.getByRole("heading", { level: 1, name: "Projects" })).toBeVisible();
});

test("has no WCAG A or AA violations in the contact form's invalid state", async ({
  page,
  makeAxeBuilder,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Complete every field" })).toBeVisible();

  const result = await makeAxeBuilder().analyze();
  expect(result.violations).toEqual([]);
});

test("has no WCAG A or AA violations in the contact form's unavailable state", async ({
  page,
  makeAxeBuilder,
}) => {
  test.skip(
    process.env.PLAYWRIGHT_PHASE6_LIVE === "1",
    "The unavailable state cannot occur against a live, working preview database.",
  );
  await page.goto("/");
  await page.getByLabel("Inquiry type").selectOption("Freelance project");
  await page.getByLabel("Name", { exact: true }).fill("Ada Lovelace");
  await page.getByLabel("Email", { exact: true }).fill("ada@example.com");
  await page.getByLabel("Message", { exact: true }).fill("Hello there");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "could not be saved" })).toBeVisible();

  const result = await makeAxeBuilder().analyze();
  expect(result.violations).toEqual([]);
});

test("has no WCAG A or AA violations in the contact form's success state", async ({
  page,
  makeAxeBuilder,
}) => {
  test.skip(
    process.env.PLAYWRIGHT_PHASE6_LIVE !== "1",
    "The success state requires a real Neon-backed preview deployment.",
  );
  await page.goto("/");
  await page.getByLabel("Inquiry type").selectOption("Freelance project");
  await page.getByLabel("Name", { exact: true }).fill("Ada Lovelace");
  await page.getByLabel("Email", { exact: true }).fill("ada@example.com");
  await page.getByLabel("Message", { exact: true }).fill("Hello there, live preview axe check.");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Message saved" })).toBeVisible();

  const result = await makeAxeBuilder().analyze();
  expect(result.violations).toEqual([]);
});

// axe's wcag2a/wcag2aa tags do not include the heading-order best-practice
// rule, so the shared catalogue/case-study template gets an explicit check.
for (const route of ["/projects", "/projects/skillbridge-ai-interviewer"] as const) {
  test(`never skips a heading level at ${route}`, async ({ page }) => {
    await page.goto(route);

    const levels = await page
      .locator("h1, h2, h3, h4, h5, h6")
      .evaluateAll((headings) => headings.map((heading) => Number(heading.tagName.slice(1))));

    expect(levels[0]).toBe(1);
    let maxSeen = levels[0] ?? 1;
    for (const level of levels) {
      expect(level, `heading levels so far: ${levels.join(", ")}`).toBeLessThanOrEqual(maxSeen + 1);
      maxSeen = Math.max(maxSeen, level);
    }
  });
}
