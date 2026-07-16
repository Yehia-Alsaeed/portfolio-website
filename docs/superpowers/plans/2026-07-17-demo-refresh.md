# Portfolio Demo Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring the static portfolio demo up to date with the approved visual and interaction specification without implementing production backend services.

**Architecture:** Keep the existing multi-page HTML/CSS/vanilla-JavaScript prototype. Add reusable static-demo components and deterministic sample data; reserve React Flow, Recharts, Neon, Cloudinary uploads, and other production integrations for the later Next.js implementation.

**Tech Stack:** HTML5, CSS, vanilla JavaScript, local/remote project imagery, iframe embeds, browser-native SVG.

## Global Constraints

- Preserve the approved YA monogram grid, Archivo/JetBrains Mono typography, and Paper/Night/Mono modes.
- Every interaction must be keyboard usable and respect `prefers-reduced-motion`.
- Scroll-responsive rules remain controlled by one removable feature flag and default to disabled.
- Do not add production database, authentication, analytics, email, or Cloudinary-upload logic to the static demo.
- Avoid autoplay video and heavy assets.

---

### Task 1: Homepage visual refresh

**Files:**
- Modify: `mockups/demo/index.html`
- Modify: `mockups/demo/style.css`
- Modify: `mockups/demo/app.js`
- Create: `mockups/demo/assets/*`

- [x] Add the kinetic monogram entrance with a static reduced-motion state.
- [x] Add mode-specific material texture and a command-palette Poster Mode action.
- [x] Add the experimental scroll-rules feature flag, defaulted off.
- [x] Verify layout and interactions at desktop and mobile widths.

### Task 2: Case-study proof modules

**Files:**
- Modify: `mockups/demo/case-study.html`
- Modify: `mockups/demo/case-study-prestige.html`
- Modify: `mockups/demo/style.css`
- Modify: `mockups/demo/app.js`

- [x] Add a reusable interactive Architecture X-Ray prototype with selectable nodes and request replay.
- [x] Add a compact deterministic model-comparison prototype.
- [x] Add a compact deterministic agent-run replay prototype.
- [x] Add the 320-1440 responsive iframe scrubber with presets and keyboard-accessible range input.
- [x] Verify every module has readable static/reduced-motion behavior.

### Task 3: Admin and contact prototype

**Files:**
- Create: `mockups/demo/admin.html`
- Modify: `mockups/demo/index.html`
- Modify: `mockups/demo/style.css`
- Modify: `mockups/demo/app.js`

- [x] Add a dense analytics dashboard with SVG chart, metrics, traffic table, and recent event log.
- [x] Add contact inbox rows and read/unread interaction.
- [x] Add the admin route to the command palette.
- [x] Replace client-only contact copy with inquiry type, name, email, and broad discussion prompt.
- [x] Verify form success behavior and admin interactions.

### Task 4: Verification and documentation

**Files:**
- Modify: `prd.md`
- Modify: `handoff.md`

- [x] Start a local HTTP server on an available port.
- [x] Run automated DOM and interaction checks for all demo pages.
- [x] Capture desktop and mobile screenshots and inspect them for overflow, blank media, and overlap.
- [x] Confirm reduced-motion and keyboard-accessible states.
- [x] Record the refreshed demo scope and remaining production-only work in the project documents.
