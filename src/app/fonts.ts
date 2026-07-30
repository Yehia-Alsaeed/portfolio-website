import localFont from "next/font/local";

// Both faces are self-hosted, fontTools-instanced subsets of the Google
// variable fonts instead of the planned next/font/google downloads. The
// Google-served files carry axis ranges the design never uses (Archivo
// wght 100-900 / wdth 62-125 at 90KB, JetBrains Mono wght 100-800 at 41KB),
// and that critical-path weight pushed the simulated homepage LCP past the
// 2.5s Lighthouse gate. The repo copies keep the same latin coverage plus
// site-used ASCII plus arrows/punctuation at wght 400-900 / wdth 100-125
// with kerning (23.7KB), and
// wght 400-700 (7.2KB).
// All four faces are preloaded and use `swap`. The whole set is 43KB, so
// fetching it at high priority lands it before or during first paint - the
// real face is then what renders, and there is no fallback period to swap
// out of, which is what was displacing `<main>` site-wide.
//
// This deliberately reverses the earlier `preload: false` / `display:
// "optional"` setup on this face. That combination optimised the LCP number
// by never blocking on the font, but its actual effect was that the chosen
// body face silently never rendered at all on a cold visit (unprioritised,
// so it missed `optional`'s ~100ms window, and `optional` never swaps
// afterwards). Showing the selected typeface is the product requirement;
// the font bytes on the critical path are the accepted cost.
export const archivo = localFont({
  adjustFontFallback: "Arial",
  declarations: [{ prop: "font-stretch", value: "100% 125%" }],
  display: "swap",
  preload: true,
  src: "./fonts/archivo-latin-variable.woff2",
  variable: "--font-archivo",
  weight: "400 900",
});

// Exact static instances keep the first viewport in Archivo without waiting
// for the broader variable face used by content below it. `adjustFontFallback`
// matches the fallback's box metrics to the real face's so the swap this
// `display: "swap"` strategy performs doesn't reflow surrounding content -
// found missing here (only `archivo` had it) via a real, reproducible
// "Web font loaded" layout-shift measured across every route in Phase 8
// Stage 6 (docs/implementation/phase-8-report.md).
export const archivoStatement = localFont({
  adjustFontFallback: "Arial",
  display: "swap",
  preload: true,
  src: "./fonts/archivo-statement-650.woff2",
  weight: "650",
});

// Styles the site-header logo, which renders on every route - so this face
// arriving late is what moved `<main>` on every page, not just the ones with
// a hero. See docs/implementation/phase-8-report.md, Checkpoint 4.
export const archivoWide = localFont({
  adjustFontFallback: "Arial",
  display: "swap",
  preload: true,
  src: "./fonts/archivo-wide-900.woff2",
  weight: "900",
});

export const jetBrainsMono = localFont({
  adjustFontFallback: "Arial",
  display: "swap",
  preload: true,
  src: "./fonts/jetbrains-mono-latin-variable.woff2",
  variable: "--font-jetbrains-mono",
  weight: "400 700",
});
