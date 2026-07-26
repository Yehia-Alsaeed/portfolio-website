"use client";

import styles from "@/features/admin/admin.module.css";

export default function AdminError({ reset }: Readonly<{ error: Error; reset: () => void }>) {
  return (
    <section className={styles.errorState} role="alert">
      <h1>Admin data is unavailable.</h1>
      <p>
        The dashboard could not load. Retry the request, or check the database and auth provider
        status.
      </p>
      <button onClick={reset} type="button">
        Retry
      </button>
    </section>
  );
}
