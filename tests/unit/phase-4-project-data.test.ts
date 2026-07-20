import { afterEach, describe, expect, it, vi } from "vitest";

import { FALLBACK_PROJECTS } from "@/content/projects/fallback";
import { FLAGSHIP_SLUGS } from "@/content/projects/overrides";
import {
  buildCatalogue,
  getProjectCatalogue,
  mapTopicsToCategory,
  resolveCategory,
} from "@/features/projects/catalogue";
import { fetchGithubRepos } from "@/features/projects/github";
import { type CategorySlug, PROJECT_CATEGORIES } from "@/features/projects/model";

const ORIGINAL_TOKEN = process.env.GITHUB_TOKEN;

function restoreEnv() {
  if (ORIGINAL_TOKEN === undefined) delete process.env.GITHUB_TOKEN;
  else process.env.GITHUB_TOKEN = ORIGINAL_TOKEN;
}

describe("Phase 4 project catalogue data", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    restoreEnv();
  });

  it("has 17 unique reviewed repositories", () => {
    expect(FALLBACK_PROJECTS).toHaveLength(17);
    expect(new Set(FALLBACK_PROJECTS.map((project) => project.slug)).size).toBe(17);
  });

  it("has exactly five approved flagships, all present in the fallback set", () => {
    expect(FLAGSHIP_SLUGS).toHaveLength(5);
    expect(new Set(FLAGSHIP_SLUGS).size).toBe(5);
    const fallbackSlugs = new Set(FALLBACK_PROJECTS.map((project) => project.slug));
    for (const slug of FLAGSHIP_SLUGS) {
      expect(fallbackSlugs.has(slug)).toBe(true);
    }
  });

  it("maps every fallback project's topics to one of the six approved categories", () => {
    const approved = new Set<CategorySlug>(PROJECT_CATEGORIES.map((category) => category.slug));
    for (const record of FALLBACK_PROJECTS) {
      expect(approved.has(mapTopicsToCategory(record.topics))).toBe(true);
    }
  });

  it("falls back to Other for unknown future topics instead of guessing", () => {
    expect(mapTopicsToCategory(["some-unreleased-framework"])).toBe("other");
    expect(mapTopicsToCategory([])).toBe("other");
  });

  it("lets a manual category override win over the mapped topic category", () => {
    expect(resolveCategory("fixture-repo", ["computer-vision"], { "fixture-repo": "dist" })).toBe(
      "dist",
    );
    expect(resolveCategory("fixture-repo", ["computer-vision"], {})).toBe("cv");
  });

  it("preserves the 17 approved projects and approved category counts when GitHub is unavailable", () => {
    const catalogue = buildCatalogue(null);
    expect(catalogue).toHaveLength(17);
    expect(new Set(catalogue.map((project) => project.slug)).size).toBe(17);
    expect(catalogue.filter((project) => project.isFlagship)).toHaveLength(5);

    const counts = new Map<string, number>();
    for (const project of catalogue) {
      counts.set(project.category, (counts.get(project.category) ?? 0) + 1);
    }
    expect(counts.get("llm")).toBe(3);
    expect(counts.get("cv")).toBe(2);
    expect(counts.get("ml")).toBe(5);
    expect(counts.get("fs")).toBe(2);
    expect(counts.get("games")).toBe(3);
    expect(counts.get("dist")).toBe(2);
  });

  it("merges live GitHub data over the reviewed fallback for a known repository", async () => {
    process.env.GITHUB_TOKEN = "test-token";
    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => [
        {
          archived: false,
          description: "Live description from GitHub",
          fork: false,
          homepage: "",
          language: "Python",
          name: "skillbridge-ai-interviewer",
          stargazers_count: 42,
          topics: ["llm", "multimodal"],
          updated_at: "2026-07-20T00:00:00Z",
        },
      ],
      ok: true,
    });
    vi.stubGlobal("fetch", fetchMock);

    const catalogue = await getProjectCatalogue();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(catalogue).toHaveLength(17);

    const skillbridge = catalogue.find((project) => project.slug === "skillbridge-ai-interviewer");
    expect(skillbridge?.description).toBe("Live description from GitHub");
    expect(skillbridge?.stars).toBe(42);
    expect(skillbridge?.updatedAt).toBe("2026-07-20T00:00:00Z");
  });

  it("returns the complete fallback catalogue when the GitHub token is missing", async () => {
    delete process.env.GITHUB_TOKEN;
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const repos = await fetchGithubRepos();
    expect(repos).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns the complete fallback catalogue on a non-2xx response", async () => {
    process.env.GITHUB_TOKEN = "test-token";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 403 }));

    expect(await fetchGithubRepos()).toBeNull();
  });

  it("returns the complete fallback catalogue on a network error or timeout", async () => {
    process.env.GITHUB_TOKEN = "test-token";
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new DOMException("Aborted", "AbortError")));

    expect(await fetchGithubRepos()).toBeNull();
  });

  it("returns the complete fallback catalogue on a malformed payload", async () => {
    process.env.GITHUB_TOKEN = "test-token";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ json: async () => ({ message: "not an array" }), ok: true }),
    );

    expect(await fetchGithubRepos()).toBeNull();
  });

  it("returns the complete fallback catalogue when array items are malformed", async () => {
    process.env.GITHUB_TOKEN = "test-token";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ json: async () => [{ notARepo: true }], ok: true }),
    );

    expect(await fetchGithubRepos()).toBeNull();
  });
});
