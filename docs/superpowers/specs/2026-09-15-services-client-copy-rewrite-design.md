# Services Page Client-Facing Copy Rewrite Design

**Status:** Approved in conversation on 2026-09-15. Copy is final; do not reword it.

**Executor:** Claude Code (Opus), in this repository, on the `dev` branch, in the single root checkout.

**Goal:** Rewrite `/services` so a non-technical freelance client (a Shopify store owner or a studio founder) understands what Yehia offers and how it makes them money, without reading a single technical term. Every line sells an outcome, not a tool.

## Hard rules

- **Do not commit or push.** Leave the working tree for Yehia to review. He will say when to commit. Never add an AI co-author trailer (see `CLAUDE.md`).
- **Work on `dev`.** No new branches, no `git worktree`.
- **Use the copy in this document verbatim.** It has been through three review rounds. Do not "improve" it, do not add marketing words, do not add sections that are not listed here.
- **No prices, no percentages, no dollar figures, no fabricated results, no testimonials.** The word "price" may appear only in the one FAQ answer below.
- **Do not touch the client-work section.** `CLIENT_WORK`, `VISIBLE_CLIENT_WORK`, `CLIENT_WORK_MEDIA`, the hidden Nexo entry, `client-work-grid.tsx`, `client-work-media.tsx`, and `TESTIMONIALS` stay byte-for-byte as they are. The section keeps its title `Client work` and its `3 client builds` meta.
- **No AI language anywhere on the page.** The "Web and AI" offer is removed, not renamed. LLM, CV, React, Node, MongoDB, full-stack, Liquid, staging, QA, deploy, auth, admin panel: none of these words appear on `/services` or in the homepage services teaser.
- **Match the existing look.** Reuse `RuledSection`, `PageTitle`, `Button`, the `border-line` rules, the mono uppercase labels, `text-dim` body text, and the existing type scale. No new colors, fonts, icons, shadows, rounded corners, or accordions.

## Page order

The rendered order of `ServicesPage` becomes:

1. Page title (headline with two accented phrases, plus subtitle)
2. `What I build` (two offers)
3. `Already have a store?` (new, one paragraph and one button)
4. `Client work` (unchanged)
5. `Every project includes` (new, six-cell grid)
6. `How I work` (four steps, rewritten)
7. `Questions` (new, seven open FAQ items)
8. `Start a project` (one line added above the existing buttons)

Client work moves up from its current slot (after the process) to directly after the fix strip, so the reader sees real stores right after the promise.

## Final copy

### 1. Page title

- Title: `Stores that sell. Sites that win clients.`
- Accent (rendered in `text-accent-text`): both `sell` and `win clients`.
- Subtitle (the existing mono uppercase line under the h1): `Shopify stores - Brand websites - Cairo, clients anywhere`

`PageTitle` currently accepts a single `accent` string. Extend it to accept `string | readonly string[]` and highlight every listed phrase (first occurrence of each). Keep the existing single-string call on `/projects` working unchanged.

### 2. What I build

Section title stays `What I build`. Two cards, same `OfferGrid` layout.

**Offer 01**

- `index`: `01`
- `label`: `For product brands`
- `title`: `A store that looks worth paying for.`
- `summary`: `I build Shopify stores that look like a real brand, make buying the easiest part of the visit, and are set up properly for Google from day one.`
- `capabilities`:
  1. `Looks premium, so people trust you with their card`
  2. `Nothing between the shopper and the buy button`
  3. `Set up so Google can find you`
  4. `Yours to update, no developer needed`

**Offer 02**

- `index`: `02`
- `label`: `For studios and service businesses`
- `title`: `A site as good as your work.`
- `summary`: `When people hire you for your taste, your website is the first thing they judge. I build sites that hold up: clear about what you do, built around your work, and pointed at one thing, getting in touch.`
- `capabilities`:
  1. `Designed for you, not picked from a template`
  2. `Case studies that do the selling for you`
  3. `Every page leads to one thing: hiring you`

### 3. Already have a store?

New section. Same shape as `Start a project`: a `RuledSection` titled `Already have a store?`, one paragraph (`max-w` around 60ch, body size matching the offer summaries), then one primary button.

