"use client";

import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { HOME_STATS } from "@/content/homepage";
import { PROFILE } from "@/content/profile";

import type { PosterTemplate } from "./poster-mode-provider";

type PosterModeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRemix: () => void;
  template: PosterTemplate;
};

export default function PosterModeDialog({
  onOpenChange,
  onRemix,
  open,
  template,
}: PosterModeDialogProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent
        className="top-[4svh] max-h-[92svh] w-[min(920px,calc(100vw-32px))] overflow-y-auto"
        closeLabel="Close poster"
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          document.querySelector<HTMLButtonElement>('[aria-label="Open command palette"]')?.focus();
        }}
      >
        <DialogTitle>Poster Mode</DialogTitle>
        <DialogDescription>
          An alternate poster composition made from the portfolio&apos;s real profile and project
          data.
        </DialogDescription>
        <div
          className="bg-paper text-ink border-line m-4 grid min-h-[min(68svh,680px)] border-2 p-5 sm:p-8"
          data-poster-template={template}
        >
          {template === "index" ? (
            <div className="grid content-between gap-10">
              <p className="text-[clamp(7rem,30vw,17rem)] leading-[0.72] font-black font-stretch-[125%]">
                YA<span className="text-accent-text">.</span>
              </p>
              <div className="border-line grid gap-4 border-t-2 pt-5 md:grid-cols-[1.4fr_1fr] md:items-end">
                <p className="text-[clamp(2.5rem,8vw,5.5rem)] leading-[0.85] font-black">
                  {PROFILE.name}
                </p>
                <div className="font-mono text-xs tracking-[0.1em] uppercase">
                  <p>{PROFILE.role}</p>
                  <p>{PROFILE.location}</p>
                  <p className="text-accent-text mt-3">{PROFILE.status}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-rows-[auto_1fr_auto] gap-8">
              <p className="font-mono text-xs tracking-[0.14em] uppercase">
                Evidence / Selected metrics
              </p>
              <div className="grid content-center gap-4 sm:grid-cols-[1.2fr_1fr] sm:items-end">
                <p className="text-[clamp(7rem,28vw,16rem)] leading-[0.7] font-black font-stretch-[125%]">
                  YA<span className="text-accent-text">.</span>
                </p>
                <div className="border-line grid grid-cols-2 border-2">
                  <div className="border-line border-r p-4">
                    <strong className="block font-mono text-4xl">{HOME_STATS[1].value}</strong>
                    <span className="text-dim font-mono text-[0.625rem] uppercase">mIoU</span>
                  </div>
                  <div className="p-4">
                    <strong className="block font-mono text-4xl">{HOME_STATS[0].value}</strong>
                    <span className="text-dim font-mono text-[0.625rem] uppercase">Projects</span>
                  </div>
                </div>
              </div>
              <p className="border-line border-t-2 pt-4 font-mono text-xs tracking-[0.1em] uppercase">
                AI/ML systems + full-stack delivery
              </p>
            </div>
          )}
        </div>
        <div className="border-line flex justify-end border-t p-4">
          <Button onClick={onRemix} type="button" variant="outline">
            <RefreshCw aria-hidden="true" className="size-4" />
            Remix poster
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
