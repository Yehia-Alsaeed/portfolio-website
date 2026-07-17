# Phase 1 Input Contract

## Required Inputs

- Approved product scope: `prd.md`
- Decision rationale and rejected ideas: `handoff.md`
- Master phase gates: `docs/superpowers/specs/2026-07-17-portfolio-production-roadmap-design.md`
- Readiness result: `docs/implementation/phase-0-readiness-report.md`
- Locked decisions: `docs/implementation/decision-register.md`
- Media boundary: `docs/content/asset-register.md`
- Client safety states: `docs/content/client-work-register.md`
- CV contract: `docs/content/cv-register.md`
- Service limits: `docs/ops/free-tier-baseline.md`
- Environment names: `.env.example` and `docs/ops/environment-contract.md`
- Visual reference: `mockups/demo/`

## Phase 1 Scope

Phase 1 may scaffold Next.js, strict TypeScript, Tailwind, shadcn/ui, tests, CI, and Vercel preview deployment. It must not implement production pages, provision Neon/Cloudinary/Auth, or copy prototype source into production components.

## Mandatory Baseline Commands

The Phase 1 plan must define and make passing:

```text
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm playwright test
```
