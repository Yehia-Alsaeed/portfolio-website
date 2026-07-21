import { FALLBACK_PROJECTS } from "@/content/projects/fallback";
import {
  CATEGORY_OVERRIDES,
  DISPLAY_OVERRIDES,
  HIDDEN_SLUGS,
  isFlagshipSlug,
  LIVE_URLS,
  PROJECT_ORDER,
} from "@/content/projects/overrides";
import { fetchGithubRepos, type GithubRepo } from "@/features/projects/github";
import {
  CATEGORY_OTHER,
  GITHUB_OWNER,
  type CategorySlug,
  type Project,
  type ProjectCategorySlug,
} from "@/features/projects/model";

/**
 * Maps GitHub topic tokens to the six approved categories. Only specific,
 * unambiguous tokens are listed — generic tech tags (pytorch, react, java...)
 * are intentionally excluded so they never mis-route a project into the
 * wrong category.
 */
const TOPIC_CATEGORY_MAP: Readonly<Record<string, ProjectCategorySlug>> = {
  agents: "llm",
  "board-game": "games",
  "computer-vision": "cv",
  "data-science": "ml",
  "distributed-systems": "dist",
  "fine-tuning": "llm",
  flutter: "fs",
  fullstack: "fs",
  "game-ai": "games",
  "game-development": "games",
  llm: "llm",
  "machine-learning": "ml",
  mern: "fs",
  mobile: "fs",
  "multi-agent": "llm",
  "object-detection": "cv",
  qlora: "llm",
  "reinforcement-learning": "ml",
  segmentation: "cv",
  unity: "games",
  web: "fs",
};

export function mapTopicsToCategory(topics: readonly string[]): CategorySlug {
  for (const topic of topics) {
    const mapped = TOPIC_CATEGORY_MAP[topic];
    if (mapped) return mapped;
  }
  return CATEGORY_OTHER.slug;
}

export function resolveCategory(
  slug: string,
  topics: readonly string[],
  overrides: Readonly<Record<string, ProjectCategorySlug>> = CATEGORY_OVERRIDES,
): CategorySlug {
  return overrides[slug] ?? mapTopicsToCategory(topics);
}

function orderIndex(slug: string): number {
  const index = PROJECT_ORDER.indexOf(slug as (typeof PROJECT_ORDER)[number]);
  return index === -1 ? PROJECT_ORDER.length : index;
}

/**
 * Deterministically merges the reviewed fallback catalogue with live GitHub
 * data (when available). Every field falls back to the reviewed record when
 * `liveRepos` is `null` or a given slug is absent from it, so the catalogue
 * always renders the complete, approved 17-project set.
 */
export function buildCatalogue(liveRepos: readonly GithubRepo[] | null): readonly Project[] {
  const liveBySlug = new Map((liveRepos ?? []).map((repo) => [repo.slug, repo] as const));

  const projects = FALLBACK_PROJECTS.filter((record) => !HIDDEN_SLUGS.includes(record.slug)).map(
    (record): Project => {
      const live = liveBySlug.get(record.slug);
      const topics = live?.topics ?? record.topics;
      const display = DISPLAY_OVERRIDES[record.slug];
      const liveUrl = LIVE_URLS[record.slug];

      return {
        category: resolveCategory(record.slug, topics),
        description: display?.description ?? live?.description ?? record.description,
        isFlagship: isFlagshipSlug(record.slug),
        language: live?.language ?? record.language,
        name: display?.name ?? record.name,
        repoUrl: `https://github.com/${GITHUB_OWNER}/${record.slug}`,
        slug: record.slug,
        stars: live?.stars ?? record.stars,
        topics,
        ...(liveUrl ? { liveUrl } : {}),
        ...(live?.updatedAt ? { updatedAt: live.updatedAt } : {}),
      };
    },
  );

  return [...projects].sort((a, b) => orderIndex(a.slug) - orderIndex(b.slug));
}

export async function getProjectCatalogue(): Promise<readonly Project[]> {
  const liveRepos = await fetchGithubRepos();
  return buildCatalogue(liveRepos);
}
