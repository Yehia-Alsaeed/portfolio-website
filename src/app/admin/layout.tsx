import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  robots: {
    follow: false,
    index: false,
    nocache: true,
  },
  title: "Portfolio Admin | Yehia Alsaeed",
};

export default function AdminRootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return children;
}
