"use client";

import { Area, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import styles from "../admin.module.css";

export function TrendChart({
  data,
}: Readonly<{ data: Array<{ bucket: string; pageViews: number; visitors: number }> }>) {
  const hasData = data.some((row) => row.pageViews > 0 || row.visitors > 0);

  return (
    <div className={styles.chartArea}>
      <div aria-label="Visitors and page views trend" role="img">
        <ResponsiveContainer height={250} width="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="var(--soft)" vertical={false} />
            <XAxis dataKey="bucket" hide />
            <YAxis allowDecimals={false} hide />
            <Tooltip isAnimationActive={false} />
            <Area
              dataKey="pageViews"
              fill="var(--accent)"
              fillOpacity={0.08}
              isAnimationActive={false}
              stroke="none"
              type="monotone"
            />
            <Line
              dataKey="pageViews"
              dot={false}
              isAnimationActive={false}
              stroke="var(--accent)"
              strokeWidth={3}
              type="monotone"
            />
            <Line
              dataKey="visitors"
              dot={false}
              isAnimationActive={false}
              stroke="var(--ink)"
              strokeWidth={2}
              type="monotone"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {hasData ? null : <p className={styles.empty}>No activity recorded for this range yet.</p>}
      <table className={styles.dataTable}>
        <caption>Trend data</caption>
        <thead>
          <tr>
            <th>Bucket</th>
            <th>Views</th>
            <th>Visitors</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.bucket}>
              <td>{row.bucket}</td>
              <td>{row.pageViews.toLocaleString("en-US")}</td>
              <td>{row.visitors.toLocaleString("en-US")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
