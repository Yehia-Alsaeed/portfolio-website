import { expect, test } from "@playwright/test";

const ROUTES = ["/", "/projects", "/projects/skillbridge-ai-interviewer", "/services"] as const;

// WCAG 2.2 SC 1.4.10 Reflow: content must remain usable without horizontal
// scrolling at 400 CSS-px equivalent width. Testing 200% browser zoom on a
// 1280px desktop viewport is equivalent to reflow at 640 CSS px - halving
// the viewport is the standard, unambiguous way to verify this (the
// non-standard CSS `zoom` property was tried first here and rejected: it
// mixes pre- and post-zoom pixel units across different DOM properties in
// Chromium, producing a false-positive "overflow" that direct element
// inspection could not reproduce or attribute to any real element).
for (const route of ROUTES) {
  test(`reflows without horizontal scrolling at 200%-zoom-equivalent width on ${route}`, async ({
    page,
  }) => {
    await page.setViewportSize({ height: 900, width: 640 });
    await page.goto(route);

    const widths = await page.evaluate(() => ({
      client: document.documentElement.clientWidth,
      scroll: document.documentElement.scrollWidth,
    }));
    expect(widths.scroll).toBeLessThanOrEqual(widths.client + 1);

    await expect(page.getByRole("banner")).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();
  });
}

test("command palette stays reachable and inside the viewport at 200%-zoom-equivalent width", async ({
  page,
}) => {
  await page.setViewportSize({ height: 900, width: 640 });
  await page.goto("/");

  await page.keyboard.press("Control+KeyK");
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  const box = await dialog.boundingBox();
  const viewport = page.viewportSize();
  expect(box).not.toBeNull();
  if (box && viewport) {
    expect(box.x).toBeGreaterThanOrEqual(-1);
    expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 1);
  }
});
