import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { ReactNode } from "react";

/**
 * Vercel Web Analytics and Speed Insights, mounted together because they have
 * the same deployment-shaped precondition: both only work when the app is
 * actually served by Vercel, which injects the routes they talk to
 * (`/_vercel/insights/*`, `/_vercel/speed-insights/*`, and the version-2
 * randomized "Resilient Intake" paths) and the
 * `NEXT_PUBLIC_VERCEL_OBSERVABILITY_*` build variables that point the scripts
 * at them.
 *
 * `NEXT_PUBLIC_VERCEL_ENV` is a Vercel framework environment variable set on
 * every Preview and Production build and absent everywhere else, so this gate
 * is a no-op for the deployments that matter and switches both tools off for
 * local `next dev` / `next start`. That local half is not cosmetic:
 *
 * - Under `next dev` both packages load their debug script from
 *   `https://va.vercel-scripts.com`, which this app's CSP (`script-src 'self'`,
 *   no remote script host - see next.config.ts) correctly refuses. Rendering
 *   them locally would put real CSP violations in the console and fail
 *   tests/e2e/csp.spec.ts on the local Playwright run.
 * - Under a local `next start` the scripts resolve to the same-origin
 *   `/_vercel/*` paths, which only exist on Vercel, so they 404 and log a
 *   console error that Lighthouse counts against the best-practices score the
 *   CI gate asserts.
 *
 * Neither package sends data in development mode regardless, so nothing is
 * lost by not mounting them there.
 */
export function VercelInsights(): ReactNode {
  if (!process.env.NEXT_PUBLIC_VERCEL_ENV) return null;

  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
