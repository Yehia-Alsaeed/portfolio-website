import { readFileSync } from "node:fs";
import path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import { CASE_STUDIES } from "@/content/projects/case-studies";
import { FALLBACK_PROJECTS } from "@/content/projects/fallback";
import { FLAGSHIP_SLUGS } from "@/content/projects/overrides";
import {
  buildCatalogue,
  getProjectCatalogue,
  mapTopicsToCategory,
  resolveCategory,
} from "@/features/projects/catalogue";
import { fetchGithubRepos, type GithubRepo } from "@/features/projects/github";
import { type CategorySlug, PROJECT_CATEGORIES } from "@/features/projects/model";

const APPROVED_MEDIA_PUBLIC_IDS = new Set([
  "skillbridge-interview",
  "skillbridge-results",
  "prestige-home",
  "prestige-collection",
  "pets-fcn",
  "pets-segnet",
  "pets-hrnet",
  "study-planner-architecture",
]);

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

  it("keeps approved categories stable against real (not curated) live GitHub topics", () => {
    // Regression: verified against the deployed preview with a real GITHUB_TOKEN.
    // Real repo topics are more specific/verbose than the curated fallback
    // topics and don't share its exact vocabulary, so `topics = live ?? fallback`
    // can silently drift a project's category once live data is merged in.
    const liveRepos: GithubRepo[] = [
      {
        description: "",
        language: "Python",
        slug: "skillbridge-ai-interviewer",
        stars: 0,
        topics: ["computer-vision", "fastapi", "llm", "machine-learning", "speech-processing"],
        updatedAt: "2026-01-01T00:00:00Z",
      },
      {
        description: "",
        language: "JavaScript",
        slug: "prestige-motors-showroom",
        stars: 0,
        topics: ["car-showroom", "cloudinary", "express", "mern", "mongodb", "react"],
        updatedAt: "2026-01-01T00:00:00Z",
      },
      {
        description: "",
        language: "Dart",
        slug: "trip-mate-travel-planner-app",
        stars: 0,
        topics: ["android", "firebase", "flutter", "mobile-app", "trip-planner"],
        updatedAt: "2026-01-01T00:00:00Z",
      },
      {
        description: "",
        language: "C++",
        slug: "game-tree-alpha-beta-board-game",
        stars: 0,
        topics: ["algorithms", "artificial-intelligence", "board-game", "game-tree", "minimax"],
        updatedAt: "2026-01-01T00:00:00Z",
      },
    ];
    const catalogue = buildCatalogue(liveRepos);
    const bySlug = new Map(catalogue.map((project) => [project.slug, project]));
    expect(bySlug.get("skillbridge-ai-interviewer")?.category).toBe("llm");
    expect(bySlug.get("prestige-motors-showroom")?.category).toBe("fs");
    expect(bySlug.get("trip-mate-travel-planner-app")?.category).toBe("fs");
    expect(bySlug.get("game-tree-alpha-beta-board-game")?.category).toBe("games");

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

describe("Phase 4 flagship case study content", () => {
  const ledger = readFileSync(
    path.join(process.cwd(), "docs/content/phase-4-claim-ledger.md"),
    "utf-8",
  );

  it("has exactly five unique case studies matching the approved flagship slugs", () => {
    expect(CASE_STUDIES).toHaveLength(5);
    const slugs = new Set(CASE_STUDIES.map((study) => study.slug));
    expect(slugs.size).toBe(5);
    expect(slugs).toEqual(new Set(FLAGSHIP_SLUGS));
  });

  it("forms a valid closed previous/next navigation cycle", () => {
    const bySlug = new Map(CASE_STUDIES.map((study) => [study.slug, study]));
    for (const study of CASE_STUDIES) {
      const previous = bySlug.get(study.previousSlug);
      const next = bySlug.get(study.nextSlug);
      expect(previous, `${study.slug} previousSlug must reference a real case study`).toBeDefined();
      expect(next, `${study.slug} nextSlug must reference a real case study`).toBeDefined();
      expect(next?.previousSlug).toBe(study.slug);
      expect(previous?.nextSlug).toBe(study.slug);
    }
  });

  it("only links to HTTPS repository and live URLs", () => {
    for (const study of CASE_STUDIES) {
      expect(study.repoUrl.startsWith("https://github.com/Yehia-Alsaeed/")).toBe(true);
      if (study.liveUrl) {
        expect(study.liveUrl.startsWith("https://")).toBe(true);
      }
    }
  });

  it("includes every required section, non-empty", () => {
    for (const study of CASE_STUDIES) {
      for (const field of [
        "title",
        "summary",
        "role",
        "type",
        "problem",
        "approach",
        "architecture",
        "reproducibility",
      ] as const) {
        expect(study[field].length, `${study.slug}.${field}`).toBeGreaterThan(0);
      }
      for (const field of ["stack", "constraints", "results", "limitations"] as const) {
        expect(study[field].length, `${study.slug}.${field}`).toBeGreaterThan(0);
      }
      // `period` is optional: Yehia supplies real build dates during final
      // pre-launch tweaks rather than have them guessed from GitHub push dates.
      if (study.period !== undefined) {
        expect(study.period.length, `${study.slug}.period`).toBeGreaterThan(0);
      }
    }
  });

  it("has a real build period only for SkillBridge for now, supplied directly by Yehia", () => {
    const bySlug = new Map(CASE_STUDIES.map((study) => [study.slug, study]));
    expect(bySlug.get("skillbridge-ai-interviewer")?.period).toBe("Oct 2025 - Jun 2026");
    for (const slug of FLAGSHIP_SLUGS) {
      if (slug === "skillbridge-ai-interviewer") continue;
      expect(bySlug.get(slug)?.period, `${slug}.period should be pending`).toBeUndefined();
    }
  });

  it("gives every media reference non-empty alt text from an approved asset", () => {
    for (const study of CASE_STUDIES) {
      for (const media of study.media) {
        expect(media.alt.length, `${study.slug} media alt text`).toBeGreaterThan(0);
        expect(APPROVED_MEDIA_PUBLIC_IDS.has(media.publicId)).toBe(true);
      }
    }
  });

  it("has no approved media for Llama QLoRA, matching the asset register", () => {
    const llama = CASE_STUDIES.find((study) => study.slug === "llama-qlora-education-qa");
    expect(llama?.media).toEqual([]);
  });

  it("matches known, source-verified metric values", () => {
    const bySlug = new Map(CASE_STUDIES.map((study) => [study.slug, study]));
    const resultValue = (slug: string, label: string) =>
      bySlug.get(slug)?.results.find((result) => result.label === label)?.value;

    expect(
      resultValue("skillbridge-ai-interviewer", "Interview score accuracy (grouped split)"),
    ).toBe("0.9094");
    expect(
      resultValue(
        "llama-qlora-education-qa",
        "Llama 3.2 3B Instruct, QLoRA fine-tuned Exact Match",
      ),
    ).toBe("0.660");
    expect(
      resultValue(
        "llama-qlora-education-qa",
        "Llama 3.1 8B Instruct, QLoRA fine-tuned Exact Match",
      ),
    ).toBe("0.595");
    expect(resultValue("oxford-pet-binary-segmentation", "HRNet-W18 test mIoU")).toBe("0.9306");
    expect(resultValue("prestige-motors-showroom", "Deployment status")).toBe("Live in production");
  });

  it("records a claim-ledger entry for every published metric", () => {
    for (const study of CASE_STUDIES) {
      for (const result of study.results) {
        expect(
          ledger.includes(result.label),
          `ledger entry for ${study.slug}: "${result.label}"`,
        ).toBe(true);
        expect(
          ledger.includes(result.value),
          `ledger entry for ${study.slug} value "${result.value}"`,
        ).toBe(true);
      }
    }
  });

  it("never mentions unapproved secrets or credentials", () => {
    const serialized = JSON.stringify(CASE_STUDIES);
    expect(serialized).not.toMatch(/api[_-]?key\s*[:=]\s*["'][^"']+["']/i);
    expect(serialized).not.toMatch(/sk-[a-zA-Z0-9]{16,}/);
    expect(serialized).not.toMatch(/coming soon|lorem ipsum|\btbd\b/i);
  });
});
