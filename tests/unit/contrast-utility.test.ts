import { describe, expect, it } from "vitest";

import { contrastRatio, relativeLuminance } from "@/lib/color/contrast";

describe("contrastRatio", () => {
  it("returns 21:1 for pure black against pure white", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 1);
  });

  it("returns 1:1 for identical colors", () => {
    expect(contrastRatio("#2b3cff", "#2b3cff")).toBeCloseTo(1, 5);
  });

  it("is symmetric regardless of argument order", () => {
    expect(contrastRatio("#111114", "#f1efe9")).toBeCloseTo(contrastRatio("#f1efe9", "#111114"), 5);
  });
});

describe("relativeLuminance", () => {
  it("is 0 for black and 1 for white", () => {
    expect(relativeLuminance({ b: 0, g: 0, r: 0 })).toBeCloseTo(0, 5);
    expect(relativeLuminance({ b: 255, g: 255, r: 255 })).toBeCloseTo(1, 5);
  });
});
