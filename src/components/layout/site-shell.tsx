import type * as React from "react";

import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

export type SiteShellProps = { children: React.ReactNode };

export function SiteShell({ children }: SiteShellProps) {
  return (
    <>
      <a className="skip-link" href="#main-content">
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
