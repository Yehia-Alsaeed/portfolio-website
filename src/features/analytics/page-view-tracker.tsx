"use client";

import { usePathname } from "next/navigation";
import * as React from "react";

import { getScreenClass, trackEvent } from "./client";

export function PageViewTracker(): React.ReactNode {
  const pathname = usePathname();
  const lastTrackedPath = React.useRef<string | undefined>(undefined);

  React.useEffect(() => {
    if (lastTrackedPath.current === pathname) return;
    lastTrackedPath.current = pathname;

    trackEvent({
      type: "page_view",
      path: pathname,
      referrer: document.referrer,
      screen: getScreenClass(window.innerWidth),
    });
  }, [pathname]);

  return null;
}
