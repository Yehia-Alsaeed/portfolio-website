import { spawn } from "node:child_process";
import { copyFile, mkdir, mkdtemp, rm, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { chromium, type Browser, type Locator, type Page } from "@playwright/test";

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
 *
 * `link` is a CSS selector; the first visible match is the one followed.
 * `press` clicks a control that stays on the same page - an accordion header,
 * say - so it waits for the page to react rather than for a new URL. Only
 * `browsed` captures support it.
 * `endBefore` stops the pass where that element would scroll into view
 * (usually `footer`) instead of at the very bottom of the page.
 * `hold` brings the pass to rest with that element centred for `seconds`,
 * then carries on. The hold comes out of the leg's own budget, so the leg
 * still takes `seconds` overall.
 */
type ScrollPass = { seconds: number; endBefore?: string; hold?: { at: string; seconds: number } };

type WalkStep =
  | ({ kind: "visit"; path: string } & ScrollPass)
  | ({ kind: "follow"; link: string } & ScrollPass)
  | ({ kind: "press"; control: string } & ScrollPass);

/**
 * How the walkthrough is filmed.
 *
 * - `scripted`: Playwright's own recorder (fixed at 25fps), no cursor. The
 *   Loverboy Studio clip.
 * - `browsed`: Chrome's screencast encoded at 30fps, with a drawn cursor that
 *   glides to each link and clicks it, so the clip reads as someone browsing
 *   the store - homepage, menu, catalogue, product. The La Glosse and Madar
 *   Wears clips, and the style any new storefront should match.
 */
type CaptureStyle = "scripted" | "browsed";

type CaptureTarget = {
  key: string;
  url: string;
  style: CaptureStyle;
  /**
   * The cookie banner's least-permissive choice, clicked before anything is
   * captured so the banner never sits over a still or a recording. The site
   * remembers the choice, so one click covers the whole walkthrough.
   */
  consent?: string;
  /**
   * `scripted` only: the clip's length in seconds. Playwright films from the
   * moment the context opens, so the page's own load time - which varies run
   * to run - ends up in the clip. Holding on the last frame until this mark
   * keeps a re-record the same length as the take it replaces.
   */
  length?: number;
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
    style: "browsed",
    walkthrough: [
      { kind: "visit", path: "/", seconds: 8, endBefore: "footer" },
      { kind: "follow", link: 'a[href="/collections/all"]', seconds: 7, endBefore: "footer" },
      {
        kind: "follow",
        link: 'a[href="/products/grey-denim"], a[href^="/products/grey-denim?"]',
        seconds: 7,
        endBefore: "footer",
      },
    ],
  },
  {
    key: "la-glosse",
    url: "https://la-glosse.com/",
    style: "browsed",
    walkthrough: [
      { kind: "visit", path: "/", seconds: 9, endBefore: "footer" },
      { kind: "follow", link: 'a[href="/collections/all"]', seconds: 4, endBefore: "footer" },
      { kind: "follow", link: 'main a[href*="/products/"]', seconds: 5, endBefore: "footer" },
    ],
  },
  {
    key: "loverboy-studio",
    url: "https://www.loverboy-studio.com/",
    style: "scripted",
    length: 32.3,
    // Budgets are wall-clock time for the pass, and pace is derived from each
    // page's height, so these are set for how the motion should read rather
    // than for a distance. The homepage is ~3,100px of scroll, which over 14s
    // lands near the calm pace of the two storefront clips.
    //
    // The About stats reset to 0 on every scroll and only count up once the
    // page has been still for a moment, so an unbroken pass films them as
    // 0+ / 0+ / 0. The hold lets them count up to their real figures on
    // camera; once counted they stay put when the pass moves on.
    walkthrough: [
      { kind: "visit", path: "/", seconds: 14, hold: { at: "#about", seconds: 2.8 } },
      { kind: "follow", link: 'a[href*="/work/dallah-karak-speciality-tea"]', seconds: 9 },
    ],
  },
  {
    key: "almuharrami-legal",
    url: "https://www.almuharramilegal.com/",
    style: "browsed",
    consent: 'button:has-text("Reject Non-essential")',
    // A law firm has no catalogue, so the storefront path becomes practice
    // card -> the matching practice area opened -> the firm and its people.
    // The homepage pass stops with all eight practice cards on screen, and Our
    // Story ends on the "Authentic. Trustworthy." split above its CTA band.
    walkthrough: [
      { kind: "visit", path: "/", seconds: 9, endBefore: ".home-testimonial" },
      {
        kind: "follow",
        link: 'main a[href="/experience"]:has-text("Banking & Finance")',
        seconds: 0,
      },
      {
        kind: "press",
        control: 'button:has-text("Financial Institutions")',
        seconds: 2.5,
        endBefore: "footer",
      },
      { kind: "follow", link: 'header a[href="/our-story"]', seconds: 7, endBefore: ".cta-band" },
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

/** Frame rate of `browsed` clips. Playwright's recorder is fixed at 25. */
const BROWSED_FPS = 30;

/** `ffmpeg` encodes `browsed` clips; set FFMPEG_PATH if it is not on PATH. */
const FFMPEG = process.env.FFMPEG_PATH ?? "ffmpeg";

/** Well under the per-clip budget the shipped captures sit at (1.7-2.3 MB). */
const MAX_RECORDING_BYTES = 5 * 1024 * 1024;

const IMAGE_DIR = path.resolve(process.cwd(), "src/assets/client-work");
const VIDEO_DIR = path.resolve(process.cwd(), "public/media/client-work");

type OutputDirs = { imageDir: string; videoDir: string };

type Point = { x: number; y: number };

/**
 * Skips cross-document View Transitions, which recent Shopify themes (La
 * Glosse and Madar Wears both) run on every link click. In headless Chrome the
 * transition never finishes: the new page stops painting and
 * requestAnimationFrame never fires again, so the scroll pass after a click
 * hangs forever. The shipped clips hard-cut between pages anyway, so skipping
 * it matches them.
 */
const SKIP_VIEW_TRANSITIONS_SCRIPT = `
  addEventListener("pageswap", (event) => event.viewTransition?.skipTransition());
  addEventListener("pagereveal", (event) => event.viewTransition?.skipTransition());
`;

/**
 * The cursor drawn into `browsed` clips: a small white arrow with a dark
 * outline, matching the one in the shipped La Glosse and Madar Wears clips.
 * Headless Chrome paints no pointer of its own, so this follows real
 * `mousemove` events, and remembers its last spot in sessionStorage so it
 * does not jump to the corner when a link click loads a new document.
 *
 * A string for the same `__name` reason as the shim in `newCapturePage`.
 */
const CURSOR_SCRIPT = `(() => {
  const id = "__capture-cursor";
  const place = (element, x, y) => {
    element.style.transform = "translate(" + x + "px, " + y + "px)";
  };
  const mount = () => {
    if (document.getElementById(id)) return;
    const element = document.createElement("div");
    element.id = id;
    element.innerHTML =
      '<svg width="13" height="19" viewBox="0 0 13 19" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M1 1v14.5l3.6-3.4 2.6 6 2.3-1-2.6-5.9H12z" fill="#fff" stroke="#111" stroke-width="1.1" stroke-linejoin="round"/></svg>';
    Object.assign(element.style, {
      filter: "drop-shadow(0 1px 1.5px rgba(0, 0, 0, 0.35))",
      left: "0",
      pointerEvents: "none",
      position: "fixed",
      top: "0",
      zIndex: "2147483647",
    });
    try {
      const saved = JSON.parse(sessionStorage.getItem(id) || "null");
      if (saved) place(element, saved.x, saved.y);
      else element.style.visibility = "hidden";
    } catch {}
    document.documentElement.appendChild(element);
    addEventListener(
      "mousemove",
      (event) => {
        element.style.visibility = "visible";
        place(element, event.clientX, event.clientY);
        try {
          sessionStorage.setItem(id, JSON.stringify({ x: event.clientX, y: event.clientY }));
        } catch {}
      },
      { capture: true, passive: true },
    );
  };
  if (document.readyState === "loading") addEventListener("DOMContentLoaded", mount);
  else mount();
})();`;

function outputDirs(argv: readonly string[]): OutputDirs {
  const out = argv.find((value) => value.startsWith("--out="))?.slice("--out=".length);
  if (!out) return { imageDir: IMAGE_DIR, videoDir: VIDEO_DIR };
  const dir = path.resolve(out);
  return { imageDir: dir, videoDir: dir };
}

async function captureScreenshot(
  browser: Browser,
  target: CaptureTarget,
  variant: "desktop" | "mobile",
  dirs: OutputDirs,
) {
  const viewport = variant === "desktop" ? DESKTOP_VIEWPORT : MOBILE_VIEWPORT;
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  await page.goto(target.url, { timeout: 30_000, waitUntil: "load" });
  await page.waitForTimeout(2200);
  await dismissConsent(page, target);

  const destination = path.join(dirs.imageDir, `${target.key}-${variant}.jpg`);
  await page.screenshot({ path: destination, quality: 82, type: "jpeg" });
  await context.close();
  console.log(`Captured ${destination}`);
}

async function dismissConsent(page: Page, target: CaptureTarget) {
  if (!target.consent) return;
  const choice = page.locator(target.consent).filter({ visible: true }).first();
  await choice.waitFor({ state: "visible", timeout: 15_000 });
  await choice.click();
  await choice.waitFor({ state: "hidden", timeout: 15_000 });
  // Lets the banner's exit animation finish before anything is captured.
  await page.waitForTimeout(600);
}

/**
 * Scrolls one page from where it is down to the bottom - or to just before
 * `endBefore` - over `seconds`, moving on every animation frame.
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
async function scrollThrough(page: Page, seconds: number, endBefore?: string, to?: number) {
  // A zero budget means "stay put": the pass would otherwise reach its
  // destination on the very first frame and jump straight there.
  if (seconds <= 0) return;

  await page.evaluate(
    async ({
      durationMs,
      stopSelector,
      target,
    }: {
      durationMs: number;
      stopSelector: string | null;
      target: number | null;
    }) => {
      const startedAt = performance.now();
      const from = window.scrollY;

      // Eased rather than linear so the pass settles into motion and comes to
      // rest, instead of starting and stopping at full speed.
      const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

      // Re-read each frame: lazy sections can extend the page mid-pass.
      const destination = () => {
        if (target !== null) return target;
        const bottom = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
        const stop = stopSelector ? document.querySelector(stopSelector) : null;
        if (!stop) return bottom;
        const stopAt = stop.getBoundingClientRect().top + window.scrollY - window.innerHeight;
        return Math.max(0, Math.min(bottom, stopAt));
      };

      await new Promise<void>((resolve) => {
        const frame = (now: number) => {
          const progress = Math.min(1, (now - startedAt) / durationMs);

          window.scrollTo({
            behavior: "instant",
            top: from + (destination() - from) * ease(progress),
          });

          if (progress < 1) requestAnimationFrame(frame);
          else resolve();
        };

        requestAnimationFrame(frame);
      });
    },
    { durationMs: seconds * 1000, stopSelector: endBefore ?? null, target: to ?? null },
  );
}

/**
 * Runs a leg's scroll pass, pausing on `hold` when the leg has one. The time
 * left after the hold is split between the two moves by distance, so the
 * pace either side of the pause matches.
 */
async function walkPass(page: Page, pass: ScrollPass) {
  if (!pass.hold) {
    await scrollThrough(page, pass.seconds, pass.endBefore);
    return;
  }

  const target = page.locator(pass.hold.at).first();
  const { afterHold, holdAt, toHold } = await target.evaluate((element, stopSelector) => {
    const holdAt =
      element.getBoundingClientRect().top +
      window.scrollY +
      element.getBoundingClientRect().height / 2 -
      window.innerHeight / 2;
    const bottom = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const stop = stopSelector ? document.querySelector(stopSelector) : null;
    const end = stop
      ? Math.min(bottom, stop.getBoundingClientRect().top + window.scrollY - window.innerHeight)
      : bottom;
    return {
      afterHold: Math.abs(end - holdAt),
      holdAt,
      toHold: Math.abs(holdAt - window.scrollY),
    };
  }, pass.endBefore ?? null);

  const moving = pass.seconds - pass.hold.seconds;
  const first = moving * (toHold / (toHold + afterHold || 1));
  // Centres the whole element, not just its top edge as `scrollToElement`
  // does, so a tall section is on screen in full while the pass rests on it.
  await scrollThrough(page, first, undefined, holdAt);
  await page.waitForTimeout(pass.hold.seconds * 1000);
  await scrollThrough(page, moving - first, pass.endBefore);
}

/**
 * Brings an element into view over `seconds` without the hard backwards snap
 * that `scrollIntoViewIfNeeded` produces mid-clip.
 */
async function scrollToElement(element: Locator, seconds: number) {
  await element.evaluate(async (target: Element, durationMs: number) => {
    const from = window.scrollY;
    const to = from + target.getBoundingClientRect().top - window.innerHeight / 2;
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
  }, seconds * 1000);
}

/** Resolves once the page has stopped scrolling for 250ms, or after 3s. */
async function settleScroll(page: Page) {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        const startedAt = performance.now();
        let last = window.scrollY;
        let stillSince = startedAt;
        const frame = (now: number) => {
          if (window.scrollY !== last) {
            last = window.scrollY;
            stillSince = now;
          }
          if (now - stillSince > 250 || now - startedAt > 3000) resolve();
          else requestAnimationFrame(frame);
        };
        requestAnimationFrame(frame);
      }),
  );
}

