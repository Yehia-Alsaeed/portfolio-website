"use client";

import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
import type * as React from "react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { PROFILE } from "@/content/profile";
import { getScreenClass, trackEvent } from "@/features/analytics/client";
import { useDisplayMode } from "@/features/display-mode/provider";
import { usePosterMode } from "@/features/poster-mode/poster-mode-provider";

import { COMMAND_GROUPS, SITE_COMMANDS, type PaletteCommand } from "./commands";

type CommandPalettePanelProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  onStatus: (status: string) => void;
};

export default function CommandPalettePanel({
  onOpenChange,
  open,
  onStatus,
  triggerRef,
}: CommandPalettePanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { setMode } = useDisplayMode();
  const { openPoster } = usePosterMode();

  async function copyEmail() {
    try {
      if (!navigator.clipboard) {
        throw new Error("Clipboard API unavailable");
      }
      await navigator.clipboard.writeText(PROFILE.email);
      onStatus("Email address copied");
    } catch {
      onStatus(`Copy failed. Email address: ${PROFILE.email}`);
      window.location.assign("/#contact");
    }
  }

  function runCommand(command: PaletteCommand) {
    onOpenChange(false);
    if (command.kind === "navigate") {
      // The command hrefs point at routes owned by later-phase tasks, so they
      // are asserted as Route rather than inferred from the current route set.
      router.push(command.href as Route);
      return;
    }
    if (command.kind === "display-mode") {
      setMode(command.mode);
      return;
    }
    if (command.kind === "poster-mode") {
      openPoster();
      return;
    }
    if (command.kind === "download-cv") {
      trackEvent({
        type: "cv_download",
        placement: "command-palette",
        path: pathname,
        screen: getScreenClass(window.innerWidth),
      });
      const anchor = document.createElement("a");
      anchor.href = PROFILE.cvUrl;
      anchor.download = "Yehia_Alsaeed_CV_AI.pdf";
      anchor.click();
      onStatus("CV download started");
      return;
    }
    void copyEmail();
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent
        closeLabel="Close command palette"
        onCloseAutoFocus={(event) => {
          // The palette is opened from an external trigger rather than a
          // Radix DialogTrigger, so focus restoration is wired manually.
          event.preventDefault();
          triggerRef.current?.focus();
        }}
      >
        <DialogTitle>Command palette</DialogTitle>
        <DialogDescription>
          Search for a page or a display mode, then press Enter to run the selected command.
        </DialogDescription>
        <Command label="Search commands">
          <CommandInput placeholder="Search commands" />
          <CommandList>
            <CommandEmpty>No matching commands</CommandEmpty>
            {COMMAND_GROUPS.map((group) => (
              <CommandGroup heading={group} key={group}>
                {SITE_COMMANDS.filter((command) => command.group === group).map((command) => (
                  <CommandItem
                    key={command.id}
                    keywords={[...command.keywords]}
                    onSelect={() => {
                      runCommand(command);
                    }}
                    value={command.label}
                  >
                    {command.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
