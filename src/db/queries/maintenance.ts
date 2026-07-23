import { sql } from "drizzle-orm";

import { getDatabase } from "@/db/client";
import {
  analyticsDailyAggregates,
  analyticsEvents,
  rateLimitBuckets,
  type AggregateDimension,
} from "@/db/schema";

export type MaintenanceResult = {
  aggregateRows: number;
  deletedEvents: number;
  deletedBuckets: number;
};

const RETENTION_DAYS = 90;

function utcDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function utcMidnight(dateOnly: string): Date {
  return new Date(`${dateOnly}T00:00:00.000Z`);
}

function subtractUtcCalendarDays(dateOnly: string, days: number): string {
  const [year, month, day] = dateOnly.split("-").map(Number) as [number, number, number];
  const date = new Date(Date.UTC(year, month - 1, day));

  date.setUTCDate(date.getUTCDate() - days);

  return date.toISOString().slice(0, 10);
}

const DIMENSION_COLUMNS = {
  path: analyticsEvents.path,
  referrer: analyticsEvents.referrerDomain,
  country: analyticsEvents.country,
  device: analyticsEvents.device,
  browser: analyticsEvents.browser,
  os: analyticsEvents.os,
  screen: analyticsEvents.screen,
} as const;

function buildAggregateInsert(dimension: AggregateDimension, from: Date, to: Date) {
  const dimensionValueExpr =
    dimension === "overall" ? sql`'all'` : sql`${DIMENSION_COLUMNS[dimension]}`;

  return sql`
    insert into ${analyticsDailyAggregates}
      (${analyticsDailyAggregates.date}, ${analyticsDailyAggregates.eventType}, ${analyticsDailyAggregates.dimension}, ${analyticsDailyAggregates.dimensionValue}, ${analyticsDailyAggregates.eventCount}, ${analyticsDailyAggregates.uniqueVisitors})
    select
      (${analyticsEvents.createdAt} at time zone 'utc')::date,
      ${analyticsEvents.type},
      ${dimension}::aggregate_dimension,
      ${dimensionValueExpr},
      count(*),
      count(distinct ${analyticsEvents.visitorHash})
    from ${analyticsEvents}
    where ${analyticsEvents.createdAt} >= ${from} and ${analyticsEvents.createdAt} < ${to}
    group by 1, 2, 4
  `;
}

export async function runMaintenance(now: Date): Promise<MaintenanceResult> {
  const todayUtc = utcDateOnly(now);
  const retentionStartUtc = subtractUtcCalendarDays(todayUtc, RETENTION_DAYS);
  const todayInstant = utcMidnight(todayUtc);
  const retentionCutoffInstant = utcMidnight(retentionStartUtc);

  const db = getDatabase();

  const results = await db.batch([
    db.execute(sql`
      delete from ${analyticsDailyAggregates}
      where ${analyticsDailyAggregates.date} >= ${retentionStartUtc}
        and ${analyticsDailyAggregates.date} < ${todayUtc}
    `),
    db.execute(buildAggregateInsert("overall", retentionCutoffInstant, todayInstant)),
    db.execute(buildAggregateInsert("path", retentionCutoffInstant, todayInstant)),
    db.execute(buildAggregateInsert("referrer", retentionCutoffInstant, todayInstant)),
    db.execute(buildAggregateInsert("country", retentionCutoffInstant, todayInstant)),
    db.execute(buildAggregateInsert("device", retentionCutoffInstant, todayInstant)),
    db.execute(buildAggregateInsert("browser", retentionCutoffInstant, todayInstant)),
    db.execute(buildAggregateInsert("os", retentionCutoffInstant, todayInstant)),
    db.execute(buildAggregateInsert("screen", retentionCutoffInstant, todayInstant)),
    db.execute(sql`
      delete from ${analyticsEvents}
      where ${analyticsEvents.createdAt} < ${retentionCutoffInstant}
    `),
    db.execute(sql`
      delete from ${rateLimitBuckets}
      where ${rateLimitBuckets.expiresAt} < ${now}
    `),
  ]);

  const insertResults = results.slice(1, 9);
  const deleteEventsResult = results[9]!;
  const deleteBucketsResult = results[10]!;

  return {
    aggregateRows: insertResults.reduce((sum, result) => sum + (result.rowCount ?? 0), 0),
    deletedEvents: deleteEventsResult.rowCount ?? 0,
    deletedBuckets: deleteBucketsResult.rowCount ?? 0,
  };
}
