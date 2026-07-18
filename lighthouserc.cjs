module.exports = {
  ci: {
    collect: {
      numberOfRuns: 3,
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
        // 2900ms while the self-hosted brand fonts exist (approved on PR #2):
        // the simulated slow-4G LCP is bimodal (~2260ms when paint precedes
        // hydration, ~2560-2880ms when it does not), so the previous 2500ms
        // budget sat inside run-to-run noise. Real observed LCP is ~0.2s.
        // Revisit during Phase 8 quality hardening.
        "largest-contentful-paint": [
          "error",
          { maxNumericValue: 2900, aggregationMethod: "median" },
        ],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.1, aggregationMethod: "median" }],
      },
    },
  },
};
