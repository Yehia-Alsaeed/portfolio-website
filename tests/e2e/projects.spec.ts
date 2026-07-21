import { expect, test } from "@playwright/test";

const FLAGSHIP_SLUGS = [
  "skillbridge-ai-interviewer",
  "llama-qlora-education-qa",
  "ai-study-planner-agents",
  "oxford-pet-binary-segmentation",
  "prestige-motors-showroom",
] as const;

test("serves the complete catalogue with the expected action links", async ({ page }) => {
  const response = await page.goto("/projects");

  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("17");
  await expect(page.locator("article")).toHaveCount(17);
  await expect(page.getByText("★ Flagship")).toHaveCount(5);
  await expect(page.locator('a[href^="/projects/"]')).toHaveCount(5);
  await expect(page.locator('a[href^="https://github.com/Yehia-Alsaeed/"]')).toHaveCount(12);

  for (const slug of FLAGSHIP_SLUGS) {
    await expect(page.locator(`a[href="/projects/${slug}"]`)).toHaveCount(1);
  }

  const githubLink = page.getByRole("link", { name: "View YOLOv8 Digit Detector on GitHub" });
  await expect(githubLink).toHaveAttribute(
    "href",
    "https://github.com/Yehia-Alsaeed/yolov8-handwritten-digit-detector",
  );
  await expect(githubLink).toHaveAttribute("target", "_blank");
  await expect(githubLink).toHaveAttribute("rel", "noopener noreferrer");

  const liveLink = page.getByRole("link", { name: "Open the Prestige Motors Showroom live site" });
  await expect(liveLink).toHaveAttribute("href", "https://prestige-motor.vercel.app/");
  await expect(liveLink).toHaveAttribute("target", "_blank");

  const caseStudyLink = page.getByRole("link", {
    name: "Read the Prestige Motors Showroom case study",
  });
  await expect(caseStudyLink).toHaveAttribute("href", "/projects/prestige-motors-showroom");
  await expect(caseStudyLink).not.toHaveAttribute("target", "_blank");
});

test("filters by category client-side and syncs the URL without a full navigation", async ({
  page,
}) => {
  await page.goto("/projects");

  await page.getByRole("button", { name: "Computer Vision" }).click();

  await expect(page).toHaveURL(/category=cv/);
  await expect(page.locator("article")).toHaveCount(2);
  await expect(page.getByRole("status")).toHaveText("2 projects");
  await expect(page.getByRole("button", { name: "Computer Vision" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );

  await page.getByRole("button", { name: "All" }).click();
  await expect(page).not.toHaveURL(/category=/);
  await expect(page.locator("article")).toHaveCount(17);
});

test("reconstructs filter state from the URL on load, reload, and back/forward navigation", async ({
  page,
}) => {
  await page.goto("/projects?category=cv");
  await expect(page.locator("article")).toHaveCount(2);
  await expect(page.getByRole("button", { name: "Computer Vision" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );

  await page.reload();
  await expect(page.locator("article")).toHaveCount(2);

  await page.goto("/projects?category=ml");
  await expect(page.locator("article")).toHaveCount(5);

  await page.goBack();
  await expect(page).toHaveURL(/category=cv/);
  await expect(page.locator("article")).toHaveCount(2);

  await page.goForward();
  await expect(page).toHaveURL(/category=ml/);
  await expect(page.locator("article")).toHaveCount(5);
});

test("resolves an invalid category value to All instead of an empty grid", async ({ page }) => {
  await page.goto("/projects?category=not-a-real-category");

  await expect(page.getByRole("button", { name: "All" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("status")).toHaveText("17 projects");
  await expect(page.locator("article")).toHaveCount(17);
});

test("operates the category filters by keyboard", async ({ page }) => {
  await page.goto("/projects");

  await page.getByRole("button", { name: "Computer Vision" }).press("Enter");

  await expect(page.getByRole("button", { name: "Computer Vision" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.locator("article")).toHaveCount(2);
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("still exposes every project record and its primary link", async ({ page }) => {
    const response = await page.goto("/projects");

    expect(response?.status()).toBe(200);
    await expect(page.locator("article")).toHaveCount(17);
    await expect(page.locator('a[href^="/projects/"]')).toHaveCount(5);
    await expect(page.locator('a[href^="https://github.com/Yehia-Alsaeed/"]')).toHaveCount(12);
  });
});
