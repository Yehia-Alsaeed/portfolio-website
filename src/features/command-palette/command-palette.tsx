"use client";

import * as React from "react";

import { isEditableTarget } from "@/lib/keyboard";

import { CommandPaletteTrigger } from "./command-palette-trigger";

const CommandPalettePanel = React.lazy(() => import("./command-palette-panel"));

/**
 * `withShortcut` exists so a second instance can be rendered inside the mobile
 * menu panel without two Ctrl+K listeners racing to open both palettes at once
 * (the header's instance stays mounted and inert behind the open panel).
 */
export function CommandPalette({ withShortcut = true }: { withShortcut?: boolean }) {
  const [open, setOpen] = React.useState(false);
  const [hasOpened, setHasOpened] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const [status, setStatus] = React.useState("");

  const openPalette = React.useCallback(() => {
    setHasOpened(true);
    setOpen(true);
  }, []);

  React.useEffect(() => {
    if (!withShortcut) {
      return;
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() !== "k" || (!event.ctrlKey && !event.metaKey)) {
        return;
      }
      if (isEditableTarget(event.target)) {
        return;
      }
      event.preventDefault();
      openPalette();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openPalette, withShortcut]);

  return (
    <>
      <CommandPaletteTrigger onOpen={openPalette} ref={triggerRef} />
      {hasOpened ? (
        <React.Suspense fallback={null}>
          <CommandPalettePanel
            onOpenChange={setOpen}
            onStatus={setStatus}
            open={open}
            triggerRef={triggerRef}
          />
        </React.Suspense>
      ) : null}
      <p aria-live="polite" className="sr-only">
        {status}
      </p>
    </>
  );
}