- Paragraph: `If your store is slow, looks dated, or gets visits but not orders, you don't need to start over. I'll find what's costing you sales and fix it.`
- Button: `Send me your store`, `variant="primary"`, linking to `/#contact`.

### 4. Client work

Unchanged. Do not edit anything in it.

### 5. Every project includes

New section. `RuledSection` titled `Every project includes`. Render as the same bordered grid used by `ProcessSection` (`border-line grid grid-cols-1 border-t border-l`, cells with `border-r border-b p-6`), six cells, three across at `min-[1024px]`, two across at `min-[560px]`. Each cell shows a mono index `01` to `06` in the accent style, then the sentence in the process step body style.

1. `One person, start to finish. No account managers, no handoffs.`
2. `Works on every phone. That's where your customers are.`
3. `Fast, because a slow site is an empty one.`
4. `Your own domain, connected and secure.`
5. `A walkthrough, so you can update it yourself.`
6. `You own everything: the site, the design, every login.`

### 6. How I work

Section title changes from `How we work together` to `How I work`. Same `ProcessSection` grid. Step titles change, so update the `ProcessStep["title"]` union to `"Call" | "Build" | "Test" | "Launch"`.

- `01` `Call`: `You tell me what you sell, who buys it, and what you want the site to do. I tell you what's realistic, how long it takes, and what it costs.`
- `02` `Build`: `I send you a private link and you watch the site take shape. You give feedback along the way, so there are no surprises at the end.`
- `03` `Test`: `I test it the way your customers will use it. On a phone, on slow internet, from finding a product to paying for it.`
- `04` `Launch`: `Your site goes live. You get every login and full ownership. It's yours to run.`

### 7. Questions

New section. `RuledSection` titled `Questions`. An open stacked list, no accordion, no `<details>`. Each item: top rule (`border-line border-t`), vertical padding around `py-6`, question as an `h3` in `text-lg font-bold`, answer beneath in `text-dim mt-2 text-sm leading-relaxed` with `max-w` around 60ch. Use a `<dl>` or a list of `<article>`s; either is fine as long as the question is a real heading.

1. **`Do I need a Shopify account first?`**
   `No. I set it up with you, in your name, so it's yours from day one.`
2. **`How long does it take?`**
   `Most stores go live three to five weeks after our first call. Fixes are faster.`
3. **`How much does it cost?`**
   `Every project is quoted after the first call, based on what you actually need. One fixed price, no hourly billing, no surprises.`
4. **`Can I update it myself after launch?`**
   `Yes. Products, prices, photos and text are all yours to change, no developer needed. I show you how before I hand it over.`
5. **`Do you write the text and take the photos?`**
   `You bring the product photos and details. I tell you exactly what I need up front and handle everything else.`
6. **`I already have a store. Can you fix it instead of rebuilding?`**
   `Yes, and often that's the smarter move. Send me the link and I'll tell you what's worth fixing.`
7. **`Do you work with clients outside Egypt?`**
   `Yes. I'm in Cairo and work with clients anywhere over email and calls.`

### 8. Start a project

Section title stays `Start a project`. Add one paragraph above the existing buttons, same style as the fix-strip paragraph. Buttons are unchanged: `Start a conversation` (primary, `/#contact`) and `Email directly` (outline, `mailto:`).

- Paragraph: `Tell me what you sell and what's not working. I'll tell you if I can help.`

## Off-page copy that changes with it

### Route metadata (`src/app/(public)/services/page.tsx`)

- `title` stays `Services | Yehia Alsaeed`.
- `description` becomes: `Stores that sell and sites that win clients. Shopify and custom websites by Yehia Alsaeed, Cairo, for clients anywhere.`

### Open Graph image (`src/app/(public)/services/opengraph-image.tsx`)

- `eyebrow` stays `Services`.
- `title` becomes `Stores that sell. Sites that win clients.`
- `subtitle` becomes the new description above.
- `alt` stays `Services | Yehia Alsaeed`.

### Structured data (`src/lib/seo/services-json-ld.ts`)

No code change. It reads `SERVICE_OFFERS` and follows automatically. Its unit test forbids the substring `price` in the emitted JSON; the new offer titles and summaries do not contain it. The FAQ is not added to the JSON-LD.

