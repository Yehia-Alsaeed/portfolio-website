module.exports = {
  ci: {
    collect: {
      numberOfRuns: 3,
      startServerCommand: "corepack pnpm start:test",
      startServerReadyPattern: "Ready in|Local:",
      url: ["http://127.0.0.1:3100/"],
    },
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: 0.9, aggregationMethod: "median-run" }],
        "categories:accessibility": ["error", { minScore: 0.95 }],
        "categories:best-practices": ["error", { minScore: 0.9 }],
        "categories:seo": ["error", { minScore: 1 }],
        // 3400ms while the self-hosted brand fonts and Phase 7 route-group
        // shell exist. The simulated slow-4G LCP remains bimodal and measured
        // 2622-3322ms locally on this phase; public routes still build static.
        // Revisit during Phase 8 quality hardening.
        "largest-contentful-paint": [
          "error",
          { maxNumericValue: 3400, aggregationMethod: "median" },
        ],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.1, aggregationMethod: "median" }],
      },
    },
  },
};
