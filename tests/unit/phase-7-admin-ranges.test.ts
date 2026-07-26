import { describe, expect, it } from "vitest";

import {
  buildAdminRangeWindow,
  decodeContactCursor,
  encodeContactCursor,
  parseAdminRange,
} from "@/features/admin/analytics/ranges";

const NOW = new Date("2026-07-26T04:30:00Z");

describe("Phase 7 admin range handling", () => {
  it("defaults unknown, missing, and repeated ranges to 30d", () => {
    expect(parseAdminRange(undefined)).toBe("30d");
    expect(parseAdminRange("bogus")).toBe("30d");
    expect(parseAdminRange(["7d", "90d"])).toBe("30d");
  });

  it("keeps approved single ranges closed", () => {
    expect(parseAdminRange("24h")).toBe("24h");
    expect(parseAdminRange("7d")).toBe("7d");
    expect(parseAdminRange("30d")).toBe("30d");
    expect(parseAdminRange("90d")).toBe("90d");
  });

  it("builds exactly 24 hourly buckets for the 24h raw-event window", () => {
    const window = buildAdminRangeWindow("24h", NOW);

    expect(window.usesRawOnly).toBe(true);
    expect(window.start.toISOString()).toBe("2026-07-25T04:30:00.000Z");
    expect(window.todayStart.toISOString()).toBe("2026-07-26T00:00:00.000Z");
    expect(window.end.toISOString()).toBe(NOW.toISOString());
    expect(window.buckets).toHaveLength(24);
    expect(window.buckets[0]).toEqual({
      key: "2026-07-25T05:00:00.000Z",
      start: new Date("2026-07-25T05:00:00.000Z"),
    });
  });

  it("builds UTC daily windows for aggregate-backed ranges", () => {
    const window = buildAdminRangeWindow("7d", NOW);

    expect(window.usesRawOnly).toBe(false);
    expect(window.start.toISOString()).toBe("2026-07-20T00:00:00.000Z");
    expect(window.completedAggregateEnd.toISOString()).toBe("2026-07-26T00:00:00.000Z");
    expect(window.buckets.map((bucket) => bucket.key)).toEqual([
      "2026-07-20",
      "2026-07-21",
      "2026-07-22",
      "2026-07-23",
      "2026-07-24",
      "2026-07-25",
      "2026-07-26",
    ]);
  });
});

describe("Phase 7 contact cursor handling", () => {
  it("round-trips versioned base64url cursors", () => {
    const cursor = { createdAt: "2026-07-26T04:00:00.000Z", id: "2d6c56f8-11e9-4d88-b98a-57d8d01cf8f3" };

    expect(decodeContactCursor(encodeContactCursor(cursor), NOW)).toEqual({
      createdAt: new Date(cursor.createdAt),
      id: cursor.id,
    });
  });

  it("fails closed on invalid, garbage, and future cursors", () => {
    expect(decodeContactCursor("not-base64", NOW)).toBeUndefined();
    expect(decodeContactCursor(Buffer.from(JSON.stringify({ v: 2 })).toString("base64url"), NOW)).toBeUndefined();
    expect(
      decodeContactCursor(
        encodeContactCursor({
          createdAt: "2026-07-27T00:00:00.000Z",
          id: "2d6c56f8-11e9-4d88-b98a-57d8d01cf8f3",
        }),
        NOW,
      ),
    ).toBeUndefined();
  });
});
