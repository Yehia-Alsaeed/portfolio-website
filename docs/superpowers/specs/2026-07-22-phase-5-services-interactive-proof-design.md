# Phase 5 Services and Interactive Proof Design

**Status:** Approved in conversation on 2026-07-22

**Executor:** Claude Code

**Goal:** Complete the freelance services path and add progressively enhanced technical proof to the five flagship case studies without weakening performance, accessibility, or factual integrity.

## Scope

Phase 5 delivers:

- a finished `/services` page;
- three approved Shopify client-work entries;
- responsive visual proof for Madar Wears and La Glosse;
- a text-only Nexo entry;
- a reusable Architecture X-Ray foundation with five project-specific diagrams;
- the Oxford Model Comparison Microscope;
- the AI Study Planner deterministic Agent Run Replay; and
- a component-ready testimonials section that renders nothing while no approved quotes exist.

Phase 5 does not add Neon, contact persistence, analytics, Resend, authentication, admin UI, pricing, fabricated client outcomes, or live AI/model inference.

## Services Page

The page order is fixed:

1. Page title: `I build stores & software that ship.`
2. Availability: `Available for select freelance projects.`
3. Two inquiry-only offers: Shopify and full-stack/AI development.
4. Four-step process: discovery, build, verification, and launch/handover.
5. Three approved client-work entries.
6. Inquiry call to action linking to the existing `/#contact` section.

The page remains a Server Component driven by typed repository content. It shows no prices, fixed packages, booking-quarter claim, testimonial placeholder, or unsupported business result.

## Shopify Client Work

The approved entries are:

| Entry | URL | Phase 5 presentation |
| --- | --- | --- |
| Madar Wears | `https://www.madarwears.com/` | Desktop/mobile screenshots, short user-controlled recording, and external live-store link |
| La Glosse | `https://la-glosse.com/` | Desktop/mobile screenshots, short user-controlled recording, and external live-store link |
| Nexo | `https://bh9d1w-16.myshopify.com/` | Text-only project entry and external link |

Claude Code may open and capture only Madar Wears and La Glosse. It must not open, capture, authenticate to, or modify Nexo during Phase 5.

Shopify work is presented through approved screenshots and recordings because the contribution being demonstrated is the storefront design and implementation, not the merchant's products or store operations. This is also the rule for future Shopify portfolio entries:

- never embed the hosted storefront in an iframe;
- never add a live product feed merely to make the preview interactive;
- use exact visual captures and an external live-store link; and
- show only claims and media that are approved for public portfolio use.

The continuous 320-1440px viewport scrubber from the original roadmap is removed. A static capture cannot truthfully re-render at arbitrary widths. Honest labelled desktop and mobile controls replace it.

Recordings must be muted by default, never autoplay, expose native or equivalent keyboard-accessible controls, use a screenshot poster, and include a concise text description. A missing or failed recording leaves the screenshots and project text intact. Media is optimized before commit and loaded only when its client-work entry is visible or activated.

## Architecture X-Ray

Each flagship case study receives one project-specific architecture dataset containing typed nodes, edges, short descriptions, and an ordered static reading sequence.

The existing architecture prose remains the baseline. A server-rendered static diagram/step list is always present and understandable without JavaScript. The interactive X-Ray progressively enhances that same data with selectable nodes and visible relationships. It must not introduce claims beyond the approved Phase 4 case-study content and repository evidence.

`@xyflow/react` may be added for the interactive canvas. It must be dynamically imported only by case-study proof modules; it cannot enter the homepage, services page, shared shell, or initial case-study server fallback bundle.

The five diagrams cover:

- SkillBridge: capture/UI, FastAPI orchestration, CV/role signals, transcription, multimodal scoring, and report output;
- Llama QLoRA: dataset preparation, baseline evaluation, quantized fine-tuning, evaluation, and result artifacts;
- AI Study Planner: profiler, generator, critic, optimizer, and evaluation/output;
- Oxford Pets: preprocessing/fixed splits, the three model branches, shared evaluation, and comparison output; and
- Prestige Motors: customer/admin UI, Express API, guarded route groups, MongoDB, Cloudinary, and Vercel deployment.

