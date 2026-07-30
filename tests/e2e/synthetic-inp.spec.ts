import { expect, test, type Page } from "@playwright/test";

// INP (Interaction to Next Paint) is a real-user field metric that cannot
// be truthfully established from a low-traffic Preview or a local run -
// Phase 9/post-launch operations own confirming the real value once enough
// eligible visits exist (docs/superpowers/specs/2026-07-17-portfolio-
// production-roadmap-design.md section 3). Everything in this file is a
// SYNTHETIC prelaunch proxy: it uses the same browser Event Timing API
// (PerformanceEventTiming) that real INP sampling reads from, but on
// repeatable, scripted interactions rather than real-user sessions.
const INP_SYNTHETIC_BUDGET_MS = 200;

async function startEventTimingCapture(page: Page) {
  await page.evaluate(() => {
    (window as unknown as { __eventDurations: number[] }).__eventDurations = [];
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        (window as unknown as { __eventDurations: number[] }).__eventDurations.push(entry.duration);
      }
    });
    // `durationThreshold` is a real Event Timing API option (the same
    // mechanism real INP measurement uses) that the pinned TypeScript
    // version's bundled DOM lib doesn't declare yet.
    observer.observe({
      type: "event",
      buffered: true,
      ...({ durationThreshold: 0 } as Record<string, unknown>),
    });
  });
}

async function readMaxEventDuration(page: Page): Promise<number> {
  return page.evaluate(() =>
    Math.max(0, ...(window as unknown as { __eventDurations: number[] }).__eventDurations),
  );
}

test("keyboard: opening the command palette stays under the synthetic INP budget", async ({
  page,
}) => {
  await page.goto("/");
  await startEventTimingCapture(page);

  await page.keyboard.press("Control+KeyK");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.waitForTimeout(150); // let the Event Timing entry flush

  expect(await readMaxEventDuration(page)).toBeLessThan(INP_SYNTHETIC_BUDGET_MS);
});

test("keyboard: cycling display mode with N stays under the synthetic INP budget", async ({
  page,
}) => {
  await page.goto("/");
  await startEventTimingCapture(page);

  await page.keyboard.press("n");
  await expect(page.locator("html")).toHaveAttribute("data-mode", "night");
  await page.waitForTimeout(150);

  expect(await readMaxEventDuration(page)).toBeLessThan(INP_SYNTHETIC_BUDGET_MS);
});

test("pointer: switching a project category filter stays under the synthetic INP budget", async ({
  page,
}) => {
  await page.goto("/projects");
  await startEventTimingCapture(page);

  await page.getByRole("button", { name: "Computer vision" }).click();
  await expect(page).toHaveURL(/category=cv/);
  await page.waitForTimeout(150);

  expect(await readMaxEventDuration(page)).toBeLessThan(INP_SYNTHETIC_BUDGET_MS);
});

test("pointer: activating the Architecture X-Ray stays under the synthetic INP budget", async ({
  page,
}) => {
  await page.goto("/projects/skillbridge-ai-interviewer");
  await startEventTimingCapture(page);

  await page.getByRole("button", { name: "Explore interactive architecture" }).click();
  await expect(page.getByRole("button", { name: "Zoom in" })).toBeVisible();
  await page.waitForTimeout(150);

  // This one is allowed more headroom: it is the single interaction on the
  // site that synchronously mounts a whole lazy-loaded canvas library
  // (@xyflow/react) rather than toggling existing DOM, so its first
  // activation is a deliberately different, heavier case than the others
  // above - still checked, just not held to the same tight budget.
  expect(await readMaxEventDuration(page)).toBeLessThan(INP_SYNTHETIC_BUDGET_MS * 2.5);
});
