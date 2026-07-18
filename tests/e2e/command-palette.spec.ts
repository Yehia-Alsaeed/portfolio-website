import { expect, test } from "@playwright/test";

test("opens from the header trigger with a focused search input", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Open command palette" }).click();

  await expect(page.getByRole("dialog", { name: "Command palette" })).toBeVisible();
  await expect(page.getByRole("combobox", { name: "Search commands" })).toBeFocused();
});

test("opens with Control+K and with Meta+K", async ({ page }) => {
  await page.goto("/");

  await page.keyboard.press("Control+KeyK");
  await expect(page.getByRole("dialog", { name: "Command palette" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);

  await page.keyboard.press("Meta+KeyK");
  await expect(page.getByRole("dialog", { name: "Command palette" })).toBeVisible();
});

test("filters commands by search text", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Control+KeyK");

  await page.getByRole("combobox", { name: "Search commands" }).fill("night");

  await expect(page.getByRole("option", { name: "Use Night mode" })).toBeVisible();
  expect(await page.getByRole("option").count()).toBe(1);
});

test("navigates with arrow keys and Enter", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Control+KeyK");
  await expect(page.getByRole("dialog")).toBeVisible();

  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");

  await expect(page).toHaveURL(/\/projects$/);
  await expect(page.getByRole("heading", { level: 1, name: "Projects" })).toBeVisible();
});

test("closes with Escape and restores focus to the trigger", async ({ page }) => {
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "Open command palette" });
  await trigger.click();
  await expect(page.getByRole("dialog")).toBeVisible();

  await page.keyboard.press("Escape");

  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test("runs a display-mode command", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Control+KeyK");

  await page.getByRole("option", { name: "Use Mono mode" }).click();

  await expect(page.locator("html")).toHaveAttribute("data-mode", "mono");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("does not intercept Ctrl+K while typing in gallery form fields", async ({ page }) => {
  await page.goto("/design-system");

  await page.getByLabel("Name").click();
  await page.keyboard.press("Control+KeyK");
  await expect(page.getByRole("dialog")).toHaveCount(0);

  await page.getByLabel("Message").click();
  await page.keyboard.press("Control+KeyK");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
