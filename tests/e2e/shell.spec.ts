import { expect, test } from "@playwright/test";

test("renders the static foundation shell without browser errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  const response = await page.goto("/");

  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1, name: "Yehia Alsaeed" })).toBeVisible();
  await expect(page.locator("main[data-foundation-shell='true']")).toBeVisible();
  expect(errors).toEqual([]);
});

test("remains readable when reduced motion is requested", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
