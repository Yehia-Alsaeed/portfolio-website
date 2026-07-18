import { expect, test } from "@playwright/test";

const SECTION_HEADINGS = [
  "Typography",
  "Actions",
  "Form controls",
  "Metadata",
  "Statistics",
  "Project rows",
  "Page title",
  "Display modes",
];

test("design system gallery renders every review section without errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  const response = await page.goto("/design-system");

  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1, name: "Design system" })).toBeVisible();
  for (const heading of SECTION_HEADINGS) {
    await expect(page.getByRole("heading", { level: 2, name: heading })).toBeVisible();
  }
  expect(errors).toEqual([]);
});

test("every interactive specimen is keyboard reachable and focusable", async ({ page }) => {
  await page.goto("/design-system");

  const controls = [
    page.getByRole("button", { name: "Primary action" }),
    page.getByRole("button", { name: "Outline action" }),
    page.getByRole("button", { name: "Quiet action" }),
    page.getByLabel("Name"),
    page.getByLabel("Email"),
    page.getByLabel("Inquiry type"),
    page.getByLabel("Message"),
    page.getByRole("button", { name: "Paper display mode" }).last(),
    page.getByRole("link", { name: /Example system/ }),
  ];

  for (const control of controls) {
    await control.focus();
    await expect(control).toBeFocused();
    const keyboardReachable = await control.evaluate(
      (element) => (element as HTMLElement).tabIndex >= 0,
    );
    expect(keyboardReachable).toBe(true);
  }
});
