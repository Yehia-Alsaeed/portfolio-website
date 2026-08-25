import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  CLIENT_WORK,
  CLIENT_WORK_MEDIA,
  type ClientWork,
  SERVICE_OFFERS,
  SERVICE_PROCESS,
  TESTIMONIALS,
  VISIBLE_CLIENT_WORK,
} from "@/content/services";

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

  it("lists the four client-work entries, captured for three and text-only for Nexo", () => {
    expect(CLIENT_WORK.map(({ name }) => name)).toEqual([
      "Madar Wears",
      "La Glosse",
      "Loverboy Studio",
      "Nexo",
    ]);
    expect(CLIENT_WORK.filter(({ presentation }) => presentation === "captured")).toHaveLength(3);
    expect(CLIENT_WORK.find(({ name }) => name === "Nexo")?.presentation).toBe("text-only");
  });

  // Guards the hide-don't-delete contract: Nexo is withheld from the page but
  // must survive in CLIENT_WORK. If a cleanup pass ever deletes the entry
  // instead of un-hiding it, the first assertion here fails loudly.
  it("keeps the hidden Nexo entry in the roster while withholding it from the page", () => {
    // Widened to ClientWork so the optional `hidden` flag is readable: the
    // `as const satisfies` literals only declare it on entries that set it.
    const nexo: ClientWork | undefined = CLIENT_WORK.find(
      (entry: ClientWork) => entry.name === "Nexo",
    );

    expect(nexo).toBeDefined();
    expect(nexo?.hidden).toBe(true);
    expect(nexo?.url).toBe("https://bh9d1w-16.myshopify.com/");

    expect(VISIBLE_CLIENT_WORK.map(({ name }) => name)).toEqual([
      "Madar Wears",
      "La Glosse",
      "Loverboy Studio",
    ]);
    expect(VISIBLE_CLIENT_WORK.every(({ hidden }) => !hidden)).toBe(true);
  });

  it("renders no testimonials until quotes are approved", () => {
    expect(TESTIMONIALS).toEqual([]);
  });

  it("only points captured entries at a media key that actually has media", () => {
    for (const entry of CLIENT_WORK) {
      if (entry.presentation === "captured") {
        expect(Object.keys(CLIENT_WORK_MEDIA)).toContain(entry.mediaKey);
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
