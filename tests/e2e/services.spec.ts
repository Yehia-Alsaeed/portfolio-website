import { expect, test } from "@playwright/test";

test("serves /services with correct status, metadata, canonical, and one h1", async ({ page }) => {
  const response = await page.goto("/services");
  expect(response?.status()).toBe(200);

  await expect(page).toHaveTitle("Services | Yehia Alsaeed");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /.+/);

  const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
  expect(canonical).not.toBeNull();
  expect(new URL(canonical ?? "http://invalid").pathname).toBe("/services");

  const jsonLd = JSON.parse(
    (await page.locator('script[type="application/ld+json"]').first().textContent()) ?? "{}",
  );
  expect(jsonLd["@type"]).toBe("OfferCatalog");
  expect(jsonLd.itemListElement).toHaveLength(2);

  expect(await page.locator("h1").count()).toBe(1);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "I build stores & software that ship.",
  );
});

test("shows two offers and four process steps, with no availability line", async ({ page }) => {
  await page.goto("/services");

  // The availability line was deliberately dropped from under the h1. It still
  // appears in the page description and OG image, which are not rendered here.
  await expect(page.getByText("Available for select freelance projects.")).toHaveCount(0);

  await expect(
    page.getByRole("heading", { name: "Shopify stores, brief to first sale." }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Full-stack products, end to end." }),
  ).toBeVisible();

  for (const step of ["Discovery", "Build", "Verification", "Launch and handover"]) {
    await expect(page.getByRole("heading", { name: step, exact: true })).toBeVisible();
  }
});

test("renders the three visible client-work cards, all captured", async ({ page }) => {
  await page.goto("/services");

  const articles = page.getByRole("article");
  await expect(articles).toHaveCount(3);

  const madar = page.getByRole("article").filter({ hasText: "Madar Wears" });
  const laGlosse = page.getByRole("article").filter({ hasText: "La Glosse" });
  const loverboy = page.getByRole("article").filter({ hasText: "Loverboy Studio" });

  await expect(madar.locator("video")).toHaveCount(1);
  await expect(laGlosse.locator("video")).toHaveCount(1);
  await expect(loverboy.locator("video")).toHaveCount(1);

  await expect(madar.getByText("Apparel")).toBeVisible();
  await expect(madar.getByRole("heading", { name: "Madar Wears" })).toBeVisible();

  const madarLink = madar.getByRole("link", { name: "Open Madar Wears" });
  await expect(madarLink).toHaveAttribute("href", "https://www.madarwears.com/");
  await expect(madarLink).toHaveAttribute("target", "_blank");
  await expect(madarLink).toHaveAttribute("rel", "noopener noreferrer");

  const loverboyLink = loverboy.getByRole("link", { name: "Open Loverboy Studio" });
  await expect(loverboyLink).toHaveAttribute("href", "https://www.loverboy-studio.com/");
  await expect(loverboyLink).toHaveAttribute("rel", "noopener noreferrer");

  expect(await page.locator("iframe").count()).toBe(0);
  expect(await page.locator("video[autoplay]").count()).toBe(0);
});

// Nexo is hidden, not retired - its record is still in `src/content/services.ts`
// and is due back later. When it returns, this test flips back to asserting the
// card renders with its external link; it is not a licence to delete the entry.
test("keeps the hidden Nexo entry off the page", async ({ page }) => {
  await page.goto("/services");

  await expect(page.getByRole("article").filter({ hasText: "Nexo" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Open Nexo" })).toHaveCount(0);
  expect(await page.locator('a[href*="bh9d1w-16.myshopify.com"]').count()).toBe(0);
});

test("plays each capture inline and silently, with no controls to operate", async ({ page }) => {
  await page.goto("/services");
  const madar = page.getByRole("article").filter({ hasText: "Madar Wears" });
  const video = madar.locator("video");

  await expect(video).toBeVisible();
  expect(await video.getAttribute("autoplay")).toBeNull();
  expect(await video.getAttribute("controls")).toBeNull();
  expect(await video.getAttribute("loop")).not.toBeNull();
  expect(await video.evaluate((element: HTMLVideoElement) => element.muted)).toBe(true);
  expect(await video.getAttribute("poster")).toBeTruthy();

  // The capture carries meaning, so it must stay described for assistive tech.
  const describedBy = await video.getAttribute("aria-describedby");
  expect(describedBy).toBeTruthy();
  await expect(madar.locator(`#${describedBy}`)).toHaveText(/Madar Wears/);
});

test("falls back to the still frame when a recording fails to load", async ({ page }) => {
  await page.goto("/services");
  const madar = page.getByRole("article").filter({ hasText: "Madar Wears" });

  await madar.locator("video").evaluate((element: HTMLVideoElement) => {
    element.dispatchEvent(new Event("error"));
  });

  await expect(madar.getByRole("img")).toBeVisible();
  await expect(madar.locator("video")).toHaveCount(0);
});

test("links to the contact section and a mailto action", async ({ page }) => {
  await page.goto("/services");

  await expect(page.getByRole("link", { name: "Start a conversation" })).toHaveAttribute(
    "href",
    "/#contact",
  );
  await expect(page.getByRole("link", { name: "Email directly" })).toHaveAttribute(
    "href",
    "mailto:yehias3eed11@gmail.com",
  );
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("/services stays fully readable, with a still frame standing in for each capture", async ({
    page,
  }) => {
    const response = await page.goto("/services");
    expect(response?.status()).toBe(200);

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("article")).toHaveCount(3);

    // Playback is driven by an IntersectionObserver, so with scripting off the
    // `poster` still is what a visitor actually sees - it has to be there.
    for (const name of ["Madar Wears", "La Glosse", "Loverboy Studio"]) {
      const video = page.getByRole("article").filter({ hasText: name }).locator("video");
      await expect(video).toHaveCount(1);
      expect(await video.getAttribute("poster")).toBeTruthy();
    }

    await expect(page.getByRole("link", { name: "Start a conversation" })).toBeVisible();
  });
});
