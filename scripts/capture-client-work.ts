import { copyFile, mkdir, mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { chromium, type Browser } from "@playwright/test";

/**
 * One walkthrough leg. `seconds` is the scrolling budget for that leg, not a
 * scroll speed - pacing is derived from the page's own height so a short page
 * and a long one both read as one deliberate pass.
 *
 * Prefer `follow` over a second `visit` wherever the site is a client-side
 * router. A fresh `visit` re-loads the document, and because the recording
 * starts with the browser context, every second of that load ends up in the
 * clip as dead air - three `visit` legs put ~13s of loading into a 46s take.
 * `follow` clicks a real link instead, so the transition is soft, fast, and
 * shows the site's own page transition rather than a blank frame.
 */
type WalkStep =
  | { kind: "visit"; path: string; seconds: number }
  | { kind: "follow"; hrefContains: string; seconds: number };

type CaptureTarget = {
  key: string;
  url: string;
  walkthrough: readonly WalkStep[];
};

/**
 * Hard allowlist. Only these public marketing pages are ever opened. No
 * account, cart, checkout, consent-detail, login, or admin surface belongs
 * here - Loverboy Studio's `/studio` redirects to `/login` and is off limits,
 * exactly as Nexo was in Phase 5.
 */
const CAPTURE_TARGETS: readonly CaptureTarget[] = [
  {
    key: "madar-wears",
    url: "https://www.madarwears.com/",
    walkthrough: [{ kind: "visit", path: "/", seconds: 26 }],
  },
  {
    key: "la-glosse",
    url: "https://la-glosse.com/",
    walkthrough: [{ kind: "visit", path: "/", seconds: 26 }],
  },
  {
    key: "loverboy-studio",
    url: "https://www.loverboy-studio.com/",
    // Budgets are wall-clock time for the pass, and pace is derived from each
    // page's height, so these are set for how the motion should read rather
    // than for a distance. The homepage is ~3,100px of scroll, which over 14s
    // lands near the calm pace of the two storefront clips.
    walkthrough: [
      { kind: "visit", path: "/", seconds: 14 },
      { kind: "follow", hrefContains: "/work/dallah-karak-speciality-tea", seconds: 9 },
    ],
  },
];

const DESKTOP_VIEWPORT = { width: 1440, height: 900 };
const MOBILE_VIEWPORT = { width: 390, height: 844 };

/**
 * The recording viewport is the laptop PNG's screen cut-out, measured in
 * `client-work-media.tsx`. Recording at exactly this size is what lets the
 * card use `object-cover` with nothing cropped and no letterbox band. If the
 * device PNG is ever replaced, change this to the new cut-out size and
 * re-record - do not reach for `contain` on the rendering side.
 *
 * The committed script previously said 1280x720 while the shipped WebMs were
 * 1220x790, because an asset refresh never made it back here. Keep these two
 * in step.
 */
const RECORDING_VIEWPORT = { width: 1220, height: 790 };

/** Well under the per-clip budget the shipped captures sit at (1.7-2.3 MB). */
const MAX_RECORDING_BYTES = 5 * 1024 * 1024;

const IMAGE_DIR = path.resolve(process.cwd(), "src/assets/client-work");
const VIDEO_DIR = path.resolve(process.cwd(), "public/media/client-work");

async function captureScreenshot(
  browser: Browser,
  target: CaptureTarget,
  variant: "desktop" | "mobile",
) {
  const viewport = variant === "desktop" ? DESKTOP_VIEWPORT : MOBILE_VIEWPORT;
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  await page.goto(target.url, { timeout: 30_000, waitUntil: "load" });
  await page.waitForTimeout(2200);

  const destination = path.join(IMAGE_DIR, `${target.key}-${variant}.jpg`);
  await page.screenshot({ path: destination, quality: 82, type: "jpeg" });
  await context.close();
  console.log(`Captured ${destination}`);
}

/**
 * Scrolls one page from top to bottom over `seconds`, moving on every
 * animation frame.
 *
 * Two earlier approaches both produced visibly juddery clips, so neither is
 * worth returning to:
 *
 * - Stepping with `mouse.wheel` every 70ms fires ~14 discrete impulses per
 *   second against a recording that captures 25-30. Most recorded frames
 *   catch either a full lurch or no movement at all, which reads as chop
 *   however small the step is.
 * - Clamping the step to a minimum pixel count to keep short pages moving
 *   overrode the height-derived pace and pinned every page to the same fast
 *   speed, regardless of how long it actually was.
 *
 * Driving `scrollTo` from rAF fixes both: movement lands once per compositor
 * frame, and the speed falls out of the page's own height, so a tall page and
 * a short one both take exactly their budget. `behavior: "instant"` matters -
 * these sites set `scroll-behavior: smooth`, which would otherwise animate
 * every frame's scroll against the next one.
 */
async function scrollThrough(page: Awaited<ReturnType<Browser["newPage"]>>, seconds: number) {
  await page.evaluate(async (durationMs: number) => {
    const startedAt = performance.now();

    // Eased rather than linear so the pass settles into motion and comes to
    // rest, instead of starting and stopping at full speed.
    const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

    await new Promise<void>((resolve) => {
      const frame = (now: number) => {
        const progress = Math.min(1, (now - startedAt) / durationMs);
        // Re-read each frame: lazy sections can extend the page mid-pass.
        const distance = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

        window.scrollTo({ behavior: "instant", top: distance * ease(progress) });

        if (progress < 1) requestAnimationFrame(frame);
        else resolve();
      };

      requestAnimationFrame(frame);
    });
  }, seconds * 1000);
}

/**
 * Brings an element into view over `seconds` without the hard backwards snap
 * that `scrollIntoViewIfNeeded` produces mid-clip.
 */
async function scrollToElement(
  page: Awaited<ReturnType<Browser["newPage"]>>,
  selector: string,
  seconds: number,
) {
  await page.evaluate(
    async ({ durationMs, target }: { durationMs: number; target: string }) => {
      const element = document.querySelector(target);
      if (!element) return;

      const from = window.scrollY;
      const to = from + element.getBoundingClientRect().top - window.innerHeight / 2;
      const startedAt = performance.now();
      const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

      await new Promise<void>((resolve) => {
        const frame = (now: number) => {
          const progress = Math.min(1, (now - startedAt) / durationMs);
          window.scrollTo({ behavior: "instant", top: from + (to - from) * ease(progress) });
          if (progress < 1) requestAnimationFrame(frame);
          else resolve();
        };

        requestAnimationFrame(frame);
      });
    },
    { durationMs: seconds * 1000, target: selector },
  );
}

// Playwright only finalizes a recording once its context closes, so the whole
// walkthrough runs inside one context and the file is collected afterwards.
async function captureRecording(browser: Browser, target: CaptureTarget) {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "client-work-video-"));
  const context = await browser.newContext({
    recordVideo: { dir: tempDir, size: RECORDING_VIEWPORT },
    viewport: RECORDING_VIEWPORT,
  });
  const page = await context.newPage();

  // tsx compiles this file with esbuild's `keepNames`, which rewrites every
  // named arrow into a `__name(...)` call. That helper exists in Node, not in
  // the page, so any `page.evaluate` body containing a named function throws
  // `__name is not defined` once serialized. Passed as a string so the shim
  // itself cannot be rewritten the same way.
  await page.addInitScript({
    content: "globalThis.__name = globalThis.__name || ((fn) => fn);",
  });

  for (const [index, step] of target.walkthrough.entries()) {
    if (step.kind === "visit") {
      await page.goto(new URL(step.path, target.url).href, {
        timeout: 30_000,
        waitUntil: "load",
      });
      // Longer hold on the first leg so the hero, its fonts, and any entry
      // animation have settled before the clip starts moving.
      await page.waitForTimeout(index === 0 ? 2000 : 1200);
    } else {
      const selector = `a[href*="${step.hrefContains}"]`;
      const link = page.locator(selector).first();
      await link.waitFor({ state: "attached", timeout: 15_000 });
      await scrollToElement(page, selector, 1.4);
      await page.waitForTimeout(600);
      await link.click({ timeout: 15_000 });
      // A soft route change has no load event to wait on, so this is the
      // transition's own budget rather than a network wait.
      await page.waitForTimeout(1600);
    }

    await scrollThrough(page, step.seconds);
  }

  await context.close();

  const video = page.video();
  if (!video) throw new Error(`No recording captured for ${target.key}`);
  const recordedPath = await video.path();
  const destination = path.join(VIDEO_DIR, `${target.key}.webm`);
  // `rename` fails cross-device when the OS temp dir and project dir live on
  // different drives, so copy the finalized recording and clean up after.
  await copyFile(recordedPath, destination);
  await rm(tempDir, { force: true, recursive: true });
  console.log(`Captured ${destination}`);
}

