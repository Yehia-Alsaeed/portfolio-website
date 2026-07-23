import { beforeEach, describe, expect, it, vi } from "vitest";

import type { HealthDependencies } from "@/features/operations/health";
import { handleHealthRequest } from "@/features/operations/health";

describe("Phase 6 health route", () => {
  it("returns 200 {status: ok} with no-store caching when the check succeeds", async () => {
    const dependencies: HealthDependencies = { check: vi.fn().mockResolvedValue(true) };
    const response = await handleHealthRequest(dependencies);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "ok" });
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  it("returns 503 {status: unavailable} when the check reports failure", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const dependencies: HealthDependencies = { check: vi.fn().mockResolvedValue(false) };
    const response = await handleHealthRequest(dependencies);

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ status: "unavailable" });
    consoleSpy.mockRestore();
  });

  it("returns 503 rather than throwing when the check itself rejects", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const dependencies: HealthDependencies = {
      check: vi.fn().mockRejectedValue(new Error("connection reset")),
    };
    const response = await handleHealthRequest(dependencies);
    const body = await response.text();

    expect(response.status).toBe(503);
    expect(body).not.toContain("connection reset");
    consoleSpy.mockRestore();
  });

  it("never exposes connection, schema, region, or timing details", async () => {
    const dependencies: HealthDependencies = { check: vi.fn().mockResolvedValue(true) };
    const response = await handleHealthRequest(dependencies);
    const body = await response.text();

    expect(body).toBe(JSON.stringify({ status: "ok" }));
  });
});

describe("Phase 6 database health probe", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("returns true when the probe query succeeds", async () => {
    vi.doMock("@/db/client", () => ({
      getDatabase: () => ({ execute: vi.fn().mockResolvedValue({ rows: [{ "?column?": 1 }] }) }),
    }));
    const { checkDatabaseHealth } = await import("@/db/queries/health");

    expect(await checkDatabaseHealth()).toBe(true);
  });

  it("returns false rather than throwing when the probe query fails", async () => {
    vi.doMock("@/db/client", () => ({
      getDatabase: () => ({ execute: vi.fn().mockRejectedValue(new Error("timeout")) }),
    }));
    const { checkDatabaseHealth } = await import("@/db/queries/health");

    expect(await checkDatabaseHealth()).toBe(false);
  });
});
