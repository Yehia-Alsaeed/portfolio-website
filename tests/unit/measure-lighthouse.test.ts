// @vitest-environment node

import { describe, expect, it } from "vitest";

import { summarizeLighthouseRuns, type LighthouseRun } from "../../scripts/measure-lighthouse";

function run(
  performance: number,
  accessibility: number,
  bestPractices: number,
  seo: number,
  lcp: number,
  cls: number,
): LighthouseRun {
  return {
    categories: {
      accessibility: { score: accessibility },
      "best-practices": { score: bestPractices },
      performance: { score: performance },
      seo: { score: seo },
    },
    audits: {
      "cumulative-layout-shift": { numericValue: cls },
      "largest-contentful-paint": { numericValue: lcp },
    },
  };
}

describe("summarizeLighthouseRuns", () => {
  it("returns median category scores and metrics", () => {
    const result = summarizeLighthouseRuns([
      run(0.96, 0.97, 0.91, 1, 1800, 0.02),
      run(0.98, 0.99, 0.95, 1, 1500, 0.01),
      run(0.97, 0.98, 0.93, 1, 1600, 0.015),
    ]);

    expect(result).toEqual({
      runs: 3,
      scores: {
        performance: 97,
        accessibility: 98,
        bestPractices: 93,
        seo: 100,
      },
      metrics: {
        largestContentfulPaintMs: 1600,
        cumulativeLayoutShift: 0.015,
      },
    });
  });
});
