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

/**
 * Tiebreaker order within each flagship tier - the catalogue sorts the five
 * flagships ahead of everything else first, then falls back to this list.
 */
export const PROJECT_ORDER = [
  "skillbridge-ai-interviewer",
  "llama-qlora-education-qa",
  "ai-study-planner-agents",
  "oxford-pet-binary-segmentation",
  "prestige-motors-showroom",
  "yolov8-handwritten-digit-detector",
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
 * Manual category pins, applied before topic mapping. This existed because
 * live GitHub topics used to drive categorisation and skillbridge carries both
 * `computer-vision` and `llm` upstream, which resolved to the wrong category.
 * Categorisation now runs off the reviewed topics in fallback.ts, so this pin
 * agrees with the topic map rather than correcting it - it stays as an
 * explicit statement of intent for a project that legitimately spans both.
 */
export const CATEGORY_OVERRIDES: Readonly<Record<string, ProjectCategorySlug>> = {
  "skillbridge-ai-interviewer": "llm",
};
