import { expect, test } from "@playwright/test";

const VIEWPORTS = [
  { height: 800, name: "mobile-360", width: 360 },
  { height: 844, name: "mobile-390", width: 390 },
  { height: 1024, name: "tablet-portrait", width: 768 },
  { height: 768, name: "tablet-landscape", width: 1024 },
  { height: 1000, name: "desktop", width: 1440 },
  { height: 1080, name: "wide-desktop", width: 1920 },
] as const;

const ROUTES = [
  "/",
  "/projects",
  "/projects/skillbridge-ai-interviewer",
  "/projects/prestige-motors-showroom",
  "/design-system",
  "/missing-phase-2-route",
] as const;

for (const viewport of VIEWPORTS) {
  for (const route of ROUTES) {
    test(`stays inside the ${viewport.name} viewport at ${route}`, async ({ page }) => {
      await page.setViewportSize({ height: viewport.height, width: viewport.width });
      await page.goto(route);

      const dimensions = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
      }));
      expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);

      const escapees = await page.evaluate(() => {
        const viewportWidth = document.documentElement.clientWidth;
        return Array.from(document.body.querySelectorAll("*"))
          .filter((element) => {
            const rect = element.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) return false;
            return rect.left < -1 || rect.right > viewportWidth + 1;
          })
          .map((element) => `${element.tagName}.${element.className}`)
          .slice(0, 5);
      });
      expect(escapees).toEqual([]);

      await expect(page.getByRole("link", { name: "Yehia Alsaeed home" })).toBeVisible();
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
      await expect(page.getByRole("contentinfo")).toBeVisible();

      if (route === "/") {
        await expect(page.locator("#work")).toBeVisible();
        await expect(page.locator("#experience")).toBeVisible();
        await expect(page.locator("#services")).toBeVisible();
        await expect(page.locator("main #contact")).toBeVisible();
        const emailBox = await page
          .getByRole("link", { name: /yehias3eed11@gmail.com/ })
          .first()
          .boundingBox();
        expect(emailBox).not.toBeNull();
        if (emailBox) expect(emailBox.x + emailBox.width).toBeLessThanOrEqual(viewport.width + 1);
      }

      const shortButtons = await page.evaluate(() => {
        return Array.from(document.querySelectorAll("button"))
          .filter((button) => {
            const rect = button.getBoundingClientRect();
            return rect.height > 0 && rect.height < 44;
          })
          .map((button) => button.textContent?.trim() ?? button.getAttribute("aria-label") ?? "?");
      });
      expect(shortButtons).toEqual([]);
    });
  }

  test(`keeps the open command palette inside the ${viewport.name} viewport`, async ({ page }) => {
    await page.setViewportSize({ height: viewport.height, width: viewport.width });
    await page.goto("/");

    await page.getByRole("button", { name: "Open command palette" }).click();
    const dialog = page.getByRole("dialog", { name: "Command palette" });
    await expect(dialog).toBeVisible();

    const box = await dialog.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.x).toBeGreaterThanOrEqual(-1);
      expect(box.y).toBeGreaterThanOrEqual(-1);
      expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 1);
      expect(box.y + box.height).toBeLessThanOrEqual(viewport.height + 1);
    }
  });
}

const MODE_SWEEP_ROUTES = [
  "/",
  "/projects",
  "/projects/skillbridge-ai-interviewer",
  "/projects/prestige-motors-showroom",
] as const;
const MODE_SWEEP_WIDTHS = [
  { height: 844, width: 390 },
  { height: 1024, width: 768 },
  { height: 1000, width: 1440 },
  { height: 1080, width: 1920 },
] as const;

for (const route of MODE_SWEEP_ROUTES) {
  for (const viewport of MODE_SWEEP_WIDTHS) {
    for (const mode of ["paper", "night", "mono"] as const) {
      test(`contains ${route} in ${mode} mode at ${viewport.width}px`, async ({ page }) => {
        await page.setViewportSize(viewport);
        await page.addInitScript((storedMode) => {
          localStorage.setItem("ya-display-mode:v1", storedMode);
        }, mode);
        await page.goto(route);

        await expect(page.locator("html")).toHaveAttribute("data-mode", mode);
        const widths = await page.evaluate(() => ({
          client: document.documentElement.clientWidth,
          scroll: document.documentElement.scrollWidth,
        }));
        expect(widths.scroll).toBeLessThanOrEqual(widths.client);
      });
    }
  }
}
