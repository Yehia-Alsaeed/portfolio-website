import { describe, expect, it } from "vitest";

import type { RequestFacts } from "@/features/analytics/model";
import { createRateLimitKey, createVisitorHash } from "@/features/analytics/privacy";
import { classifyRequest } from "@/features/analytics/request-facts";
import { normalizePath, parseTrackPayload } from "@/features/analytics/validation";

const facts: RequestFacts = {
  address: "203.0.113.10",
  userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15 Safari/605.1.15",
  country: "US",
  device: "desktop",
  browser: "safari",
  os: "macos",
  isBot: false,
};

const salt = "unit-test-salt";

describe("Phase 6 request classification", () => {
  it("flags known crawler user agents as bots", () => {
    expect(classifyRequest(new Headers({ "user-agent": "Googlebot/2.1" })).isBot).toBe(true);
    expect(
      classifyRequest(new Headers({ "user-agent": "facebookexternalhit/1.1" })).isBot,
    ).toBe(true);
  });

  it("does not flag unrecognized browsers as bots", () => {
    expect(classifyRequest(new Headers({ "user-agent": "SomeNewBrowser/1.0" })).isBot).toBe(
      false,
    );
  });

  it("normalizes classifications into only the declared enums", () => {
    const result = classifyRequest(new Headers({ "user-agent": "" }));
    expect(["mobile", "tablet", "desktop", "unknown"]).toContain(result.device);
    expect(["chrome", "edge", "firefox", "safari", "other", "unknown"]).toContain(result.browser);
    expect(["android", "ios", "linux", "macos", "windows", "other", "unknown"]).toContain(
      result.os,
    );
  });
});

describe("Phase 6 HMAC privacy", () => {
  it("rotates the visitor hash at the UTC day boundary", () => {
    expect(createVisitorHash(facts, new Date("2026-07-23T23:59:59Z"), salt)).not.toBe(
      createVisitorHash(facts, new Date("2026-07-24T00:00:00Z"), salt),
    );
  });

  it("keeps the rate-limit key stable across calls", () => {
    expect(createRateLimitKey(facts, salt)).toBe(createRateLimitKey(facts, salt));
  });

  it("never contains the raw address or user agent in either hash", () => {
    const visitorHash = createVisitorHash(facts, new Date(), salt);
    const rateLimitKey = createRateLimitKey(facts, salt);
    expect(visitorHash).not.toContain(facts.address);
    expect(rateLimitKey).not.toContain(facts.userAgent);
    expect(visitorHash).toMatch(/^[a-f0-9]{64}$/);
    expect(rateLimitKey).toMatch(/^[a-f0-9]{64}$/);
  });
});

describe("Phase 6 path normalization", () => {
  it("rejects paths carrying a query string or fragment", () => {
    expect(
      normalizePath("/projects/skillbridge-ai-interviewer?x=1#proof"),
    ).toBeUndefined();
  });

  it("accepts a clean internal path", () => {
    expect(normalizePath("/projects/skillbridge-ai-interviewer")).toBe(
      "/projects/skillbridge-ai-interviewer",
    );
  });

  it("rejects non-string and empty values", () => {
    expect(normalizePath(42)).toBeUndefined();
    expect(normalizePath("")).toBeUndefined();
    expect(normalizePath("relative/path")).toBeUndefined();
  });
});

describe("Phase 6 closed event validation", () => {
  it("accepts a well-formed page_view payload", () => {
    expect(
      parseTrackPayload({
        type: "page_view",
        path: "/",
        referrer: "https://example.com/",
        screen: "large",
      }),
    ).toEqual({
      type: "page_view",
      path: "/",
      referrer: "https://example.com/",
      screen: "large",
    });
  });

  it("rejects an unknown project slug", () => {
    expect(
      parseTrackPayload({
        type: "project_click",
        path: "/projects",
        projectSlug: "not-a-real-project",
        destination: "github",
        screen: "large",
      }),
    ).toBeUndefined();
  });

  it("rejects payloads carrying object-prototype keys", () => {
    const polluted = JSON.parse(
      '{"type":"page_view","path":"/","referrer":"","screen":"large","__proto__":{"polluted":true},"constructor":{"polluted":true}}',
    ) as Record<string, unknown>;

    expect(Object.prototype.hasOwnProperty.call(polluted, "__proto__")).toBe(true);
    expect(parseTrackPayload(polluted)).toBeUndefined();
  });

  it("rejects an unknown event type", () => {
    expect(parseTrackPayload({ type: "arbitrary_event", path: "/" })).toBeUndefined();
  });

  it("rejects arbitrary metadata objects", () => {
    expect(
      parseTrackPayload({
        type: "page_view",
        path: "/",
        referrer: "",
        screen: "large",
        metadata: { anything: "goes" },
      }),
    ).toBeUndefined();
  });

  it("rejects non-string scalar fields", () => {
    expect(
      parseTrackPayload({
        type: "cv_download",
        path: "/",
        placement: "footer",
        screen: 1024,
      }),
    ).toBeUndefined();
  });

  it("rejects paths containing a query string or fragment", () => {
    expect(
      parseTrackPayload({
        type: "cv_download",
        path: "/?x=1",
        placement: "footer",
        screen: "large",
      }),
    ).toBeUndefined();
  });

  it("accepts an approved outbound client-work destination", () => {
    expect(
      parseTrackPayload({
        type: "outbound_click",
        path: "/services",
        destination: "la-glosse",
        screen: "medium",
      }),
    ).toEqual({
      type: "outbound_click",
      path: "/services",
      destination: "la-glosse",
      screen: "medium",
    });
  });

  it("rejects an unapproved outbound destination", () => {
    expect(
      parseTrackPayload({
        type: "outbound_click",
        path: "/services",
        destination: "https://evil.example.com",
        screen: "medium",
      }),
    ).toBeUndefined();
  });

  it("rejects non-object and array payloads", () => {
    expect(parseTrackPayload(null)).toBeUndefined();
    expect(parseTrackPayload("page_view")).toBeUndefined();
    expect(parseTrackPayload([1, 2, 3])).toBeUndefined();
  });
});
