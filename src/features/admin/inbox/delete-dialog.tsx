"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { deleteMessageAction } from "./actions";
import styles from "./inbox.module.css";

export function DeleteDialog({ id, name }: Readonly<{ id: string; name: string }>) {
  const [open, setOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

  function confirmDelete() {
    startTransition(async () => {
      await deleteMessageAction(id);
      setOpen(false);
    });
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <div className={styles.deleteForm}>
        <DialogTrigger asChild>
          <button type="button">Delete message from {name}</button>
        </DialogTrigger>
      </div>
      <DialogContent role="alertdialog">
        <DialogTitle>Delete this message?</DialogTitle>
        <DialogDescription>
          Confirm permanent deletion of the message from {name}.
        </DialogDescription>
        <div className={styles.deleteConfirm}>
          <p>This permanently deletes the message from {name}. This cannot be undone.</p>
          <div className={styles.deleteActions}>
            <Button
              disabled={isPending}
              onClick={() => setOpen(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button disabled={isPending} onClick={confirmDelete} type="button" variant="primary">
              {isPending ? "Deleting" : "Delete"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