### Homepage services teaser (`src/content/homepage.ts`, `src/features/home/services-teaser.tsx`)

- The two teaser cards must be identical to offers 01 and 02 above (label, title, summary, capabilities). Preferred: derive `SERVICE_TEASERS` from `SERVICE_OFFERS` so there is one source of truth. If importing `@/content/services` into `homepage.ts` drags the client-work image imports into the homepage module graph in a way that matters, keep a duplicated list instead and add a unit test asserting it deep-equals `SERVICE_OFFERS`.
- The section `meta` line `4 Shopify + 2 full-stack client builds` becomes `Shopify stores + custom websites` (revised 2026-09-18 to match the offer labels). Yehia will replace it with a real count later.
- The section title `Services - Freelance` stays.

## Content module changes (`src/content/services.ts`)

- Replace `SERVICE_OFFERS` and `SERVICE_PROCESS` with the copy above.
- Change the `ProcessStep["title"]` union to the four new names.
- Add typed exports for the new sections, following the existing `as const satisfies readonly X[]` pattern:
  - `FIX_STRIP` (or similar): `{ title, body, cta: { label, href } }`.
  - `PROJECT_INCLUDES`: `readonly string[]`, six entries.
  - `SERVICE_FAQ`: `readonly { question: string; answer: string }[]`, seven entries.
  - `START_PROJECT_INTRO`: the one closing paragraph.
- Leave every client-work and testimonial export exactly as it is, including the comments.

## Components

- `src/features/services/offer-grid.tsx`: no change needed unless the four-bullet card needs a spacing check.
- `src/features/services/process-section.tsx`: heading text only.
- New `src/features/services/fix-strip.tsx`, `src/features/services/project-includes.tsx`, `src/features/services/faq-section.tsx`, each a Server Component taking its content as a prop, matching the existing files in style.
- `src/features/services/services-page.tsx`: new order, new sections, the closing paragraph, the multi-accent title.
- `src/components/ui/page-title.tsx`: multi-phrase accent as described.

## Tests

### `tests/unit/phase-5-services-content.test.ts`

- Offer titles: `A store that looks worth paying for.` and `A site as good as your work.`
- Process titles: `Call`, `Build`, `Test`, `Launch`.
- Add assertions: six include items, seven FAQ items, the FAQ contains no `$` or `%`.
- **Relax the word ban.** Remove `\bconversion\b|\brevenue\b|\btraffic\b|\bcustomer\b` from the forbidden pattern. The rest of that assertion stays: no `<iframe`, no `Q3 2026`, no `\$\d`, no `\d+%`, no `\bpackage\b`, no `\bpricing\b`, no secrets, no placeholder text. The new copy contains `price` (singular, in one FAQ answer) which does not match `\bpricing\b`.
- Everything about `CLIENT_WORK`, Nexo, media keys, and `TESTIMONIALS` stays as is.

### `tests/e2e/services.spec.ts`

- h1 text becomes `Stores that sell. Sites that win clients.`
- Offer headings and step names updated to the copy above.
- Keep the assertion that `Available for select freelance projects.` has count 0.
- Add: the `Send me your store` link points at `/#contact`; the `Questions` section renders seven questions; `Start a conversation` and `Email directly` assertions stay.
- Client-work assertions stay untouched.

### `tests/unit/services-json-ld.test.ts`

No change expected; run it to confirm.

## Verification, in order

```bash
npm run lint
```

```bash
npm run typecheck
```

```bash
npm test
```

```bash
npx playwright test tests/e2e/services.spec.ts
```

Then open `/services` in the in-app browser through the `dev` launch config and check, at desktop width and at 400px width: the two accent phrases render in the accent color, the six-cell grid collapses cleanly, the FAQ is fully visible with no interaction, none of the banned technical words appear anywhere on the page, and the homepage teaser cards match the offers. Report any failure verbatim instead of working around it.

## Out of scope

Pricing, testimonials, un-hiding Nexo, changing client-work copy, adding AI services, FAQ structured data, changes to the contact form, and any redesign of existing components beyond the multi-accent title.

