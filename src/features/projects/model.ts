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

export type ProjectFallbackRecord = {
  slug: string;
  name: string;
  description: string;
  topics: readonly string[];
  language: string;
  stars: number;
};

export type Project = {
  slug: string;
  name: string;
  description: string;
  category: CategorySlug;
  topics: readonly string[];
  language: string;
  stars: number;
  repoUrl: `https://github.com/${string}`;
  liveUrl?: string;
  updatedAt?: string;
  isFlagship: boolean;
};
