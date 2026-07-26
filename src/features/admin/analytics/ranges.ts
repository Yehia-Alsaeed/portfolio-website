import { ADMIN_RANGES, type AdminRange, type ContactCursor } from "./model";

const DEFAULT_ADMIN_RANGE: AdminRange = "30d";
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const RANGE_DAYS: Record<Exclude<AdminRange, "24h">, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
};
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type AdminRangeWindow = {
  range: AdminRange;
  start: Date;
  todayStart: Date;
  completedAggregateEnd: Date;
  end: Date;
  usesRawOnly: boolean;
  buckets: Array<{ key: string; start: Date }>;
};

function utcDayStart(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function utcHourStart(date: Date): Date {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      date.getUTCHours(),
    ),
  );
}

function formatDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function parseAdminRange(value: string | string[] | undefined): AdminRange {
  if (typeof value !== "string") return DEFAULT_ADMIN_RANGE;
  return (ADMIN_RANGES as readonly string[]).includes(value) ? (value as AdminRange) : DEFAULT_ADMIN_RANGE;
}

export function buildAdminRangeWindow(range: AdminRange, now: Date): AdminRangeWindow {
  const end = new Date(now);
  const todayStart = utcDayStart(end);

  if (range === "24h") {
    const start = new Date(end.getTime() - 24 * HOUR_MS);
    const firstBucket = new Date(utcHourStart(start).getTime() + HOUR_MS);
    const buckets = Array.from({ length: 24 }, (_, index) => {
      const bucketStart = new Date(firstBucket.getTime() + index * HOUR_MS);
      return { key: bucketStart.toISOString(), start: bucketStart };
    });

    return {
      range,
      start,
      todayStart,
      completedAggregateEnd: todayStart,
      end,
      usesRawOnly: true,
      buckets,
    };
  }

  const days = RANGE_DAYS[range];
  const start = new Date(todayStart.getTime() - (days - 1) * DAY_MS);
  const buckets = Array.from({ length: days }, (_, index) => {
    const bucketStart = new Date(start.getTime() + index * DAY_MS);
    return { key: formatDateKey(bucketStart), start: bucketStart };
  });

  return {
    range,
    start,
    todayStart,
    completedAggregateEnd: todayStart,
    end,
    usesRawOnly: false,
    buckets,
  };
}

export function encodeContactCursor(cursor: ContactCursor): string {
  return Buffer.from(JSON.stringify({ v: 1, ...cursor })).toString("base64url");
}

export function decodeContactCursor(
  cursor: string | string[] | undefined,
  now: Date,
): { createdAt: Date; id: string } | undefined {
  if (typeof cursor !== "string" || cursor.length > 256) return undefined;

  try {
    const parsed = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8")) as Partial<
      ContactCursor & { v: number }
    >;
    if (parsed.v !== 1 || typeof parsed.createdAt !== "string" || typeof parsed.id !== "string") {
      return undefined;
    }
    if (!UUID_PATTERN.test(parsed.id)) return undefined;

    const createdAt = new Date(parsed.createdAt);
    if (!Number.isFinite(createdAt.getTime()) || createdAt.getTime() > now.getTime()) return undefined;

    return { createdAt, id: parsed.id };
  } catch {
    return undefined;
  }
}
