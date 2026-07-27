import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { contrastRatio } from "@/lib/color/contrast";

const css = readFileSync(resolve("src/app/globals.css"), "utf8");

type ModeTokens = {
  paper: string;
  ink: string;
  dim: string;
  accent: string;
  accentInk: string;
  accentText: string;
};

function extractModeTokens(mode: "paper" | "night" | "mono"): ModeTokens {
  const blockMatch = new RegExp(`:root\\[data-mode="${mode}"\\]\\s*\\{([^}]*)\\}`).exec(css);
  const block: string | undefined = blockMatch?.[1];
  if (!block) throw new Error(`Could not find :root[data-mode="${mode}"] block in globals.css`);
  const modeBlock: string = block;

  function token(name: string): string {
    const match = new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{3,6})`).exec(modeBlock);
    const value = match?.[1];
    if (!value) throw new Error(`Could not find --${name} in ${mode} mode block`);
    return value;
  }

  return {
    accent: token("accent"),
    accentInk: token("accent-ink"),
    accentText: token("accent-text"),
    dim: token("dim"),
    ink: token("ink"),
    paper: token("paper"),
  };
}

// These pairs mirror how the tokens are actually used in src/components/ui
// and src/features: `dim`/`ink` as text, `accent-text` for accent-colored
// text AND as the safe-contrast UI-boundary color (button borders, the
// command-palette selection ring, the contact form's alert border), and
// `accent-ink` as the text color rendered on top of an `accent` fill.
describe.each(["paper", "night", "mono"] as const)(
  "%s mode token contrast (WCAG 2.2 AA)",
  (mode) => {
    const tokens = extractModeTokens(mode);

    it("body text (ink on paper) meets 4.5:1", () => {
      expect(contrastRatio(tokens.ink, tokens.paper)).toBeGreaterThanOrEqual(4.5);
    });

    it("secondary/mono text (dim on paper) meets 4.5:1", () => {
      expect(contrastRatio(tokens.dim, tokens.paper)).toBeGreaterThanOrEqual(4.5);
    });

    it("accent-colored text (accent-text on paper) meets 4.5:1", () => {
      expect(contrastRatio(tokens.accentText, tokens.paper)).toBeGreaterThanOrEqual(4.5);
    });

    it("text on an accent fill (accent-ink on accent) meets 4.5:1", () => {
      expect(contrastRatio(tokens.accentInk, tokens.accent)).toBeGreaterThanOrEqual(4.5);
    });

    it("accent-text used as a UI-component boundary meets 3:1", () => {
      expect(contrastRatio(tokens.accentText, tokens.paper)).toBeGreaterThanOrEqual(3);
    });
  },
);
