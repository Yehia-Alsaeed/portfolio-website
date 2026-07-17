# Phase 0 Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the approved prototype and planning documents into a clean, version-controlled, build-ready source of truth for the production Next.js implementation.

**Architecture:** Phase 0 adds no application runtime and provisions no database or media service. It establishes repository hygiene, records locked decisions and service limits, classifies assets and client permissions, prepares the CV, and publishes the baseline repository that Phase 1 will scaffold in place.

**Tech Stack:** Git, GitHub CLI, Markdown, PowerShell, existing static HTML/CSS/JavaScript prototype, Word/PDF tooling for CV export.

## Global Constraints

- Vercel Hobby is the locked and non-negotiable deployment target. Do not reopen hosting selection.
- Do not scaffold Next.js or install JavaScript dependencies in Phase 0.
- Do not create Neon, Cloudinary, Neon Auth, or Resend resources in Phase 0.
- Do not commit credentials, `.env` values, client-confidential URLs, unapproved client media, or temporary QA captures.
- `prd.md`, `handoff.md`, the production roadmap, and the updated demo must agree before completion.
- The approved Mockup B demo remains a reference artifact; production code will not import its HTML, CSS, or JavaScript.
- All recorded UI requirements must explicitly cover 360, 390, 768, 1024, 1440, and 1920px verification widths.
- Performance and practical scalability remain phase exit criteria throughout the roadmap.
- Use ASCII for new configuration files. Existing UTF-8 product copy may remain UTF-8.

---

### Task 1: Initialize source control and repository hygiene

**Files:**
- Create: `.gitignore`
- Create: `.gitattributes`
- Create: `.editorconfig`
- Preserve: `prd.md`
- Preserve: `handoff.md`
- Preserve: `docs/`
- Preserve: `mockups/`

**Interfaces:**
- Consumes: the existing unversioned workspace at `D:\portfolio website`
- Produces: a `main` Git branch with deterministic text settings and no tracked secrets or QA artifacts

- [ ] **Step 1: Verify the workspace preconditions**

Run:

```powershell
Test-Path .git
Test-Path prd.md
Test-Path handoff.md
Test-Path docs\superpowers\specs\2026-07-17-portfolio-production-roadmap-design.md
Test-Path mockups\demo\index.html
```

Expected:

```text
False
True
True
True
True
```

- [ ] **Step 2: Initialize Git with `main` as the default branch**

Run:

```powershell
git init -b main
git status --short --branch
```

Expected: the output starts with `## No commits yet on main`.

- [ ] **Step 3: Add repository ignore rules**

Create `.gitignore` with exactly:

```gitignore
# Dependencies and Next.js output
node_modules/
.next/
out/
.netlify/

# Local environment and provider state
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
!.env.example
.vercel/

# Test and analysis output
coverage/
playwright-report/
test-results/
mockups/demo/qa/

# Local optimized-image source copies; WebP/JPEG demo assets are tracked
mockups/demo/assets/pets-*.png
mockups/demo/assets/prestige-*.png
mockups/demo/assets/study-planner-architecture.png

# Operating system and editor files
.DS_Store
Thumbs.db
*.swp
*.swo
```

- [ ] **Step 4: Add cross-platform text rules**

Create `.gitattributes` with exactly:

```gitattributes
* text=auto eol=lf
*.ps1 text eol=crlf
*.png binary
*.jpg binary
*.jpeg binary
*.webp binary
*.pdf binary
*.docx binary
```

Create `.editorconfig` with exactly:

```editorconfig
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
indent_style = space
indent_size = 2
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false

[*.ps1]
end_of_line = crlf
indent_size = 4
```

- [ ] **Step 5: Verify ignored and tracked boundaries**

Run:

```powershell
git check-ignore mockups/demo/qa/report.json
git check-ignore mockups/demo/assets/pets-fcn.png
git check-ignore mockups/demo/assets/pets-fcn.webp
git check-ignore .env.local
git check-ignore .env.example
```

Expected:

- `mockups/demo/qa/report.json`, the PNG source copy, and `.env.local` are printed as ignored.
- `pets-fcn.webp` and `.env.example` produce no output and return a non-zero status because they are allowed to be tracked.

- [ ] **Step 6: Create the baseline commit**

Run:

```powershell
git add .gitignore .gitattributes .editorconfig prd.md handoff.md docs mockups
git status --short
git commit -m "chore: establish portfolio planning baseline"
```

