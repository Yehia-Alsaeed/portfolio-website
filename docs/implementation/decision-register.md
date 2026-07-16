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
