module.exports = {
  ci: {
    collect: {
      numberOfRuns: 3,
      startServerCommand: "corepack pnpm start:test",
      startServerReadyPattern: "Ready in|Local:",
      url: [
        "http://127.0.0.1:3100/",
        "http://127.0.0.1:3100/projects",
        "http://127.0.0.1:3100/projects/skillbridge-ai-interviewer",
        "http://127.0.0.1:3100/services",
      ],
    },
    assert: {
      assertions: {
        // Phase 8 quality-hardening targets (docs/superpowers/specs/2026-07-17-
        // portfolio-production-roadmap-design.md section 3). The temporary
        // Phase 7 allowances (performance >= 0.90, LCP <= 3400ms) are removed.
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
