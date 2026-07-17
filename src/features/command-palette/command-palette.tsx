"use client";

import * as React from "react";

import { CommandPaletteTrigger } from "./command-palette-trigger";

const CommandPalettePanel = React.lazy(() => import("./command-palette-panel"));

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  if (target.isContentEditable) {
    return true;
  }
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  );
}

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const [hasOpened, setHasOpened] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  const openPalette = React.useCallback(() => {
    setHasOpened(true);
    setOpen(true);
  }, []);

  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() !== "k" || (!event.ctrlKey && !event.metaKey)) {
        return;
      }
      if (isTypingTarget(event.target)) {
        return;
      }
      event.preventDefault();
      openPalette();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openPalette]);

  return (
    <>
      <CommandPaletteTrigger onOpen={openPalette} ref={triggerRef} />
      {hasOpened ? (
        <React.Suspense fallback={null}>
          <CommandPalettePanel onOpenChange={setOpen} open={open} triggerRef={triggerRef} />
        </React.Suspense>
      ) : null}
    </>
  );
}
