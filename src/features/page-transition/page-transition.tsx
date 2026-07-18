"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import * as React from "react";

const PUSH_DELAY_MS = 420;
const FALLBACK_DELAY_MS = 650;

export function PageTransition() {
  const router = useRouter();
  const [active, setActive] = React.useState(false);
  const layerRef = React.useRef<HTMLDivElement>(null);
  const timers = React.useRef<number[]>([]);

  React.useEffect(() => {
    function clearPendingNavigation() {
      for (const timer of timers.current) window.clearTimeout(timer);
      timers.current = [];
    }

    function handleHistoryNavigation() {
      clearPendingNavigation();
      setActive(false);
    }

    function handleClick(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        return;
      }

      const target = event.target;
      const anchor =
        target instanceof Element ? target.closest<HTMLAnchorElement>("a[href]") : null;
      if (
        !anchor ||
        anchor.hasAttribute("download") ||
        (anchor.target && anchor.target !== "_self")
      ) {
        return;
      }

      const destination = new URL(anchor.href, window.location.href);
      if (
        destination.origin !== window.location.origin ||
        destination.hash ||
        (destination.pathname === window.location.pathname &&
          destination.search === window.location.search)
      ) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      setActive(true);
      const expectedLocation = `${destination.pathname}${destination.search}`;

      timers.current.push(
        window.setTimeout(() => router.push(expectedLocation as Route), PUSH_DELAY_MS),
        window.setTimeout(() => {
          if (`${window.location.pathname}${window.location.search}` !== expectedLocation) {
            window.location.assign(destination.href);
          } else {
            setActive(false);
          }
        }, FALLBACK_DELAY_MS),
      );
    }

    document.addEventListener("click", handleClick, true);
    window.addEventListener("popstate", handleHistoryNavigation);
    if (layerRef.current) layerRef.current.dataset.ready = "true";
    return () => {
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("popstate", handleHistoryNavigation);
      clearPendingNavigation();
    };
  }, [router]);

  return (
    <div
      aria-hidden="true"
      className="page-transition"
      data-active={active ? "true" : "false"}
      data-testid="page-transition"
      ref={layerRef}
    >
      <span />
      <span />
    </div>
  );
}
