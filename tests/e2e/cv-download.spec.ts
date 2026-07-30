import { expect, test } from "@playwright/test";

const CV_PATH = "/cv/Yehia_Alsaeed_CV_AI.pdf";
const CV_FILENAME = "Yehia_Alsaeed_CV_AI.pdf";

test("serves the CV as a real PDF, not an HTML fallback", async ({ request }) => {
  const response = await request.get(CV_PATH);

  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toBe("application/pdf");

  const body = await response.body();
  expect(body.byteLength).toBeGreaterThan(0);
  // Real PDFs start with the "%PDF-" magic bytes; an accidental HTML
  // fallback (e.g. the branded 404) would start with "<!DOCTYPE" instead.
  expect(body.subarray(0, 5).toString("latin1")).toBe("%PDF-");

  const contentDisposition = response.headers()["content-disposition"];
  if (contentDisposition) {
    // The filename is a static constant with no user input, so there is no
    // injection surface - this only guards against an accidental unsafe
    // value being introduced later. Vercel's own static-file serving wraps
    // the filename in quotes (the standard RFC 6266 form), which is
    // expected and safe, so this checks for the exact known-good filename
    // rather than rejecting quote characters outright.
    expect(contentDisposition).toMatch(
      new RegExp(`^inline; filename="?${CV_FILENAME.replace(/\./g, "\\.")}"?$`),
    );
  }
});

test("downloads the CV with the expected filename from the footer link", async ({ page }) => {
  await page.goto("/");

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("contentinfo").getByRole("link", { name: "Download CV" }).click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toBe(CV_FILENAME);
});
