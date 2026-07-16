# PRD — Yehia Alsaeed Portfolio Website

**Status:** Spec locked — design approved, IA finalized, ready for real build. No production code written yet (see §13).
**Owner:** Yehia Alsaeed
**Last updated:** 2026-07-16
**Companion doc:** see `handoff.md` in this same folder for full session history, rationale, and exact next steps — read both before starting work.

---

## 1. Overview

A personal portfolio website that presents Yehia Alsaeed's work to two distinct audiences from a single site, plus a private admin panel with first-party analytics so Yehia can see exactly who is visiting and what they engage with.

The site itself doubles as a portfolio piece: a clean, modern Next.js + TypeScript codebase with a real backend demonstrates the exact skills it advertises.

## 2. Goals

1. **Get hired** — present AI/ML engineering work (LLM fine-tuning, multi-agent systems, computer vision, full-stack ML products) convincingly to recruiters and hiring managers.
2. **Win freelance clients** — showcase Shopify and full-stack website services with proof of shipped work and a clear path to contact.
3. **Know what's working** — first-party analytics dashboard showing traffic, sources, and engagement, owned end-to-end (no third-party analytics dependency).

### Success metrics

- Site ranks on page 1 for "Yehia Alsaeed" searches.
- Lighthouse: ≥95 Performance, 100 SEO, ≥95 Accessibility on all public pages.
- Analytics answers: How many visitors? Where from? Which projects get clicked? How many contact submissions / CV downloads?
- Recruiter can reach the flagship AI/ML projects in ≤2 clicks; client can reach contact form in ≤2 clicks.

## 3. Target audiences

| Audience | What they need | Primary CTA |
|----------|----------------|-------------|
| Recruiters / hiring managers (AI/ML + software roles) | Flagship projects with real metrics, skills, experience, CV download | Download CV / view GitHub |
| Freelance clients (Shopify + full-stack) | Proof of shipped client work, services offered, trust signals | Contact form |
| Admin (Yehia only) | Analytics dashboard, contact message inbox | — |

### 3.1 Dual-audience positioning strategy

The site serves both audiences under **one professional identity**, not two separate brands or websites. The connecting idea is that Yehia is an **AI/ML engineer who builds production-ready software**: the AI/ML work demonstrates technical depth, while the freelance work demonstrates that he can scope, communicate, ship, and maintain real products.

**Priority and hierarchy:** recruiters and hiring managers are the primary homepage audience because the site will be attached to graduate AI/ML job applications. Freelance clients are a deliberate secondary audience with an immediate path to a focused `/services` experience. This priority controls content order; it must not make the freelance offer look hidden or accidental.

**Homepage positioning requirements:**
- Lead with one umbrella statement focused on AI/ML engineering and shipping usable software; do not list every discipline as an equal job title.
- Supporting copy may explicitly state that Yehia is open to graduate AI/ML roles and selected Shopify/full-stack freelance projects.
- Place two clear actions directly after the opening statement: **View AI/ML work** (primary) and **Explore client services** (secondary).
- Do not use a recruiter/client splash screen, audience gate, or mode that hides half of the site. Both paths remain visible and share the same design system.

**Audience paths:**
- Job applications link to `/` or directly to an AI/ML case study. Recruiters should encounter AI/ML projects, measurable results, experience, education, GitHub, and CV before the detailed freelance sales content.
- Client outreach links directly to `/services`. Clients should encounter shipped commercial work, services, process, trust signals, and the project-inquiry CTA without needing to navigate through academic projects.
- `/projects` remains the complete technical project inventory. Its default/featured presentation prioritizes the strongest AI/ML work, while filters expose full-stack, mobile, games, and distributed-systems work.
- Commercial client work primarily lives on `/services`; it should not be mixed into the GitHub-synced project grid unless a project is also a public technical repository.

**Content distinction:** AI/ML case studies emphasize the problem, dataset/baseline, system or model design, evaluation, results, limitations, and reproducibility. Client-work case studies emphasize the brief, Yehia's role, delivery scope, screenshots/live site, timeline, business outcome where available, and handover. They use the same visual template but different proof.

