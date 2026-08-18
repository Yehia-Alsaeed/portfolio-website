export const GITHUB_OWNER = "Yehia-Alsaeed";

export type ProjectCategorySlug = "llm" | "cv" | "ml" | "fs" | "games" | "dist";
export type CategorySlug = ProjectCategorySlug | "other";

export type ProjectCategory = { slug: CategorySlug; label: string };

export const PROJECT_CATEGORIES = [
  { label: "LLM & Agents", slug: "llm" },
  { label: "Computer Vision", slug: "cv" },
  { label: "ML & Data Science", slug: "ml" },
  { label: "Full-Stack & Mobile", slug: "fs" },
  { label: "Games & Game AI", slug: "games" },
  { label: "Distributed Systems", slug: "dist" },
] as const satisfies readonly ProjectCategory[];

export const CATEGORY_OTHER = { label: "Other", slug: "other" } as const satisfies ProjectCategory;

export const ALL_PROJECT_CATEGORIES = [
  ...PROJECT_CATEGORIES,
  CATEGORY_OTHER,
] as const satisfies readonly ProjectCategory[];

export function getCategoryLabel(slug: CategorySlug): string {
  return (
    ALL_PROJECT_CATEGORIES.find((category) => category.slug === slug)?.label ?? CATEGORY_OTHER.label
  );
}

/**
 * The single headline fact a card leads with. `value` is a measured figure
 * wherever the repository publishes one, and a concrete capability where it
 * does not - never an invented number. Every figure used is traceable to
 * either docs/content/phase-4-claim-ledger.md (the five case studies) or the
 * repository's own README results table.
 */
export type ProjectOutcome = { value: string; label: string };

export type ProjectFallbackRecord = {
  slug: string;
  name: string;
  description: string;
  /**
   * Lowercase GitHub-style tokens, used *only* to resolve the category via
   * TOPIC_CATEGORY_MAP. These are never rendered - `stack` is what the card
   * shows - so they stay in the vocabulary the category map understands.
   */
  topics: readonly string[];
  /** Display technologies, properly cased. Kept to four so cards stay compact. */
  stack: readonly string[];
  language: string;
  outcome: ProjectOutcome;
};

export type Project = {
  slug: string;
  name: string;
  description: string;
  category: CategorySlug;
  topics: readonly string[];
  stack: readonly string[];
  language: string;
  outcome: ProjectOutcome;
  repoUrl: `https://github.com/${string}`;
  liveUrl?: string;
  updatedAt?: string;
  isFlagship: boolean;
};