Expected: the first commit succeeds; `mockups/demo/qa/` and ignored PNG source copies do not appear in the commit.

---

### Task 2: Create the readiness audit and locked-decision register

**Files:**
- Create: `docs/implementation/phase-0-readiness-report.md`
- Create: `docs/implementation/decision-register.md`
- Modify only if a contradiction is found: `prd.md`
- Modify only if a contradiction is found: `handoff.md`
- Modify only if a contradiction is found: `docs/superpowers/specs/2026-07-17-portfolio-production-roadmap-design.md`

**Interfaces:**
- Consumes: product scope from `prd.md`, rationale from `handoff.md`, and phase gates from the roadmap
- Produces: one concise audit result and one stable list of decisions that every later phase plan can cite

- [ ] **Step 1: Write a failing consistency scan before creating the report**

Run:

```powershell
$required = @(
  'Next.js', 'TypeScript', 'Tailwind', 'shadcn', 'Neon Postgres',
  'Drizzle', 'Neon Auth', 'Cloudinary', 'Recharts', 'React Flow',
  'Vercel', 'Paper', 'Night', 'Mono'
)
$documents = Get-Content prd.md,handoff.md,docs\superpowers\specs\2026-07-17-portfolio-production-roadmap-design.md -Raw
$required | Where-Object { $documents -notmatch [regex]::Escape($_) }
Test-Path docs\implementation\phase-0-readiness-report.md
```

Expected: no missing required term is printed, followed by `False` because the report does not exist yet.

- [ ] **Step 2: Create the readiness report**

Create `docs/implementation/phase-0-readiness-report.md` with these sections and resolved values:

```markdown
# Phase 0 Readiness Report

**Audit date:** 2026-07-17
**Production implementation status:** Not started
**Prototype status:** Approved static reference at `mockups/demo/`

## Source Priority

1. `prd.md` controls product scope.
2. `handoff.md` controls rationale and rejected ideas.
3. The production roadmap controls phase order and quality gates.
4. The static demo controls approved visual behavior.

## Locked Decisions

- One recruiter-first brand with a prominent freelance-services path.
- Next.js App Router, strict TypeScript, Tailwind CSS, and shadcn/ui.
- Neon Postgres, Drizzle, and Neon Auth.
- Cloudinary for project media; no image binaries in PostgreSQL.
- Recharts for authenticated admin charts.
- React Flow core for Architecture X-Ray.
- GitHub source control and Vercel Hobby deployment.
- Paper, Night, and Mono modes in the approved YA Monogram system.
- Five flagship case studies and seventeen technical projects.
- Custom first-party analytics only in v1.

## Explicitly Excluded From v1

- Blog, CMS, newsletter, i18n, `/uses`, public stats, certifications wall.
- Calendar booking, WhatsApp button, services FAQ, public availability toggle.
- Ask-my-AI chatbot and in-browser ML demo.
- Testimonial collection flow; the empty display component remains hidden.

## Non-Blocking Content States

- CV: use the AI CV source and export the reviewed PDF in Phase 0.
- Client work: six anonymized placeholders remain valid until written approval is recorded.
- Resend: notification is optional; persisted contact messages remain the source of truth.

## Audit Result

The planning documents and updated no-preview demo are consistent enough to begin Phase 1 after every Phase 0 exit check passes.
```

- [ ] **Step 3: Create the decision register**

Create `docs/implementation/decision-register.md` as a table with columns `ID`, `Decision`, `Status`, `Source`, and `Change rule`. Include these exact IDs:

```markdown
# Production Decision Register

| ID | Decision | Status | Source | Change rule |
|---|---|---|---|---|
| ARCH-001 | Single Next.js App Router application; no separate backend server | Locked | `prd.md` section 4 | Explicit user approval required |
| ARCH-002 | Strict TypeScript, Tailwind CSS, and shadcn/ui | Locked | `prd.md` section 4 | Phase plan may refine versions only |
| DATA-001 | Neon Postgres with Drizzle-owned application schema | Locked | `prd.md` sections 4 and 8 | Explicit user approval required |
| AUTH-001 | Neon Auth with one admin and disabled public registration | Locked | `prd.md` section 6.3 | Explicit user approval required |
| MEDIA-001 | Cloudinary stores portfolio media; repository stores tiny UI assets and CV | Locked | `prd.md` section 4 | Explicit user approval required |
| HOST-001 | Vercel Hobby deployment | Locked, non-negotiable | User decision | Do not reopen |
| UI-001 | Mockup B YA Monogram is the production visual system | Locked | `handoff.md` section 4 | Visual changes require prototype review |
| UI-002 | Every UI ships for mobile, tablet, desktop, and wide desktop | Locked | Production roadmap section 3 | No phase may waive viewport checks |
| PERF-001 | Performance and practical scalability are phase exit criteria | Locked | Production roadmap section 3 | Targets may only become stricter |
| ANALYTICS-001 | Custom cookieless analytics only; no parallel Vercel Analytics | Locked | Production roadmap section 3 | Explicit user approval required |
```

