import { describe, expect, it } from "vitest";

import { SKILL_GROUPS } from "@/content/homepage";
import { PROFILE } from "@/content/profile";
import { buildPersonJsonLd } from "@/lib/seo/person-json-ld";

describe("buildPersonJsonLd", () => {
  it("emits a Person graph sourced only from PROFILE and SKILL_GROUPS", () => {
    const result = buildPersonJsonLd();

    expect(result["@context"]).toBe("https://schema.org");
    expect(result["@type"]).toBe("Person");
    expect(result.name).toBe(PROFILE.name);
    expect(result.jobTitle).toBe(PROFILE.role);
    expect(result.address).toBe(PROFILE.location);
    expect(result.sameAs).toEqual([PROFILE.githubUrl, PROFILE.linkedinUrl]);
    expect(result.knowsAbout).toEqual(SKILL_GROUPS.flatMap((group) => group.skills));
    expect(result.url).toBe("http://localhost:3000/");
  });

  it("never includes a fabricated employer, credential, rating, award, or image", () => {
    const result = buildPersonJsonLd();
    const forbiddenKeys = [
      "worksFor",
      "alumniOf",
      "aggregateRating",
      "award",
      "image",
      "hasCredential",
    ];

    for (const key of forbiddenKeys) {
      expect(result).not.toHaveProperty(key);
    }
  });
});
