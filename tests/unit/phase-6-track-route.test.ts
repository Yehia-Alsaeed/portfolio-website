import { beforeEach, describe, expect, it, vi } from "vitest";

import type { TrackRouteDependencies } from "@/features/analytics/track-request";
import { handleTrackRequest } from "@/features/analytics/track-request";

function buildRequest(options: {
  body?: string;
  contentType?: string | null;
  headers?: Record<string, string>;
}): Request {
  const headers = new Headers(options.headers);

  if (options.contentType !== null) {
    headers.set("content-type", options.contentType ?? "application/json");
  }

  return new Request("https://example.com/api/track", {
    method: "POST",
    headers,
    body: options.body ?? "{}",
  });
}

function buildDependencies(
  overrides: Partial<TrackRouteDependencies> = {},
): TrackRouteDependencies {
  return {
    now: () => new Date("2026-07-23T12:00:00Z"),
    consume: vi.fn().mockResolvedValue({ allowed: true, count: 1, retryAfterSeconds: 0 }),
    insert: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

beforeEach(() => {
  process.env.ANALYTICS_HASH_SALT = "unit-test-salt";
});

describe("Phase 6 track route", () => {
  it("rejects a non-JSON content type with 415", async () => {
    const request = buildRequest({ contentType: "text/plain" });
    const response = await handleTrackRequest(request, buildDependencies());

    expect(response.status).toBe(415);
  });

  it("rejects an oversized encoded body with 413", async () => {
    const oversized = JSON.stringify({
      type: "page_view",
      path: "/",
      referrer: "a".repeat(3000),
      screen: "large",
    });
    const request = buildRequest({ body: oversized });
    const response = await handleTrackRequest(request, buildDependencies());

    expect(response.status).toBe(413);
  });

  it("rejects an invalid schema with 400", async () => {
    const request = buildRequest({ body: JSON.stringify({ type: "not-a-real-event" }) });
    const response = await handleTrackRequest(request, buildDependencies());

    expect(response.status).toBe(400);
  });

  it("drops known bot traffic with 204 and touches neither table", async () => {
    const request = buildRequest({
      body: JSON.stringify({ type: "page_view", path: "/", referrer: "", screen: "large" }),
      headers: { "user-agent": "Googlebot/2.1" },
    });
    const dependencies = buildDependencies();
    const response = await handleTrackRequest(request, dependencies);

    expect(response.status).toBe(204);
    expect(dependencies.consume).not.toHaveBeenCalled();
    expect(dependencies.insert).not.toHaveBeenCalled();
  });

  it("drops /admin paths with 204", async () => {
    const request = buildRequest({
      body: JSON.stringify({ type: "page_view", path: "/admin", referrer: "", screen: "large" }),
    });
    const dependencies = buildDependencies();
    const response = await handleTrackRequest(request, dependencies);

    expect(response.status).toBe(204);
    expect(dependencies.insert).not.toHaveBeenCalled();
  });

  it("returns 429 once the per-minute limit is exceeded", async () => {
    const request = buildRequest({
      body: JSON.stringify({ type: "page_view", path: "/", referrer: "", screen: "large" }),
    });
    const dependencies = buildDependencies({
      consume: vi.fn().mockResolvedValue({ allowed: false, count: 121, retryAfterSeconds: 30 }),
    });
    const response = await handleTrackRequest(request, dependencies);

    expect(response.status).toBe(429);
    expect(dependencies.insert).not.toHaveBeenCalled();
  });

  it("accepts a valid project_click event and inserts a PII-free record", async () => {
    const request = buildRequest({
      body: JSON.stringify({
        type: "project_click",
        path: "/projects",
        projectSlug: "skillbridge-ai-interviewer",
        destination: "github",
        screen: "large",
      }),
    });
    const dependencies = buildDependencies();
    const response = await handleTrackRequest(request, dependencies);

    expect(response.status).toBe(202);
    expect(dependencies.insert).toHaveBeenCalledTimes(1);
    const insertedEvent = (dependencies.insert as ReturnType<typeof vi.fn>).mock.calls[0]?.[0];

    expect(insertedEvent).toMatchObject({
      type: "project_click",
      path: "/projects",
      metadata: { projectSlug: "skillbridge-ai-interviewer", destination: "github" },
    });
    expect(insertedEvent).not.toHaveProperty("ip");
    expect(insertedEvent).not.toHaveProperty("userAgent");
  });

  it("reduces a same-origin page_view referrer to direct", async () => {
    const request = buildRequest({
      body: JSON.stringify({
        type: "page_view",
        path: "/",
        referrer: "https://example.com/services",
        screen: "large",
      }),
    });
    const dependencies = buildDependencies();

    await handleTrackRequest(request, dependencies);

    const insertedEvent = (dependencies.insert as ReturnType<typeof vi.fn>).mock.calls[0]?.[0];

    expect(insertedEvent.referrerDomain).toBe("direct");
  });

  it("reduces an external page_view referrer to its hostname only", async () => {
    const request = buildRequest({
      body: JSON.stringify({
        type: "page_view",
        path: "/",
        referrer: "https://news.ycombinator.com/item?id=1",
        screen: "large",
      }),
    });
    const dependencies = buildDependencies();

    await handleTrackRequest(request, dependencies);

    const insertedEvent = (dependencies.insert as ReturnType<typeof vi.fn>).mock.calls[0]?.[0];

    expect(insertedEvent.referrerDomain).toBe("news.ycombinator.com");
  });

  it("returns a safe 202 even when the database insert fails", async () => {
    const request = buildRequest({
      body: JSON.stringify({ type: "page_view", path: "/", referrer: "", screen: "large" }),
    });
    const dependencies = buildDependencies({
      insert: vi.fn().mockRejectedValue(new Error("connection reset")),
    });
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

    const response = await handleTrackRequest(request, dependencies);

    expect(response.status).toBe(202);
    consoleSpy.mockRestore();
  });

  it("sets Cache-Control: no-store on every response", async () => {
    const request = buildRequest({
      body: JSON.stringify({ type: "page_view", path: "/", referrer: "", screen: "large" }),
    });
    const response = await handleTrackRequest(request, buildDependencies());

    expect(response.headers.get("cache-control")).toBe("no-store");
  });
});
