import { expect, test } from "./fixtures";

const CASE_STUDIES = [
  "skillbridge-ai-interviewer",
  "llama-qlora-education-qa",
  "ai-study-planner-agents",
  "oxford-pet-binary-segmentation",
  "prestige-motors-showroom",
] as const;

for (const slug of CASE_STUDIES) {
  test(`${slug} shows static architecture proof without an interactive architecture control`, async ({
    page,
  }) => {
    await page.goto(`/projects/${slug}`);

    await expect(page.getByRole("heading", { name: "Architecture proof" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "System flow" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Relationships" })).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Explore interactive architecture" }),
    ).toHaveCount(0);
    await expect(page.getByRole("region", { name: /Interactive architecture/ })).toHaveCount(0);
  });
}

test("Oxford: selecting each model updates the approved metrics and image label", async ({
  page,
}) => {
  await page.goto("/projects/oxford-pet-binary-segmentation");

  const microscope = page.locator('[aria-label="Select a model"]').locator("..");

  await microscope.getByRole("button", { name: "HRNet-W18" }).click();
  await expect(microscope.getByRole("img")).toHaveAccessibleName(/HRNet-W18/);
  await expect(microscope.getByText("0.9306")).toBeVisible();
  await expect(microscope.getByText("0.0633s")).toBeVisible();
  await expect(microscope.getByText("11.44M")).toBeVisible();

  await microscope.getByRole("button", { name: "SegNet-VGG16" }).click();
  await expect(microscope.getByRole("img")).toHaveAccessibleName(/SegNet-VGG16/);
  await expect(microscope.getByText("29.46M")).toBeVisible();

  await microscope.getByRole("button", { name: "FCN-ResNet18" }).click();
  await expect(microscope.getByRole("img")).toHaveAccessibleName(/FCN-ResNet18/);
  await expect(microscope.getByText("Not published")).toBeVisible();
});

test("Study Planner omits the project-specific Agent run replay", async ({ page }) => {
  await page.goto("/projects/ai-study-planner-agents");

  await expect(page.getByRole("heading", { name: "Agent run replay" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Play", exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Reset", exact: true })).toHaveCount(0);
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  for (const slug of CASE_STUDIES) {
    test(`${slug} keeps its complete static architecture proof readable`, async ({ page }) => {
      await page.goto(`/projects/${slug}`);
      await expect(page.getByRole("heading", { name: "Architecture proof" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "System flow" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Relationships" })).toHaveCount(0);
    });
  }

  test("Oxford keeps the complete model comparison readable", async ({ page }) => {
    await page.goto("/projects/oxford-pet-binary-segmentation");
    // The architecture proof above also has an "FCN-ResNet18" pipeline node,
    // so scope to the model-comparison section specifically.
    const section = page.getByRole("heading", { name: "Model comparison" }).locator("..");
    for (const label of ["FCN-ResNet18", "SegNet-VGG16", "HRNet-W18"]) {
      await expect(section.getByRole("heading", { name: label })).toBeVisible();
    }
    await expect(section.getByText("0.9306")).toBeVisible();
  });
});

const RESPONSIVE_WIDTHS = [
  { height: 844, width: 390 },
  { height: 1024, width: 768 },
  { height: 1000, width: 1440 },
] as const;
const RESPONSIVE_ROUTES = [
  "/services",
  "/projects/skillbridge-ai-interviewer",
  "/projects/oxford-pet-binary-segmentation",
  "/projects/ai-study-planner-agents",
] as const;

for (const viewport of RESPONSIVE_WIDTHS) {
  test(`adapts every case-study system flow at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);

    for (const slug of CASE_STUDIES) {
      await page.goto(`/projects/${slug}`);

      const flow = page.getByRole("heading", { name: "System flow" }).locator("..");
      const stages = flow.getByRole("listitem");
      expect(await stages.count(), `${slug} flow stage count`).toBeGreaterThanOrEqual(4);

      const firstStageBox = await stages.nth(0).boundingBox();
      const secondStageBox = await stages.nth(1).boundingBox();
      expect(firstStageBox, `${slug} first flow stage box`).not.toBeNull();
      expect(secondStageBox, `${slug} second flow stage box`).not.toBeNull();

      if (firstStageBox && secondStageBox && viewport.width < 768) {
        expect(secondStageBox.y, `${slug} mobile flow should progress vertically`).toBeGreaterThan(
          firstStageBox.y + firstStageBox.height,
        );
      }

      if (firstStageBox && secondStageBox && viewport.width >= 768) {
        expect(
          Math.abs(secondStageBox.y - firstStageBox.y),
          `${slug} tablet/desktop flow should progress horizontally`,
        ).toBeLessThanOrEqual(2);
        expect(
          secondStageBox.x,
          `${slug} second flow stage should sit to the right`,
        ).toBeGreaterThan(firstStageBox.x + firstStageBox.width);
      }

      const widths = await page.evaluate(() => ({
        client: document.documentElement.clientWidth,
        scroll: document.documentElement.scrollWidth,
      }));
      expect(widths.scroll, `${slug} horizontal containment`).toBeLessThanOrEqual(widths.client);
    }
  });
}

for (const route of RESPONSIVE_ROUTES) {
  for (const viewport of RESPONSIVE_WIDTHS) {
    test(`stays inside the viewport at ${route} (${viewport.width}px)`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto(route);

      const widths = await page.evaluate(() => ({
        client: document.documentElement.clientWidth,
        scroll: document.documentElement.scrollWidth,
      }));
      expect(widths.scroll).toBeLessThanOrEqual(widths.client);
    });
  }
}

for (const route of [
  "/services",
  "/projects/skillbridge-ai-interviewer",
  "/projects/oxford-pet-binary-segmentation",
  "/projects/ai-study-planner-agents",
] as const) {
  test(`has no WCAG A or AA violations at ${route}`, async ({ page, makeAxeBuilder }) => {
    await page.goto(route);
    const result = await makeAxeBuilder().analyze();
    expect(result.violations).toEqual([]);
  });
}
