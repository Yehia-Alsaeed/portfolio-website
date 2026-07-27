import type { ContactMessageDto } from "@/features/admin/analytics/model";

import styles from "./inbox.module.css";

export function MessageDialog({ message }: Readonly<{ message: ContactMessageDto }>) {
  return (
    <div className={styles.detail}>
      <h3>
        {message.name} - {message.inquiryType}
      </h3>
      <p>
        From {message.name} · <a href={`mailto:${message.email}`}>{message.email}</a>
      </p>
      <time dateTime={message.createdAt}>
        {new Intl.DateTimeFormat("en-US", {
          dateStyle: "full",
          timeStyle: "long",
          timeZone: "UTC",
        }).format(new Date(message.createdAt))}
      </time>
      <p className={styles.messageText}>
        {message.message.split("\n").map((line, index) => (
          <span key={`${message.id}-${index}`}>
            {line}
            {index < message.message.split("\n").length - 1 ? <br /> : null}
          </span>
        ))}
      </p>
    </div>
  );
}
