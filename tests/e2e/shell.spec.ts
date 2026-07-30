import { expect, test, type Page } from "@playwright/test";

const ROUTES = [
  { heading: "Yehia Alsaeed", path: "/" },
  { heading: "Projects", path: "/projects" },
  { heading: "I build stores & software that ship.", path: "/services" },
] as const;

// Vercel injects its own live-feedback/comments toolbar script
// (vercel.live/_next-live/feedback/feedback.js) only on Preview
// deployments - never in Production - and this app's CSP correctly blocks
// it since it's not a first-party script. That's the CSP working as
// designed, not a real app bug, so it's excluded here rather than making
// this assertion permanently unpassable on Preview.
function isKnownPreviewOnlyNoise(message: string): boolean {
  return message.includes("vercel.live");
}

function collectBrowserErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error" && !isKnownPreviewOnlyNoise(message.text())) {
      errors.push(message.text());
    }
  });
  page.on("pageerror", (error) => {
    if (!isKnownPreviewOnlyNoise(error.message)) errors.push(error.message);
  });
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
  await expect(
    page.getByRole("heading", { level: 1, name: "I build stores & software that ship." }),
  ).toBeVisible();

  await page
    .getByRole("navigation", { name: "Primary" })
    .getByRole("link", { name: "Contact" })
    .click();
  await expect(page).toHaveURL(/\/#contact$/);
  // Checks the contact section itself, not the footer below it: on a short
  // mobile viewport the contact form alone is taller than the viewport, so
  // the footer legitimately scrolls out of view even on a correct jump.
  await expect(page.getByRole("heading", { level: 2, name: "Contact" })).toBeInViewport();

  await page
    .getByRole("navigation", { name: "Primary" })
    .getByRole("link", { name: "Home" })
    .click();
  await expect(page.getByRole("heading", { level: 1, name: "Yehia Alsaeed" })).toBeVisible();
});

test("a second nav click is not overridden by the previous one's transition", async ({ page }) => {
  await page.goto("/");

  // The route transition schedules a fallback that force-navigates if its own
  // push has not landed yet. Nav links are Next `<Link>`s, so a route change
  // neither unmounts the transition nor fires `popstate`, and that fallback
  // used to survive into the next route - clicking a second nav item inside
  // the fallback window sent the visitor back to the first destination via a
  // full page load. Clicking straight through without waiting is the case
  // that reproduced it.
  const nav = page.getByRole("navigation", { name: "Primary" });
  await nav.getByRole("link", { name: "Services" }).click();
  await nav.getByRole("link", { name: "Contact" }).click();

  await expect(page).toHaveURL(/\/#contact$/);
  await expect(page.getByRole("heading", { level: 2, name: "Contact" })).toBeVisible();

  // Outlast the fallback window and confirm nothing drags the page back.
  await page.waitForTimeout(1200);
  await expect(page).toHaveURL(/\/#contact$/);
});

test("remains readable when reduced motion is requested", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