**Contact:** the shared contact form must welcome both audiences. Use a broad prompt such as "What would you like to discuss?" and an inquiry-type control with Job opportunity / Freelance project / Collaboration / Other. Avoid client-only wording such as "What are we building?" on the shared homepage form.

## 4. Tech stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Framework | Next.js (App Router) + TypeScript | Public site + backend (API routes / server actions) in one repo |
| Styling | Tailwind CSS + shadcn/ui | Fast, consistent, accessible components |
| Database | Neon Postgres Free | Analytics events and contact messages; 0.5 GB storage, 100 CU-hours/month, automatic scale-to-zero after 5 idle minutes |
| ORM | Drizzle | Type-safe, lightweight, good with Neon serverless driver |
| Auth (admin only) | Neon Auth (Better Auth foundation) | Single admin account; auth data in Neon's managed `neon_auth` schema; middleware-protected `/admin` routes |
| Charts (admin) | Recharts (via shadcn/ui charts) | Dashboard visualizations |
| Interactive diagrams | React Flow (`@xyflow/react`, MIT-licensed core only) | Architecture X-Ray diagrams on flagship case studies; no Pro subscription |
| Media delivery | Cloudinary Free (Image & Video API) | Project screenshots, thumbnails, profile imagery, and short demo media; store public IDs/metadata in content files, never image binaries in the database |
| Email notifications | Resend | Notify Yehia on new contact message (nice-to-have) |
| Source control | GitHub (`Yehia-Alsaeed`) | Public repo |
| Hosting | Vercel (Hobby) | Auto-deploy from GitHub, preview deployments per branch |

**No separate backend server.** Next.js API routes and server actions on Vercel Functions are the backend. This keeps hosting free and deployment single-pipeline.

**Backend boundary:** Neon is the locked PostgreSQL and admin-auth provider. Its Free compute sleeps after five idle minutes and wakes automatically on the next request; this is not a week-long project pause. Keep raw analytics within a rolling retention window and preserve longer-term daily aggregates so the 0.5 GB database limit remains sufficient. Drizzle manages application-owned tables only; Neon Auth manages its own authentication schema.

**Media boundary:** Cloudinary is the approved image/CDN layer. Use its free Image & Video API with responsive transformations (`f_auto`, `q_auto`, constrained widths) and monitor the shared 25-credit allowance across storage, transformations, and bandwidth. Keep tiny UI assets, fonts, textures, and the CV in the repository. Avoid long-form or autoplay video that could exhaust free bandwidth.

## 5. Public site — pages & features

*(IA finalized July 2026 with Yehia — decisions: flagship case studies ✅, about-as-home-section without photo ✅, inquiry-only pricing ✅, testimonials slot reserved but empty at launch ✅. Visual language: approved Mockup B.)*

### 5.1 Home (`/`) — single rich scroll, in order

1. **Monogram hero** — giant Y/A band, meta row (role / base / status / display-mode toggles Paper·Night·Mono).
2. **Statement + audience paths** — one umbrella positioning statement led by AI/ML engineering, supporting availability copy, then primary "View AI/ML work" and secondary "Explore client services" actions.
3. **Stat widgets** — 17 projects · 0.93 mIoU · +0.66 EM · 1+ yr freelance (updateable constants).
4. **Selected work index** — full-width numbered rows for the 5 flagships → links to case studies; "View all 17 →" to `/projects`.
5. **About: experience & education** — compact typographic timeline (Dell Academy 2025, freelance 2025–2026, BSc BUE 2026) + skills groups. No photo, no separate page. This stays ahead of detailed freelance content for recruiter scan order.
6. **Services + client-work teaser** — two offer cards (Shopify / Full-stack & AI) plus the strongest available commercial proof → `/services`.
7. **Contact** — giant email headline + shared form (inquiry type, name, email, message → DB → admin inbox) with wording appropriate for job and freelance inquiries.
8. **Footer** — GitHub, LinkedIn, CV download (tracked).