## Oxford Model Comparison Microscope

The Oxford case study receives a deterministic comparison of FCN-ResNet18, SegNet-VGG16, and HRNet-W18 using only the already approved images and metrics.

The static fallback shows all three model summaries and comparison metrics. The client enhancement lets a visitor select a model and inspect its approved output beside mIoU, inference time, and parameter count. It does not execute a model, invent predictions, fetch notebook artifacts at runtime, or imply production benchmarking.

## AI Study Planner Agent Run Replay

The Study Planner case study receives a four-stage replay for Profiler, Generator, Critic, and Optimizer. Its content is derived from the published sample input/output and approved case-study claims.

The static fallback contains the complete ordered transcript. The client enhancement provides stage navigation and highlights each typed handoff. Playback is deterministic, requires no API key, makes no model request, and does not present the illustrative `9 / 10` sample score as an aggregate benchmark.

## Data and Component Boundaries

- Typed content modules own services, client-work, architecture, model-comparison, and replay data.
- Server Components render page structure, copy, static fallbacks, links, and metadata.
- Small client components own media switching, recording controls, diagram selection, model selection, and replay navigation.
- The shared case-study template selects proof modules by case-study slug without embedding project-specific branches throughout the page component.
- New files remain feature-focused; no single catch-all proof component owns unrelated interactions.

There is no Phase 5 API route, Server Action, database query, secret, Shopify token, or third-party preview script.

## Accessibility, SEO, Security, and Performance

- Preserve one meaningful `h1` per route and semantic section headings.
- Every interaction is keyboard reachable, has a visible focus state, and exposes selected/expanded state to assistive technology.
- Static fallbacks contain the complete meaning when JavaScript, video, or the interactive canvas is unavailable.
- Screenshots have contribution-focused alt text; recordings have text descriptions and do not autoplay.
- Reduced motion disables animated traversal and nonessential transitions.
- External destinations use `target="_blank"` with `rel="noopener noreferrer"`.
- Captures contain no admin UI, customer data, cookies, credentials, or private client information.
- `/services` receives truthful title, description, and canonical metadata. Comprehensive structured data remains Phase 8.
- Proof dependencies and media cannot increase the homepage client bundle. Heavy modules load only on the route and interaction that needs them.

## Failure Behaviour

- A failed Cloudinary or recording request falls back to checked-in poster/screenshots and text.
- A failed interactive import leaves the static proof visible.
- Missing optional media omits its control rather than rendering a broken frame.
- External site availability never controls whether `/services` renders.
- Invalid proof content fails typed/unit validation during development rather than producing a partially connected diagram.

## Verification Strategy

Use the smallest meaningful gate for each deliverable:

- unit tests for typed content invariants and proof-data integrity;
- focused component tests for each unique interaction and its accessible state;
- focused Playwright journeys for `/services`, all five case studies, no-JavaScript fallbacks, keyboard access, and representative mobile/desktop containment;
- a production build and bundle check proving Phase 5 proof code does not enter the homepage bundle; and
- one final lint, typecheck, unit, production-build, focused browser, accessibility, and Lighthouse gate before preview delivery.

Do not repeat the full historic mode/viewport matrix when existing shared-shell tests already cover the unchanged behavior. Visual review concentrates on `/services`, one representative Architecture X-Ray, Oxford, and Study Planner at 390px, 768px, and 1440px.

## Exit Criteria

Phase 5 is complete when:

- the freelance path truthfully explains the two offers and how to inquire;
- exactly three approved client entries render, with captures only for Madar Wears and La Glosse and text only for Nexo;
- every flagship case study has understandable static architecture proof and an isolated interactive enhancement;
- Oxford and Study Planner provide deterministic, evidence-backed proof modules;
- testimonials remain absent while no quotes are approved;
- all affected routes remain usable without JavaScript and pass focused accessibility/responsive checks; and
- the homepage bundle does not grow because of Phase 5 proof dependencies.