- [ ] **Step 4: Verify that the flagship index is the approved full-width list**

Run:

```powershell
$indexSections = (Select-String -Path mockups\demo\index.html -Pattern '<section class="index">' -AllMatches).Matches.Count
$projectRows = (Select-String -Path mockups\demo\index.html -Pattern '<a class="row"' -AllMatches).Matches.Count
if ($indexSections -ne 1 -or $projectRows -ne 5) { exit 1 }
'PASS: one full-width index with five flagship rows'
```

Expected: `PASS: one full-width index with five flagship rows`.

- [ ] **Step 5: Commit the audit**

Run:

```powershell
git add docs/implementation prd.md handoff.md docs/superpowers/specs/2026-07-17-portfolio-production-roadmap-design.md
git commit -m "docs: lock production decisions and readiness state"
```

Expected: commit succeeds with the readiness report and decision register.

---

### Task 3: Record the media, privacy, and repository asset boundary

**Files:**
- Create: `docs/content/asset-register.md`
- Create: `docs/content/client-work-register.md`
- Modify: `.gitignore` only if the verification finds another generated or confidential path

**Interfaces:**
- Consumes: existing `mockups/demo/assets/`, the Cloudinary media boundary, and six client-work slots
- Produces: an auditable mapping from each asset to its owner, visibility, production destination, and fallback

- [ ] **Step 1: Generate the current asset inventory**

Run:

```powershell
Get-ChildItem mockups\demo\assets -File |
  Sort-Object Name |
  Select-Object Name,Extension,Length |
  Format-Table -AutoSize
```

Expected: the inventory includes SkillBridge JPEGs, Prestige WebPs, Oxford Pet WebPs, and the Study Planner WebP. Ignored PNG source copies may exist locally but are not production inputs.

- [ ] **Step 2: Create the asset register**

Create `docs/content/asset-register.md` with one row per tracked asset:

```markdown
# Portfolio Asset Register

| Asset | Evidence/project | Public status | Production destination | Required alt-text intent |
|---|---|---|---|---|
| `skillbridge-interview.jpeg` | SkillBridge | Approved project evidence | Cloudinary | Candidate interview session with webcam and question interface |
| `skillbridge-results.jpeg` | SkillBridge | Approved project evidence | Cloudinary | Five-trait interview feedback report |
| `prestige-home.webp` | Prestige Motors | Approved public deployment | Cloudinary | Prestige Motors showroom homepage |
| `prestige-collection.webp` | Prestige Motors | Approved public deployment | Cloudinary | Responsive vehicle collection interface |
| `pets-fcn.webp` | Oxford Pet Segmentation | Approved repository output | Cloudinary | FCN predictions beside source and ground truth |
| `pets-segnet.webp` | Oxford Pet Segmentation | Approved repository output | Cloudinary | SegNet predictions beside source and ground truth |
| `pets-hrnet.webp` | Oxford Pet Segmentation | Approved repository output | Cloudinary | HRNet predictions beside source and ground truth |
| `study-planner-architecture.webp` | AI Study Planner Agents | Approved repository evidence | Cloudinary | Profiler-to-optimizer multi-agent workflow |

## Repository Boundary

- Track the optimized JPEG/WebP demo references.
- Do not track QA screenshots or redundant PNG source copies.
- Store Cloudinary public IDs and alt text in typed production content.
- Keep the CV, font files, tiny textures, and UI-only assets in the repository.
- Never store image or PDF binaries in PostgreSQL.
```

- [ ] **Step 3: Create the client-work register with explicit safe defaults**

Create `docs/content/client-work-register.md`:

