import Link from "next/link";
import type { Route } from "next";

import type { ContactPage } from "@/features/admin/analytics/model";
import adminStyles from "@/features/admin/admin.module.css";

import { DeleteDialog } from "./delete-dialog";
import { MessageDialog } from "./message-dialog";
import { MessageRow } from "./message-row";

export function Inbox({ page }: Readonly<{ page: ContactPage }>) {
  return (
    <section className={adminStyles.dashboard}>
      <div className={adminStyles.titleRow}>
        <div>
          <h1>Contact inbox.</h1>
          <p>Private messages are shown only to the configured administrator.</p>
        </div>
        <div className={adminStyles.titleMeta}>
          <span>{page.unreadCount.toLocaleString("en-US")} unread</span>
        </div>
      </div>

      <section className={adminStyles.panel}>
        <div className={adminStyles.panelHead}>
          <span>Newest messages</span>
          <span>20 per page</span>
        </div>
        {page.rows.length === 0 ? (
          <p className={adminStyles.empty}>No messages yet.</p>
        ) : (
          <div>
            {page.rows.map((message) => (
              <article key={message.id}>
                <MessageRow message={message} />
                <MessageDialog message={message} />
                <DeleteDialog id={message.id} name={message.name} />
              </article>
            ))}
          </div>
        )}
      </section>

      {page.nextCursor ? (
        <Link
          className={adminStyles.pageLink}
          href={`/admin/inbox?cursor=${page.nextCursor}` as Route}
        >
          Next page
        </Link>
      ) : null}
    </section>
  );
}
