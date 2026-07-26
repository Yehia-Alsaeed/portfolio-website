import Link from "next/link";
import type { Route } from "next";
import type { ReactNode } from "react";

import { logoutAction } from "./auth/actions";
import styles from "./admin.module.css";

export function AdminShell({
  active = "overview",
  children,
  unreadCount,
}: Readonly<{
  active?: "overview" | "inbox";
  children: ReactNode;
  unreadCount?: number;
}>) {
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <Link aria-label="Admin overview" className={styles.logo} href={"/admin" as Route}>
          YA<b>.</b>
        </Link>
        <nav aria-label="Admin views" className={styles.nav}>
          <Link aria-current={active === "overview" ? "page" : undefined} href={"/admin" as Route}>
            Overview
          </Link>
          <Link
            aria-current={active === "inbox" ? "page" : undefined}
            href={"/admin/inbox" as Route}
          >
            Inbox
            {typeof unreadCount === "number" ? <span>{unreadCount}</span> : null}
          </Link>
        </nav>
        <form action={logoutAction} className={styles.logoutForm}>
          <button type="submit">Sign out</button>
        </form>
        <p className={styles.user}>YEHIA / ADMIN</p>
      </aside>
      <main className={styles.main} id="admin-content" tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}
