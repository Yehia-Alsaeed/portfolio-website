import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { CLIENT_WORK, SERVICE_OFFERS, SERVICE_PROCESS, TESTIMONIALS } from "@/content/services";

describe("Phase 5 services content", () => {
  it("orders the two inquiry-only offers as approved", () => {
    expect(SERVICE_OFFERS.map(({ title }) => title)).toEqual([
      "Shopify stores, brief to first sale.",
      "Full-stack products, end to end.",
    ]);
  });

  it("orders the four-step process as approved", () => {
    expect(SERVICE_PROCESS.map(({ title }) => title)).toEqual([
      "Discovery",
      "Build",
      "Verification",
      "Launch and handover",
    ]);
  });

  it("lists exactly three client-work entries, captured for two and text-only for Nexo", () => {
    expect(CLIENT_WORK.map(({ name }) => name)).toEqual(["Madar Wears", "La Glosse", "Nexo"]);
    expect(CLIENT_WORK.filter(({ presentation }) => presentation === "captured")).toHaveLength(2);
    expect(CLIENT_WORK.find(({ name }) => name === "Nexo")?.presentation).toBe("text-only");
  });

  it("renders no testimonials until quotes are approved", () => {
    expect(TESTIMONIALS).toEqual([]);
  });

  it("only points captured entries at Madar Wears or La Glosse media keys", () => {
    for (const entry of CLIENT_WORK) {
      if (entry.presentation === "captured") {
        expect(["madar-wears", "la-glosse"]).toContain(entry.mediaKey);
      }
    }
  });

  it("contains no six-slot placeholders, pricing, stale dates, iframe, or Shopify secrets", () => {
    const source = readFileSync(path.join(process.cwd(), "src/content/services.ts"), "utf-8");
    expect(source).not.toMatch(/<iframe/i);
    expect(source).not.toMatch(/Q3 2026/);
    expect(source).not.toMatch(/\$\d/);
    expect(source).not.toMatch(/\bpackage\b/i);
    expect(source).not.toMatch(/\bpricing\b/i);
    expect(source).not.toMatch(/shpat_[a-zA-Z0-9]+/);
    expect(source).not.toMatch(/storefront[_-]?access[_-]?token/i);
    expect(source).not.toMatch(/coming soon|placeholder|lorem ipsum|\btbd\b/i);
    expect(source).not.toMatch(/\d+%|\bconversion\b|\brevenue\b|\btraffic\b|\bcustomer\b/i);
  });
});
