"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

import { DISPLAY_MODES, type DisplayMode } from "./model";
import { useDisplayMode } from "./provider";

const MODE_LABELS: Record<DisplayMode, string> = {
  mono: "Mono",
  night: "Night",
  paper: "Paper",
};

export function ModeSwitcher() {
  const { mode, setMode } = useDisplayMode();

  return (
    <div
      aria-label="Display mode"
      className="flex items-center gap-1 font-mono text-[0.6875rem] tracking-[0.06em] uppercase"
      role="group"
    >
      {DISPLAY_MODES.map((candidate, index) => (
        <React.Fragment key={candidate}>
          {index > 0 ? (
            <span aria-hidden="true" className="text-dim">
              /
            </span>
          ) : null}
          <button
            aria-label={`${MODE_LABELS[candidate]} display mode`}
            aria-pressed={mode === candidate}
            className={cn(
              "tracking-inherit min-h-11 cursor-pointer px-1 uppercase transition-colors",
              mode === candidate ? "text-accent-text font-bold" : "text-dim hover:text-ink",
            )}
            onClick={() => {
              setMode(candidate);
            }}
            type="button"
          >
            {MODE_LABELS[candidate]}
          </button>
        </React.Fragment>
      ))}
    </div>
  );
}
