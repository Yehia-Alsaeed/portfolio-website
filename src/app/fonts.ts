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
export const archivo = localFont({
  adjustFontFallback: "Arial",
  declarations: [{ prop: "font-stretch", value: "100% 125%" }],
  display: "optional",
  preload: false,
  src: "./fonts/archivo-latin-variable.woff2",
  variable: "--font-archivo",
  weight: "400 900",
});

// Exact static instances keep the first viewport in Archivo without waiting
// for the broader variable face used by content below it.
export const archivoStatement = localFont({
  display: "swap",
  src: "./fonts/archivo-statement-650.woff2",
  weight: "650",
});

export const archivoWide = localFont({
  display: "swap",
  src: "./fonts/archivo-wide-900.woff2",
  weight: "900",
});

export const jetBrainsMono = localFont({
  display: "swap",
  // Not preloaded: the mono face only styles small labels, so the display
  // face keeps priority on slow connections.
  preload: false,
  src: "./fonts/jetbrains-mono-latin-variable.woff2",
  variable: "--font-jetbrains-mono",
  weight: "400 700",
});