async function newCapturePage(browser: Browser, options: Parameters<Browser["newContext"]>[0]) {
  const context = await browser.newContext(options);
  const page = await context.newPage();

  // tsx compiles this file with esbuild's `keepNames`, which rewrites every
  // named arrow into a `__name(...)` call. That helper exists in Node, not in
  // the page, so any `page.evaluate` body containing a named function throws
  // `__name is not defined` once serialized. Passed as a string so the shim
  // itself cannot be rewritten the same way.
  await page.addInitScript({
    content: "globalThis.__name = globalThis.__name || ((fn) => fn);",
  });

  return { context, page };
}

async function runFfmpeg(args: readonly string[]) {
  const ffmpeg = spawn(FFMPEG, ["-loglevel", "error", ...args], { stdio: "inherit" });
  await new Promise<void>((resolve, reject) => {
    ffmpeg.on("error", reject);
    ffmpeg.on("close", (code) =>
      code === 0 ? resolve() : reject(new Error(`ffmpeg exited with code ${code}`)),
    );
  });
}

// Playwright only finalizes a recording once its context closes, so the whole
// walkthrough runs inside one context and the file is collected afterwards.
async function captureScriptedRecording(browser: Browser, target: CaptureTarget, dirs: OutputDirs) {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "client-work-video-"));
  const { context, page } = await newCapturePage(browser, {
    recordVideo: { dir: tempDir, size: RECORDING_VIEWPORT },
    viewport: RECORDING_VIEWPORT,
  });
  const filmingSince = Date.now();

  for (const [index, step] of target.walkthrough.entries()) {
    if (step.kind === "visit") {
      await page.goto(new URL(step.path, target.url).href, {
        timeout: 30_000,
        waitUntil: "load",
      });
      // Longer hold on the first leg so the hero, its fonts, and any entry
      // animation have settled before the clip starts moving.
      await page.waitForTimeout(index === 0 ? 2000 : 1200);
      if (index === 0) await dismissConsent(page, target);
    } else if (step.kind === "press") {
      throw new Error(`${target.key}: "press" steps need the browsed style`);
    } else {
      const link = page.locator(step.link).first();
      await link.waitFor({ state: "attached", timeout: 15_000 });
      await scrollToElement(link, 1.4);
      await page.waitForTimeout(600);
      await link.click({ timeout: 15_000 });
      // A soft route change has no load event to wait on, so this is the
      // transition's own budget rather than a network wait.
      await page.waitForTimeout(1600);
    }

    await walkPass(page, step);
  }

  if (target.length) {
    const remaining = target.length * 1000 - (Date.now() - filmingSince);
    if (remaining > 0) await page.waitForTimeout(remaining);
    else
      console.warn(
        `Warning: ${target.key} ran ${(-remaining / 1000).toFixed(1)}s over its length.`,
      );
  }

  await context.close();

  const video = page.video();
  if (!video) throw new Error(`No recording captured for ${target.key}`);
  const recordedPath = await video.path();
  const destination = path.join(dirs.videoDir, `${target.key}.webm`);
  if (target.length) {
    // Closing the context flushes a fraction of a second more than was asked
    // for, so the held tail is cut back to the exact length. A stream copy:
    // only the end moves, so nothing is re-encoded.
    await runFfmpeg([
      "-i",
      recordedPath,
      "-t",
      String(target.length),
      "-c",
      "copy",
      "-y",
      destination,
    ]);
  } else {
    // `rename` fails cross-device when the OS temp dir and project dir live on
    // different drives, so copy the finalized recording and clean up after.
    await copyFile(recordedPath, destination);
  }
  await rm(tempDir, { force: true, recursive: true });
  console.log(`Captured ${destination}`);
}

