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
