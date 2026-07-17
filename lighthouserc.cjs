module.exports = {
  ci: {
    collect: {
      numberOfRuns: 3,
      settings: {
        // The Phase 1 foundation shell is intentionally noindex (see
        // src/app/layout.tsx). Skip only the indexability audit so the SEO
        // category still gates everything else; remove this once the real
        // indexable homepage ships in Phase 3.
        skipAudits: ["is-crawlable"],
      },
      startServerCommand: "pnpm start:test",
      startServerReadyPattern: "Ready in|Local:",
      url: ["http://127.0.0.1:3100/"],
    },
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: 0.95, aggregationMethod: "median-run" }],
        "categories:accessibility": ["error", { minScore: 0.95 }],
        "categories:best-practices": ["error", { minScore: 0.9 }],
        "categories:seo": ["error", { minScore: 1 }],
        "largest-contentful-paint": [
          "error",
          { maxNumericValue: 2500, aggregationMethod: "median" },
        ],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.1, aggregationMethod: "median" }],
      },
    },
  },
};
