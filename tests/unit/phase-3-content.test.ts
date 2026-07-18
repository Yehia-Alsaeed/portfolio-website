import { describe, expect, it } from "vitest";

import {
  FEATURED_PROJECTS,
  HOME_SECTION_ORDER,
  HOME_STATS,
  SERVICE_TEASERS,
  SKILL_GROUPS,
  TIMELINE_ENTRIES,
} from "@/content/homepage";
import { PROFILE } from "@/content/profile";

describe("Phase 3 homepage content", () => {
  it("keeps the approved identity and section order", () => {
    expect(PROFILE).toMatchObject({
      email: "yehias3eed11@gmail.com",
      githubUrl: "https://github.com/Yehia-Alsaeed",
      linkedinUrl: "https://www.linkedin.com/in/yehia-alsaeed",
      name: "Yehia Alsaeed",
    });
    expect(HOME_SECTION_ORDER).toEqual([
      "monogram",
      "positioning",
      "stats",
      "work",
      "experience",
      "services",
      "contact",
    ]);
  });

  it("contains only the approved content inventory", () => {
    expect(HOME_STATS).toHaveLength(4);
    expect(FEATURED_PROJECTS).toHaveLength(5);
    expect(new Set(FEATURED_PROJECTS.map((project) => project.name)).size).toBe(5);
    expect(
      FEATURED_PROJECTS.every((project) => project.href.startsWith("https://github.com/")),
    ).toBe(true);
    expect(TIMELINE_ENTRIES).toHaveLength(3);
    expect(SKILL_GROUPS).toHaveLength(3);
    expect(SERVICE_TEASERS).toHaveLength(2);

    const serialized = JSON.stringify({
      FEATURED_PROJECTS,
      HOME_STATS,
      PROFILE,
      SERVICE_TEASERS,
      SKILL_GROUPS,
      TIMELINE_ENTRIES,
    });
    expect(serialized).not.toMatch(/placeholder|coming soon|lorem|tbd/i);
    expect(serialized).not.toMatch(/""/);
  });
});
