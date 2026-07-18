# Phase 2 Design System and Shell Report

## Scope Result

- Design system and responsive shell: Complete
- Phase 3 homepage sections, monogram hero, `N` shortcut, Poster Mode: Absent by design
- Provider-backed features (GitHub data, Neon, Cloudinary, Resend, analytics, admin): Absent by design
- Temporary under-construction or launch-hiding behavior: None added; the Phase 1
  foundation-preview copy and `noindex` exception were removed

## Routes Reviewed

- `/` — identity frame with profile metadata and the display-mode switcher
- `/projects` — factual project-index frame
- `/services` — factual client-services frame
- `/design-system` — internal review gallery, reachable directly, unlinked from navigation
- `/missing-phase-2-route` — branded 404 inside the full shell (HTTP 404)

## Verification

- `pnpm test`: 34 unit tests in 12 files, all passing
- `pnpm playwright test`: 62 browser tests, all passing locally and in CI
- Six-width matrix (360, 390, 768, 1024, 1440, 1920) across `/`, `/design-system`,
  and the 404: no horizontal overflow, no element outside the viewport beyond
  1 CSS px, landmarks visible, no button under 44px touch height, and the open
  command palette contained at every width
- axe (WCAG A/AA) across all five routes in Paper, Night, and Mono
  (15 combinations): zero violations
- Reduced motion: `scroll-behavior: auto`, effectively-zero transition
  durations, navigation and mode switching fully usable
- Display modes: explicit choice applied before hydration on reload, persisted
  across client navigation, invalid storage falls back to Paper, blocked
  storage still changes the visible mode without errors
- Command palette: mouse trigger, `Control+K`, `Meta+K`, filtering, arrow keys,
  Enter, Escape, focus restoration, navigation and display commands, and
  non-interception while typing in form fields
- Lighthouse categories pass everywhere with thresholds intact and
  `is-crawlable` no longer skipped. CI (implementation SHA `63276a4`):
  Performance 98, Accessibility 100, Best Practices 93, SEO 100, LCP 2262 ms,
  CLS 0.007 — all assertions green. Local Windows (recorded in
  `phase-2-lighthouse-baseline.json`): Performance 96, Accessibility 100,
  Best Practices 93, SEO 100, LCP 2779 ms, CLS 0
- **Open item for review — the LCP assertion is borderline and bimodal.**
  Lighthouse simulates slow 4G by replaying whichever requests finished before
  the observed paint. When paint precedes hydration the run measures
  ~2250–2260 ms (passes); when hydration wins the race the same build measures
  ~2560–2880 ms (fails). CI produced a passing median (2262 ms) on the
  implementation commit and a failing median (2560 ms) on the identical
  docs-only follow-up. Real observed LCP is ~0.2 s and CLS is ~0. The fonts
  were already reduced 131KB → 83KB; a no-font control measures 2250 ms, so
  the remaining exposure is the irreducible cost of the approved typography.
  **Resolved by Yehia on 2026-07-18:** the LCP budget is raised to 2900 ms
  while the brand fonts exist, every other threshold unchanged; revisit during
  Phase 8 quality hardening. (Alternatives considered and rejected: keeping
  2500 ms with a coin-flip CI gate, or reducing the approved typography.)
- JavaScript inventory (`phase-2-build-baseline.json`): 15 chunks, 722,553
  bytes raw, 219,989 bytes gzip; +18.78% over the Phase 1 gzip total of
  185,208 bytes. The Phase 1 measurement scope counts every emitted chunk, so
  this is an artifact inventory, not initial-route JavaScript:
  - Initial `/` load fetches 11 chunks totalling 161,553 gzip bytes — less
    than the Phase 1 eager total
  - The command-palette chunks (`2kw-x6dnx_lps.js`, 16,198 gzip bytes and
    `0gd87lbqilml8.js`, 1,161 gzip bytes) are requested only after the palette
    trigger is first activated, verified through browser network entries
    against the production server
  - `0cz1d0mv5g_q7.js` (39,627 gzip bytes) is the legacy-browser polyfills
    chunk and is never requested by modern browsers

## Visual Fidelity Ledger

Compared: 1440 Paper renders against `mockups/demo/qa/reference-monogram-1440.png`
and `mockups/demo/qa/home-no-preview-1440.png`, plus the 390/768/1920 and
Night/Mono captures from the temporary `.tmp/phase-2-visual/` matrix.

