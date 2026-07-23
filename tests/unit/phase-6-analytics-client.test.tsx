import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

let currentPathname = "/";

vi.mock("next/navigation", () => ({
  usePathname: () => currentPathname,
}));

beforeEach(() => {
  currentPathname = "/";
  window.localStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("Phase 6 analytics client contract", () => {
  it("classifies screen widths into the four approved breakpoints", async () => {
    const { getScreenClass } = await import("@/features/analytics/client");

    expect(getScreenClass(390)).toBe("small");
    expect(getScreenClass(768)).toBe("medium");
    expect(getScreenClass(1024)).toBe("large");
    expect(getScreenClass(1920)).toBe("wide");
  });

  it("fires a same-origin, keepalive, un-awaited POST to /api/track", async () => {
    const fetchMock = vi.fn().mockReturnValue(Promise.resolve(new Response(null, { status: 202 })));
    vi.stubGlobal("fetch", fetchMock);
    const { trackEvent } = await import("@/features/analytics/client");

    const returned = trackEvent({ type: "page_view", path: "/", referrer: "", screen: "large" });

    expect(returned).toBeUndefined();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];

    expect(url).toBe("/api/track");
    expect(init).toMatchObject({ method: "POST", keepalive: true, credentials: "same-origin" });
  });

  it("sends no request once the visitor has self-excluded", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const { ANALYTICS_EXCLUSION_KEY, trackEvent } = await import("@/features/analytics/client");
    window.localStorage.setItem(ANALYTICS_EXCLUSION_KEY, "1");

    trackEvent({ type: "page_view", path: "/", referrer: "", screen: "large" });

    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("Phase 6 page view tracker", () => {
  it("sends exactly one initial page view, then another after a pathname change", async () => {
    const fetchMock = vi.fn().mockReturnValue(Promise.resolve(new Response(null, { status: 202 })));
    vi.stubGlobal("fetch", fetchMock);
    const { PageViewTracker } = await import("@/features/analytics/page-view-tracker");

    const { rerender } = render(<PageViewTracker />);

    expect(fetchMock).toHaveBeenCalledTimes(1);

    currentPathname = "/projects";
    rerender(<PageViewTracker />);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    const secondBody = JSON.parse(
      (fetchMock.mock.calls[1] as [string, RequestInit])[1].body as string,
    );

    expect(secondBody.path).toBe("/projects");
    expect(secondBody).not.toHaveProperty("search");
  });
});
