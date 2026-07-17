import type { Metadata } from "next";
import type { ReactNode } from "react";

import { SiteShell } from "@/components/layout/site-shell";
import { DISPLAY_MODE_BOOT_SCRIPT } from "@/features/display-mode/boot-script";
import { DisplayModeProvider } from "@/features/display-mode/provider";
import { publicEnv } from "@/lib/env/public";

import { archivo, jetBrainsMono } from "./fonts";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: publicEnv.siteUrl,
  title: "Yehia Alsaeed | AI/ML Engineer and Web Developer",
  description:
    "Portfolio of Yehia Alsaeed, an AI/ML engineer and web developer in Cairo, Egypt working across machine learning, computer vision, Shopify, and full-stack systems.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html
      className={`${archivo.variable} ${jetBrainsMono.variable}`}
      data-mode="paper"
      lang="en"
      suppressHydrationWarning
    >
      <body>
        <script dangerouslySetInnerHTML={{ __html: DISPLAY_MODE_BOOT_SCRIPT }} />
        <DisplayModeProvider>
          <SiteShell>{children}</SiteShell>
        </DisplayModeProvider>
      </body>
    </html>
  );
}
