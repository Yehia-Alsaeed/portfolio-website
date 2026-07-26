import { beforeEach, describe, expect, it, vi } from "vitest";

const calls = vi.hoisted(() => ({
  order: [] as string[],
  execute: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@/features/admin/auth/authorize", () => ({
  requireAdmin: vi.fn(async () => {
    calls.order.push("auth");
    return { id: "admin-user-id" };
  }),
}));

vi.mock("@/db/client", () => ({
  getDatabase: () => {
    calls.order.push("db");
    return { execute: calls.execute };
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: calls.revalidatePath,
}));

beforeEach(() => {
  calls.order.length = 0;
  calls.execute.mockReset();
  calls.revalidatePath.mockReset();
});

describe("Phase 7 inbox mutations", () => {
  it("rejects malformed UUIDs before auth or database access", async () => {
    const { setMessageReadAction, deleteMessageAction } = await import(
      "@/features/admin/inbox/actions"
    );

    await expect(setMessageReadAction("not-a-uuid", true)).resolves.toEqual({
      status: "invalid",
      message: "Invalid message id.",
    });
    await expect(deleteMessageAction("not-a-uuid")).resolves.toEqual({
      status: "invalid",
      message: "Invalid message id.",
    });
    expect(calls.order).toEqual([]);
    expect(calls.execute).not.toHaveBeenCalled();
  });

  it("authorizes before updating read state and revalidates admin routes on success", async () => {
    calls.execute.mockResolvedValueOnce([{ id: "2d6c56f8-11e9-4d88-b98a-57d8d01cf8f3" }]);
    const { setMessageReadAction } = await import("@/features/admin/inbox/actions");

    await expect(
      setMessageReadAction("2d6c56f8-11e9-4d88-b98a-57d8d01cf8f3", true),
    ).resolves.toEqual({ status: "success", id: "2d6c56f8-11e9-4d88-b98a-57d8d01cf8f3" });

    expect(calls.order.slice(0, 2)).toEqual(["auth", "db"]);
    expect(calls.revalidatePath).toHaveBeenCalledWith("/admin");
    expect(calls.revalidatePath).toHaveBeenCalledWith("/admin/inbox");
  });

  it("returns not-found when delete affects no row", async () => {
    calls.execute.mockResolvedValueOnce([]);
    const { deleteMessageAction } = await import("@/features/admin/inbox/actions");

    await expect(deleteMessageAction("2d6c56f8-11e9-4d88-b98a-57d8d01cf8f3")).resolves.toEqual({
      status: "not-found",
      message: "Message was not found.",
    });
  });
});
