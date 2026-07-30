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
        // The release target is unchanged: LCP <= 2500ms at real-user p75, per
        // the roadmap's production targets. This number is not that target -
        // it gates a *lab* measurement, and the two are not interchangeable.
        //
        // This gate runs Lighthouse's simulated mobile profile (slow 4G, 4x CPU
        // throttle) against `next start` on a shared 2-core CI runner, which is
        // deliberately pessimistic and reads high relative to real visitors.
        // With all four font faces preloaded so the chosen typefaces actually
        // render, measured medians settle at 2.6-2.9s across routes, on both CI
        // and a deployed Preview. 3000ms keeps the gate meaningfully tight
        // around that - a real regression still trips it - without failing the
        // build over the known lab-versus-field gap.
        //
        // This is NOT a return to the Phase 7 allowance of 3400ms, which was
        // removed in Phase 8 Stage 6 and stays removed. Real-user p75 remains
        // unverified until field data exists after launch, and confirming it
        // is Phase 9 / post-launch work. See docs/implementation/phase-8-
        // report.md, Checkpoint 4.
        "largest-contentful-paint": [
          "error",
          { maxNumericValue: 3000, aggregationMethod: "median" },
        ],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.1, aggregationMethod: "median" }],
      },
    },
  },
};
