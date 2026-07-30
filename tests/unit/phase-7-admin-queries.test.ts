import { beforeEach, describe, expect, it, vi } from "vitest";

import { AdminAuthError } from "@/features/admin/auth/model";

const calls = vi.hoisted(() => ({
  order: [] as string[],
  execute: vi.fn(),
}));

const requireAdminMock = vi.hoisted(() =>
  vi.fn(async () => {
    calls.order.push("auth");
    return { id: "admin-user-id" };
  }),
);

vi.mock("@/features/admin/auth/authorize", () => ({
  requireAdmin: requireAdminMock,
}));

vi.mock("@/db/client", () => ({
  getDatabase: () => {
    calls.order.push("db");
    return { execute: calls.execute };
  },
}));

beforeEach(() => {
  calls.order.length = 0;
  calls.execute.mockReset();
  calls.execute.mockResolvedValue([]);
  requireAdminMock.mockClear();
});

describe("Phase 7 admin analytics queries", () => {
  it("authorizes before opening the database and returns a bounded empty DTO", async () => {
    const { readAdminOverview, ADMIN_OVERVIEW_QUERY_SHAPE } =
      await import("@/db/queries/admin-analytics");

    const overview = await readAdminOverview({
      range: "30d",
      now: new Date("2026-07-26T04:30:00Z"),
    });

    expect(calls.order.slice(0, 2)).toEqual(["auth", "db"]);
    expect(calls.execute).toHaveBeenCalledTimes(11);
    expect(ADMIN_OVERVIEW_QUERY_SHAPE.breakdownLimit).toBe(8);
    expect(ADMIN_OVERVIEW_QUERY_SHAPE.recentEventLimit).toBe(20);
    expect(ADMIN_OVERVIEW_QUERY_SHAPE.recentEventTypes).toEqual([
      "project_click",
      "cv_download",
      "contact_submit",
    ]);
    expect(overview.range).toBe("30d");
    expect(overview.trend).toHaveLength(30);
    expect(overview.totals).toEqual({
      visitors: 0,
      pageViews: 0,
      contactSubmissions: 0,
      cvDownloads: 0,
    });
    expect(overview.recentEvents).toEqual([]);
  });

  it("uses 24 raw hourly buckets for 24h", async () => {
    const { readAdminOverview } = await import("@/db/queries/admin-analytics");

    const overview = await readAdminOverview({
      range: "24h",
      now: new Date("2026-07-26T04:30:00Z"),
    });

    expect(overview.trend).toHaveLength(24);
    expect(overview.trend[0]).toEqual({
      bucket: "2026-07-25T05:00:00.000Z",
      pageViews: 0,
      visitors: 0,
    });
  });

  // The /admin/:path* proxy matcher is not the only thing gating this data:
  // Server Actions/route handlers can in principle be invoked outside the
  // path the matcher covers, so this query's own requireAdmin() check must
  // fail closed on its own, independent of whatever protected the request
  // on the way in.
  it("never touches the database when the caller is not an authorized admin", async () => {
    requireAdminMock.mockRejectedValueOnce(new AdminAuthError("anonymous"));
    const { readAdminOverview } = await import("@/db/queries/admin-analytics");

    await expect(
      readAdminOverview({ range: "30d", now: new Date("2026-07-26T04:30:00Z") }),
    ).rejects.toThrow(AdminAuthError);
    expect(calls.execute).not.toHaveBeenCalled();
  });
});

describe("Phase 7 admin contact queries", () => {
  it("authorizes before database access and fetches 21 rows for a 20-row keyset page", async () => {
    const { readContactPage, ADMIN_CONTACT_QUERY_SHAPE } =
      await import("@/db/queries/admin-contact");

    const page = await readContactPage({ now: new Date("2026-07-26T04:30:00Z") });

    expect(calls.order.slice(0, 2)).toEqual(["auth", "db"]);
    expect(calls.execute).toHaveBeenCalledTimes(2);
    expect(ADMIN_CONTACT_QUERY_SHAPE.pageSize).toBe(20);
    expect(ADMIN_CONTACT_QUERY_SHAPE.fetchLimit).toBe(21);
    expect(ADMIN_CONTACT_QUERY_SHAPE.orderBy).toBe("created_at desc, id desc");
    expect(ADMIN_CONTACT_QUERY_SHAPE.pagination).toBe("(created_at, id) keyset");
    expect(page).toEqual({ rows: [], unreadCount: 0 });
  });

  it("omits visitor hashes and database-only fields from contact DTOs", async () => {
    calls.execute.mockResolvedValueOnce([
      {
        id: "2d6c56f8-11e9-4d88-b98a-57d8d01cf8f3",
        inquiryType: "Freelance project",
        name: "Ada",
        email: "ada@example.com",
        message: "Hello",
        isRead: false,
        createdAt: new Date("2026-07-26T04:00:00Z"),
        visitorHash: "x".repeat(64),
      },
    ]);
    calls.execute.mockResolvedValueOnce([{ unreadCount: 1 }]);

    const { readContactPage } = await import("@/db/queries/admin-contact");
    const page = await readContactPage({ now: new Date("2026-07-26T04:30:00Z") });

    expect(page.rows).toEqual([
      {
        id: "2d6c56f8-11e9-4d88-b98a-57d8d01cf8f3",
        inquiryType: "Freelance project",
        name: "Ada",
        email: "ada@example.com",
        message: "Hello",
        isRead: false,
        createdAt: "2026-07-26T04:00:00.000Z",
      },
    ]);
    expect(page.rows[0]).not.toHaveProperty("visitorHash");
  });

  it("never touches the database when the caller is not an authorized admin", async () => {
    requireAdminMock.mockRejectedValueOnce(new AdminAuthError("unauthorized"));
    const { readContactPage } = await import("@/db/queries/admin-contact");

    await expect(readContactPage({ now: new Date("2026-07-26T04:30:00Z") })).rejects.toThrow(
      AdminAuthError,
    );
    expect(calls.execute).not.toHaveBeenCalled();
  });
});
