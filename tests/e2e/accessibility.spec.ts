import { expect, test } from "./fixtures";

test("has no automated WCAG A or AA violations", async ({ page, makeAxeBuilder }) => {
  await page.goto("/");
  const result = await makeAxeBuilder().analyze();
  expect(result.violations).toEqual([]);
});
