import { sql, type SQL } from "drizzle-orm";

import { getDatabase } from "@/db/client";
import { analyticsDailyAggregates, analyticsEvents, contactMessages } from "@/db/schema";
import { requireAdmin } from "@/features/admin/auth/authorize";
import type {
  AdminOverview,
  AdminRange,
  BreakdownRow,
  RecentEvent,
} from "@/features/admin/analytics/model";
import { buildAdminRangeWindow } from "@/features/admin/analytics/ranges";

export const ADMIN_OVERVIEW_QUERY_SHAPE = {
  ranges: ["24h", "7d", "30d", "90d"],
  breakdownDimensions: ["path", "referrer", "country", "device", "browser"],
  breakdownLimit: 8,
  recentEventTypes: ["project_click", "cv_download", "contact_submit"],
  recentEventLimit: 20,
} as const;

type QueryResult = unknown[] | { rows?: unknown[] };
type Row = Record<string, unknown>;

function rowsOf(result: QueryResult): Row[] {
  return (Array.isArray(result) ? result : (result.rows ?? [])) as Row[];
}

function safeNumber(value: unknown): number {
  const number = typeof value === "bigint" ? Number(value) : Number(value ?? 0);
  if (!Number.isSafeInteger(number) || number < 0) {
    throw new Error("Admin query returned an unsafe numeric value.");
  }
  return number;
}