/**
 * Films `page` through Chrome's screencast into a constant-30fps WebM.
 *
 * Chrome only sends a frame when something on screen changes, so each frame
 * is written as many times as it stayed on screen; a held hero still lasts
 * its full hold. Returns `freeze`, which holds the frame on screen while it is
 * on, and `stop`, which stops filming and finalizes the file.
 */
async function startScreencast(page: Page, destination: string) {
  const ffmpeg = spawn(
    FFMPEG,
    [
      ...["-loglevel", "error", "-f", "image2pipe", "-c:v", "mjpeg"],
      ...["-framerate", String(BROWSED_FPS), "-i", "pipe:0", "-an"],
      ...["-c:v", "libvpx", "-b:v", "1M", "-crf", "10", "-qmin", "0", "-qmax", "50"],
      ...["-deadline", "good", "-cpu-used", "2", "-pix_fmt", "yuv420p", "-y", destination],
    ],
    { stdio: ["pipe", "inherit", "inherit"] },
  );
  const finished = new Promise<void>((resolve, reject) => {
    ffmpeg.on("error", reject);
    ffmpeg.on("close", (code) =>
      code === 0 ? resolve() : reject(new Error(`ffmpeg exited with code ${code}`)),
    );
  });

  const session = await page.context().newCDPSession(page);
  let firstTimestamp: number | undefined;
  let lastFrame: Buffer | undefined;
  let framesWritten = 0;
  let frozen = false;

  // Repeats the frame on screen until `timestamp`, in seconds since the epoch.
  const holdUntil = (timestamp: number) => {
    if (!lastFrame || firstTimestamp === undefined) return;
    const frameNumber = Math.floor((timestamp - firstTimestamp) * BROWSED_FPS);
    for (; framesWritten < frameNumber; framesWritten += 1) ffmpeg.stdin.write(lastFrame);
  };

  session.on("Page.screencastFrame", (frame) => {
    void session
      .send("Page.screencastFrameAck", { sessionId: frame.sessionId })
      .catch(() => undefined);
    const timestamp = frame.metadata.timestamp ?? Date.now() / 1000;
    firstTimestamp ??= timestamp;
    holdUntil(timestamp);
    if (!frozen) lastFrame = Buffer.from(frame.data, "base64");
  });

  await session.send("Page.startScreencast", {
    everyNthFrame: 1,
    format: "jpeg",
    maxHeight: RECORDING_VIEWPORT.height,
    maxWidth: RECORDING_VIEWPORT.width,
    quality: 92,
  });

  return {
    freeze: (on: boolean) => {
      frozen = on;
    },
    stop: async () => {
      await session.send("Page.stopScreencast");
      holdUntil(Date.now() / 1000);
      if (lastFrame) ffmpeg.stdin.write(lastFrame);
      ffmpeg.stdin.end();
      await finished;
      await session.detach();
    },
  };
}

