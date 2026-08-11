import { expect, test } from "@playwright/test";

const CASE_STUDIES = [
  {
    hasEvidence: true,
    slug: "skillbridge-ai-interviewer",
    title: "SkillBridge AI Interviewer",
  },
  { hasEvidence: false, slug: "llama-qlora-education-qa", title: "Llama QLoRA Education QA" },
  { hasEvidence: true, slug: "ai-study-planner-agents", title: "AI Study Planner Agents" },
  {
    hasEvidence: true,
    slug: "oxford-pet-binary-segmentation",
    title: "Oxford Pet Segmentation",
  },
  { hasEvidence: true, slug: "prestige-motors-showroom", title: "Prestige Motors Showroom" },
] as const;

const CASE_STUDY_LAYOUTS = [
  { height: 844, layout: "stacked", name: "mobile", width: 390 },
  { height: 1024, layout: "split", name: "tablet portrait", width: 768 },
  { height: 768, layout: "split", name: "tablet landscape", width: 1024 },
  { height: 1000, layout: "split", name: "desktop", width: 1440 },
] as const;

for (const { hasEvidence, slug, title } of CASE_STUDIES) {
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

    // Phase 5: every flagship gets static architecture proof alongside its prose.
    await expect(page.getByRole("heading", { name: "Architecture proof" })).toBeVisible();

    await expect(page.getByRole("heading", { exact: true, name: "05 - Limitations" })).toHaveCount(
      0,
    );
    await expect(
      page.getByRole("heading", { exact: true, name: "06 - Reproducibility" }),
    ).toHaveCount(0);

    const evidenceHeading = page.getByRole("heading", { exact: true, name: "05 - Evidence" });
    if (hasEvidence) {
      await expect(evidenceHeading).toBeVisible();
    } else {
      await expect(evidenceHeading).toHaveCount(0);
    }
  });
}

for (const viewport of CASE_STUDY_LAYOUTS) {
  test(`lays out every case-study problem section correctly at ${viewport.name} width`, async ({
    page,
  }) => {
    await page.setViewportSize({ height: viewport.height, width: viewport.width });

    for (const { slug } of CASE_STUDIES) {
      await page.goto(`/projects/${slug}`);

      const section = page
        .getByRole("heading", { exact: true, name: "01 - The problem" })
        .locator("xpath=ancestor::section");
      const problemTitle = section.getByRole("heading", {
        exact: true,
        name: "01 - The problem",
      });
      const problem = section.locator("p").first();
      const constraints = section.getByRole("heading", { exact: true, name: "Constraints" });
      const firstConstraint = section.locator("li").first();

      await expect(problemTitle).toBeVisible();
      await expect(problem).toBeVisible();
      await expect(constraints).toBeVisible();
      await expect(firstConstraint).toBeVisible();

      const problemTitleBox = await problemTitle.boundingBox();
      const problemBox = await problem.boundingBox();
      const constraintsBox = await constraints.boundingBox();
      const firstConstraintBox = await firstConstraint.boundingBox();
      expect(problemTitleBox, `${slug} problem title box`).not.toBeNull();
      expect(problemBox, `${slug} problem box`).not.toBeNull();
      expect(constraintsBox, `${slug} constraints box`).not.toBeNull();
      expect(firstConstraintBox, `${slug} first constraint box`).not.toBeNull();

      if (
        problemTitleBox &&
        problemBox &&
        constraintsBox &&
        firstConstraintBox &&
        viewport.layout === "split"
      ) {
        expect(
          constraintsBox.x,
          `${slug} constraints should be in the right column`,
        ).toBeGreaterThan(problemBox.x + problemBox.width);
        expect(
          Math.abs(constraintsBox.y - problemTitleBox.y),
          `${slug} labels should share one line`,
        ).toBeLessThanOrEqual(2);
        expect(
          Math.abs(firstConstraintBox.y - problemBox.y),
          `${slug} body columns should align below their labels`,
        ).toBeLessThanOrEqual(2);
      }

      if (problemBox && constraintsBox && viewport.layout === "stacked") {
        expect(
          constraintsBox.y,
          `${slug} constraints should stack below the problem`,
        ).toBeGreaterThan(problemBox.y + problemBox.height);
      }

      const pageWidth = await page.evaluate(() => ({
        client: document.documentElement.clientWidth,
        scroll: document.documentElement.scrollWidth,
      }));
      expect(pageWidth.scroll, `${slug} horizontal containment`).toBeLessThanOrEqual(
        pageWidth.client,
      );
    }
  });
}

for (const viewport of CASE_STUDY_LAYOUTS) {
  test(`places points 02 and 03 in full-width sequential rows at ${viewport.name} width`, async ({
    page,
  }) => {
    await page.setViewportSize({ height: viewport.height, width: viewport.width });

    for (const { slug } of CASE_STUDIES) {
      await page.goto(`/projects/${slug}`);

      const problemSection = page
        .getByRole("heading", { exact: true, name: "01 - The problem" })
        .locator("xpath=ancestor::section");
      const approachSection = page
        .getByRole("heading", { exact: true, name: "02 - Approach" })
        .locator("xpath=ancestor::section");
      const architectureSection = page
        .getByRole("heading", { exact: true, name: "03 - Architecture and stack" })
        .locator("xpath=ancestor::section");

      const problemBox = await problemSection.boundingBox();
      const approachBox = await approachSection.boundingBox();
      const architectureBox = await architectureSection.boundingBox();
      const approachProseBox = await approachSection.locator("p").first().boundingBox();
      const architectureProseBox = await architectureSection.locator("p").first().boundingBox();
      expect(problemBox, `${slug} problem section box`).not.toBeNull();
      expect(approachBox, `${slug} approach section box`).not.toBeNull();
      expect(architectureBox, `${slug} architecture section box`).not.toBeNull();
      expect(approachProseBox, `${slug} approach prose box`).not.toBeNull();
      expect(architectureProseBox, `${slug} architecture prose box`).not.toBeNull();

      if (problemBox && approachBox && architectureBox) {
        expect(
          Math.abs(approachBox.x - problemBox.x),
          `${slug} approach should share the full-row left edge`,
        ).toBeLessThanOrEqual(2);
        expect(
          Math.abs(architectureBox.x - problemBox.x),
          `${slug} architecture should share the full-row left edge`,
        ).toBeLessThanOrEqual(2);
        expect(
          Math.abs(approachBox.width - problemBox.width),
          `${slug} approach should fill the row`,
        ).toBeLessThanOrEqual(2);
        expect(
          Math.abs(architectureBox.width - problemBox.width),
          `${slug} architecture should fill the row`,
        ).toBeLessThanOrEqual(2);
        expect(
          architectureBox.y,
          `${slug} architecture should stack below approach`,
        ).toBeGreaterThanOrEqual(approachBox.y + approachBox.height - 1);
      }

      if (approachBox && approachProseBox) {
        expect(
          Math.abs(approachProseBox.width - approachBox.width),
          `${slug} approach copy should use the row width`,
        ).toBeLessThanOrEqual(2);
      }

      if (architectureBox && architectureProseBox) {
        expect(
          Math.abs(architectureProseBox.width - architectureBox.width),
          `${slug} architecture copy should use the row width`,
        ).toBeLessThanOrEqual(2);
      }

      const pageWidth = await page.evaluate(() => ({
        client: document.documentElement.clientWidth,
        scroll: document.documentElement.scrollWidth,
      }));
      expect(pageWidth.scroll, `${slug} horizontal containment`).toBeLessThanOrEqual(
        pageWidth.client,
      );
    }
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
