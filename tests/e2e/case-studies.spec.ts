import { expect, test } from "@playwright/test";

const CASE_STUDIES = [
  { slug: "skillbridge-ai-interviewer", title: "SkillBridge AI Interviewer" },
  { slug: "llama-qlora-education-qa", title: "Llama QLoRA Education QA" },
  { slug: "ai-study-planner-agents", title: "AI Study Planner Agents" },
  { slug: "oxford-pet-binary-segmentation", title: "Oxford Pet Segmentation" },
  { slug: "prestige-motors-showroom", title: "Prestige Motors Showroom" },
] as const;

for (const { slug, title } of CASE_STUDIES) {
  test(`serves ${slug} with correct HTTP status, metadata, heading, and actions`, async ({
    page,
  }) => {
    const response = await page.goto(`/projects/${slug}`);
    expect(response?.status()).toBe(200);

    await expect(page).toHaveTitle(`${title} | Yehia Alsaeed`);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /.+/);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", title);
    await expect(page.locator('meta[property="og:description"]')).toHaveAttribute("content", /.+/);

    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    expect(canonical).not.toBeNull();
    expect(new URL(canonical ?? "http://invalid").pathname).toBe(`/projects/${slug}`);

    expect(await page.locator("h1").count()).toBe(1);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(title);

    const githubLink = page.getByRole("link", { name: "View on GitHub ↗" });
    await expect(githubLink).toHaveAttribute("href", `https://github.com/Yehia-Alsaeed/${slug}`);
    await expect(githubLink).toHaveAttribute("target", "_blank");
    await expect(githubLink).toHaveAttribute("rel", "noopener noreferrer");

    await expect(page.getByRole("navigation", { name: "Case study navigation" })).toBeVisible();
  });
}

test("returns a 404 status for an unknown case-study slug", async ({ page }) => {
  const response = await page.goto("/projects/not-a-real-project");
  expect(response?.status()).toBe(404);
});

test("shows a Live site action only for Prestige Motors", async ({ page }) => {
  await page.goto("/projects/prestige-motors-showroom");
  await expect(page.getByRole("link", { name: "Live site ↗" })).toHaveAttribute(
    "href",
    "https://prestige-motor.vercel.app/",
  );

  await page.goto("/projects/skillbridge-ai-interviewer");
  await expect(page.getByRole("link", { name: "Live site ↗" })).toHaveCount(0);
});

test("previous/next navigation moves through the approved flagship order", async ({ page }) => {
  await page.goto("/projects/skillbridge-ai-interviewer");
  await page
    .getByRole("navigation", { name: "Case study navigation" })
    .getByRole("link", { name: /Llama QLoRA Education QA/ })
    .click();
  await expect(page).toHaveURL(/\/projects\/llama-qlora-education-qa$/);

  await page.getByRole("link", { name: "All projects" }).click();
  await expect(page).toHaveURL(/\/projects$/);
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  for (const { slug, title } of CASE_STUDIES) {
    test(`${slug} stays fully readable with JavaScript disabled`, async ({ page }) => {
      const response = await page.goto(`/projects/${slug}`);
      expect(response?.status()).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toContainText(title);
      await expect(page.getByRole("link", { name: "View on GitHub ↗" })).toBeVisible();
      await expect(page.getByRole("navigation", { name: "Case study navigation" })).toBeVisible();
    });
  }
});
