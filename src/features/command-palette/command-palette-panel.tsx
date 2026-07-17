"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
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
import { useDisplayMode } from "@/features/display-mode/provider";

import { COMMAND_GROUPS, SITE_COMMANDS, type PaletteCommand } from "./commands";

type CommandPalettePanelProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
};

export default function CommandPalettePanel({
  onOpenChange,
  open,
  triggerRef,
}: CommandPalettePanelProps) {
  const router = useRouter();
  const { setMode } = useDisplayMode();

  function runCommand(command: PaletteCommand) {
    onOpenChange(false);
    if (command.kind === "navigate") {
      // The command hrefs point at routes owned by later-phase tasks, so they
      // are asserted as Route rather than inferred from the current route set.
      router.push(command.href as Route);
      return;
    }
    setMode(command.mode);
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