```markdown
# Client Work Publication Register

| Slot | Type | Public name | Approval | Launch state | URL/media rule |
|---|---|---|---|---|---|
| `shopify-01` | Shopify | Anonymized | Pending written approval | Placeholder | Store no URL or media in Git |
| `shopify-02` | Shopify | Anonymized | Pending written approval | Placeholder | Store no URL or media in Git |
| `shopify-03` | Shopify | Anonymized | Pending written approval | Placeholder | Store no URL or media in Git |
| `shopify-04` | Shopify | Anonymized | Pending written approval | Placeholder | Store no URL or media in Git |
| `fullstack-01` | Full-stack website | Anonymized | Pending written approval | Placeholder | Store no URL or media in Git |
| `fullstack-02` | Full-stack website | Anonymized | Pending written approval | Placeholder | Store no URL or media in Git |

## Approval States

- `Placeholder`: anonymized type and status only.
- `Screenshot`: approved media may be uploaded to Cloudinary; no live URL is exposed.
- `Live link`: approved public URL may be linked after manual verification.
- `Live embed`: approved public URL may be framed only after CSP and `X-Frame-Options` checks pass.
- `Hidden`: remove the slot from public rendering without deleting the record.

Written approval evidence stays outside the public repository. This register records only the resulting publication state.
```

- [ ] **Step 4: Verify no confidential client value appears in tracked files**

Run:

```powershell
rg -n -i "client secret|private client|unapproved|password|api[_ -]?key" . -g "!.git/**" -g "!mockups/demo/qa/**"
git status --short
```

Expected: no credential or confidential URL is found. Normal explanatory uses of words such as `unapproved` or `API` must be reviewed manually rather than blindly deleted.

- [ ] **Step 5: Commit the asset boundary**

Run:

```powershell
git add docs/content .gitignore
git commit -m "docs: define portfolio media and client privacy boundaries"
```

Expected: only documentation and any necessary ignore-rule adjustment are committed.

---

### Task 4: Prepare the CV and define its production contract

**Files:**
- Read: `D:\job hunt\CV VERSIONS\Yehia_Alsaeed_CV_AI.docx`
- Create: `public/cv/Yehia_Alsaeed_CV_AI.pdf`
- Create: `docs/content/cv-register.md`

**Interfaces:**
- Consumes: the existing AI-focused Word CV source
- Produces: one reviewed, repository-hosted PDF and a stable public path for later tracked downloads

- [ ] **Step 1: Verify the selected source exists and is not empty**

Run:

```powershell
$cv = Get-Item -LiteralPath 'D:\job hunt\CV VERSIONS\Yehia_Alsaeed_CV_AI.docx'
$cv.FullName
$cv.Length -gt 0
```

Expected: the exact source path is printed followed by `True`.

- [ ] **Step 2: Render and inspect the Word source**

Use the `documents` skill render workflow to render every page of the DOCX to images. Inspect for clipped text, font substitution, broken links, unexpected blank pages, and stale contact information.

Expected contact values:

```text
Email: yehias3eed11@gmail.com
GitHub: Yehia-Alsaeed
LinkedIn: yehia-alsaeed
```

If those identifiers differ, stop this task and correct the Word source before export; do not patch the PDF independently.

- [ ] **Step 3: Export the reviewed CV to PDF**

Create `public/cv/` and export the source as:

```text
public/cv/Yehia_Alsaeed_CV_AI.pdf
```

Use the `pdf` skill to render every exported page and compare it to the accepted Word render.

Expected: same page count, no clipped content, searchable text, and working web links.

- [ ] **Step 4: Record the production CV contract**

Create `docs/content/cv-register.md`:

```markdown
# CV Production Register

- Source: `D:\job hunt\CV VERSIONS\Yehia_Alsaeed_CV_AI.docx`
- Public file: `/cv/Yehia_Alsaeed_CV_AI.pdf`
- Repository path: `public/cv/Yehia_Alsaeed_CV_AI.pdf`
- Contact email: `yehias3eed11@gmail.com`
- Download behavior: same-origin file response with analytics event `cv_download`
- Cache rule: long-lived only when the filename changes with a CV revision
- Review rule: render and inspect every page after each source update
```

- [ ] **Step 5: Verify and commit the CV artifact**

Run:

