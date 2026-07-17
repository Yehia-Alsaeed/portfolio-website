"use client";

import type * as React from "react";

export function CommandPaletteTrigger({
  onOpen,
  ref,
}: {
  onOpen: () => void;
  ref?: React.Ref<HTMLButtonElement>;
}) {
  return (
    <button
      aria-label="Open command palette"
      className="inline-flex min-h-11 cursor-pointer items-center gap-1 border border-line px-2 font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-dim transition-colors hover:bg-ink hover:text-paper"
      onClick={onOpen}
      ref={ref}
      type="button"
    >
      Ctrl K
    </button>
  );
}
