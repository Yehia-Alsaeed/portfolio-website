import { expect, test } from "./fixtures";

const CASE_STUDIES = [
  "skillbridge-ai-interviewer",
  "llama-qlora-education-qa",
  "ai-study-planner-agents",
  "oxford-pet-binary-segmentation",
  "prestige-motors-showroom",
] as const;

for (const slug of CASE_STUDIES) {
  test(`${slug} shows static architecture proof and loads the interactive canvas only after activation`, async ({
    page,
  }) => {
    await page.goto(`/projects/${slug}`);

    await expect(page.getByRole("heading", { name: "Architecture proof" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Relationships" })).toBeVisible();
    expect(await page.locator("[aria-label*='Interactive architecture']").count()).toBe(0);

    const launchButton = page.getByRole("button", { name: "Explore interactive architecture" });
    await launchButton.click();

    const region = page.getByRole("region", { name: /Interactive architecture/ });
    await expect(region).toBeVisible();
    await expect(region.getByRole("button", { name: "Fit View" })).toBeVisible();

    // Static proof must never be hidden by the interactive enhancement.
    await expect(page.getByRole("heading", { name: "Architecture proof" })).toBeVisible();
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

test("Study Planner: selects stages, plays, and resets deterministically", async ({ page }) => {
  await page.goto("/projects/ai-study-planner-agents");

  await page.getByRole("button", { name: "Critic", exact: true }).click();
  await expect(page.getByRole("button", { name: "Critic", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.getByRole("status").filter({ hasText: "Stage" })).toContainText(
    "Stage 3 of 4: Plan Critic",
  );

  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(page.getByRole("button", { name: "Profiler", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );

  await page.getByRole("button", { name: "Play", exact: true }).click();
  await expect(page.getByRole("button", { name: "Generator", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
    { timeout: 5000 },
  );

  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(page.getByRole("button", { name: "Profiler", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  // Give any (incorrectly) surviving timer a chance to fire before asserting it didn't.
  await page.waitForTimeout(2500);
  await expect(page.getByRole("button", { name: "Profiler", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  for (const slug of CASE_STUDIES) {
    test(`${slug} keeps its complete static architecture proof readable`, async ({ page }) => {
      await page.goto(`/projects/${slug}`);
      await expect(page.getByRole("heading", { name: "Architecture proof" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Relationships" })).toBeVisible();
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

  test("Study Planner keeps the complete four-stage transcript readable", async ({ page }) => {
    await page.goto("/projects/ai-study-planner-agents");
    // Scope to the static transcript's own <ol>: the architecture proof
    // above reuses these same four stage names as pipeline node labels, and
    // the live replay's own status line also echoes the current stage name.
    const section = page
      .getByRole("heading", { name: "Agent run replay" })
      .locator("..")
      .locator("ol");
    for (const label of [
      "Student Profiler",
      "Study Plan Generator",
      "Plan Critic",
      "Plan Optimizer",
    ]) {
      await expect(section.getByText(label)).toBeVisible();
    }
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
