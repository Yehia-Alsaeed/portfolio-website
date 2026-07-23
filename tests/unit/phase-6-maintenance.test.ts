import { beforeEach, describe, expect, it, vi } from "vitest";

import type { MaintenanceDependencies, MaintenanceResult } from "@/features/operations/maintenance";
import { handleMaintenanceRequest } from "@/features/operations/maintenance";

const FIXED_RESULT: MaintenanceResult = { aggregateRows: 24, deletedEvents: 3, deletedBuckets: 5 };

function buildRequest(authorization: string | undefined): Request {
  const headers = new Headers();

  if (authorization !== undefined) headers.set("authorization", authorization);

  return new Request("https://example.com/api/maintenance", { headers });
}

function buildDependencies(
  overrides: Partial<MaintenanceDependencies> = {},
): MaintenanceDependencies {
  return {
    now: () => new Date("2026-07-23T03:17:00Z"),
    run: vi.fn().mockResolvedValue(FIXED_RESULT),
    readSecret: () => "correct-cron-secret",
    ...overrides,
  };
}

describe("Phase 6 maintenance route authorization", () => {
  it("returns 401 before running maintenance when authorization is missing", async () => {
    const dependencies = buildDependencies();
    const response = await handleMaintenanceRequest(buildRequest(undefined), dependencies);

    expect(response.status).toBe(401);
    expect(dependencies.run).not.toHaveBeenCalled();
  });

  it("returns 401 for a malformed authorization header", async () => {
    const dependencies = buildDependencies();
    const response = await handleMaintenanceRequest(
      buildRequest("correct-cron-secret"),
      dependencies,
    );

    expect(response.status).toBe(401);
    expect(dependencies.run).not.toHaveBeenCalled();
  });

  it("returns 401 for the wrong bearer secret", async () => {
    const dependencies = buildDependencies();
    const response = await handleMaintenanceRequest(
      buildRequest("Bearer wrong-secret"),
      dependencies,
    );

    expect(response.status).toBe(401);
    expect(dependencies.run).not.toHaveBeenCalled();
  });

  it("returns 401 rather than throwing when the secret cannot be read", async () => {
    const dependencies = buildDependencies({
      readSecret: () => {
        throw new Error("CRON_SECRET is required but was not set");
      },
    });
    const response = await handleMaintenanceRequest(
      buildRequest("Bearer anything"),
      dependencies,
    );

    expect(response.status).toBe(401);
    expect(dependencies.run).not.toHaveBeenCalled();
  });

  it("runs exactly one maintenance batch for the correct bearer secret", async () => {
    const dependencies = buildDependencies();
    const response = await handleMaintenanceRequest(
      buildRequest("Bearer correct-cron-secret"),
      dependencies,
    );

    expect(response.status).toBe(200);
    expect(dependencies.run).toHaveBeenCalledTimes(1);
    expect(dependencies.run).toHaveBeenCalledWith(dependencies.now());
    expect(await response.json()).toEqual(FIXED_RESULT);
  });

  it("never exposes row contents, SQL, or secrets in the response", async () => {
    const dependencies = buildDependencies();
    const response = await handleMaintenanceRequest(
      buildRequest("Bearer correct-cron-secret"),
      dependencies,
    );
    const body = await response.text();

    expect(body).not.toContain("correct-cron-secret");
    expect(body).toBe(JSON.stringify(FIXED_RESULT));
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  it("returns a generic 500 and logs safely when the maintenance run fails", async () => {
    const dependencies = buildDependencies({
      run: vi.fn().mockRejectedValue(new Error("connection reset by peer")),
    });
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

    const response = await handleMaintenanceRequest(
      buildRequest("Bearer correct-cron-secret"),
      dependencies,
    );
    const body = await response.text();

    expect(response.status).toBe(500);
    expect(body).not.toContain("connection reset by peer");
    consoleSpy.mockRestore();
  });
});

describe("Phase 6 maintenance idempotency", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("yields identical aggregate rows and counts across two runs at the same instant", async () => {
    const mocks = await buildMaintenanceQueryMocks();
    const { runMaintenance } = await import("@/db/queries/maintenance");
    const now = new Date("2026-07-23T03:17:00Z");

    const first = await runMaintenance(now);
    const second = await runMaintenance(now);

    expect(first).toEqual(second);
    expect(mocks.batchFn).toHaveBeenCalledTimes(2);
  });

  it("runs the delete-aggregates, eight dimension inserts, delete-events, and delete-buckets statements in one atomic batch", async () => {
    const mocks = await buildMaintenanceQueryMocks();
    const { runMaintenance } = await import("@/db/queries/maintenance");

    await runMaintenance(new Date("2026-07-23T03:17:00Z"));

    expect(mocks.batchFn).toHaveBeenCalledTimes(1);
    const statements = mocks.batchFn.mock.calls[0]?.[0] as unknown[];

    expect(statements).toHaveLength(11);
    expect(mocks.executeFn).toHaveBeenCalledTimes(11);
  });

  it("propagates a failed batch instead of returning a partial result", async () => {
    const mocks = await buildMaintenanceQueryMocks();
    mocks.batchFn.mockRejectedValueOnce(new Error("aggregate insert failed"));
    const { runMaintenance } = await import("@/db/queries/maintenance");

    await expect(runMaintenance(new Date("2026-07-23T03:17:00Z"))).rejects.toThrow(
      "aggregate insert failed",
    );
  });
});

async function buildMaintenanceQueryMocks() {
  const executeFn = vi.fn().mockImplementation((query: unknown) => ({ query, rowCount: 3 }));
  const batchFn = vi.fn().mockImplementation(async (statements: unknown[]) => statements);

  vi.doMock("@/db/client", () => ({
    getDatabase: () => ({
      execute: executeFn,
      batch: batchFn,
    }),
  }));

  return { executeFn, batchFn };
}
