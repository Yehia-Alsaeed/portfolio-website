import { expect, test, type Page } from "@playwright/test";

const ROUTES = [
  { heading: "Yehia Alsaeed", path: "/" },
  { heading: "Projects", path: "/projects" },
  { heading: "Services", path: "/services" },
  { heading: "Design system", path: "/design-system" },
] as const;

function collectBrowserErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

for (const route of ROUTES) {
  test(`renders the final shell at ${route.path} without browser errors`, async ({ page }) => {
    const errors = collectBrowserErrors(page);

    const response = await page.goto(route.path);

    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1, name: route.heading })).toBeVisible();
    expect(await page.locator("h1").count()).toBe(1);
    await expect(page.getByRole("banner")).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
    await expect(page.locator("main#main-content")).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();
    await expect(page.getByRole("link", { name: "Yehia Alsaeed home" })).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test("serves the branded 404 inside the shell for missing paths", async ({ page }) => {
  const errors = collectBrowserErrors(page);

  const response = await page.goto("/missing-phase-2-route");

  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1, name: "404" })).toBeVisible();
  expect(await page.locator("h1").count()).toBe(1);
  await expect(page.getByText("Page not found")).toBeVisible();
  await expect(page.getByRole("banner")).toBeVisible();
  await expect(page.getByRole("contentinfo")).toBeVisible();
  await expect(page.locator("main").getByRole("link", { name: "Home" })).toBeVisible();
  // The document request itself is expected to 404; Chrome logs that status
  // as a console error even though the page renders correctly.
  expect(errors.filter((error) => !error.includes("status of 404"))).toEqual([]);
});

test("skip link is the first tab stop and moves focus to main content", async ({ page }) => {
  await page.goto("/");

  await page.keyboard.press("Tab");
  const skipLink = page.getByRole("link", { name: "Skip to content" });
  await expect(skipLink).toBeFocused();

  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main-content$/);
  await expect(page.locator("main#main-content")).toBeFocused();
});

test("primary navigation reaches every route frame", async ({ page }) => {
  await page.goto("/");

  await page
    .getByRole("navigation", { name: "Primary" })
    .getByRole("link", { name: "Projects" })
    .click();
  await expect(page).toHaveURL(/\/projects$/);
  await expect(page.getByRole("heading", { level: 1, name: "Projects" })).toBeVisible();

  await page
    .getByRole("navigation", { name: "Primary" })
    .getByRole("link", { name: "Services" })
    .click();
  await expect(page).toHaveURL(/\/services$/);
  await expect(page.getByRole("heading", { level: 1, name: "Services" })).toBeVisible();

  await page
    .getByRole("navigation", { name: "Primary" })
    .getByRole("link", { name: "Contact" })
    .click();
  await expect(page).toHaveURL(/\/#contact$/);
  await expect(page.getByRole("contentinfo")).toBeInViewport();

  await page
    .getByRole("navigation", { name: "Primary" })
    .getByRole("link", { name: "Home" })
    .click();
  await expect(page.getByRole("heading", { level: 1, name: "Yehia Alsaeed" })).toBeVisible();
});

test("remains readable when reduced motion is requested", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
