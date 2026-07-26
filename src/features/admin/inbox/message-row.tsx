import type { ContactMessageDto } from "@/features/admin/analytics/model";

import styles from "./inbox.module.css";

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(iso));
}

export function MessageRow({ message }: Readonly<{ message: ContactMessageDto }>) {
  return (
    <button className={styles.row} data-unread={!message.isRead || undefined} type="button">
      <span className={styles.status} />
      <span>
        {message.name} / {message.inquiryType}
      </span>
      <span className={styles.preview}>{message.message.slice(0, 96)}</span>
      <time dateTime={message.createdAt}>{formatDate(message.createdAt)}</time>
    </button>
  );
}
