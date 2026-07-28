import type * as React from "react";

import { PageTransition } from "@/features/page-transition/page-transition";

import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

export type SiteShellProps = { children: React.ReactNode };

export function SiteShell({ children }: SiteShellProps) {
  return (
    <>
      <PageTransition />
      {/* WebKit's default keyboard-access mode only Tab-stops through form
          controls, not plain links, unless Full Keyboard Access is on - an
          explicit tabIndex opts this link into the sequence regardless. */}
      <a className="skip-link" href="#main-content" tabIndex={0}>
        Skip to content
      </a>
      <div className="site-frame">
        <SiteHeader />
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
