import type { AdminOverview } from "./model";
import { ADMIN_RANGES } from "./model";
import { BreakdownTable } from "./breakdown-table";
import { RangeControl } from "./range-control";
import { RecentEvents } from "./recent-events";
import { TrendChart } from "./trend-chart";
import styles from "../admin.module.css";

const RANGE_LABELS = {
  "24h": "Last 24 hours",
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
} as const;

const METRICS = [
  ["visitors", "Unique visitors"],
  ["pageViews", "Page views"],
  ["cvDownloads", "CV downloads"],
  ["contactSubmissions", "Contact inquiries"],
] as const;

export function AdminDashboard({ overview }: Readonly<{ overview: AdminOverview }>) {
  return (
    <section className={styles.dashboard}>
      <div className={styles.titleRow}>
        <div>
          <h1>Portfolio pulse.</h1>
          <p>Visitors are summed daily uniques. ZZ means unknown country.</p>
        </div>
        <div className={styles.titleMeta}>
          <span>{RANGE_LABELS[overview.range]}</span>
          <RangeControl current={overview.range} ranges={ADMIN_RANGES} />
        </div>
      </div>

      <div className={styles.metrics}>
        {METRICS.map(([key, label]) => (
          <div className={styles.metric} key={key}>
            <strong>{overview.totals[key].toLocaleString("en-US")}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>

      <div className={styles.grid}>
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <span>Visitors and views</span>
            <span>{overview.range}</span>
          </div>
          <TrendChart data={overview.trend} />
        </section>
        <BreakdownTable rows={overview.breakdowns.sources} title="Top sources" valueLabel="Views" />
        <BreakdownTable rows={overview.breakdowns.pages} title="Top pages" valueLabel="Views" />
        <BreakdownTable rows={overview.breakdowns.countries} title="Countries" valueLabel="Views" />
        <BreakdownTable rows={overview.breakdowns.devices} title="Devices" valueLabel="Views" />
        <BreakdownTable rows={overview.breakdowns.browsers} title="Browsers" valueLabel="Views" />
        <RecentEvents events={overview.recentEvents} />
      </div>
    </section>
  );
}
