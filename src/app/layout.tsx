import type { Metadata } from "next";
import type { ReactNode } from "react";

import { VercelInsights } from "@/features/analytics/vercel-insights";
import { DISPLAY_MODE_BOOT_SCRIPT } from "@/features/display-mode/boot-script";
import { DisplayModeProvider } from "@/features/display-mode/provider";
import { PosterModeProvider } from "@/features/poster-mode/poster-mode-provider";
import { publicEnv } from "@/lib/env/public";

import { archivo, jetBrainsMono } from "./fonts";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: publicEnv.siteUrl,
  title: "Yehia Alsaeed | Freelance Web Developer in Egypt",
  description:
    "Yehia Alsaeed is a freelance web developer in Egypt building Shopify stores and custom websites that bring businesses more customers. Also an AI/ML engineer. Based in Cairo, working with clients anywhere.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html
      className={`${archivo.variable} ${jetBrainsMono.variable}`}
      data-mode="paper"
      data-scroll-behavior="smooth"
      lang="en"
      suppressHydrationWarning
    >
      <body>
        <script dangerouslySetInnerHTML={{ __html: DISPLAY_MODE_BOOT_SCRIPT }} />
        <DisplayModeProvider>
          <PosterModeProvider>{children}</PosterModeProvider>
        </DisplayModeProvider>
        <VercelInsights />
      </body>
    </html>
  );
}
