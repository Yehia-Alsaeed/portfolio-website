"use client";

import * as React from "react";

import type { ContactMessageDto } from "@/features/admin/analytics/model";

import { setMessageReadAction } from "./actions";
import styles from "./inbox.module.css";

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(iso));
}

export function MessageRow({ message }: Readonly<{ message: ContactMessageDto }>) {
  const [isRead, setIsRead] = React.useState(message.isRead);
  const [isPending, startTransition] = React.useTransition();

  function toggleRead() {
    const next = !isRead;
    setIsRead(next);
    startTransition(async () => {
      const result = await setMessageReadAction(message.id, next);
      if (result.status !== "success") setIsRead(!next);
    });
  }

  return (
    <button
      aria-label={`Mark message from ${message.name} as ${isRead ? "unread" : "read"}`}
      aria-pressed={!isRead}
      className={styles.row}
      data-unread={!isRead || undefined}
      disabled={isPending}
      onClick={toggleRead}
      type="button"
    >
      <span aria-hidden="true" className={styles.status} />
      <span>
        {message.name} / {message.inquiryType}
      </span>
      <span className={styles.preview}>{message.message.slice(0, 96)}</span>
      <time dateTime={message.createdAt}>{formatDate(message.createdAt)}</time>
    </button>
  );
}
