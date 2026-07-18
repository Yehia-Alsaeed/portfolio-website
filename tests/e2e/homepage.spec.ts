import { expect, test, type Page } from "@playwright/test";

const PROJECTS = [
  ["SkillBridge AI Interviewer", "https://github.com/Yehia-Alsaeed/skillbridge-ai-interviewer"],
  ["Llama QLoRA Education QA", "https://github.com/Yehia-Alsaeed/llama-qlora-education-qa"],
  ["AI Study Planner Agents", "https://github.com/Yehia-Alsaeed/ai-study-planner-agents"],
  ["Oxford Pet Segmentation", "https://github.com/Yehia-Alsaeed/oxford-pet-binary-segmentation"],
  ["Prestige Motors Showroom", "https://github.com/Yehia-Alsaeed/prestige-motors-showroom"],
] as const;

function collectBrowserErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

test("serves the complete recruiter-first homepage with production metadata", async ({ page }) => {
  const errors = collectBrowserErrors(page);
  const response = await page.goto("/");

  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle("Yehia Alsaeed | AI/ML Engineer and Web Developer");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /AI\/ML/);
  const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
  expect(canonical).not.toBeNull();
  expect(new URL(canonical ?? "http://invalid").pathname).toBe("/");
  await expect(page.getByRole("heading", { level: 1, name: "Yehia Alsaeed" })).toBeVisible();
  expect(await page.locator("h1").count()).toBe(1);

  const sectionOrder = await page
    .locator("main section[id]")
    .evaluateAll((sections) => sections.map((section) => section.id));
  expect(sectionOrder).toEqual([
    "monogram",
    "positioning",
    "stats",
    "work",
    "experience",
    "services",
    "contact",
  ]);
  expect(await page.locator("[id=contact]").count()).toBe(1);
  expect(errors).toEqual([]);
});

test("exposes both audience paths and all five real flagship destinations", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("link", { name: "View AI/ML work" }).click();
  await expect(page).toHaveURL(/#work$/);
  await expect(page.locator("#work")).toBeInViewport();

  for (const [name, href] of PROJECTS) {
    await expect(page.getByRole("link", { name })).toHaveAttribute("href", href);
  }

  await page.getByRole("link", { name: "Explore client services" }).click();
  await expect(page).toHaveURL(/\/services$/);
});

test("renders experience, services, contact, and a truthful invalid form state", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /Dell Technologies/ })).toBeVisible();
  await expect(page.getByText("PyTorch", { exact: false })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Shopify, built to convert." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Full-stack, end to end." })).toBeVisible();
  await expect(page.getByRole("link", { name: /yehias3eed11@gmail.com/ })).toBeVisible();
  await expect(page.getByLabel("Inquiry type")).toBeVisible();
  await expect(page.getByLabel("Name", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Email", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Message", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("contentinfo").getByRole("link", { name: "Download CV" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Prepare email" }).click();
  const alert = page.getByRole("alert").filter({ hasText: "Complete every field" });
  await expect(alert).toContainText("Complete every field");
  await expect(alert).toBeFocused();

  await expect(
    page.locator("[data-project-preview], #project-preview, .project-preview"),
  ).toHaveCount(0);
});
