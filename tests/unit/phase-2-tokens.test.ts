// @vitest-environment node

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const cssPath = resolve(process.cwd(), "src/app/globals.css");
const css = readFileSync(cssPath, "utf8");

describe("Phase 2 design tokens", () => {
  it.each([
    ["--paper", "#f1efe9"],
    ["--ink", "#111114"],
    // The approved dim #6f6d68 fails WCAG AA by 0.005 on paper; the shipped
    // value is the nearest passing shade (see globals.css).
    ["--dim", "#6d6b66"],
    ["--accent", "#2b3cff"],
    ["--accent-ink", "#ffffff"],
    ["--accent-text", "#2b3cff"],
  ])("defines %s as %s", (token, value) => {
    expect(css).toContain(`${token}: ${value};`);
  });

  it("keeps accent-colored text readable on the night surface", () => {
    expect(css).toContain("--accent-text: #6f7aff;");
  });

  it("defines all three display modes and reduced-motion behavior", () => {
    expect(css).toContain(':root[data-mode="paper"]');
    expect(css).toContain(':root[data-mode="night"]');
    expect(css).toContain(':root[data-mode="mono"]');
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
  });
});
