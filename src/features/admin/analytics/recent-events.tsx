import type { RecentEvent } from "./model";
import styles from "../admin.module.css";

const EVENT_LABELS: Record<RecentEvent["type"], string> = {
  contact_submit: "Contact submitted",
  cv_download: "CV downloaded",
  project_click: "Project opened",
};

function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(iso));
}

export function RecentEvents({ events }: Readonly<{ events: RecentEvent[] }>) {
  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <h2>Recent events</h2>
        <span>Latest 20</span>
      </div>
      {events.length === 0 ? (
        <p className={styles.empty}>No recent events for this range.</p>
      ) : (
        <ul className={styles.eventList}>
          {events.map((event) => (
            <li key={event.id}>
              <time dateTime={event.createdAt}>{formatTime(event.createdAt)}</time>
              <span>{EVENT_LABELS[event.type]}</span>
              <em>{event.path}</em>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
