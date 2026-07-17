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
    ["--dim", "#6f6d68"],
    ["--accent", "#2b3cff"],
    ["--accent-ink", "#ffffff"],
  ])("defines %s as %s", (token, value) => {
    expect(css).toContain(`${token}: ${value};`);
  });

  it("defines all three display modes and reduced-motion behavior", () => {
    expect(css).toContain(':root[data-mode="paper"]');
    expect(css).toContain(':root[data-mode="night"]');
    expect(css).toContain(':root[data-mode="mono"]');
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
  });
});
