import { FALLBACK_PROJECTS } from "@/content/projects/fallback";
import {
  CATEGORY_OVERRIDES,
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
 * Builds the catalogue from the reviewed records in fallback.ts. Those records
 * are authoritative for everything the card renders - name, description,
 * stack, language and outcome - because GitHub's own blurbs, topic slugs and
 * detected language are written for repo browsers, not for this page. Letting
 * them win had replaced measured results with generic prose, buried the
 * curated stack under 11-16 raw tags, and mislabelled a Unity C# game as
 * ShaderLab because that is what Linguist counted most bytes of.
 *
 * Live data therefore contributes `updatedAt` only, which is the one field
 * where fresh genuinely beats reviewed.
 */
export function buildCatalogue(liveRepos: readonly GithubRepo[] | null): readonly Project[] {
  const liveBySlug = new Map((liveRepos ?? []).map((repo) => [repo.slug, repo] as const));

  const projects = FALLBACK_PROJECTS.map((record): Project => {
    const live = liveBySlug.get(record.slug);
    const liveUrl = LIVE_URLS[record.slug];

    return {
      category: resolveCategory(record.slug, record.topics),
      description: record.description,
      isFlagship: isFlagshipSlug(record.slug),
      language: record.language,
      name: record.name,
      outcome: record.outcome,
      repoUrl: `https://github.com/${GITHUB_OWNER}/${record.slug}`,
      slug: record.slug,
      stack: record.stack,
      topics: record.topics,
      ...(liveUrl ? { liveUrl } : {}),
      ...(live?.updatedAt ? { updatedAt: live.updatedAt } : {}),
    };
  });

  // Flagships lead, so the strongest five are what a reader meets first - in
  // the unfiltered grid and inside every category that contains one.
  return [...projects].sort((a, b) => {
    if (a.isFlagship !== b.isFlagship) return a.isFlagship ? -1 : 1;
    return orderIndex(a.slug) - orderIndex(b.slug);
  });
}

export async function getProjectCatalogue(): Promise<readonly Project[]> {
  const liveRepos = await fetchGithubRepos();
  return buildCatalogue(liveRepos);
}
