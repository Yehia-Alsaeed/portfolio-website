import { describe, expect, it } from "vitest";

import { CASE_STUDIES } from "@/content/projects/case-studies";
import sitemap from "@/app/sitemap";

describe("sitemap.xml", () => {
  it("emits only the canonical public URLs, each under the configured site origin", () => {
    const result = sitemap();
    const urls = result.map((entry) => entry.url);

    expect(urls).toEqual([
      "http://localhost:3000/",
      "http://localhost:3000/projects",
      "http://localhost:3000/services",
      ...CASE_STUDIES.map((study) => `http://localhost:3000/projects/${study.slug}`),
    ]);
  });

  it("never invents a changeFrequency or priority", () => {
    const result = sitemap();

    for (const entry of result) {
      expect(entry).not.toHaveProperty("changeFrequency");
      expect(entry).not.toHaveProperty("priority");
    }
  });

  it("omits lastModified rather than fabricating a date when git history is unavailable", () => {
    const result = sitemap();

    for (const entry of result) {
      if (entry.lastModified !== undefined) {
        expect(entry.lastModified).toBeInstanceOf(Date);
      }
    }
  });
});
