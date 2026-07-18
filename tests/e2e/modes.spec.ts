import { expect, test } from "@playwright/test";

const STORAGE_KEY = "ya-display-mode:v1";

test("an explicit Night choice is applied before hydration on reload", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Night display mode" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-mode", "night");
  expect(await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY)).toBe("night");

  await page.reload();

  await expect(page.locator("html")).toHaveAttribute("data-mode", "night");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("button", { name: "Night display mode" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});

test("the chosen mode persists across client-side navigation", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Night display mode" }).click();

  await page
    .getByRole("navigation", { name: "Primary" })
    .getByRole("link", { name: "Projects" })
    .click();

  await expect(page).toHaveURL(/\/projects$/);
  await expect(page.locator("html")).toHaveAttribute("data-mode", "night");
});

test("Mono mode maps the accent token onto ink", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Mono display mode" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-mode", "mono");

  const { accent, ink } = await page.evaluate(() => {
    const styles = getComputedStyle(document.documentElement);
    return {
      accent: styles.getPropertyValue("--accent").trim(),
      ink: styles.getPropertyValue("--ink").trim(),
    };
  });

  expect(accent).toBe(ink);
});

test("invalid stored values fall back to Paper without throwing", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript((key) => {
    localStorage.setItem(key, "not-a-real-mode");
  }, STORAGE_KEY);

  await page.goto("/");

  await expect(page.locator("html")).toHaveAttribute("data-mode", "paper");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  expect(errors).toEqual([]);
});

test("controls still change the visible mode when localStorage is blocked", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new Error("localStorage is blocked");
      },
    });
  });

  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-mode", "paper");

  await page.getByRole("button", { name: "Night display mode" }).click();

  await expect(page.locator("html")).toHaveAttribute("data-mode", "night");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  expect(errors).toEqual([]);
});
