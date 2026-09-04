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

export type ModeSwitcherProps = {
  /**
   * "center" (the default) renders in normal flow - correct where the
   * switcher stands alone, as in the mobile nav panel, and lets its real
   * 44px-tall buttons set the height of whatever contains them.
   *
   * "start" is for placing the switcher beside plain text of the same font
   * size, as in the home page's Role/Base/Display strip, which is a CSS grid
   * row shared with the Role/Base columns. A real 44px-tall button sitting in
   * flow there does two kinds of damage: the browser centers its label inside
   * that taller box, dropping it below the sibling text's baseline, and grid
   * rows auto-size to their tallest cell, so the whole row (and anything
   * pinned to its bottom, like a rule) stretches to match the button instead
   * of the text.
   *
   * "start" fixes both without touching the button's own size: it stays a
   * real, in-flow-sized 44px box (so it still satisfies an automated tap
   * -target-size check, and real assistive tech, exactly like "center" does)
   * with its label pinned to the top instead of centered - but the whole row
   * of buttons is lifted out of the grid's flow with `absolute`, so none of
   * that 44px reaches the row's own height calculation. An earlier version of
   * this instead shrank the button's own box and grew an invisible pseudo-
   * -element to cover the difference; that passed a manual click test but
   * failed this project's `shortButtons` accessibility check, because the
   * pseudo-element isn't a real target as far as that check (or a screen
   * reader, or a tap-target audit) is concerned - only the actual element's
   * box counts. Keeping the real box real and moving the row instead is what
   * satisfies both the visual goal and that check.
   */
  align?: "center" | "start";
};

export function ModeSwitcher({ align = "center" }: ModeSwitcherProps) {
  const { mode, setMode } = useDisplayMode();

  const buttons = DISPLAY_MODES.map((candidate, index) => (
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
          align === "start" ? "inline-flex items-start" : undefined,
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
  ));

  const row = (
    <div
      aria-label="Display mode"
      className={cn(
        "flex gap-1 font-mono text-[0.6875rem] tracking-[0.06em] uppercase",
        align === "start" ? "absolute inset-x-0 top-0 items-start" : "items-center",
      )}
      role="group"
    >
      {buttons}
    </div>
  );

  if (align !== "start") return row;

  // A plain in-flow wrapper that ends up zero-height: its only child is
  // `absolute`, so it has no in-flow content of its own to report a height
  // for. That's what removes the real 44px button row from the grid's
  // auto-row-height calculation. `row`, an `absolute` child, then anchors to
  // this wrapper's top-left corner - exactly where its own in-flow content
  // would otherwise have started - so the visible result is pixel-identical
  // to before.
  return <div className="relative">{row}</div>;
}
