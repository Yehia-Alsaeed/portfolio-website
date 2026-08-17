import type * as React from "react";

import { cn } from "@/lib/utils";

/** `className` lands on the item's own cell, so a caller can drop one item at
 *  a breakpoint without the row having to know why. */
export type MetadataItem = { label: string; value: React.ReactNode; className?: string };

export type MetadataRowProps = {
  items: readonly MetadataItem[];
  ariaLabel?: string;
  /** Replaces the column track classes outright rather than merging with them.
   *  A caller whose row holds a different number of items needs its own
   *  breakpoints, and appending would leave both sets live - the wider one
   *  simply winning at its own breakpoint. */
  columnsClassName?: string;
};

// Case studies pass three or four items (Role, optional Period, Type, Stack)
// and are what these defaults are tuned for.
const DEFAULT_COLUMNS_CLASS_NAME = "grid-cols-2 min-[821px]:grid-cols-4";

export function MetadataRow({
  ariaLabel,
  columnsClassName = DEFAULT_COLUMNS_CLASS_NAME,
  items,
}: MetadataRowProps) {
  return (
    <dl
      aria-label={ariaLabel}
      className={cn(
        "border-line grid gap-x-5 gap-y-4 border-b pt-3.5 pb-[18px] font-mono text-[0.6875rem] tracking-[0.06em] uppercase",
        columnsClassName,
      )}
    >
      {items.map((item) => (
        <div className={cn("min-w-0", item.className)} key={item.label}>
          <dt className="text-dim mb-0.5">{item.label}</dt>
          <dd className="text-ink m-0">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
