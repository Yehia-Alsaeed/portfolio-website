import { readFile } from "node:fs/promises";

import { ImageResponse } from "next/og";

import { publicEnv } from "@/lib/env/public";

const PAPER = "#f1efe9";
const INK = "#111114";
const ACCENT = "#2b3cff";
const DIM = "#6d6b66";

export const OG_IMAGE_SIZE = { width: 1200, height: 630 } as const;
export const OG_IMAGE_CONTENT_TYPE = "image/png";

async function loadFonts() {
  const [archivo, jetBrainsMono] = await Promise.all([
    readFile(new URL("./fonts/archivo-800.ttf", import.meta.url)),
    readFile(new URL("./fonts/jetbrains-mono-500.ttf", import.meta.url)),
  ]);
  return { archivo, jetBrainsMono };
}

export type OgImageContent = {
  eyebrow: string;
  title: string;
  subtitle?: string;
};

/**
 * Shared Swiss-grid OG template for every route. Text is always caller-
 * supplied from existing, already-published copy (page titles/descriptions,
 * PROFILE, or case-study fields) - never invented here.
 */
export async function renderOgImage({ eyebrow, title, subtitle }: OgImageContent) {
  const { archivo, jetBrainsMono } = await loadFonts();

  return new ImageResponse(
    <div
      style={{
        backgroundColor: PAPER,
        color: INK,
        display: "flex",
        flexDirection: "column",
        fontFamily: "Archivo",
        height: "100%",
        justifyContent: "space-between",
        padding: "72px",
        width: "100%",
      }}
    >
      <div
        style={{
          color: DIM,
          display: "flex",
          fontFamily: "JetBrains Mono",
          fontSize: 22,
          letterSpacing: 4,
          textTransform: "uppercase",
        }}
      >
        {eyebrow}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div
          style={{
            display: "flex",
            fontSize: 74,
            fontWeight: 800,
            lineHeight: 1.08,
            maxWidth: 1020,
          }}
        >
          {title}
        </div>
        {subtitle ? (
          <div style={{ color: DIM, display: "flex", fontSize: 28, maxWidth: 920 }}>{subtitle}</div>
        ) : null}
      </div>

      <div
        style={{
          alignItems: "center",
          borderTop: `4px solid ${INK}`,
          display: "flex",
          justifyContent: "space-between",
          paddingTop: 28,
        }}
      >
        <div style={{ color: DIM, display: "flex", fontFamily: "JetBrains Mono", fontSize: 22 }}>
          {publicEnv.siteUrl.host}
        </div>
        <div style={{ color: ACCENT, display: "flex", fontSize: 32, fontWeight: 800 }}>YA .</div>
      </div>
    </div>,
    {
      ...OG_IMAGE_SIZE,
      fonts: [
        { data: archivo, name: "Archivo", style: "normal", weight: 800 },
        { data: jetBrainsMono, name: "JetBrains Mono", style: "normal", weight: 500 },
      ],
      headers: {
        // Not `immutable`: the build-time hash in each route's public path
        // is derived from the route's code, not the case-study/profile text
        // it renders, so a content-only edit between deployments would keep
        // the same URL. A one-hour fresh window with a background
        // revalidation day is a safer middle ground than the previous
        // `max-age=0` (which forced a Fluid Compute invocation on every
        // request) without risking a stale image for a full year.
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    },
  );
}
