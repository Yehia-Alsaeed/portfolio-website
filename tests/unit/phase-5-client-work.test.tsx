import { existsSync } from "node:fs";
import path from "node:path";

import { render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CLIENT_WORK } from "@/content/services";
import { ClientWorkGrid } from "@/features/services/client-work-grid";

function getArticle(name: string) {
  const heading = screen.getByRole("heading", { name });
  const article = heading.closest("article");
  if (!article) throw new Error(`${name} article not found`);
  return { article, queries: within(article) };
}

/**
 * jsdom ships no IntersectionObserver. Installing a fake one lets the tests
 * drive the visibility callback directly and assert the play/pause wiring the
 * card depends on, rather than only the feature-detected fallback path.
 */
function installIntersectionObserver() {
  const callbacks: IntersectionObserverCallback[] = [];
  const disconnect = vi.fn();

  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(callback: IntersectionObserverCallback) {
        callbacks.push(callback);
      }
      observe() {}
      unobserve() {}
      disconnect = disconnect;
    },
  );

  return {
    disconnect,
    trigger(isIntersecting: boolean) {
      for (const callback of callbacks) {
        callback(
          [{ isIntersecting } as IntersectionObserverEntry],
          undefined as unknown as IntersectionObserver,
        );
      }
    },
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("Phase 5 client-work presentation", () => {
  it("renders three articles with safe external links and no embedded frames", () => {
    const { container } = render(<ClientWorkGrid entries={CLIENT_WORK} />);

    expect(screen.getAllByRole("article")).toHaveLength(3);
    expect(screen.getByRole("link", { name: "Open Madar Wears" })).toHaveAttribute(
      "rel",
      "noopener noreferrer",
    );
    expect(screen.getByRole("link", { name: "Open La Glosse" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Open Nexo" })).toBeVisible();
    expect(container.querySelector("iframe")).toBeNull();
  });

  it("shows sector, client name, kind, and contribution on every card", () => {
    render(<ClientWorkGrid entries={CLIENT_WORK} />);
    const { queries } = getArticle("Madar Wears");

    expect(queries.getByText("Apparel")).toBeVisible();
    expect(queries.getByText("Shopify storefront")).toBeVisible();
    expect(queries.getByText(/needed a storefront that could carry/i)).toBeVisible();
  });

  it("plays the capture inline, muted, with no controls and no autoplay attribute", () => {
    const { container } = render(<ClientWorkGrid entries={CLIENT_WORK} />);
    const { article } = getArticle("Madar Wears");
    const video = article.querySelector("video");

    expect(video).not.toBeNull();
    expect(container.querySelector("video[autoplay]")).toBeNull();
    expect(video).not.toHaveAttribute("controls");
    // React sets `muted` as a DOM property rather than an HTML attribute
    // (facebook/react#10389), so assert the property, not the attribute.
    expect(video?.muted).toBe(true);
    expect(video).toHaveAttribute("loop");
    expect(video).toHaveAttribute("playsinline");
    expect(video).toHaveAttribute("preload", "metadata");
    expect(video?.getAttribute("poster")).toBeTruthy();
  });

  it("starts playback when the card scrolls into view and pauses it on the way out", () => {
    const observer = installIntersectionObserver();
    const play = vi
      .spyOn(HTMLMediaElement.prototype, "play")
      .mockResolvedValue(undefined as unknown as void);
    const pause = vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => undefined);

    render(<ClientWorkGrid entries={CLIENT_WORK} />);

    expect(play).not.toHaveBeenCalled();

    observer.trigger(true);
    expect(play).toHaveBeenCalled();

    observer.trigger(false);
    expect(pause).toHaveBeenCalled();
  });

  it("leaves the capture paused when the visitor asks for reduced motion", () => {
    installIntersectionObserver();
    const play = vi
      .spyOn(HTMLMediaElement.prototype, "play")
      .mockResolvedValue(undefined as unknown as void);
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({ matches: true, addEventListener() {}, removeEventListener() {} })),
    );

    render(<ClientWorkGrid entries={CLIENT_WORK} />);

    expect(play).not.toHaveBeenCalled();
  });

  it("describes each capture for assistive technology", () => {
    render(<ClientWorkGrid entries={CLIENT_WORK} />);
    const { article } = getArticle("Madar Wears");

    const video = article.querySelector("video");
    const describedBy = video?.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();

    const description = article.querySelector(`#${CSS.escape(describedBy ?? "")}`);
    expect(description?.textContent).toMatch(/Madar Wears/);
  });

  it("gives Nexo no capture, since none was recorded", () => {
    render(<ClientWorkGrid entries={CLIENT_WORK} />);
    const { article } = getArticle("Nexo");

    expect(article.querySelector("video")).toBeNull();
  });

  it("ships framed by default, over a device PNG that is actually on disk", () => {
    // Framing is only safe while the asset exists - referencing a missing PNG
    // would ship a broken image over every capture, which is why this asserts
    // the file and not just the markup.
    expect(existsSync(path.join(process.cwd(), "public/media/devices/macbook-pro-16.png"))).toBe(
      true,
    );

    const { container } = render(<ClientWorkGrid entries={CLIENT_WORK} />);

    expect(container.querySelectorAll('img[src*="macbook"]')).toHaveLength(2);
    expect(container.querySelector("video")).not.toBeNull();
  });

  it("drops back to a bare capture when framing is switched off", () => {
    const { container } = render(<ClientWorkGrid entries={CLIENT_WORK} framed={false} />);

    expect(container.querySelector('img[src*="macbook"]')).toBeNull();
    expect(container.querySelector("video")).not.toBeNull();
  });

  it("lays the device PNG over the capture, hidden from assistive tech", () => {
    const { container } = render(<ClientWorkGrid entries={CLIENT_WORK} framed />);

    const frames = container.querySelectorAll('img[src*="macbook"]');
    expect(frames).toHaveLength(2);
    for (const frame of frames) {
      expect(frame).toHaveAttribute("aria-hidden", "true");
      expect(frame).toHaveAttribute("alt", "");
    }
    expect(container.querySelector("video")).not.toBeNull();
  });
});