function dateValue(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function trendMap(rows: Row[]): Map<string, { pageViews: number; visitors: number }> {
  return new Map(
    rows.map((row) => [
      String(row.bucket),
      {
        pageViews: safeNumber(row.pageViews ?? row.page_views),
        visitors: safeNumber(row.visitors),
      },
    ]),
  );
}

function mapBreakdown(rows: Row[]): BreakdownRow[] {
  return rows.slice(0, ADMIN_OVERVIEW_QUERY_SHAPE.breakdownLimit).map((row) => ({
    label: String(row.label ?? row.dimensionValue ?? row.dimension_value ?? ""),
    value: safeNumber(row.value ?? row.eventCount ?? row.event_count),
    visitors: safeNumber(row.visitors ?? row.uniqueVisitors ?? row.unique_visitors),
  }));
}

function mapRecent(rows: Row[]): RecentEvent[] {
  return rows.slice(0, ADMIN_OVERVIEW_QUERY_SHAPE.recentEventLimit).map((row) => ({
    id: safeNumber(row.id),
    type: row.type as RecentEvent["type"],
    path: String(row.path),
    createdAt: (row.createdAt instanceof Date
      ? row.createdAt
      : new Date(String(row.created_at))
    ).toISOString(),
  }));
}

async function executeRows(
  db: ReturnType<typeof getDatabase>,
  query: ReturnType<typeof sql>,
): Promise<Row[]> {
  return rowsOf((await db.execute(query)) as QueryResult);
}

function pageViewTotalQuery(window: ReturnType<typeof buildAdminRangeWindow>): SQL {
  if (window.usesRawOnly) {
    return sql`select count(*)::bigint as value
        from ${analyticsEvents}
        where ${analyticsEvents.type} = 'page_view'
          and ${analyticsEvents.createdAt} >= ${window.start}
          and ${analyticsEvents.createdAt} <= ${window.end}`;
  }

  return sql`select (
        select coalesce(sum(${analyticsDailyAggregates.eventCount}), 0)::bigint
        from ${analyticsDailyAggregates}
        where ${analyticsDailyAggregates.dimension} = 'overall'
          and ${analyticsDailyAggregates.eventType} = 'page_view'
          and ${analyticsDailyAggregates.date} >= ${dateValue(window.start)}
          and ${analyticsDailyAggregates.date} < ${dateValue(window.completedAggregateEnd)}
      ) + (
        select count(*)::bigint
        from ${analyticsEvents}
        where ${analyticsEvents.type} = 'page_view'
          and ${analyticsEvents.createdAt} >= ${window.todayStart}
          and ${analyticsEvents.createdAt} <= ${window.end}
      ) as value`;
}

function visitorTotalQuery(window: ReturnType<typeof buildAdminRangeWindow>): SQL {
  if (window.usesRawOnly) {
    return sql`select count(distinct ${analyticsEvents.visitorHash})::bigint as value
        from ${analyticsEvents}
        where ${analyticsEvents.type} = 'page_view'
          and ${analyticsEvents.createdAt} >= ${window.start}
          and ${analyticsEvents.createdAt} <= ${window.end}`;
  }

  return sql`select (
        select coalesce(sum(${analyticsDailyAggregates.uniqueVisitors}), 0)::bigint
        from ${analyticsDailyAggregates}
        where ${analyticsDailyAggregates.dimension} = 'overall'
          and ${analyticsDailyAggregates.eventType} = 'page_view'
          and ${analyticsDailyAggregates.date} >= ${dateValue(window.start)}
          and ${analyticsDailyAggregates.date} < ${dateValue(window.completedAggregateEnd)}
      ) + (
        select count(distinct ${analyticsEvents.visitorHash})::bigint
        from ${analyticsEvents}
        where ${analyticsEvents.type} = 'page_view'
          and ${analyticsEvents.createdAt} >= ${window.todayStart}
          and ${analyticsEvents.createdAt} <= ${window.end}
      ) as value`;
}

function trendQuery(window: ReturnType<typeof buildAdminRangeWindow>): SQL {
  if (window.usesRawOnly) {
    return sql`select date_trunc('hour', ${analyticsEvents.createdAt})::text as bucket,
             count(*)::bigint as page_views,
             count(distinct ${analyticsEvents.visitorHash})::bigint as visitors
          from ${analyticsEvents}
          where ${analyticsEvents.type} = 'page_view'
            and ${analyticsEvents.createdAt} >= ${window.start}
            and ${analyticsEvents.createdAt} <= ${window.end}
          group by bucket
          order by bucket asc`;
  }

  return sql`select bucket, sum(page_views)::bigint as page_views, sum(visitors)::bigint as visitors
      from (
        select ${analyticsDailyAggregates.date}::text as bucket,
          coalesce(sum(${analyticsDailyAggregates.eventCount}), 0)::bigint as page_views,
          coalesce(sum(${analyticsDailyAggregates.uniqueVisitors}), 0)::bigint as visitors
        from ${analyticsDailyAggregates}
        where ${analyticsDailyAggregates.dimension} = 'overall'
          and ${analyticsDailyAggregates.eventType} = 'page_view'
          and ${analyticsDailyAggregates.date} >= ${dateValue(window.start)}
          and ${analyticsDailyAggregates.date} < ${dateValue(window.completedAggregateEnd)}
        group by ${analyticsDailyAggregates.date}
        union all
        select (${analyticsEvents.createdAt} at time zone 'utc')::date::text as bucket,
          count(*)::bigint as page_views,
          count(distinct ${analyticsEvents.visitorHash})::bigint as visitors
        from ${analyticsEvents}
        where ${analyticsEvents.type} = 'page_view'
          and ${analyticsEvents.createdAt} >= ${window.todayStart}
          and ${analyticsEvents.createdAt} <= ${window.end}
        group by bucket
      ) trend_rows
      group by bucket
      order by bucket asc`;
}

export async function readAdminOverview(input: {
  range: AdminRange;
  now?: Date;
}): Promise<AdminOverview> {
  await requireAdmin();

  const now = input.now ?? new Date();
  const window = buildAdminRangeWindow(input.range, now);
  const db = getDatabase();

  const [
    pageViewRows,
    visitorRows,
    cvRows,
    contactRows,
    trendRows,
    pageRows,
    sourceRows,
    countryRows,
    deviceRows,
    browserRows,
    recentRows,
  ] = await Promise.all([
    executeRows(db, pageViewTotalQuery(window)),
    executeRows(db, visitorTotalQuery(window)),
    executeRows(
      db,
      sql`select count(*)::bigint as value
          from ${analyticsEvents}
          where ${analyticsEvents.type} = 'cv_download'
            and ${analyticsEvents.createdAt} >= ${window.start}
            and ${analyticsEvents.createdAt} <= ${window.end}`,
    ),
    executeRows(
      db,
      sql`select count(*)::bigint as value
          from ${contactMessages}
          where ${contactMessages.createdAt} >= ${window.start}
            and ${contactMessages.createdAt} <= ${window.end}`,
    ),
    executeRows(db, trendQuery(window)),
    readBreakdownRows(db, "path", window),
    readBreakdownRows(db, "referrer", window),
    readBreakdownRows(db, "country", window),
    readBreakdownRows(db, "device", window),
    readBreakdownRows(db, "browser", window),
    executeRows(
      db,
      sql`select ${analyticsEvents.id}, ${analyticsEvents.type}, ${analyticsEvents.path}, ${analyticsEvents.createdAt}
          from ${analyticsEvents}
          where ${analyticsEvents.type} in ('project_click', 'cv_download', 'contact_submit')
            and ${analyticsEvents.createdAt} >= ${window.start}
            and ${analyticsEvents.createdAt} <= ${window.end}
          order by ${analyticsEvents.createdAt} desc, ${analyticsEvents.id} desc
          limit ${ADMIN_OVERVIEW_QUERY_SHAPE.recentEventLimit}`,
    ),
  ]);

  const mappedTrend = trendMap(trendRows);

  return {
    range: input.range,
    totals: {
      visitors: safeNumber(visitorRows[0]?.value),
      pageViews: safeNumber(pageViewRows[0]?.value),
      contactSubmissions: safeNumber(contactRows[0]?.value),
      cvDownloads: safeNumber(cvRows[0]?.value),
    },
    trend: window.buckets.map((bucket) => ({
      bucket: bucket.key,
      pageViews: mappedTrend.get(bucket.key)?.pageViews ?? 0,
      visitors: mappedTrend.get(bucket.key)?.visitors ?? 0,
    })),
    breakdowns: {
      pages: mapBreakdown(pageRows),
      sources: mapBreakdown(sourceRows),
      countries: mapBreakdown(countryRows),
      devices: mapBreakdown(deviceRows),
      browsers: mapBreakdown(browserRows),
    },
    recentEvents: mapRecent(recentRows),
  };
}

function readBreakdownRows(
  db: ReturnType<typeof getDatabase>,
  dimension: "path" | "referrer" | "country" | "device" | "browser",
  window: ReturnType<typeof buildAdminRangeWindow>,
): Promise<Row[]> {
  const eventColumn = {
    path: analyticsEvents.path,
    referrer: analyticsEvents.referrerDomain,
    country: analyticsEvents.country,
    device: analyticsEvents.device,
    browser: analyticsEvents.browser,
  }[dimension];

  if (window.usesRawOnly) {
    return executeRows(
      db,
      sql`select ${eventColumn} as label,
             count(*)::bigint as value,
             count(distinct ${analyticsEvents.visitorHash})::bigint as visitors
          from ${analyticsEvents}
          where ${analyticsEvents.type} = 'page_view'
            and ${analyticsEvents.createdAt} >= ${window.start}
            and ${analyticsEvents.createdAt} <= ${window.end}
          group by ${eventColumn}
          order by value desc, ${eventColumn} asc
          limit ${ADMIN_OVERVIEW_QUERY_SHAPE.breakdownLimit}`,
    );
  }

  return executeRows(
    db,
    sql`select label, sum(value)::bigint as value, sum(visitors)::bigint as visitors
      from (
        select ${analyticsDailyAggregates.dimensionValue} as label,
          coalesce(sum(${analyticsDailyAggregates.eventCount}), 0)::bigint as value,
          coalesce(sum(${analyticsDailyAggregates.uniqueVisitors}), 0)::bigint as visitors
        from ${analyticsDailyAggregates}
        where ${analyticsDailyAggregates.dimension} = ${dimension}
          and ${analyticsDailyAggregates.eventType} = 'page_view'
          and ${analyticsDailyAggregates.date} >= ${dateValue(window.start)}
          and ${analyticsDailyAggregates.date} < ${dateValue(window.completedAggregateEnd)}
        group by ${analyticsDailyAggregates.dimensionValue}
        union all
        select ${eventColumn} as label,
          count(*)::bigint as value,
          count(distinct ${analyticsEvents.visitorHash})::bigint as visitors
        from ${analyticsEvents}
        where ${analyticsEvents.type} = 'page_view'
          and ${analyticsEvents.createdAt} >= ${window.todayStart}
          and ${analyticsEvents.createdAt} <= ${window.end}
        group by ${eventColumn}
      ) breakdown_rows
      group by label
      order by value desc, label asc
      limit ${ADMIN_OVERVIEW_QUERY_SHAPE.breakdownLimit}`,
  );
}
