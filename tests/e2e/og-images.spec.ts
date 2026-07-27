import { createHash } from "node:crypto";

import { expect, test, type Page } from "@playwright/test";

const ROUTES = [
  { alt: /Yehia Alsaeed/, path: "/" },
  { alt: "Projects | Yehia Alsaeed", path: "/projects" },
  { alt: "Services | Yehia Alsaeed", path: "/services" },
  { alt: "Case study | Yehia Alsaeed", path: "/projects/skillbridge-ai-interviewer" },
  { alt: "Case study | Yehia Alsaeed", path: "/projects/prestige-motors-showroom" },
] as const;

async function readOgImageMeta(page: Page, path: string) {
  await page.goto(path);
  const image = await page.locator('meta[property="og:image"]').getAttribute("content");
  const alt = await page.locator('meta[property="og:image:alt"]').getAttribute("content");
  return { alt, image };
}

function readPngDimensions(bytes: Buffer): { width: number; height: number } {
  return { height: bytes.readUInt32BE(20), width: bytes.readUInt32BE(16) };
}

for (const route of ROUTES) {
  test(`serves a real 1200x630 PNG og:image for ${route.path}`, async ({ page, request }) => {
    const { alt, image } = await readOgImageMeta(page, route.path);
    expect(image).not.toBeNull();

    const response = await request.get(image ?? "");
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toBe("image/png");
    expect(response.headers()["cache-control"]).toBeTruthy();

    const body = await response.body();
    expect(readPngDimensions(body)).toEqual({ height: 630, width: 1200 });
    expect(alt).toEqual(expect.stringMatching(route.alt));
  });
}

test("each route's og:image is distinct generated content", async ({ page, request }) => {
  const urls = new Set<string>();
  const bodyHashes = new Set<string>();

  for (const route of ROUTES) {
    const { image } = await readOgImageMeta(page, route.path);
    expect(image).not.toBeNull();
    urls.add(image ?? "");

    const response = await request.get(image ?? "");
    const body = await response.body();
    bodyHashes.add(createHash("sha256").update(body).digest("hex"));
  }

  expect(urls.size).toBe(ROUTES.length);
  expect(bodyHashes.size).toBe(ROUTES.length);
});
