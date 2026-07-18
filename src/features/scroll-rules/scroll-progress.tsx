"use client";

import * as React from "react";

import { SCROLL_RULES_QUERY } from "./config";

function subscribeToLocation(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  return () => window.removeEventListener("popstate", onChange);
}

function readEnabled() {
  return new URLSearchParams(window.location.search).get(SCROLL_RULES_QUERY) === "1";
}

export function ScrollProgress() {
  const enabled = React.useSyncExternalStore(subscribeToLocation, readEnabled, () => false);
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    if (!enabled) return;

    let frame = 0;
    function update() {
      const available = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(available > 0 ? Math.min(window.scrollY / available, 1) : 1);
      frame = 0;
    }
    function handleScroll() {
      if (!frame) frame = window.requestAnimationFrame(update);
    }

    frame = window.requestAnimationFrame(update);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      aria-hidden="true"
      className="scroll-progress"
      data-testid="scroll-progress"
      style={{ transform: `scaleX(${progress})` }}
    />
  );
}
