import { expect, test } from "./fixtures";

const ROUTES = ["/", "/projects", "/services", "/design-system", "/missing-phase-2-route"] as const;
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
