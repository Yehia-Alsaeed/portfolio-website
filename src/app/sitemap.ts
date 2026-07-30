import { execFileSync } from "node:child_process";

import type { MetadataRoute } from "next";

import { CASE_STUDIES } from "@/content/projects/case-studies";
import { publicEnv } from "@/lib/env/public";

/**
 * Reads the real last-commit date for a tracked source file so sitemap
 * entries never carry a fabricated `lastModified` value. Returns undefined
 * (omitting the field) if git history for the file is unavailable, e.g. a
 * very shallow production checkout.
 */
function lastCommitDate(relativePath: string): Date | undefined {
  try {
    const iso = execFileSync("git", ["log", "-1", "--format=%cI", "--", relativePath], {
      cwd: process.cwd(),
      encoding: "utf8",
    }).trim();
    return iso ? new Date(iso) : undefined;
  } catch {
    return undefined;
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = publicEnv.siteUrl.origin;

  const staticEntries: Array<{ path: string; source: string }> = [
    { path: "/", source: "src/app/(public)/page.tsx" },
    { path: "/projects", source: "src/app/(public)/projects/page.tsx" },
    { path: "/services", source: "src/app/(public)/services/page.tsx" },
  ];

  const caseStudyEntries = CASE_STUDIES.map((study) => ({
    path: `/projects/${study.slug}`,
    source: "src/content/projects/case-studies.ts",
  }));

  return [...staticEntries, ...caseStudyEntries].map(({ path, source }) => ({
    url: `${origin}${path}`,
    lastModified: lastCommitDate(source),
  }));
}
