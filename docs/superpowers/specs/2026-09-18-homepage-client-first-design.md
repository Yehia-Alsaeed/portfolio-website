# Homepage Client-First Design

**Status:** Approved in conversation on 2026-09-18.

**Executor:** Claude Code, on `dev`, in the single root checkout. Not committed until Yehia says so; no AI co-author trailers (see `CLAUDE.md`).

**Goal:** Turn the homepage from recruiter-first into client-first, in the same voice as the 2026-09-15 services rewrite: every line names a gain the client can count, no trade jargon, and the search phrase `freelance web developer in Egypt` in the title, the first sentence, and the link preview. Recruiters keep everything they had, moved into a clearly labelled second half.

## Decisions

- **Client-first.** The homepage was built recruiter-first (statement about fine-tuning language models, ML-metric stats, four AI projects before any client content). Yehia chose to flip it so the client path comes first and recruiters get a labelled half further down.
- **Stats strip removed (2026-09-19).** The four figures (`17` projects, `0.93` mIoU, `+0.66` exact match, `1+ yr` freelance) and the `For hiring managers` block that held them are gone from the homepage. Small counts make a new freelancer read as new; the live client work already does the convincing. `HOME_STATS` stays in the content module because Poster Mode reads two of the figures. If a strip ever returns, prefer terms (fixed price, reply time, ownership, location) over counts, and write tenure as `Since 2025`, never `1+ yr`.
- **Reply promise:** "within two days". This is the only reply-time claim on the site.
- **No WhatsApp.** Contact stays email plus the form.

## Section order

`monogram`, `positioning`, `client-work`, `services`, `work`, `experience`, `contact`. `HOME_SECTION_ORDER` mirrors this and the homepage e2e spec asserts it.

## Copy

- **Browser title:** `Yehia Alsaeed | Freelance Web Developer in Egypt` (page and root layout).
- **Description:** `Yehia Alsaeed is a freelance web developer in Egypt building Shopify stores and custom websites that bring businesses more customers. Also an AI/ML engineer. Based in Cairo, working with clients anywhere.`
- **Link preview:** eyebrow `Freelance web developer in Egypt`, title `Yehia Alsaeed`, subtitle `Shopify stores and custom websites that bring businesses more customers. Cairo, clients anywhere.`
- **Role line under the monogram** (also the structured-data job title): `Freelance web developer + AI/ML engineer`.
- **Statement:** `I'm a freelance web developer in Egypt. I build Shopify stores and websites that bring businesses more customers.` with `Shopify stores` and `more customers` highlighted. The dimmed AI/ML sentence that followed was removed on 2026-09-19; the role line under the monogram and the `View AI/ML projects` link carry that side. From 1024px the statement is sized `clamp(2rem, 3.2vw, 3.375rem)` with balanced wrapping so it always sits on exactly two lines (measured at 1024 to 2560px); below 1024px it keeps its original sizing. Buttons: `See client work` (primary, `#client-work`), `See all services` (outline, `/services`), `View AI/ML projects` (quiet link, `#work`).
- **Client work:** the services page's `ClientWorkGrid` with `VISIBLE_CLIENT_WORK`, titled `Client work`, meta `3 live sites` (counted).
- **Services teaser:** cards unchanged (they mirror `SERVICE_OFFERS`). Added under them: a tease row, `Already have a website that isn't bringing in customers? I fix those too.` with a `Fixes and redesigns` link to `/services#fix` (the fix section now carries `id="fix"`), and a full-width `All services` link matching the projects list's `View all` row.
- **Selected work:** retitled `Selected work - AI and engineering`; the last row's category loses `Vercel` (`Full-stack - Live demo`); the `View all N projects` count is read from the roster instead of typed.
- **About:** the freelance row moves first and reads `Shopify - Custom websites - Independent` / `Shopify stores and custom websites for brands in Egypt and abroad, built to bring in orders and clients.` Dell and the degree are unchanged. Skills unchanged.
- **Contact:** the line under the button becomes `I read every message myself and reply within two days. Email works too, it's right above.`

## Layout notes (2026-09-18, second pass)

- The statement spans the full content width (the old `max-w-[1040px]` cap is gone).
- Its actions sit in one ruled row under it: the two client buttons on the left, the recruiter link on the right. From 560px the link keeps to the right edge even when it wraps under the buttons; below 560px the buttons go full width and stack, and the link is centred on its own row.
- The services teaser's fix-tease link likewise keeps to the right edge when it wraps under its sentence on tablets.
- Every other section already adapted at desktop, tablet, and phone widths and was left alone. A per-section capture at 1440, 1024, 768, and 400px found no horizontal overflow and nothing escaping the main column.

## Not changed

Monogram hero, the five AI projects, the Dell and degree rows, the skills grid, the contact form fields, the footer, the nav, the command palette.