```powershell
Test-Path public\cv\Yehia_Alsaeed_CV_AI.pdf
(Get-Item public\cv\Yehia_Alsaeed_CV_AI.pdf).Length -gt 0
git add public/cv/Yehia_Alsaeed_CV_AI.pdf docs/content/cv-register.md
git commit -m "docs: prepare reviewed portfolio CV artifact"
```

Expected: both checks return `True` and the binary plus register are committed.

---

### Task 5: Lock service budgets and the environment-variable contract

**Files:**
- Create: `.env.example`
- Create: `docs/ops/free-tier-baseline.md`
- Create: `docs/ops/environment-contract.md`

**Interfaces:**
- Consumes: the locked stack and current official provider limits
- Produces: public variable names, secret ownership rules, monitoring thresholds, and zero-cost operating boundaries for later phases

- [ ] **Step 1: Create the environment example without secrets**

Create `.env.example`:

```dotenv
# Public application configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=

# Server-only database configuration (Phase 6)
DATABASE_URL=
DATABASE_URL_UNPOOLED=

# Server-only integrations
GITHUB_TOKEN=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
ANALYTICS_HASH_SALT=
RESEND_API_KEY=
CONTACT_NOTIFICATION_TO=yehias3eed11@gmail.com

# Neon Auth variables are added from Neon's generated integration output in Phase 7.
```

- [ ] **Step 2: Create the provider baseline**

Create `docs/ops/free-tier-baseline.md` with this table and direct official links:

```markdown
# Free-Tier Operating Baseline

**Recorded:** 2026-07-17

| Provider | Locked use | Free allocation to monitor | Stop/mitigation rule | Official source |
|---|---|---|---|---|
| Vercel Hobby | Next.js hosting and Functions | 1M edge requests/month, 100 GB transfer/month, 1M function invocations/month, 4 active CPU hours/month, 5K image transformations/month | Keep public routes static/ISR and use Cloudinary for portfolio media | https://vercel.com/pricing |
| Neon Free | PostgreSQL and Neon Auth | 100 CU-hours/project/month, 0.5 GB/project, 5 GB public transfer/month, scale-to-zero after 5 idle minutes, 60K Auth MAU | Aggregate and expire raw analytics before 70% storage; keep queries indexed | https://neon.com/pricing |
| Cloudinary Free | Project media delivery | 25 credits/month; transformations and bandwidth evaluated over a rolling 30-day window; storage is a current snapshot | Alert at 70%; constrain widths and avoid video/autoplay | https://cloudinary.com/documentation/billing_and_plans |
| Resend Free | Optional contact notification | 3,000 emails/month and 100/day | Persist first; skip notification when unavailable | https://resend.com/docs/knowledge-base/what-is-resend-pricing |

## Review Schedule

- Recheck a provider's official page immediately before creating its account or production resource.
- Record current usage monthly after launch.
- Never enable automatic paid overages or paid add-ons.
- The application must remain useful when optional email notification is unavailable.
```

- [ ] **Step 3: Create the environment contract**

Create `docs/ops/environment-contract.md` with a table for every variable in `.env.example`. For each variable record:

- visibility (`public` or `server-only`),
- owner/provider,
- first phase that requires it,
- local/preview/production scope,
- whether absence is fatal or has a fallback.

Use these required rules:

```markdown
- Only variables beginning with `NEXT_PUBLIC_` may enter browser bundles.
- `.env.example` contains names and safe local defaults only.
- Local secrets live in `.env.local`, which Git ignores.
- Preview and production values live in Vercel environment settings.
- `RESEND_API_KEY` is optional; every other server variable becomes required in the phase that activates its integration.
- `ANALYTICS_HASH_SALT` must differ between local, preview, and production.
- Provider-generated Neon Auth variable names are added verbatim in Phase 7 rather than guessed in advance.
```

- [ ] **Step 4: Verify no secret-like value is tracked**

Run:

```powershell
git check-ignore .env.local
git check-ignore .env.example
rg -n "(sk_live_|sk_test_|postgres(ql)?://[^[:space:]]+:[^[:space:]]+@|CLOUDINARY_API_SECRET=.+|RESEND_API_KEY=.+)" .env.example prd.md handoff.md docs\implementation docs\content docs\ops mockups -g "!mockups/demo/qa/**"
```

Expected: `.env.local` is ignored, `.env.example` is not ignored, and the secret scan produces no matches.

- [ ] **Step 5: Commit the service contracts**

