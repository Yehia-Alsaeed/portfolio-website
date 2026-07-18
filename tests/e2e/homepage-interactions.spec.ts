import { expect, test } from "@playwright/test";

test("animates normal route navigation and preserves browser history", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("page-transition")).toHaveAttribute("data-ready", "true");
  await page.evaluate(() => {
    document.querySelector<HTMLAnchorElement>('a[href="/services"]')?.click();
  });

  await expect(page.getByTestId("page-transition")).toHaveAttribute("data-active", "true");
  await page.waitForTimeout(250);
  await expect(page).toHaveURL(/\/$/);
  await expect(page).toHaveURL(/\/services$/);

  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
});

test("does not delay modified, external, hash, or reduced-motion navigation", async ({ page }) => {
  await page.goto("/");

  const prevention = await page.evaluate(() => {
    function wasPrevented(selector: string, init: MouseEventInit = {}) {
      const link = document.querySelector<HTMLAnchorElement>(selector);
      if (!link) throw new Error(`Missing link: ${selector}`);
      const event = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        button: 0,
        ...init,
      });
      link.dispatchEvent(event);
      return event.defaultPrevented;
    }

    return {
      external: wasPrevented('a[href^="https://github.com/Yehia-Alsaeed/skillbridge"]'),
      hash: wasPrevented('a[href="#work"]'),
      modified: wasPrevented('a[href="/services"]', { ctrlKey: true }),
    };
  });
  expect(prevention).toEqual({ external: false, hash: false, modified: false });

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.getByRole("link", { name: "Explore client services" }).click({ noWaitAfter: true });
  await expect(page.getByTestId("page-transition")).toHaveAttribute("data-active", "false");
  await expect(page).toHaveURL(/\/services$/);
});

test("keeps scroll progress absent by default and updates it only when enabled", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByTestId("scroll-progress")).toHaveCount(0);

  await page.goto("/?scrollRules=1");
  const progress = page.getByTestId("scroll-progress");
  await expect(progress).toHaveCount(1);
  await expect(progress).toHaveAttribute("style", /scaleX\(0\)/);

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await expect(progress).toHaveAttribute("style", /scaleX\((?:0\.[8-9]|1)/);
});
