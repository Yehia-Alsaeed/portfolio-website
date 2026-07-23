import {
  bigint,
  char,
  date,
  index,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const ANALYTICS_EVENT_TYPES = [
  "page_view",
  "project_click",
  "cv_download",
  "contact_submit",
  "outbound_click",
] as const;
export type AnalyticsEventType = (typeof ANALYTICS_EVENT_TYPES)[number];

export const analyticsEventTypeEnum = pgEnum("analytics_event_type", ANALYTICS_EVENT_TYPES);

export const AGGREGATE_DIMENSIONS = [
  "overall",
  "path",
  "referrer",
  "country",
  "device",
  "browser",
  "os",
  "screen",
] as const;
export type AggregateDimension = (typeof AGGREGATE_DIMENSIONS)[number];

export const aggregateDimensionEnum = pgEnum("aggregate_dimension", AGGREGATE_DIMENSIONS);

export const analyticsEvents = pgTable(
  "analytics_events",
  {
    id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
    type: analyticsEventTypeEnum().notNull(),
    path: varchar({ length: 512 }).notNull(),
    referrerDomain: varchar({ length: 253 }).notNull().default("direct"),
    country: varchar({ length: 2 }).notNull().default("ZZ"),
    device: varchar({ length: 16 }).notNull(),
    browser: varchar({ length: 16 }).notNull(),
    os: varchar({ length: 16 }).notNull(),
    screen: varchar({ length: 16 }).notNull(),
    visitorHash: char({ length: 64 }).notNull(),
    metadata: jsonb().$type<Record<string, string>>().notNull().default({}),
    createdAt: timestamp({ withTimezone: true, mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    index("analytics_events_created_at_id_idx").on(table.createdAt, table.id),
    index("analytics_events_type_created_at_idx").on(table.type, table.createdAt),
    index("analytics_events_path_created_at_idx").on(table.path, table.createdAt),
    index("analytics_events_visitor_hash_created_at_idx").on(table.visitorHash, table.createdAt),
  ],
);

export const analyticsDailyAggregates = pgTable(
  "analytics_daily_aggregates",
  {
    date: date({ mode: "string" }).notNull(),
    eventType: analyticsEventTypeEnum().notNull(),
    dimension: aggregateDimensionEnum().notNull(),
    dimensionValue: varchar({ length: 512 }).notNull(),
    eventCount: bigint({ mode: "number" }).notNull(),
    uniqueVisitors: bigint({ mode: "number" }).notNull(),
    updatedAt: timestamp({ withTimezone: true, mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    primaryKey({
      columns: [table.date, table.eventType, table.dimension, table.dimensionValue],
    }),
  ],
);
