import type { BreakdownRow } from "./model";
import styles from "../admin.module.css";

const countryNames = new Intl.DisplayNames(["en"], { type: "region" });

function formatLabel(title: string, label: string): string {
  if (title === "Countries") {
    if (label === "ZZ") return "Unknown";
    try {
      return countryNames.of(label) ?? label;
    } catch {
      return label;
    }
  }
  if (title === "Top sources" && label === "direct") return "Direct";
  return label;
}

export function BreakdownTable({
  rows,
  title,
  valueLabel,
}: Readonly<{ rows: BreakdownRow[]; title: string; valueLabel: string }>) {
  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <span>{title}</span>
        <span>{valueLabel}</span>
      </div>
      {rows.length === 0 ? (
        <p className={styles.empty}>No rows for this range yet.</p>
      ) : (
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>{title}</th>
              <th>{valueLabel}</th>
              <th>Visitors</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label}>
                <td>{formatLabel(title, row.label)}</td>
                <td>{row.value.toLocaleString("en-US")}</td>
                <td>{row.visitors.toLocaleString("en-US")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
