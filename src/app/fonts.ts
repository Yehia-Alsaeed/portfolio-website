import localFont from "next/font/local";

// Both faces are self-hosted, fontTools-instanced subsets of the Google
// variable fonts instead of the planned next/font/google downloads. The
// Google-served files carry axis ranges the design never uses (Archivo
// wght 100-900 / wdth 62-125 at 90KB, JetBrains Mono wght 100-800 at 41KB),
// and that critical-path weight pushed the simulated homepage LCP past the
// 2.5s Lighthouse gate. The repo copies keep the same latin coverage plus
// arrows/punctuation at wght 400-900 / wdth 100-125 (54.5KB) and
// wght 400-700 (28.4KB).
export const archivo = localFont({
  declarations: [{ prop: "font-stretch", value: "100% 125%" }],
  display: "swap",
  src: "./fonts/archivo-latin-variable.woff2",
  variable: "--font-archivo",
  weight: "400 900",
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
