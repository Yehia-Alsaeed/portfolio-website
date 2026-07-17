"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type * as React from "react";

import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

function DialogOverlay({ className, ...props }: DialogPrimitive.DialogOverlayProps) {
  return (
    <DialogPrimitive.Overlay
      className={cn("fixed inset-0 z-50 bg-[rgba(0,0,0,0.5)] backdrop-blur-[2px]", className)}
      {...props}
    />
  );
}

type DialogContentProps = DialogPrimitive.DialogContentProps & {
  closeLabel?: string;
};

function DialogContent({
  children,
  className,
  closeLabel = "Close dialog",
  ...props
}: DialogContentProps) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        className={cn(
          "fixed left-1/2 top-[14svh] z-50 flex max-h-[72svh] w-[min(640px,calc(100vw-32px))] -translate-x-1/2 flex-col border-2 border-line bg-paper text-ink",
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          aria-label={closeLabel}
          className="absolute right-0 top-0 inline-flex size-11 cursor-pointer items-center justify-center text-dim transition-colors hover:text-ink"
        >
          <X aria-hidden="true" className="size-4" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

function DialogTitle({ className, ...props }: DialogPrimitive.DialogTitleProps) {
  return (
    <DialogPrimitive.Title
      className={cn(
        "border-b border-line px-4 py-3.5 font-mono text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-dim",
        className,
      )}
      {...props}
    />
  );
}

function DialogDescription({ className, ...props }: DialogPrimitive.DialogDescriptionProps) {
  return <DialogPrimitive.Description className={cn("sr-only", className)} {...props} />;
}

export {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
};
export type { DialogContentProps };
