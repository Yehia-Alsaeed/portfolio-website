import type { ProjectCategorySlug } from "@/features/projects/model";

export const FLAGSHIP_SLUGS = [
  "skillbridge-ai-interviewer",
  "llama-qlora-education-qa",
  "ai-study-planner-agents",
  "oxford-pet-binary-segmentation",
  "prestige-motors-showroom",
] as const;

export type FlagshipSlug = (typeof FLAGSHIP_SLUGS)[number];

export function isFlagshipSlug(slug: string): slug is FlagshipSlug {
  return (FLAGSHIP_SLUGS as readonly string[]).includes(slug);
}

/** Curated display order matching the approved mockups/demo/projects.html grid. */
export const PROJECT_ORDER = [
  "skillbridge-ai-interviewer",
  "llama-qlora-education-qa",
  "ai-study-planner-agents",
  "oxford-pet-binary-segmentation",
  "yolov8-handwritten-digit-detector",
  "prestige-motors-showroom",
  "trip-mate-travel-planner-app",
  "bank-churn-imbalanced-classification",
  "supervised-ml-classification-regression",
  "superstore-sales-data-analysis",
  "rff-wine-quality-classifier",
  "airport-luggage-robot-planning",
  "lost-in-the-woods-unity-platformer",
  "connect-six-ai-game",
  "game-tree-alpha-beta-board-game",
  "java-socket-clothing-store-system",
  "java-rmi-event-notification-system",
] as const;

/** Approved live deployments, keyed by repository slug. */
export const LIVE_URLS: Readonly<Record<string, string>> = {
  "prestige-motors-showroom": "https://prestige-motor.vercel.app/",
};

/**
 * Manual category corrections keyed by repository slug, applied before topic
 * mapping. skillbridge-ai-interviewer carries both `computer-vision` and
 * `llm` topics on GitHub (real repo, not the curated fallback); topic mapping
 * picks whichever comes first alphabetically, which resolved to Computer
 * Vision instead of the intended LLM category once live GitHub data was
 * verified against the deployed preview. Forced here to match the approved
 * case-study framing.
 */
export const CATEGORY_OVERRIDES: Readonly<Record<string, ProjectCategorySlug>> = {
  "skillbridge-ai-interviewer": "llm",
};

/** Manual display-copy corrections keyed by repository slug. Empty today. */
export const DISPLAY_OVERRIDES: Readonly<Record<string, { name?: string; description?: string }>> =
  {};

/** Repository slugs excluded from the catalogue regardless of GitHub state. */
export const HIDDEN_SLUGS: readonly string[] = [];
