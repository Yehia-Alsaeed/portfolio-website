import { char, index, integer, pgTable, primaryKey, timestamp, varchar } from "drizzle-orm/pg-core";

export const rateLimitBuckets = pgTable(
  "rate_limit_buckets",
  {
    scope: varchar({ length: 32 }).notNull(),
    keyHash: char({ length: 64 }).notNull(),
    windowStart: timestamp({ withTimezone: true, mode: "date" }).notNull(),
    requestCount: integer().notNull().default(1),
    expiresAt: timestamp({ withTimezone: true, mode: "date" }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.scope, table.keyHash, table.windowStart] }),
    index("rate_limit_buckets_expires_at_idx").on(table.expiresAt),
  ],
);
