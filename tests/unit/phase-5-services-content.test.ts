import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { SERVICE_TEASERS } from "@/content/homepage";
import {
  CLIENT_WORK,
  CLIENT_WORK_MEDIA,
  type ClientWork,
  FIX_SECTION,
  PROJECT_INCLUDES,
  SERVICE_FAQ,
  SERVICE_OFFERS,
  SERVICE_PROCESS,
  TESTIMONIALS,
  VISIBLE_CLIENT_WORK,
} from "@/content/services";

describe("Phase 5 services content", () => {
  it("orders the two inquiry-only offers as approved", () => {
    expect(SERVICE_OFFERS.map(({ title }) => title)).toEqual([
      "Shopify stores that bring in more orders.",
      "Websites that bring you new clients.",
    ]);
  });

  it("orders the four-step process as approved", () => {
    expect(SERVICE_PROCESS.map(({ title }) => title)).toEqual(["Call", "Build", "Test", "Launch"]);
  });

  it("lists six project inclusions and seven FAQ answers, none carrying a figure", () => {
    expect(PROJECT_INCLUDES).toHaveLength(6);
    expect(SERVICE_FAQ).toHaveLength(7);
    expect(FIX_SECTION.problems).toHaveLength(4);
    expect(FIX_SECTION.headline).toContain(FIX_SECTION.accent);

    const prose = JSON.stringify({ FIX_SECTION, SERVICE_FAQ });
    expect(prose).not.toContain("$");
    expect(prose).not.toContain("%");
  });

  // The homepage teaser is a deliberate copy (see SERVICE_TEASERS in
  // homepage.ts). This is what keeps the copy from drifting.
  it("keeps the homepage services teaser identical to the published offers", () => {
    expect(SERVICE_TEASERS).toEqual(SERVICE_OFFERS);
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
    // Client-facing words like "customer" and "conversion" are allowed now;
    // what stays banned is any figure that would read as a promised result.
    expect(source).not.toMatch(/\d+%/);
  });
});
