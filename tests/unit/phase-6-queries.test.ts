import { beforeEach, describe, expect, it, vi } from "vitest";

import { analyticsEvents, contactMessages, rateLimitBuckets } from "@/db/schema";
import type { AnalyticsEventInsert, PersistedContactInput } from "@/features/analytics/model";

const mocks = vi.hoisted(() => {
  const insertChain = {
    values: vi.fn(),
    onConflictDoUpdate: vi.fn(),
    returning: vi.fn(),
  };
  insertChain.values.mockReturnValue(insertChain);
  insertChain.onConflictDoUpdate.mockReturnValue(insertChain);

  return {
    insertChain,
    insertFn: vi.fn(() => insertChain),
    batchFn: vi.fn(),
  };
});

vi.mock("@/db/client", () => ({
  getDatabase: () => ({
    insert: mocks.insertFn,
    batch: mocks.batchFn,
  }),
}));

const event: AnalyticsEventInsert = {
  type: "contact_submit",
  path: "/",
  referrerDomain: "direct",
  country: "US",
  device: "desktop",
  browser: "safari",
  os: "macos",
  screen: "unknown",
  visitorHash: "a".repeat(64),
  metadata: {},
  createdAt: new Date("2026-07-23T00:00:00Z"),
};

const contact: PersistedContactInput = {
  inquiryType: "Freelance project",
  name: "Ada Lovelace",
  email: "ada@example.com",
  message: "Hello there",
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Phase 6 rate-limit query", () => {
  it("performs one atomic insert-or-increment upsert and returns the current count", async () => {
    mocks.insertChain.returning.mockResolvedValueOnce([{ requestCount: 4 }]);
    const { consumeRateLimit } = await import("@/db/queries/rate-limit");

    const decision = await consumeRateLimit({
      scope: "contact",
      keyHash: "b".repeat(64),
      limit: 3,
      windowSeconds: 3600,
      now: new Date("2026-07-23T12:00:00Z"),
    });

    expect(mocks.insertFn).toHaveBeenCalledTimes(1);
    expect(mocks.insertFn).toHaveBeenCalledWith(rateLimitBuckets);
    expect(mocks.insertChain.onConflictDoUpdate).toHaveBeenCalledTimes(1);
    expect(mocks.insertChain.returning).toHaveBeenCalledTimes(1);
    expect(decision).toEqual({ allowed: false, count: 4, retryAfterSeconds: expect.any(Number) });
    expect(decision.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("allows the request while the count is within the limit", async () => {
    mocks.insertChain.returning.mockResolvedValueOnce([{ requestCount: 1 }]);
    const { consumeRateLimit } = await import("@/db/queries/rate-limit");

    const decision = await consumeRateLimit({
      scope: "analytics",
      keyHash: "c".repeat(64),
      limit: 120,
      windowSeconds: 60,
      now: new Date("2026-07-23T12:00:00Z"),
    });

    expect(decision).toEqual({ allowed: true, count: 1, retryAfterSeconds: 0 });
  });

  it("propagates database errors without swallowing them", async () => {
    mocks.insertChain.returning.mockRejectedValueOnce(new Error("connection reset"));
    const { consumeRateLimit } = await import("@/db/queries/rate-limit");
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

    await expect(
      consumeRateLimit({
        scope: "contact",
        keyHash: "d".repeat(64),
        limit: 3,
        windowSeconds: 3600,
        now: new Date(),
      }),
    ).rejects.toThrow("connection reset");
    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});

describe("Phase 6 contact persistence query", () => {
  it("commits the contact and its PII-free event in one atomic batch", async () => {
    mocks.batchFn.mockResolvedValueOnce([{}, {}]);
    const { saveContactAndEvent } = await import("@/db/queries/contact");

    const result = await saveContactAndEvent({ contact, event });

    expect(mocks.batchFn).toHaveBeenCalledTimes(1);
    expect(mocks.batchFn.mock.calls[0]?.[0]).toHaveLength(2);
    expect(mocks.insertFn).toHaveBeenNthCalledWith(1, contactMessages);
    expect(mocks.insertFn).toHaveBeenNthCalledWith(2, analyticsEvents);
    expect(result.id).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("never places contact fields inside the analytics event insert", async () => {
    mocks.batchFn.mockResolvedValueOnce([{}, {}]);
    const { saveContactAndEvent } = await import("@/db/queries/contact");

    await saveContactAndEvent({ contact, event });

    const eventValuesCall = mocks.insertChain.values.mock.calls[1]?.[0];
    expect(eventValuesCall).not.toHaveProperty("name");
    expect(eventValuesCall).not.toHaveProperty("email");
    expect(eventValuesCall).not.toHaveProperty("message");
  });

  it("propagates a failed batch without swallowing the error", async () => {
    mocks.batchFn.mockRejectedValueOnce(new Error("batch failed"));
    const { saveContactAndEvent } = await import("@/db/queries/contact");
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

    await expect(saveContactAndEvent({ contact, event })).rejects.toThrow("batch failed");
    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});

describe("Phase 6 analytics insert query", () => {
  it("inserts only the already-normalized event shape", async () => {
    mocks.insertChain.values.mockResolvedValueOnce(undefined);
    const { insertAnalyticsEvent } = await import("@/db/queries/analytics");

    await insertAnalyticsEvent(event);

    expect(mocks.insertFn).toHaveBeenCalledWith(analyticsEvents);
    expect(mocks.insertChain.values).toHaveBeenCalledWith(event);
  });
});
