import { describe, expect, it, vi } from "vitest";

import { createAdminAuthorizer, requireAdminAccess } from "@/features/admin/auth/authorize";
import { AdminAuthError } from "@/features/admin/auth/model";

describe("Phase 7 admin authorization", () => {
  it("returns anonymous before exposing data when no session exists", async () => {
    const getSession = vi.fn().mockResolvedValue({ data: null, error: null });
    const access = await createAdminAuthorizer({
      getSession,
      readAdminUserId: () => "admin-user-id",
    })();

    expect(access).toEqual({ status: "anonymous" });
    expect(getSession).toHaveBeenCalledTimes(1);
  });

  it("fails closed as expired when the provider errors", async () => {
    const access = await createAdminAuthorizer({
      getSession: vi.fn().mockResolvedValue({
        data: null,
        error: { message: "upstream unavailable" },
      }),
      readAdminUserId: () => "admin-user-id",
    })();

    expect(access).toEqual({ status: "expired" });
  });

  it("rejects a valid session for any non-admin user id", async () => {
    const access = await createAdminAuthorizer({
      getSession: vi.fn().mockResolvedValue({
        data: { user: { id: "other-user-id", name: "Other User" } },
        error: null,
      }),
      readAdminUserId: () => "admin-user-id",
    })();

    expect(access).toEqual({ status: "unauthorized" });
  });

  it("authorizes only the exact configured ADMIN_USER_ID", async () => {
    const access = await createAdminAuthorizer({
      getSession: vi.fn().mockResolvedValue({
        data: { user: { id: "admin-user-id", name: "Yehia" } },
        error: null,
      }),
      readAdminUserId: () => "admin-user-id",
    })();

    expect(access).toEqual({
      status: "authorized",
      user: { id: "admin-user-id", name: "Yehia" },
    });
  });

  it("stops protected dependencies before database access when unauthorized", async () => {
    const databaseRead = vi.fn();

    await expect(
      requireAdminAccess(async () => ({ status: "unauthorized" }), databaseRead),
    ).rejects.toBeInstanceOf(AdminAuthError);

    expect(databaseRead).not.toHaveBeenCalled();
  });
});
