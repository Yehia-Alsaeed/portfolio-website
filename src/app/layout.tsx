import type { Metadata } from "next";
import type { ReactNode } from "react";

import { publicEnv } from "@/lib/env/public";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: publicEnv.siteUrl,
  title: "Yehia Alsaeed | Foundation Preview",
  description: "Foundation preview for Yehia Alsaeed's portfolio application.",
  robots: {
    follow: false,
    index: false,
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
