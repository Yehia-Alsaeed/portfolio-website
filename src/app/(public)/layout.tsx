import type { ReactNode } from "react";

import { SiteShell } from "@/components/layout/site-shell";
import { PageViewTracker } from "@/features/analytics/page-view-tracker";

export default function PublicLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <PageViewTracker />
      <SiteShell>{children}</SiteShell>
    </>
  );
}