/**
 * Glides the cursor from `from` to `to` on a slight arc, eased at both ends,
 * so the path reads as a hand on a trackpad rather than a ruler.
 */
async function glideCursor(page: Page, from: Point, to: Point, seconds: number) {
  const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy) || 1;
  const bow = Math.min(60, length * 0.12);
  const startedAt = Date.now();

  for (;;) {
    const progress = Math.min(1, (Date.now() - startedAt) / (seconds * 1000));
    const eased = ease(progress);
    const lift = Math.sin(Math.PI * eased) * bow;
    await page.mouse.move(
      from.x + dx * eased - (dy / length) * lift,
      from.y + dy * eased + (dx / length) * lift,
    );
    if (progress === 1) return to;
    await page.waitForTimeout(16);
  }
}

async function captureBrowsedRecording(browser: Browser, target: CaptureTarget, dirs: OutputDirs) {
  const destination = path.join(dirs.videoDir, `${target.key}.webm`);
  const { context, page } = await newCapturePage(browser, { viewport: RECORDING_VIEWPORT });
  await page.addInitScript({ content: SKIP_VIEW_TRANSITIONS_SCRIPT });
  await page.addInitScript({ content: CURSOR_SCRIPT });

  let cursor: Point = { x: RECORDING_VIEWPORT.width * 0.62, y: RECORDING_VIEWPORT.height * 0.58 };
  let film: Awaited<ReturnType<typeof startScreencast>> | undefined;

  for (const step of target.walkthrough) {
    const subject =
      step.kind === "visit" ? step.path : step.kind === "follow" ? step.link : step.control;
    console.log(`  ${target.key}: ${step.kind} ${subject}`);
    if (step.kind === "visit") {
      await page.goto(new URL(step.path, target.url).href, {
        timeout: 30_000,
        waitUntil: "load",
      });
      await page.waitForTimeout(2000);

      // Filming starts on a settled page, so the clip opens on the hero rather
      // than on a blank load, then holds there a beat before anything moves.
      if (!film) {
        await dismissConsent(page, target);
        await page.mouse.move(cursor.x, cursor.y);
        film = await startScreencast(page, destination);
        await page.waitForTimeout(1500);
      }
    } else {
      const element = page.locator(subject).filter({ visible: true }).first();
      await element.waitFor({ state: "visible", timeout: 15_000 });

      let box = await element.boundingBox();
      const onScreen = (b: typeof box) =>
        b !== null && b.y + b.height / 2 > 8 && b.y + b.height / 2 < RECORDING_VIEWPORT.height - 8;
      if (!onScreen(box)) {
        await scrollToElement(element, 1.4);
        box = await element.boundingBox();
      }
      if (!box) throw new Error(`${target.key}: "${subject}" has no box to click`);

      const point = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
      cursor = await glideCursor(page, cursor, point, 1.1);
      await page.waitForTimeout(450);

      const before = page.url();
      if (step.kind === "follow") {
        // Held on the click until the new page is at its top. A client-side
        // router (Next.js) paints the new page at the old scroll position, then
        // smooth-scrolls it up over about a second - and not always to 0 - which
        // flashes the wrong sections. A held frame then a cut to the top reads
        // like the storefront clips' hard cuts.
        film?.freeze(true);
        await page.mouse.click(point.x, point.y);
        await page.waitForURL((url) => url.href !== before, { timeout: 15_000 });
        await page.waitForLoadState("load");
        await settleScroll(page);
        await page.evaluate(() => window.scrollTo({ behavior: "instant", top: 0 }));
        await page.waitForTimeout(150);
        film?.freeze(false);
        await page.waitForTimeout(1200);
      } else {
        await page.mouse.click(point.x, point.y);
        // Long enough for an accordion's open animation to finish and be read.
        await page.waitForTimeout(1400);
      }
    }

    await walkPass(page, step);
  }

  // A closing hold, so the loop does not cut away mid-motion.
  await page.waitForTimeout(1500);
  await film?.stop();
  await context.close();
  console.log(`Captured ${destination}`);
}

/**
 * Captures every target by default, or only the keys named on the command
 * line: `tsx scripts/capture-client-work.ts loverboy-studio`. Filtering exists
 * so adding one client cannot silently overwrite captures that were already
 * reviewed and approved. `--out=<dir>` writes everything there instead, for
 * reviewing a take before it replaces anything.
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
  const argv = process.argv.slice(2);
  const targets = selectTargets(argv);
  const dirs = outputDirs(argv);

  await mkdir(dirs.imageDir, { recursive: true });
  await mkdir(dirs.videoDir, { recursive: true });

  const browser = await chromium.launch();
  try {
    for (const target of targets) {
      await captureScreenshot(browser, target, "desktop", dirs);
      await captureScreenshot(browser, target, "mobile", dirs);
      if (target.style === "browsed") await captureBrowsedRecording(browser, target, dirs);
      else await captureScriptedRecording(browser, target, dirs);

      const { size } = await stat(path.join(dirs.videoDir, `${target.key}.webm`));
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