## Revision 2026-09-18

Approved in conversation on 2026-09-18, replacing the copy above for the page title, both offers, and one FAQ answer. Everything else in this document stands. The goal sharpened: every line names a gain the client can count (orders, sales, clients), and the headings carry the search phrases for the coming SEO pass.

- Page title: eyebrow `Freelance web developer in Egypt`; headline `Websites that make your business more money.` with `more money` accented; subtitle `Shopify stores - Custom websites - Cairo, clients anywhere`.
- Offer 01: label `Ecommerce`; title `Shopify stores that bring in more orders.`; summary `Getting people to your store is only half the job. The other half is getting them to buy. I build Shopify ecommerce stores that look like a real brand, make ordering effortless, and feel right on a phone, so the visitors you already have turn into orders.`; bullets `Looks premium, so people trust you with their card` / `Fewer steps to buy, so fewer people leave without paying` / `Brings back shoppers who left their cart, so lost sales come back` / `Suggests related products, so every order is worth more`. No SEO-result promises and no "no developer needed" claims: Yehia is not positioning as an SEO expert, and maintenance is a paid service. The summaries deliberately do not restate the bullets beneath them.
- Offer 02: label `Custom websites`; title `Websites that bring you new clients.`; summary `Whatever your business does, people check your website before they call, book, or buy. If it looks cheap or confusing, they move on to a competitor. I design and build custom websites that make you the obvious choice, so more of those visits turn into calls and messages.`; bullets `Designed around your business, so you stand out from competitors` / `Says what you do in seconds, so people don't leave confused` / `Shows your work, so the site does the selling for you` / `Every page leads to one thing: contacting you`.
- FAQ "Can I update it myself after launch?" answer: `Yes. Products, prices, photos and text are all yours to change, and I show you how before I hand it over. For bigger changes or ongoing upkeep, I'm one message away.`
- Page description and link-preview subtitle: `Freelance web developer in Egypt building Shopify stores and custom websites that bring in more orders and new clients. Yehia Alsaeed, Cairo.` First pass; the site-wide SEO task may revise it.
- Homepage teaser meta line: `Shopify stores + custom websites`, matching the offer labels.
- "Already have a store?" grows from a one-paragraph strip into a full, platform-neutral section (`fix-section.tsx`, content `FIX_SECTION`): fixes apply to Shopify stores and custom websites alike, so Shopify is named once in the lead and nowhere else. Mono h2 label `Already have a website?`; meta `Fixes - Redesigns - Speed-ups`; h3 headline `Same website. More customers.` with `More customers` accented; lead `You don't need to start over. Whether it's a Shopify store or a custom website, if it's slow, looks dated, or gets visits but no orders or messages, something specific is costing you money. I find it, fix it, and leave what works alone.`; a four-cell problem grid in the process-grid style with h4 titles `It's slow` / `It looks dated` / `Visitors, but no customers` / `Something's broken`, each body naming the customer it costs and the fix; closing line `I'll look at it and tell you what's costing you money and what it takes to fix it.`; button `Send me the link` to `/#contact`. FAQ question 6 becomes `I already have a website. Can you fix it instead of rebuilding?` to match. Bodies carry `speed up your website` and `redesign` once each, for the SEO pass. Layout: the headline spans the full width at `clamp(2rem, 5.5vw, 4.5rem)`; the lead runs to half the width from 1024px; the problem grid is two across on phones and tablets (01 02 / 03 04) and four across from 1024px, never single-column; the closing line and button sit in a `bg-soft` ruled band directly under the grid, line left (`text-balance`, so it breaks into two even lines) and button right, with the button centred on its own row on phones. Cell bodies were cut to roughly twenty words each on 2026-09-18 (`Every slow second sends people back to Instagram. I speed up your website, so visitors stay long enough to buy.` / `A dated site makes people doubt the business. I redesign it to match your brand today, so visitors trust you enough to pay.` / `People come, look, and leave. Usually it's confusing pages, hidden costs, or too many steps. I fix those, and your visitors start turning into customers.` / `A dead button, a broken page, a form that never sends. Each one is a lost customer. I find them and fix them.`); the h4 titles are unchanged.
