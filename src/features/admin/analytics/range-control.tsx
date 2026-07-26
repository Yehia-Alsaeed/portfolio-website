import Link from "next/link";
import type { Route } from "next";

import type { AdminRange } from "./model";
import styles from "../admin.module.css";

export function RangeControl({
  current,
  ranges,
}: Readonly<{ current: AdminRange; ranges: readonly AdminRange[] }>) {
  return (
    <nav aria-label="Dashboard range" className={styles.rangeNav}>
      {ranges.map((range) => (
        <Link
          aria-current={range === current ? "page" : undefined}
          href={(range === "30d" ? "/admin" : `/admin?range=${range}`) as Route}
          key={range}
        >
          {range}
        </Link>
      ))}
    </nav>
  );
}
