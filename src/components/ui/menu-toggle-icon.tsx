import type * as React from "react";

import { cn } from "@/lib/utils";

type MenuToggleIconProps = React.ComponentProps<"svg"> & {
  open: boolean;
  duration?: number;
};

// Vendored from https://21st.dev/@sshahaider/components/menu-toggle-icon
//
// The morph is a `stroke-dasharray` / `stroke-dashoffset` sweep along one
// continuous path, so it needs no animation library - the two visible bars and
// the X are all the same stroke at different dash windows. Kept close to the
// upstream source so it stays diffable against the registry; the site's square
// caps and sizing are passed in at the call site rather than baked in here.
//
// The reduced-motion block in globals.css collapses `transition-duration`
// with `!important`, which outranks the inline duration below, so this
// animates only for users who have not asked it not to.
export function MenuToggleIcon({
  open,
  className,
  fill = "none",
  stroke = "currentColor",
  strokeWidth = 2.5,
  strokeLinecap = "round",
  strokeLinejoin = "round",
  duration = 500,
  ...props
}: MenuToggleIconProps) {
  return (
    <svg
      className={cn("transition-transform ease-in-out", open && "-rotate-45", className)}
      fill={fill}
      stroke={stroke}
      strokeLinecap={strokeLinecap}
      strokeLinejoin={strokeLinejoin}
      strokeWidth={strokeWidth}
      style={{ transitionDuration: `${duration}ms` }}
      viewBox="0 0 32 32"
      {...props}
    >
      <path
        className={cn(
          // Upstream uses `transition-all`, which also drags `stroke` through
          // the same duration. The sibling bar below has no transition, so on a
          // display-mode switch this path's colour lagged ~300ms behind it and
          // the X showed as a single diagonal. Only the dash window needs to
          // animate; colour should snap with the rest of the UI.
          "[transition-property:stroke-dasharray,stroke-dashoffset] ease-in-out",
          open
            ? "[stroke-dasharray:20_300] [stroke-dashoffset:-32.42px]"
            : "[stroke-dasharray:12_63]",
        )}
        d="M27 10 13 10C10.8 10 9 8.2 9 6 9 3.5 10.8 2 13 2 15.2 2 17 3.8 17 6L17 26C17 28.2 18.8 30 21 30 23.2 30 25 28.2 25 26 25 23.8 23.2 22 21 22L7 22"
        style={{ transitionDuration: `${duration}ms` }}
      />
      <path d="M7 16 27 16" />
    </svg>
  );
}
