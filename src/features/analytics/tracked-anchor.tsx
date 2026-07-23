"use client";

import { usePathname } from "next/navigation";
import * as React from "react";

import { getScreenClass, trackEvent, type ClickTrackingIntent } from "./client";

export type TrackedAnchorProps = React.ComponentPropsWithoutRef<"a"> & {
  tracking: ClickTrackingIntent;
};

export const TrackedAnchor = React.forwardRef<HTMLAnchorElement, TrackedAnchorProps>(
  function TrackedAnchor({ children, onClick, tracking, ...props }, ref) {
    const pathname = usePathname();

    function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
      trackEvent({ ...tracking, path: pathname, screen: getScreenClass(window.innerWidth) });
      onClick?.(event);
    }

    return (
      <a {...props} onClick={handleClick} ref={ref}>
        {children}
      </a>
    );
  },
);
