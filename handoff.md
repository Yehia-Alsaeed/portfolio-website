# Handoff — Yehia Alsaeed Portfolio Website

**Purpose of this document:** this is the full session history and rationale behind `prd.md`. Read **both files** before writing any code. The PRD is the spec; this file is the "why" behind every decision in it, plus everything that was explicitly considered and rejected (so you don't re-propose it), plus the exact current state of the repo. Written 2026-07-12 for handoff to Codex; dual-audience strategy updated 2026-07-15; visual interaction direction updated 2026-07-16.

**Locked media decision (July 2026):** Cloudinary Free is the approved media layer for project screenshots, thumbnails, profile imagery, and short demo media. Store Cloudinary public IDs and alt text in project content files; never store image binaries in the application database. Use responsive Cloudinary transformations and treat its 25 monthly credits as a shared allowance across storage, transformations, and bandwidth. Keep tiny UI assets, fonts, textures, and the CV in the repository, and avoid long-form/autoplay video that could exhaust the free allowance.

---

## 1. Who this is for

**Yehia Alsaeed** — AI/ML Engineer, Cairo, Egypt. BSc (Hons) Informatics & Computer Science, AI major, British University in Egypt, graduated 2026.

- GitHub: `Yehia-Alsaeed` (18 repos total — 17 project repos + 1 profile README repo)
- LinkedIn: linkedin.com/in/yehia-alsaeed
- Contact email for the site: `yehias3eed11@gmail.com` (this is the email that appears on his CV and should be used everywhere on the site — a different address, ``, is only his Claude account login and is **not** for the site)
- CV source file: `D:\job hunt\CV VERSIONS\Yehia_Alsaeed_CV_AI.docx` (still the source of truth for experience/education content; a PDF export for the site's download button is an open item — see PRD §12.3)

Two professional identities the site must serve simultaneously:
1. **AI/ML engineer job-seeker** — LLM fine-tuning (QLoRA/PEFT), multi-agent systems (CrewAI), computer vision (PyTorch, YOLOv8, segmentation), full-stack ML products. Audience: recruiters/hiring managers.
2. **Freelance web developer** — 1+ year building Shopify stores (Liquid/HTML/CSS/JS, conversion + SEO focus) and full-stack client sites. Audience: prospective clients. This work is **not** on GitHub — it's 4 Shopify stores + 2 full-stack websites, currently un-published pending client approval (see §6 below).

### Dual-audience positioning decision (July 15, 2026)

Yehia clarified that the website will be attached to graduate AI/ML job applications while also being used directly in freelance promotion. The resolution is **one brand with two intentional entry paths**, not two websites and not an audience-selection splash screen.

The homepage hierarchy is recruiter-first: Yehia is presented primarily as an **AI/ML engineer who builds production-ready software**. Full-stack ability supports that identity because it shows he can turn models into usable products; freelance delivery adds evidence that he can work with requirements, communicate with stakeholders, and ship. Shopify remains a real commercial offer, but it is not presented as an equal competing job title in the opening headline.

Immediately after the homepage positioning, visitors get two actions:
- **View AI/ML work** — primary; leads into the flagship technical work and recruiter evidence.
- **Explore client services** — secondary but prominent; leads directly to `/services`.

Link-sharing is audience-specific. Use `/` or a relevant AI/ML case study in job applications. Use `/services` in client outreach. Both routes retain the same YA Monogram visual identity, navigation, contact system, and underlying site; only their content hierarchy differs.

The shared homepage contact form must not ask only "What are we building?" because that excludes recruiters. Use a broad discussion prompt and an inquiry-type field (Job opportunity / Freelance project / Collaboration / Other). The `/services` CTA may retain client-specific wording because its audience is already clear.

The approved content order on home is now: monogram → umbrella statement and two audience paths → evidence stats → flagship work → experience/education → services and strongest client-work proof → shared contact → footer. This intentionally moves recruiter evidence ahead of the detailed freelance offer while preserving a one-click client route near the top.

Proof differs by audience even though the case-study design stays consistent: AI/ML work needs baselines, methodology, evaluation, metrics, limitations, and reproducibility; client work needs the brief, Yehia's exact role, delivery scope, visual/live proof, timeline, business outcome where available, and handover. Commercial client projects stay on `/services` unless they also have a public GitHub repository; `/projects` remains the technical repository inventory.

## 2. Full project inventory (all 17 GitHub repos)

Pulled live from `gh repo list Yehia-Alsaeed` and categorized. This is the canonical list — use it to seed the projects grid before the live GitHub API integration is wired up, and as the fallback/cache shape.

**LLM & Agents**
- `skillbridge-ai-interviewer` — flagship. Multimodal AI mock-interview coach (React, FastAPI, PyTorch, OpenAI, MediaPipe). Graduation project. Has a drafted case study.
- `llama-qlora-education-qa` — flagship. Llama 3.x fine-tuned with QLoRA for educational QA; Exact Match 0.00 → 0.66. (Transformers, TRL, PEFT)
- `ai-study-planner-agents` — flagship. Multi-agent (profiler/generator/critic/optimizer) study planner. (CrewAI, GPT-4o-mini, sentence-transformers)

**Computer Vision**
- `oxford-pet-binary-segmentation` — flagship. Benchmarked FCN-ResNet18/SegNet-VGG16/HRNet-W18; HRNet won at 0.93 mIoU, 0.06s/image. (PyTorch, timm)
- `yolov8-handwritten-digit-detector` — YOLOv8 on HashiDigits dataset. (OpenCV, Roboflow, Ultralytics) — **this is the model earmarked for the backlog in-browser ML demo, see §9.**

**Full-Stack & Mobile**
- `prestige-motors-showroom` — flagship. Full-stack MERN car-showroom platform: reservations, used-car offers, role-based admin, JWT auth, Cloudinary. **Live at https://prestige-motor.vercel.app/** — only repo with a live deployment, and confirmed embeddable (no `X-Frame-Options`/CSP blocking, checked via `curl -I`). Has a drafted case study with the live-embed feature built.
- `trip-mate-travel-planner-app` — Flutter travel planner (Firebase Auth/Firestore, Geoapify, MVVM/Provider).

**ML & Data Science**
- `bank-churn-imbalanced-classification` — credit-card churn, KMeans features, SMOTE/ROS, ensembles.
- `supervised-ml-classification-regression` — classification/regression notebooks, full preprocessing/tuning pipeline.
- `superstore-sales-data-analysis` — EDA on Superstore sales/profit/shipping data.
- `rff-wine-quality-classifier` — PyTorch Random Fourier Features classifier on wine quality.
- `airport-luggage-robot-planning` — multi-robot Q-learning + PSO + GWO simulation (Pygame).

**Games & Game AI**
- `lost-in-the-woods-unity-platformer` — Unity 2D action-adventure platformer.
- `connect-six-ai-game` — Pygame Connect6 with minimax/alpha-beta AI.
- `game-tree-alpha-beta-board-game` — Windows C++ board game, minimax/alpha-beta, Win32 GDI.

**Distributed Systems (Java)**
- `java-socket-clothing-store-system` — socket-based distributed inventory sim, Swing clients.
- `java-rmi-event-notification-system` — Java RMI pub/sub event system, Swing clients.

**The 5 flagships** (get dedicated case-study pages per PRD §5.3): SkillBridge AI Interviewer, Llama QLoRA Education QA, AI Study Planner Agents, Oxford Pet Segmentation, Prestige Motors Showroom.

## 3. Tech stack decision — how we got there

User said upfront: GitHub for source, Vercel for deployment, otherwise open. Recommended and approved: **Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui**, reasoning:
- Matches his existing stack (Prestige Motors is React/TS/Tailwind) — no new framework to learn.
- Vercel-native — zero-config deploys, preview URLs, image optimization.
- SEO matters for a portfolio (recruiters/clients search his name); Next.js pre-renders, a plain Vite SPA doesn't.
- ISR lets the projects grid live-sync from the GitHub API without manual redeploys.
- The repo itself is a work sample — a clean Next.js/TS codebase is a stronger signal than alternatives.
- Astro was considered (slightly faster for pure content) and rejected — weaker employability signal, new framework to learn, negligible real perf gain for this use case.

Then Yehia added a requirement that changed the architecture: **he wants an admin panel to track site analytics.** This is why the stack has a real backend layer instead of being a purely static site — see PRD §4, §6, §7, §8 for the full resulting spec. The final backend decision is **Neon Postgres Free + Drizzle + Neon Auth**: Neon owns PostgreSQL and the single-admin authentication schema, while Drizzle manages application tables. Neon Free has 0.5 GB per project, 100 CU-hours monthly, and automatic scale-to-zero after five idle minutes; it wakes on the next request rather than pausing the project after a week. Decision: **no separate backend server** — Next.js API routes/server actions on Vercel Functions serve as the backend, keeping deployment single-piece.

## 4. Design process — how Mockup B was chosen

1. Asked Yehia for taste direction → he picked **"Bold & creative"** over minimal-dark, editorial-light, and terminal-hacker options.
2. He pointed at godly.website for references. That domain now redirects to its rebrand, **recent.design** — the old godly archive is mostly gone (its "Portfolio" filter has only ~6 entries now). Browsed the live site directly (via browser automation, not memory) and selected/rejected candidates:
   - **Kept as inspiration:** Shopify Editions Winter '26 (spectacle — art×tech collision, huge chapter typography), Harry Atkins' portfolio harryjatkins.com (structure — monogram hero, numbered project index, display-mode toggles), Displace Agency displace.agency (bento stat widgets — but see next point), Pacôme Pertant pacomepertant.com (playful motion/personality).
   - **Rejected:** Meech213, Gregor Collienne, Belen Jones, Cathy Dolle (fashion/photography/WebGL-art portfolios — wrong genre for 17 technical projects), Augen (soft product concept site), Astro Dither (site was down).
3. Yehia's verdict on the four kept references: liked all the *aesthetics* except Displace Agency's fake-macOS-desktop concept — but explicitly wanted to keep the **stat-widget idea** from it (small metric cards like "17 projects shipped").
4. Built **3 full clickable HTML/CSS mockups** synthesizing this: Mockup A "Ren(ai)ssance" (editorial serif×grotesk collision, violet/amber gradient, roman-numeral chapters — the Shopify Editions descendant), Mockup B "YA Monogram" (Swiss grid, giant Y/A letters, numbered index, 3 display modes — the Harry Atkins descendant), Mockup C "The Orb" (playful acid-green AI-mascot orb, terminal intro, marquee — the Pacôme descendant). All three included the stat-widget row.
5. **Yehia approved Mockup B**, liked A and C aesthetically but ruled them out. B is the permanent visual direction. Files: `mockups/mockup-a-renaissance.html` (rejected, kept for reference), `mockups/mockup-b-monogram.html` (**approved**), `mockups/mockup-c-orb.html` (rejected, kept for reference).

**Mockup B's visual language (this IS the design system to implement in Tailwind):**
- Colors: `--paper:#f1efe9` (background, light mode / default), `--ink:#111114` (text), `--dim:#6f6d68` (secondary text), `--accent:#2b3cff` (electric blue — the one accent color, used sparingly), `--line:#111114` (all borders/rules).
- Three display modes via `data-mode` attribute on `<html>`: **Paper** (default — cream bg, near-black ink), **Night** (near-black bg `#111114`, cream ink `#f1efe9`, same blue accent), **Mono** (paper colors but accent becomes `--ink` — i.e. no color at all, pure black/white/grey). Persisted via `localStorage`, toggle in the header meta row, plus the `N` key cycles through them.
- Typography: **Archivo** (variable font, wide weight/width axis — used at font-stretch 105–125% for headlines, giving that expanded "monogram" look) for display type, **JetBrains Mono** for all labels/meta/UI chrome text.
- Structural motifs: ruled grid lines (1–2px solid borders) as the primary decorative device instead of shadows/gradients — Swiss/print-design influenced. Giant "Y" and "A" monogram letters as the hero. Numbered project index rows that invert to black-on-cream on hover. Stat cells in a bordered grid that invert to accent-blue on hover.

## 5. Information architecture — how the page list was decided

After the design was picked, Yehia stopped and asked "are you sure this is enough, or do you have suggestions?" before allowing any real build — this is a deliberate pattern with him: **he wants the full menu of options laid out, then he picks, rather than being handed a fait accompli.** Two structured decision rounds happened:

**Round 1 — page/section structure**, resolved via 4 clarifying questions:
- Case studies: **flagships only get dedicated pages** (5 of them), not all 17 (overkill) and not zero (too shallow for recruiters). Rejected "cards only, no detail pages."
- About content: **lives as a section on the home page**, no separate `/about` page, **no photo**. Rejected a full separate About page (least-visited page on most portfolios) and rejected photo+section (mockup B's aesthetic is typography-first; no photo fits it).
- Services pricing: **inquiry-only, no prices shown anywhere.** Every services CTA leads to the contact form. Rejected "starting from" prices and rejected full package tiers.
- Testimonials: **not available yet, but the block is designed and reserved, hidden until populated.** Rejected shipping with a totally absent testimonials section (no future-proofing) and rejected skipping the concept entirely.

Result: 6 public pages total — Home (single rich scroll: hero → statement → stats → flagship index → services strip → about/experience → contact → footer), `/projects` (all 17, filterable), `/projects/[slug]` (5 case studies), `/services`, 404, plus `/admin` (2 pages: dashboard + inbox).

**Round 2 — feature brainstorm**, offered as 10 numbered ideas with an honest recommendation on each, Yehia approved/rejected individually:

| # | Idea | Verdict |
|---|------|---------|
| 1 | Dynamic OG images (branded share cards via `next/og`) | **✅ Approved — v1** |
| 2 | Live GitHub activity stat cell | ❌ Rejected |
| 3 | cal.com booking link | ❌ Rejected |
| 4 | WhatsApp contact button (MENA market fit) | ❌ Rejected |
| 5 | Services FAQ block | ❌ Rejected |
| 6 | Admin-editable availability toggle | ❌ Rejected |
| 7 | Testimonial collection flow (private link → admin approval → live) | **✅ Approved — v1.5, explicitly post-launch** |
| 8 | In-browser YOLOv8 digit-drawing ML demo (ONNX Runtime Web) | **✅ Approved — backlog, "definitely interested," not now** |
| 9 | "Ask my AI" chatbot grounded in CV/projects | ❌ Rejected (revisit only after #8 ships) |
| 10 | Command palette (Ctrl+K) with `N` key mode-cycling | **✅ Approved — v1** |

Also explicitly declined together with #2–6, #9: `/uses` page, public visitor-stats page, certifications wall, blog/MDX, CMS, newsletter, i18n/Arabic. **Do not re-propose any of these** — they were considered on their merits and rejected, not overlooked.

### Signature interactive proof features approved July 15, 2026

After auditing the demo, Yehia asked for more ideas with the same quality as the live iframe window: unusual interactions that materially improve proof instead of adding novelty alone. Four were selected and added to PRD §5.7:

1. **Architecture X-Ray** for all five flagship case studies — reusable interactive component/data-flow diagram built with the MIT-licensed React Flow core (`@xyflow/react`, no Pro subscription); selected nodes explain responsibility, contracts, decisions, and exact repository evidence; an optional request replay animates the end-to-end path.
2. **Model Comparison Microscope** for Oxford Pet Segmentation — curated images compare source, ground truth, FCN, SegNet, and HRNet outputs with metrics and failure regions. Launch with precomputed predictions, not browser/server inference.
3. **Agent Run Replay** for AI Study Planner Agents — deterministic profiler → generator → critic → optimizer execution with inspectable inputs, prompt summaries, tool calls, outputs, timing, and revision reasons. No paid API request on ordinary page visits.
4. **Responsive Viewport Scrubber** for deployed client work — evolves the existing desktop/phone iframe toggle into continuous breakpoint proof, with phone/tablet/desktop presets and the existing click-to-load and screenshot-fallback rules preserved.

These are approved portfolio features, but they do not come before the core case-study evidence. Build the static content, screenshots, metrics, and accessible fallback first; progressively enhance afterward. They must be route-level lazy loaded, keyboard usable, reduced-motion aware, mobile safe, and visually integrated into Mockup B. The Architecture X-Ray should be built as the reusable foundation; the other three are project-specific modules using the same interaction and styling primitives.

### Visual/cosmetic interaction direction approved July 16, 2026

Yehia then asked for memorable visual ideas that do not need to explain a project but make the portfolio feel distinctive. The selected direction is a **living technical poster**: animate and extend Mockup B's existing typography, grid, print rules, and blue ink rather than importing generic creative-developer effects.

Five concepts are specified in PRD §5.8:

1. **Kinetic YA Monogram** — cropped Y/A pieces assemble quickly on entry, the blue period lands last, and the large mark can compress toward the header identity. Optional desktop variable-font response; deterministic mobile and static reduced-motion version.
2. **Print-Registration Page Transitions** — project titles carry into their case-study headings through ruled-line and electric-blue plate motion, progressively enhanced so navigation never waits for animation.
3. **Scroll-Responsive Rules** — section-rule drawing, progress line, docked section numbers, stat reveals, or restrained row staggering. **This is not firmly approved for final use. Yehia explicitly expects he may hate it and remove it early.** Treat it as a disposable experiment: separate module, one feature flag, off by default until reviewed, no layout/content dependencies, and no broad implementation before a tiny prototype is evaluated.
4. **Mode-Specific Material Treatments** — Paper gets subtle warm grain, Night gets crisp near-black/cream with restrained blue emphasis, and Mono gets controlled halftone/photocopy imagery. Layout stays identical and readability wins over texture.
5. **Swiss Poster Mode** — optional command-palette surprise that rearranges real identity/project data through authored grid templates. It is never the default route and print/export is later polish only.

The shared motion vocabulary is precise and mechanical: short blue slides, rule movement, hard inversions, extending arrows, offset borders, and restrained variable-width type. Explicitly avoid custom-cursor replacement, long loaders, autoplay audio, constant noise animation, decorative particles, large parallax systems, and moving body text. Prototype order is monogram → page transitions → mode materials → Poster mode. Scroll-Responsive Rules runs as a separate early test and can be deleted with no consequence.

## 6. The live embedded-site-window feature — full history

This was Yehia's own idea, described from something he'd seen on another developer's portfolio: a "window" inside a project card showing the *actual live website*, not a screenshot.

**Confirmed understanding and technique:** an `<iframe>` rendered at real desktop width (1280px) then visually shrunk via CSS `transform: scale()`, wrapped in a fake-browser-chrome frame (traffic-light dots, URL bar) to sell the "window" illusion. Explained three real risks up front: (a) some sites block framing via `X-Frame-Options`/CSP and must be header-checked first, (b) loading a full live site is heavy and must be click-to-load / lazy, not automatic, (c) a desktop-scaled iframe is unreadable on a real mobile screen.

**Where it evolved through the conversation:**
1. First prototyped generically on the demo's `services.html` "Shipped" section, using Prestige Motors as the example (its embeddability was verified: `curl -I https://prestige-motor.vercel.app/` returns no `X-Frame-Options` or blocking CSP header).
2. Yehia loved it but redirected: **the window belongs on individual case-study pages**, not the services hero — so a new page `mockups/demo/case-study-prestige.html` was built, a full Prestige Motors case study (brief → **"see it live" with the embedded window** → technical details → why it matters) — this is the template pattern for any future flagship/project that has a live deployment.
3. He also said the window was **too large** (bigger than a full screen) → capped at `max-width: 880px` (~550px tall), confirmed by measurement to fit comfortably in viewport.
4. This surfaced the real unresolved problem: **how to display the freelance client work** — 4 Shopify stores + 2 full-stack sites, none on GitHub, none yet approved for public display. Solution built: the services page "Shipped" section became a **2-column grid of 6 compact browser-window cards**, one per real client project, each currently showing a styled "awaiting client approval" placeholder *inside* the browser chrome (so it looks intentional, not empty) — each flips to a real live-embed window as client approvals come in. Anonymized labels ("fashion brand — Egypt") are fine if a client prefers not to be named.
5. Final refinement — Yehia's own idea, and a good one: **since the embed can't work well on mobile screens, make it show the site's actual mobile layout instead of failing.** Insight confirmed and implemented: because responsive sites lay out based on their *rendering viewport* (the iframe), not the visitor's actual screen, a **desktop/phone toggle** in the window's title bar can literally re-render the live site's true mobile layout inside a narrow vertical frame (390×760, matching a real phone viewport) — this isn't a simulation, it's the same mechanism as Chrome DevTools' device toolbar. Implemented with: a `desktop`/`phone` button pair in the browser-bar; phone mode sets the iframe to 390×760 inside a `max-width: 400px` frame; **mobile visitors get phone mode automatically by default** (checks `matchMedia('(max-width: 640px)')` on load) so they see the embedded site's real mobile UI at near-native scale, not a shrunken desktop.

**Final spec (this is what PRD §5.3/§5.4 describes and what's built in the demo):**
- Component: mini browser window, Mockup B chrome (square dots — first one filled accent-blue, mono-font URL bar, "open ↗" external link, `desktop`/`phone` toggle).
- Desktop mode: iframe at 1280×800, CSS-scaled to fit an 880px-max-width window.
- Phone mode: iframe at 390×760, window narrows to 400px max-width; toggle-able by any visitor, auto-selected for visitors on ≤640px screens.
- **Click-to-load**: the iframe element does not exist in the DOM until the visitor clicks "▶ Load live preview" — protects page weight/Lighthouse scores from loading a full external site on every pageview.
- The loading facade only removes itself on the iframe's `load` event — so a site that silently blocks framing never shows a broken/blank box to a visitor; production implementation should have a screenshot-card fallback for that case.
- **Prerequisite for every real client store before wiring it in: header-check it** (`curl -I <url>`, look for `X-Frame-Options` / CSP `frame-ancestors`) exactly as was done for Prestige Motors. Shopify stores in particular sometimes block embedding depending on theme/app config — check each of the 4 individually, don't assume.
- Placement: on case-study pages for any project with a live deployment (currently just Prestige Motors — SkillBridge etc. would get one if/when hosted), and as the 6-slot grid on `/services` for client work.
- Caveat carried into the PRD: this only works because Yehia's builds are responsive via CSS media queries (true for all of them) — a site that switches layout via user-agent sniffing wouldn't respond to the iframe-width toggle. Also flagged: iOS Safari has historically had quirks scrolling content inside iframes — do a real-device QA pass before launch, don't just trust desktop browser testing.

## 7. Demo/prototype delivery mechanics (context, not build instructions)

Two side-quests happened that don't affect the final build but are worth knowing:

- **Sharing the demo with a friend:** Yehia asked for the fastest way to share a running preview. Compared a single-file HTML export, a Cloudflare quick tunnel, and a full Vercel deploy — recommended and used a **Cloudflare quick tunnel** (`cloudflared` was installed via winget, then `cloudflared tunnel --url http://127.0.0.1:4173` was run against the local static file server). Note for whoever continues this: that tunnel URL is ephemeral, tied to a process that was running on Yehia's machine during the session — it will not still be live later, and is irrelevant to the actual site build. Don't try to reuse or reference the old tunnel URL.
- **Local demo server:** the prototype is served via a `.claude/launch.json` dev-server config named `"mockups"` that runs `python -m http.server 4173 --directory mockups`. This is a throwaway convenience for previewing static HTML during design — it is **not** part of the Next.js app and should not be preserved/ported into the real build; delete or ignore it once the real Next.js dev server exists.

## 8. Verification / QA already performed on the prototype

Everything below was actually tested interactively (via browser automation), not just written — noting it so Codex knows the interaction design is proven, not speculative:

- Command palette: opens on Ctrl+K, search filtering works correctly (tested query "night" → correctly isolates the one matching command), Escape closes it, arrow keys navigate, Enter runs the selected action.
- Display-mode system: all 3 modes (Paper/Night/Mono) apply correctly, the `N` key cycles through all three and back to start, mode persists across page navigations via `localStorage`.
- **Bug found and fixed:** closing the command palette via Escape used to leave keyboard focus trapped in its (now-hidden) search input, silently swallowing the `N` shortcut afterward. Fixed by explicitly blurring the input on close.
- **Bug found and fixed:** a leftover dark-mode-only CSS override (`html[data-mode="night"] .row:hover{background:var(--paper)}`) made project-index row text invisible on hover in Night mode (same color text-on-background). Removed; hover inversion now works correctly in all 3 modes.
- Project filters on `/projects`: all 6 category chips tested, each shows the correct subset count (LLM & Agents: 3, Computer Vision: 2, Full-Stack & Mobile: 2, ML & Data Science: 5, Games & Game AI: 3, Distributed Systems: 2 — totals 17), "All" restores everything.
- Live-embed window: click-to-load correctly creates the iframe only on click, the loading facade correctly removes itself only after the iframe actually fires its `load` event, the desktop/phone toggle correctly resizes and rescales the iframe (measured: desktop 1280×800 @ ~0.69 scale in an 877px-wide window; phone 390×760 @ ~1.02 scale in a 397px-wide window), and reloading the page at a 375px mobile viewport correctly auto-selects phone mode with the right button states.
- Prestige Motors embeddability confirmed via `curl -I` — no framing-blocking headers.

## 9. Explicit backlog item — full technical detail for the in-browser ML demo

This was Yehia's favorite suggestion ("this is a sick idea... I am definitely interested") but explicitly **not for now** — logged here in enough detail that whoever picks it up later doesn't have to re-derive the approach:

- Concept: a `<canvas>` where a visitor draws a digit with their mouse/finger; Yehia's own trained `yolov8-handwritten-digit-detector` model (trained on the HashiDigits dataset) detects and classifies it **live in the browser**, no server round-trip.
- Approach: export the YOLOv8 model weights to **ONNX** format, run inference client-side via **ONNX Runtime Web** (WASM/WebGL backend) — zero server/API cost, works entirely static.
- Why it's the strongest differentiator considered: it converts "he says he knows ML" into "I just watched his model run," live, with input I typed myself. Nothing else discussed (chatbot, live stat cells, etc.) proves skill as directly.
- Placement: not yet decided — likely either its own small `/demo` or `/lab` route, or embedded on the YOLOv8 project's card/case-study once it gets one. Not in PRD §5 page list because it's post-launch; add a page for it when it's actually being built.

## 10. Working style notes for whoever continues this (Claude or Codex)

Patterns Yehia has shown consistently across this project, worth carrying forward:

- He wants **options with an honest recommendation**, not either a single unexplained choice or an exhaustive neutral list. When multiple reasonable paths exist, lay them out briefly with a pick and why, then let him decide.
- He explicitly stops forward momentum to ask "is this actually enough?" before committing — treat that as an invitation to brainstorm additively, not as dissatisfaction with what exists.
- He iterates on his own ideas out loud and expects them to be taken seriously and executed, not just validated — e.g. the embedded-window feature and the desktop/phone toggle were both his ideas, refined collaboratively, and built the same session.
- He cares about the demo/prototype being genuinely interactive and verified, not just described — every feature claim in this document was backed by actually clicking/testing it before reporting it done.
- Prefers seeing things built and clickable before "fully committing and writing the files" (his words) — the whole `mockups/demo/` prototype exists because he asked to see the locked spec made real before authorizing the production build.

## 11. What happens next

Per PRD §13 and §11 (milestones): scaffold the real Next.js/TypeScript/Tailwind/shadcn-ui project in this directory, rebuild Mockup B's design system as Tailwind theme tokens (the CSS custom properties in `mockups/demo/style.css` map almost 1:1), and build Phase 1 (home page) matching `mockups/demo/index.html` exactly using the real, final content documented in PRD §5.1 and this file's §1–§2. Then proceed through Phases 2–5 in the PRD's milestone table. The two open items that don't block starting (PRD §12.2, §12.3) are: which of the 6 client projects Yehia can get approval to show live, and which CV file version becomes the downloadable PDF — both can be resolved in parallel with the build, not before it.

## 12. Demo refresh completed July 17, 2026

The static demo was brought up to date before the production rebuild. Added routes are `case-study-oxford.html`, `case-study-agents.html`, and `admin.html`; SkillBridge and Prestige were expanded with their approved proof modules. The homepage now prototypes the kinetic monogram, material modes, print-registration transitions, Poster Mode, and the disposable scroll-rules experiment (off by default).

Verification was rerun with Playwright at 1440x1000 and 390x844 across all nine routes. Every route returned HTTP 200 with no console errors, broken images, or horizontal overflow. Command-palette Poster Mode, Architecture X-Ray selection/replay, viewport scrubbing, model switching, agent-step selection, admin inbox state, contact success state, and reduced-motion behavior were exercised. Desktop and mobile full-page captures were visually inspected against `mockups/mockup-b-monogram.html`; the mobile title and browser-grid overflow found during QA were fixed before completion.

The demo uses deterministic sample data and local project assets. It does not implement the production Neon/Drizzle/Auth/Cloudinary/Recharts/React Flow stack and must not be mistaken for a deployed backend.
