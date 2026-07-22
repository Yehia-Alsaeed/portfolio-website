import { copyFile, mkdir, mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { chromium, type Browser } from "@playwright/test";

const CAPTURE_TARGETS = [
  { key: "madar-wears", url: "https://www.madarwears.com/" },
  { key: "la-glosse", url: "https://la-glosse.com/" },
] as const;

const DESKTOP_VIEWPORT = { width: 1440, height: 900 };
const MOBILE_VIEWPORT = { width: 390, height: 844 };
const RECORDING_VIEWPORT = { width: 1280, height: 720 };

const IMAGE_DIR = path.resolve(process.cwd(), "src/assets/client-work");
const VIDEO_DIR = path.resolve(process.cwd(), "public/media/client-work");

type CaptureTarget = (typeof CAPTURE_TARGETS)[number];

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

// Playwright only finalizes a recording once its context closes, so a short,
// representative scroll (not a full walkthrough) keeps the muted webm well
// under the 5 MB budget without a separate re-encode/compression step.
async function captureRecording(browser: Browser, target: CaptureTarget) {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "client-work-video-"));
  const context = await browser.newContext({
    recordVideo: { dir: tempDir, size: RECORDING_VIEWPORT },
    viewport: RECORDING_VIEWPORT,
  });
  const page = await context.newPage();
  await page.goto(target.url, { timeout: 30_000, waitUntil: "load" });
  await page.waitForTimeout(1000);
  await page.mouse.wheel(0, 700);
  await page.waitForTimeout(1200);
  await page.mouse.wheel(0, 700);
  await page.waitForTimeout(1500);
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

async function main() {
  await mkdir(IMAGE_DIR, { recursive: true });
  await mkdir(VIDEO_DIR, { recursive: true });

  const browser = await chromium.launch();
  try {
    for (const target of CAPTURE_TARGETS) {
      await captureScreenshot(browser, target, "desktop");
      await captureScreenshot(browser, target, "mobile");
      await captureRecording(browser, target);
    }
  } finally {
    await browser.close();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
