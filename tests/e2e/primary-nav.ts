import { expect, type Locator, type Page } from "@playwright/test";

// Matches the `md:` breakpoint the header switches on: at 768px and up the nav
// links sit inline, below it they collapse behind the hamburger.
const MOBILE_NAV_MAX_WIDTH = 767;

export function usesMobileNav(page: Page): boolean {
  const viewport = page.viewportSize();
  return viewport !== null && viewport.width <= MOBILE_NAV_MAX_WIDTH;
}

/**
 * Asserts primary navigation is reachable in whichever form this viewport is
 * meant to show it - the inline nav on tablet and desktop, the hamburger on
 * mobile, where the nav landmark itself only exists while the panel is open.
 */
export async function expectPrimaryNavAvailable(page: Page): Promise<void> {
  if (usesMobileNav(page)) {
    await expect(page.getByRole("button", { name: "Open menu" })).toBeVisible();
    return;
  }
  await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
}

/**
 * Returns the primary nav with its links clickable, opening the mobile panel
 * first when the viewport calls for it. Call it again before each navigation:
 * the panel closes itself as the route changes, which detaches the links.
 */
export async function openPrimaryNav(page: Page): Promise<Locator> {
  if (usesMobileNav(page)) {
    // A previous navigation may still be tearing the panel down, and the
    // trigger sits underneath it - wait the teardown out rather than clicking
    // into a panel that is about to detach.
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
  }
  return page.getByRole("navigation", { name: "Primary" });
}