| Aspect | Reference observation | Rendered observation | Result |
|---|---|---|---|
| Frame width/gutters | Content frame ~1360px at 1440 with even gutters | `.site-frame` = `min(1360px, 100% - 56px)`, matches reference span | Pass |
| Archivo proportions | Black-weight expanded display type, tight line height | h1 at weight 900, `font-stretch` 120%, `leading-[0.95]`, clamp with rem endpoints | Pass |
| Mono metadata | Uppercase mono labels (dim) over values (ink), 4-column meta row | `MetadataRow` renders identical hierarchy and density | Pass |
| Token colors | Paper `#f1efe9`, ink `#111114`, electric blue `#2b3cff` | Exact values; dim darkened `#6f6d68`→`#6d6b66` and night accent text `#6f7aff` for WCAG AA (see Deviations) | Pass with documented corrections |
| Rule weights | 2px header/section rules, 1px internal rules | Header/title/footer-top 2px, metadata and row rules 1px | Pass |
| Control corners | Square buttons, chips, and inputs throughout | No border radius on any control, palette, or field | Pass |
| Navigation wrapping | Logo left, mono uppercase nav + palette chip right | Identical at desktop; wraps into two stable rows at ≤767px with no hamburger | Pass |
| 390px text/control fit | Readable labels, no clipping at phone width | Meta row collapses to 2 columns, no overflow or clipped text at 360/390 | Pass |

## Delivery

- Pull request: [Phase 2: design system and responsive shell (#2)](https://github.com/Yehia-Alsaeed/portfolio-website/pull/2) (draft)
- Vercel preview: [https://portfolio-website-git-phase-73aef0-yehias3eed11-5404s-projects.vercel.app](https://portfolio-website-git-phase-73aef0-yehias3eed11-5404s-projects.vercel.app)
  — deployment state READY; Vercel deployment protection (SSO) is enabled on
  this project, so the preview requires a Vercel login to view
- Implementation SHA (before this report commit): `63276a466c9d414269896845af9ac14c071d9bb4`
- GitHub `quality` check: pass (2m28s), including the full Playwright suite and
  the Lighthouse gate

## Deviations From the Plan

Each deviation was forced by a real measurement or toolchain behavior and is
documented at the point of change:

1. **Dim token `#6d6b66` instead of `#6f6d68`.** The approved value measures
   4.4948:1 against paper — under the WCAG AA 4.5:1 minimum for the small mono
   labels it colors, and axe fails it. The shipped shade is the nearest
   imperceptible step that clears the gate at 4.63:1.
2. **`--accent-text` token for accent-colored text.** Electric blue `#2b3cff`
   measures 2.87:1 as text on the night surface (fails even the 3:1 large-text
   minimum). Accent-colored text maps to the plan's own night focus blue
   `#6f7aff` (5.30:1) in Night mode; accent surfaces keep `#2b3cff` exactly.
3. **Self-hosted subsetted fonts instead of `next/font/google`.** The
   Google-served files (Archivo 90KB with unused wght 100–399 and wdth 62–99;
   JetBrains Mono 41KB with unused weights) pushed the simulated LCP past the
   2.5s budget. The shipped files are the same Google fonts instanced with
   fontTools to the axis ranges the design uses (54.5KB + 28.4KB), loaded via
   `next/font/local` with `display: swap`; the mono face is not preloaded.
4. **Element base styles wrapped in `@layer base`.** The plan's unlayered
   `a { color: inherit }` overrode every Tailwind text-color utility on links
   (unlayered CSS beats layered utilities), inverting button/link colors.
5. **Testing Library cleanup registered in `tests/setup.ts`.** Vitest runs
   without injected globals, so auto-cleanup never registered; leaked trees
   from earlier tests broke layered-dialog Escape/focus assertions.
6. **`PageTitle` gained an optional `headingLevel`** (default 1) so gallery
   specimens do not add extra h1 elements to the route.
7. **Token test path resolution.** The plan's `import.meta.url` file lookup is
   not a `file:` URL under the jsdom Vitest environment; the test resolves from
   `process.cwd()` and runs in the node environment instead.
8. **Preview verified via the Vercel GitHub integration** rather than
   `vercel deploy` + `PLAYWRIGHT_BASE_URL`: the CLI session is expired (device
   re-auth requires Yehia) and deployment protection now returns 302 SSO for
   all preview URLs, so automated tests cannot reach them without a Protection
   Bypass secret. Browser verification ran against the identical production
   build locally and in CI.
9. **Nine scoped commits instead of eight.** The gate-forced product
   corrections above landed as a separate `fix:` commit before the test
   commit rather than being mixed into either.

## Phase 3 Readiness

Phase 3 planning may begin only after Yehia reviews this preview and approves
the merge of pull request #2.
