import { expect, test } from "@playwright/test";

test("serves /services with correct status, metadata, canonical, and one h1", async ({ page }) => {
  const response = await page.goto("/services");
  expect(response?.status()).toBe(200);

  await expect(page).toHaveTitle("Services | Yehia Alsaeed");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /.+/);

  const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
  expect(canonical).not.toBeNull();
  expect(new URL(canonical ?? "http://invalid").pathname).toBe("/services");

  expect(await page.locator("h1").count()).toBe(1);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "I build stores & software that ship.",
  );
});

test("shows the exact availability line, two offers, and four process steps", async ({ page }) => {
  await page.goto("/services");

  await expect(page.getByText("Available for select freelance projects.")).toBeVisible();

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

test("renders exactly three client-work entries with captured media only for Madar/La Glosse and text-only Nexo", async ({
  page,
}) => {
  await page.goto("/services");

  const articles = page.getByRole("article");
  await expect(articles).toHaveCount(3);

  const madar = page.getByRole("article").filter({ hasText: "Madar Wears" });
  const laGlosse = page.getByRole("article").filter({ hasText: "La Glosse" });
  const nexo = page.getByRole("article").filter({ hasText: "Nexo" });

  await expect(madar.getByRole("img")).toBeVisible();
  await expect(laGlosse.getByRole("img")).toBeVisible();
  await expect(nexo.getByRole("img")).toHaveCount(0);

  const madarLink = madar.getByRole("link", { name: "Open Madar Wears ↗" });
  await expect(madarLink).toHaveAttribute("href", "https://www.madarwears.com/");
  await expect(madarLink).toHaveAttribute("target", "_blank");
  await expect(madarLink).toHaveAttribute("rel", "noopener noreferrer");

  const nexoLink = nexo.getByRole("link", { name: "Open Nexo ↗" });
  await expect(nexoLink).toHaveAttribute("href", "https://bh9d1w-16.myshopify.com/");
  await expect(nexoLink).toHaveAttribute("rel", "noopener noreferrer");

  expect(await page.locator("iframe").count()).toBe(0);
  expect(await page.locator("video[autoplay]").count()).toBe(0);
});

test("keyboard-switches Madar Wears between Desktop and Mobile, and opens the recording without autoplay", async ({
  page,
}) => {
  await page.goto("/services");
  const madar = page.getByRole("article").filter({ hasText: "Madar Wears" });

  const desktopButton = madar.getByRole("button", { name: "Desktop" });
  const mobileButton = madar.getByRole("button", { name: "Mobile" });

  await expect(desktopButton).toHaveAttribute("aria-pressed", "true");
  const desktopAlt = await madar.getByRole("img").getAttribute("alt");

  await mobileButton.focus();
  await page.keyboard.press("Enter");
  await expect(mobileButton).toHaveAttribute("aria-pressed", "true");
  await expect(desktopButton).toHaveAttribute("aria-pressed", "false");
  const mobileAlt = await madar.getByRole("img").getAttribute("alt");
  expect(mobileAlt).not.toBe(desktopAlt);

  await expect(madar.locator("video")).toHaveCount(0);
  await madar.getByText("Watch short recording").click();
  const video = madar.locator("video");
  await expect(video).toBeVisible();
  expect(await video.getAttribute("autoplay")).toBeNull();
  expect(await video.evaluate((element: HTMLVideoElement) => element.muted)).toBe(true);
  expect(await video.getAttribute("poster")).toBeTruthy();

  // A failed/aborted recording must leave the screenshot in place, not a broken frame.
  await video.evaluate((element: HTMLVideoElement) => {
    element.dispatchEvent(new Event("error"));
  });
  await expect(madar.getByRole("img")).toBeVisible();
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

  test("/services stays fully readable, including both client screenshots", async ({ page }) => {
    const response = await page.goto("/services");
    expect(response?.status()).toBe(200);

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText("Available for select freelance projects.")).toBeVisible();
    await expect(page.getByRole("article")).toHaveCount(3);

    const madar = page.getByRole("article").filter({ hasText: "Madar Wears" });
    const laGlosse = page.getByRole("article").filter({ hasText: "La Glosse" });
    await expect(madar.getByRole("img")).toBeVisible();
    await expect(laGlosse.getByRole("img")).toBeVisible();

    await expect(page.getByRole("link", { name: "Start a conversation" })).toBeVisible();
  });
});