### 5.2 Projects (`/projects`)

- Grid of **all** GitHub repos, filterable by category: LLM & Agents · Computer Vision · ML & Data Science · Full-Stack & Mobile · Games & Game AI · Distributed Systems.
- Data pulled from the GitHub API at build/revalidation time (ISR, revalidate ~daily). New repos appear automatically; categories derived from repo topics with a manual override map in code.
- Each card: name, description, tech topics, stars, GitHub link, live demo link when available. Flagship cards link to their case study instead of GitHub.

### 5.3 Case studies (`/projects/[slug]`) — flagships only

Five hand-written pages: SkillBridge AI Interviewer, Llama QLoRA Education QA, AI Study Planner Agents, Oxford Pet Segmentation, Prestige Motors Showroom.
Structure per page: problem → approach → architecture/stack → results with real metrics → screenshots/demo → GitHub + live links. Content drafted by Claude from repo READMEs/CV, reviewed by Yehia.

**Live embedded site windows (approved July 2026, prototyped in demo):** any case study whose project has a live deployment embeds the *actual running site* in a styled mini browser window (Swiss chrome: square dots, mono URL bar, "open ↗" link). Applies to Prestige Motors now; others when/if hosted. Implementation rules:
- Iframe renders at 1280px desktop width, CSS `transform: scale()` down to fit; window max-width ~880px so it never dominates the viewport.
- **Click-to-load facade** — iframe is not created until the visitor clicks "▶ Load live preview" (protects page speed / Lighthouse).
- Facade only clears on the iframe `load` event → a site that blocks framing never shows a broken empty box; fallback is a screenshot linking out.
- Every embed target gets a header check first (`X-Frame-Options` / CSP `frame-ancestors`). Prestige Motors: checked, embeddable.
- **Device toggle (approved July 2026, prototyped):** the window bar has a `desktop / phone` switch. Phone mode renders the iframe at 390×760 in a vertical frame (max-width 400px) — the embedded site reflows to its true responsive mobile layout, since media queries respond to iframe width. Toggling live shows the layout adapting in real time (a built-in responsiveness proof for freelance clients).
- **Mobile visitors get phone mode automatically** (`max-width: 640px` media check on load) — they experience the embedded site's real mobile version at near-native scale, not a shrunken desktop. No screenshot fallback needed for responsive embeds; screenshots remain the fallback only for sites that block framing.
- Caveat noted: layout switching relies on the embedded site being responsive via media queries (true for all of Yehia's builds). Sites that adapt via user-agent sniffing won't flip in the desktop toggle. iOS iframe scrolling should get a real-device QA pass before launch.

### 5.4 Services (`/services`)

- Freelance offering: Shopify store builds (Liquid, conversion + SEO focus) and full-stack + AI development.
- **No pricing shown** — inquiry-only: every offer CTA leads to the contact form ("tell me about your project").
- Client work showcase — **"Shipped" grid of 6 compact live-window slots** matching Yehia's actual freelance inventory: **4 Shopify stores + 2 full-stack client websites**. Each slot is a mini browser-chrome card (2-col grid) that becomes a live embedded window (same component as case studies, click-to-load) once the client approves; anonymized labels allowed. Until approval, slots show styled "awaiting client approval" placeholders. Every store URL needs an embed header check; Shopify stores that block framing fall back to screenshot cards.
- Process overview (brief → build → launch) + contact CTA.
- **Testimonials block:** designed and component-ready but hidden at launch; activates when Yehia collects client quotes.

### 5.5 404

- On-brand typographic 404 ("Page not found — 0 of 17 projects live here") with links home.

### 5.6 Global

- Display modes per approved Mockup B: Paper (default) / Night / Mono, responsive (mobile-first), subtle motion (respecting `prefers-reduced-motion`).
- **Command palette (Ctrl+K / ⌘K)** — quick navigation to any page/section/project + actions (switch display mode, copy email, download CV). Keyboard shortcuts: `N` cycles display modes (Harry Atkins-style). Approved July 2026.
- **Dynamic OG images** — every page (home, projects, each case study, services) gets a generated Open Graph card in the Mockup B visual language (monogram, ruled lines, page title, key stat) via `next/og` ImageResponse. Links shared on LinkedIn/WhatsApp look designed. Approved July 2026.
- CV download served from the site (tracked as an analytics event).
- SEO: per-page metadata, sitemap.xml, robots.txt, JSON-LD Person schema.

### 5.7 Signature interactive proof features

Approved July 15, 2026. These four interactions are part of the portfolio's differentiation strategy. Each one must expose real project evidence rather than act as decoration. Implement the underlying case-study content and static fallback first, then progressively enhance it with interaction.

1. **Architecture X-Ray — all flagship case studies.** A reusable interactive system diagram shows components and data flow. Selecting a node reveals its responsibility, technology, input/output contract, important engineering decision, and links to relevant repository files. A "Play request" action animates one representative request through the system. On small screens or with reduced motion, provide an ordered, fully readable static flow instead of requiring canvas interaction.
2. **Model Comparison Microscope — Oxford Pet Segmentation.** Visitors select curated sample images and compare the original, ground-truth mask, and FCN / SegNet / HRNet predictions. Controls switch models or reveal a before/after split, while adjacent evidence shows mIoU, inference time, and notable failure regions. Use precomputed outputs at launch so the experience is fast, deterministic, and has no inference-server dependency.
3. **Agent Run Replay — AI Study Planner Agents.** A deterministic prerecorded execution animates the profiler → generator → critic → optimizer workflow. Selecting a step reveals the input, instruction/prompt summary, tool call, output, elapsed time, and why the result was accepted or revised. The replay must not call paid model APIs during an ordinary portfolio visit; include a complete text transcript for accessibility and fallback.
4. **Responsive Viewport Scrubber — deployed client websites.** Extend the approved live iframe window with a width control from approximately 320px to 1440px so visitors can watch the embedded site reflow continuously across breakpoints. Keep labeled phone/tablet/desktop presets for keyboard and mobile use. Preserve click-to-load behavior, iframe header checks, screenshot fallback, and the simple phone-first presentation on narrow visitor screens.

**Shared constraints:** lazy-load each enhancement; do not add its JavaScript to unrelated routes; respect `prefers-reduced-motion`; make every control keyboard-operable and labeled; provide static screenshots/text when interaction or framing is unavailable; and keep the public-page Lighthouse targets from §2. These features should share the Mockup B tokens and ruled-grid visual language rather than look like third-party widgets.

### 5.8 Visual identity and cosmetic interaction system

Approved direction July 16, 2026. These effects are intended to make the portfolio recognizable and memorable even when they do not explain project content directly. They must extend Mockup B's Swiss-grid, oversized Archivo typography, ruled lines, and electric-blue ink rather than introduce an unrelated 3D, gradient, glassmorphism, or game-like aesthetic.

1. **Kinetic YA Monogram — signature first impression.** On the homepage, cropped pieces of the giant Y and A enter along the grid and assemble into the complete `YA.` mark; the blue period arrives last like an ink stamp. The sequence should finish in roughly one second and never block reading. On desktop, restrained pointer movement may alter Archivo's width/weight axes; on mobile it remains deterministic. As the visitor leaves the hero, the large mark may visually compress toward the small header logo. It must settle into a fully static state and be skipped under reduced-motion preferences.
2. **Print-Registration Page Transitions — navigation motion.** Opening a project carries the selected project title into the case-study heading while ruled lines sweep across and an electric-blue print plate briefly wipes between pages. Target duration is approximately 400–650ms; navigation and browser history must remain normal, and unsupported/reduced-motion environments receive an instant transition. Use progressive enhancement so this effect can never block route changes.
3. **Scroll-Responsive Rules — experimental and removable.** Candidate effects include drawing selected section rules as they enter, a thin blue reading-progress line, briefly docked section numbers, one-time stat-number reveals, and restrained row staggering. Yehia may dislike and remove this feature early. Therefore it must be prototyped independently, disabled by default until reviewed, controlled by one feature flag/config entry, and implemented without changing document flow or required content. No component may depend on it for readability, hierarchy, or spacing; removal must be a clean deletion, not a redesign. Test only one or two effects first rather than shipping the entire list.
4. **Mode-Specific Material Treatments.** Paper, Night, and Mono retain identical layout but feel like distinct editions. Paper uses an extremely subtle warm fiber/grain with black and blue ink; Night uses a near-black surface, cream type, and restrained blue emphasis without broad glow; Mono removes blue and treats selected project imagery with controlled halftone/photocopy texture. Textures must be lightweight, static, low-contrast, and optional under data/performance constraints; they must not reduce text or image legibility.
5. **Swiss Poster Mode — optional memorable surprise.** A command-palette action temporarily rearranges the homepage identity data into a generated, grid-constrained Swiss poster using the YA monogram, name, role, location, and a real project metric. Re-running chooses from authored composition templates rather than unrestricted randomness, so every result remains designed and readable. Poster mode is never the default experience, exits instantly without losing scroll position, and may later support print/export only if that can be added without delaying core scope.

**Motion language:** interactive feedback should reuse a small vocabulary across the site: blue blocks sliding into active states, arrows extending, hard offset borders, rule-line movement, sharp inversions, and subtle variable-width type changes. Avoid replacing the native cursor, continuous background animation, autoplay sound, long intro loaders, excessive parallax, decorative particle systems, and effects that make text move while it is being read.

**Implementation order:** prototype the kinetic monogram first, then add page transitions after routing is stable and apply material treatments. Poster mode is polish. Scroll-Responsive Rules receives a separate early prototype/review and should be removed immediately if it makes the site feel busy or irritating.

## 6. Admin panel (`/admin`)

Login-protected area for Yehia only. Not linked from public navigation; `noindex`.

### 6.1 Analytics dashboard

- **Overview cards:** visitors, page views, contact submissions, CV downloads — for a selectable range (24h / 7d / 30d / 90d).
- **Time-series chart:** views & visitors per day.
- **Breakdowns (tables/bars):** top pages, referrer sources, countries, device type (mobile/desktop), browsers.
- **Event log:** recent key events (project link clicks, CV downloads, contact submissions).

### 6.2 Contact inbox

- List of contact form submissions (name, email, message, date, read/unread).
- Mark read / delete.

### 6.3 Auth

- Single Neon Auth admin account with public registration disabled. Session-protected login, rate-limited authentication, and middleware gating for all `/admin/*` routes and admin APIs.

## 7. Analytics — tracking spec

First-party, cookieless, privacy-respecting. A lightweight client beacon posts to `POST /api/track` on route changes and key interactions.

### Events

| Event | Payload |
|-------|---------|
| `page_view` | path, referrer, country (from Vercel geo headers), device type, browser, OS, screen class |
| `project_click` | project name, destination (github / live-demo) |
| `cv_download` | path it was triggered from |
| `contact_submit` | (no PII in the event; message itself goes to contact inbox) |
| `outbound_click` | destination (github profile / linkedin) |

### Rules

- **Visitor identity:** daily-rotating salted hash of IP + user agent (industry-standard cookieless uniques). Raw IPs are never stored.
- **Bot filtering:** drop known bot user agents server-side.
- **Self-exclusion:** admin sessions / a localStorage flag exclude Yehia's own visits.
- No cookies, no fingerprinting beyond the daily hash, no third-party scripts. V1 uses the custom first-party analytics system only; Vercel Analytics is not added in parallel.

## 8. Data model (initial)

```
analytics_event: id, type, path, referrer_domain, country, device, browser, os,
                 visitor_hash, metadata (jsonb), created_at
contact_message: id, name, email, message, is_read, created_at
```

Authentication users and sessions live in Neon's managed `neon_auth` schema rather than an application-owned `admin_user` table.

Daily aggregation can be added later if event volume grows; raw events are fine at portfolio scale.

## 9. Non-functional requirements

- **Performance:** static/ISR rendering for all public pages; images via `next/image`; no blocking third-party scripts. Analytics beacon is fire-and-forget (`keepalive`), never blocks navigation.
- **Security:** admin auth + middleware gating; minimal built-in field/type/length checks on public inputs (no validation library); rate limiting on `/api/track` and contact form; honeypot protection for contact spam; secrets only in Vercel env vars.
- **Accessibility:** semantic HTML, keyboard navigable, WCAG AA contrast in both themes.
- **Code quality:** TypeScript strict mode, ESLint + Prettier — the repo is a public work sample.

## 10. Out of scope (v1) & approved backlog

**Approved for post-launch (Yehia, July 2026):**
- **v1.5 — Testimonial collection flow:** private URL Yehia sends past clients → client submits a quote → lands in admin inbox for approval → approved quotes appear in the (already-designed, hidden) testimonials block on `/services`.
- **Backlog — In-browser ML demo (high interest):** visitors draw a digit on a canvas and Yehia's YOLOv8 HashiDigits model detects it live in the browser via ONNX Runtime Web (no server cost). Export `yolov8-handwritten-digit-detector` weights to ONNX. The strongest "proof of skill" feature — build when time allows.

**Not planned (explicitly rejected):**
- Blog / MDX articles (possible v2), CMS, newsletter, i18n/Arabic
- "Ask my AI" chatbot (revisit only after ML demo ships)
- /uses page, public stats page, certifications wall, GitHub live-activity stat cell, cal.com booking, WhatsApp button, services FAQ, admin availability toggle (all considered and declined July 2026)

## 11. Milestones

| Phase | Deliverable |
|-------|-------------|
| 1. Foundation | Scaffold (Next.js, Tailwind, shadcn/ui), layout, theme, hero + skills + experience sections with real CV content |
| 2. Projects & services | GitHub API integration with ISR + category filters, featured projects, services page (placeholders for client work), contact form → DB |
| 3. Deploy | GitHub repo, Vercel project, Neon DB provisioned, live preview → production |
| 4. Analytics & admin | Event tracking API, Neon Auth login, dashboard with charts, contact inbox |
| 5. Polish & launch | SEO (OG images, sitemap, JSON-LD), accessibility pass, Lighthouse tuning, optional custom domain |

## 12. Open questions

1. **Custom domain** — ✅ Resolved: launching on the free `*.vercel.app` domain. Custom domain deferred, can be attached later without code changes.
2. **Shopify client work** — which stores/screenshots can be shown publicly? (Blocks Services page content, not layout.)
3. **CV file** — deferred; decide which version to publish before launch (Phase 5). Doesn't block anything earlier.
4. **Design direction** — ✅ Resolved: **Mockup B "YA Monogram"** approved (`mockups/mockup-b-monogram.html`). Swiss-grid structure inspired by harryjatkins.com; giant Y/A monogram hero, numbered project index, ruled lines, stat-widget cells, electric blue `#2b3cff` accent, Archivo (variable, expanded weights) + JetBrains Mono, three display modes (Paper default / Night / Mono). Stat-widgets idea retained from displace.agency. Mockups A (`mockup-a-renaissance.html`) and C (`mockup-c-orb.html`) rejected but kept for reference.
5. **Analytics** — ✅ Resolved: v1 uses custom first-party analytics only; Vercel Analytics is not added in parallel.

## 13. Current build status (read this before writing any code)

**Nothing in the final tech stack (Next.js/TypeScript/Tailwind/Drizzle/Neon/Neon Auth/Cloudinary) exists yet.** What exists today is a static HTML/CSS/vanilla-JS **prototype** used to design and approve the spec above. Treat it as the visual/interaction reference to rebuild in Next.js — not as code to import or extend in place.

### What's built (in `mockups/`)

- `mockups/mockup-a-renaissance.html`, `mockup-c-orb.html` — two **rejected** homepage directions, kept only for reference.
- `mockups/mockup-b-monogram.html` — the **approved** direction (see §12.4), single-file version.
- `mockups/index.html` — a picker page linking the three above.
- `mockups/demo/` — the real deliverable: a 6-page static prototype implementing the *entire* locked spec in Mockup B's visual language, with a shared `style.css` (full design system: colors, type, all component classes) and `app.js` (all interactive behavior). Pages:
  - `index.html` — full home page, all 8 sections from §5.1
  - `projects.html` — all 17 projects, filterable by the 6 categories from §5.2
  - `case-study.html` — SkillBridge case study (template for §5.3, no live embed)
  - `case-study-prestige.html` — Prestige Motors case study **with the working live-embed browser window + desktop/phone device toggle** from §5.3
  - `services.html` — services page with the 6-slot client-work browser-window grid from §5.4
  - `404.html` — on-brand 404 from §5.5
  - Global: Ctrl+K command palette and Paper/Night/Mono display-mode cycling (`N` key) both work across all pages and persist via `localStorage`.

Everything in this prototype has been interactively tested (palette search/open/close, mode cycling + persistence, all 6 project filters, the contact form stub, the live-embed click-to-load + device toggle, mobile auto-phone-mode) — see `handoff.md` for the verification log and the bugs that were caught and fixed along the way.

### What's NOT built yet — this is the actual scope of work

Everything in §4–§9 of this PRD: the Next.js/TypeScript scaffold itself, Tailwind + shadcn/ui setup translating the prototype's CSS into a real design system, the GitHub API integration with ISR, the five case-study pages as real routes with drafted prose (only 2 of 5 are drafted, in the prototype, and need to move into real content files), the Neon Postgres + Drizzle data layer, Neon Auth admin login, the Cloudinary media layer, the analytics tracking beacon + dashboard, the contact form's real submission handling, the command palette and display-mode system re-implemented as React, the live-embed component re-implemented as React (with the header-check step actually run against each client URL before wiring it in), dynamic OG images, SEO metadata, and deployment to Vercel + GitHub.

### Immediate next steps, in order

1. Scaffold Next.js (App Router) + TypeScript + Tailwind + shadcn/ui in this directory.
2. Rebuild Mockup B's design system as Tailwind config + a small set of primitives (the `mockups/demo/style.css` custom properties map almost directly to Tailwind theme tokens — `--paper`/`--ink`/`--accent`/etc.).
3. Build the home page first (Phase 1 in §11), matching `mockups/demo/index.html` exactly, with real content (already final — see §5.1 and `handoff.md`'s content appendix).
4. Proceed through Phases 2–5 in §11's milestone table.

### Static demo refresh — July 17, 2026

This note supersedes the older page count in the status section above. The static reference in `mockups/demo/` now contains nine routes: home, projects, services, 404, four flagship case studies, and a private-admin prototype.

The refreshed demo now implements the approved interaction direction as working prototypes:

- Kinetic YA monogram, mode-specific material treatments, print-registration navigation transitions, and command-palette Swiss Poster Mode.
- Scroll-responsive rules remain isolated behind one feature flag and are off by default. They can be removed without affecting layout or content.
- SkillBridge Architecture X-Ray with selectable components and deterministic request replay.
- Oxford Pet Model Comparison Microscope using real repository output images.
- AI Study Planner deterministic Agent Run Replay using a real repository architecture image.
- Prestige Motors continuous 320–1440px Responsive Viewport Scrubber with phone, tablet, and desktop presets.
- Dense sample-data admin dashboard and contact inbox, plus the broadened job/freelance/collaboration contact form.

This remains a static HTML/CSS/JavaScript prototype. Neon Postgres, Drizzle, Neon Auth, Cloudinary uploads, Recharts, React Flow, real analytics, real contact persistence, email delivery, and Vercel deployment remain production implementation work for the future Next.js build.