Run:

```powershell
git add .env.example docs/ops
git commit -m "docs: lock environment and free-tier operating contracts"
```

Expected: the example and two operational documents are committed without secret values.

---

### Task 6: Publish the GitHub baseline and Phase 1 handoff

**Files:**
- Create: `docs/implementation/phase-1-inputs.md`
- Modify: `docs/implementation/phase-0-readiness-report.md`

**Interfaces:**
- Consumes: all Phase 0 commits and exit checks
- Produces: public GitHub repository `Yehia-Alsaeed/portfolio-website`, pushed `main`, and a precise input contract for the Phase 1 plan

- [ ] **Step 1: Create the Phase 1 input contract**

Create `docs/implementation/phase-1-inputs.md`:

```markdown
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
```

- [ ] **Step 2: Run the Phase 0 exit audit**

Run:

```powershell
$requiredFiles = @(
  '.gitignore', '.gitattributes', '.editorconfig', '.env.example',
  'docs\implementation\phase-0-readiness-report.md',
  'docs\implementation\decision-register.md',
  'docs\implementation\phase-1-inputs.md',
  'docs\content\asset-register.md',
  'docs\content\client-work-register.md',
  'docs\content\cv-register.md',
  'docs\ops\free-tier-baseline.md',
  'docs\ops\environment-contract.md',
  'public\cv\Yehia_Alsaeed_CV_AI.pdf'
)
$missing = $requiredFiles | Where-Object { -not (Test-Path $_) }
if ($missing) { $missing; exit 1 }

$indexSections = (Select-String -Path mockups\demo\index.html -Pattern '<section class="index">' -AllMatches).Matches.Count
$projectRows = (Select-String -Path mockups\demo\index.html -Pattern '<a class="row"' -AllMatches).Matches.Count
if ($indexSections -ne 1 -or $projectRows -ne 5) { exit 1 }

git status --short
```

Expected: no missing path, no rejected-feature match, and only the new Phase 1 input file plus readiness-report update are uncommitted.

- [ ] **Step 3: Mark Phase 0 complete in the readiness report**

Change these fields in `docs/implementation/phase-0-readiness-report.md`:

```markdown
**Phase 0 status:** Complete
**Phase 1 readiness:** Approved to write the Phase 1 implementation plan
```

Append a verification record containing:

```markdown
## Phase 0 Exit Verification

- Git hygiene and secret boundaries: pass
- Scope and decision consistency: pass
- Asset and client privacy registers: pass
- CV render and PDF comparison: pass
- Free-tier and environment contracts: pass
- Full-width five-row flagship index: pass
```

- [ ] **Step 4: Commit the handoff**

Run:

```powershell
git add docs/implementation/phase-1-inputs.md docs/implementation/phase-0-readiness-report.md
git commit -m "docs: complete phase zero readiness handoff"
git status --short
```

Expected: commit succeeds and the working tree is clean.

- [ ] **Step 5: Authenticate GitHub CLI and create the public repository**

Run:

```powershell
gh auth status
gh repo create Yehia-Alsaeed/portfolio-website --public --source=. --remote=origin --push
```

Expected:

- `gh auth status` confirms the `Yehia-Alsaeed` account.
- GitHub creates `https://github.com/Yehia-Alsaeed/portfolio-website`.
- `main` is pushed and tracks `origin/main`.

If the repository already exists, do not recreate or overwrite it. Run instead:

```powershell
git remote add origin https://github.com/Yehia-Alsaeed/portfolio-website.git
git push -u origin main
```

- [ ] **Step 6: Verify the remote baseline**

Run:

```powershell
git remote -v
git branch -vv
git log --oneline --decorate -6
gh repo view Yehia-Alsaeed/portfolio-website --json nameWithOwner,visibility,url,defaultBranchRef
```

Expected:

- `origin` points to `Yehia-Alsaeed/portfolio-website`.
- `main` tracks `origin/main`.
- The repository is public and its default branch is `main`.
- The latest commit is `docs: complete phase zero readiness handoff`.

---

## Phase 0 Completion Gate

Phase 0 is complete only when all six tasks are committed and pushed, the working tree is clean, the CV is visually verified, no secret or unapproved client material is tracked, all locked decisions are recorded, and `docs/implementation/phase-1-inputs.md` authorizes creation of the Phase 1 implementation plan.
