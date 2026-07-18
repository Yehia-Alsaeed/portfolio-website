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
      className="border-line text-dim hover:bg-ink hover:text-paper inline-flex min-h-11 cursor-pointer items-center gap-1 border px-2 font-mono text-[0.6875rem] tracking-[0.08em] uppercase transition-colors"
      onClick={onOpen}
      ref={ref}
      type="button"
    >
      Ctrl K
    </button>
  );
}
