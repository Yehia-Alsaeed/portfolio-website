import { GITHUB_OWNER } from "@/features/projects/model";

const GITHUB_API_URL = `https://api.github.com/users/${GITHUB_OWNER}/repos?type=owner&sort=updated&per_page=100`;
const REQUEST_TIMEOUT_MS = 8000;

export type GithubRepo = {
  slug: string;
  description: string;
  topics: readonly string[];
  language: string;
  stars: number;
  updatedAt: string;
  homepageUrl?: string;
};

type RawGithubRepo = {
  name: unknown;
  description: unknown;
  topics: unknown;
  language: unknown;
  stargazers_count: unknown;
  updated_at: unknown;
  homepage: unknown;
  fork: unknown;
  archived: unknown;
};

function isRawGithubRepo(value: unknown): value is RawGithubRepo {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.name === "string" &&
    typeof record.fork === "boolean" &&
    typeof record.archived === "boolean"
  );
}

function normalizeRepo(raw: RawGithubRepo): GithubRepo {
  const homepage = typeof raw.homepage === "string" ? raw.homepage.trim() : "";
  const topics = Array.isArray(raw.topics)
    ? raw.topics.filter((topic): topic is string => typeof topic === "string")
    : [];

  return {
    description: typeof raw.description === "string" ? raw.description : "",
    language: typeof raw.language === "string" ? raw.language : "",
    slug: raw.name as string,
    stars: typeof raw.stargazers_count === "number" ? raw.stargazers_count : 0,
    topics,
    updatedAt: typeof raw.updated_at === "string" ? raw.updated_at : "",
    ...(homepage.length > 0 ? { homepageUrl: homepage } : {}),
  };
}

/**
 * Fetches and normalizes Yehia's public repositories from GitHub. Returns
 * `null` on any failure mode (missing token, non-2xx response, timeout,
 * malformed payload, rate limit) so the caller can fall back to the
 * checked-in catalogue without breaking rendering.
 */
export async function fetchGithubRepos(): Promise<readonly GithubRepo[] | null> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(GITHUB_API_URL, {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
      },
      next: { revalidate: 86400 },
      signal: controller.signal,
    });

    if (!response.ok) return null;

    const payload: unknown = await response.json();
    if (!Array.isArray(payload) || !payload.every(isRawGithubRepo)) return null;

    return payload.filter((repo) => !repo.fork && !repo.archived).map(normalizeRepo);
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