/**
 * Captures every target by default, or only the keys named on the command
 * line: `tsx scripts/capture-client-work.ts loverboy-studio`. Filtering exists
 * so adding one client cannot silently overwrite captures that were already
 * reviewed and approved.
 */
function selectTargets(argv: readonly string[]): readonly CaptureTarget[] {
  const requested = argv.filter((value) => !value.startsWith("-"));
  if (requested.length === 0) return CAPTURE_TARGETS;

  return requested.map((key) => {
    const target = CAPTURE_TARGETS.find((candidate) => candidate.key === key);
    if (!target) {
      throw new Error(
        `Unknown capture target "${key}". Known targets: ${CAPTURE_TARGETS.map((entry) => entry.key).join(", ")}`,
      );
    }
    return target;
  });
}

async function main() {
  const targets = selectTargets(process.argv.slice(2));

  await mkdir(IMAGE_DIR, { recursive: true });
  await mkdir(VIDEO_DIR, { recursive: true });

  const browser = await chromium.launch();
  try {
    for (const target of targets) {
      await captureScreenshot(browser, target, "desktop");
      await captureScreenshot(browser, target, "mobile");
      await captureRecording(browser, target);

      const { size } = await import("node:fs/promises").then((fs) =>
        fs.stat(path.join(VIDEO_DIR, `${target.key}.webm`)),
      );
      if (size > MAX_RECORDING_BYTES) {
        console.warn(
          `Warning: ${target.key}.webm is ${(size / 1048576).toFixed(2)} MB, over the ${MAX_RECORDING_BYTES / 1048576} MB budget.`,
        );
      }
    }
  } finally {
    await browser.close();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
