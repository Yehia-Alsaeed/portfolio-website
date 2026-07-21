import { expect, test } from "@playwright/test";

test("finishes the monogram registration and removes it for reduced motion", async ({ page }) => {
  await page.goto("/");
  const monogram = page.getByTestId("kinetic-monogram");
  await expect(monogram).toBeVisible();
  await expect
    .poll(() =>
      monogram
        .locator("span")
        .first()
        .evaluate((node) => getComputedStyle(node).opacity),
    )
    .toBe("1");

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  await expect(monogram.locator("span").first()).toHaveCSS("animation-name", "none");
});

test("cycles modes with N and ignores N while typing", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("n");
  await expect(page.locator("html")).toHaveAttribute("data-mode", "night");
  await page.keyboard.press("n");
  await expect(page.locator("html")).toHaveAttribute("data-mode", "mono");

  await page.getByLabel("Name", { exact: true }).click();
  await page.keyboard.press("n");
  await expect(page.getByLabel("Name", { exact: true })).toHaveValue("n");
  await expect(page.locator("html")).toHaveAttribute("data-mode", "mono");
});

test("runs section, email, CV, and lazy Poster Mode commands", async ({ context, page }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");
  await expect(page.getByTestId("page-transition")).toHaveAttribute("data-ready", "true");

  await page.keyboard.press("Control+KeyK");
  await page.getByRole("combobox", { name: "Search commands" }).fill("selected work");
  await page.getByRole("option", { name: "Jump to selected work" }).click();
  await expect(page).toHaveURL(/#work$/);

  await page.keyboard.press("Control+KeyK");
  await page.getByRole("combobox", { name: "Search commands" }).fill("copy email");
  await page.getByRole("option", { name: "Copy email address" }).click();
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toBe("yehias3eed11@gmail.com");

  await page.keyboard.press("Control+KeyK");
  await page.getByRole("combobox", { name: "Search commands" }).fill("download cv");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("option", { name: "Download CV" }).click();
  expect((await downloadPromise).suggestedFilename()).toBe("Yehia_Alsaeed_CV_AI.pdf");

  await expect(page.locator("[data-poster-template]")).toHaveCount(0);
  await page.keyboard.press("Control+KeyK");
  await page.getByRole("combobox", { name: "Search commands" }).fill("poster");
  await page.getByRole("option", { name: "Open Poster Mode" }).click();
  const poster = page.getByRole("dialog", { name: "Poster Mode" });
  await expect(poster.locator('[data-poster-template="index"]')).toBeVisible();
  await page.getByRole("button", { name: "Remix poster" }).click();
  await expect(poster.locator('[data-poster-template="metric"]')).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(poster).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Open command palette" })).toBeFocused();
});

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

  await page.waitForLoadState("load");
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
      external: wasPrevented('a[href="https://github.com/Yehia-Alsaeed"]'),
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
