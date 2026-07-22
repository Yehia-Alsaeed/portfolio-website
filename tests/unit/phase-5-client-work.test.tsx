import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { CLIENT_WORK } from "@/content/services";
import { ClientWorkGrid } from "@/features/services/client-work-grid";

function getMadarWearsArticle() {
  const heading = screen.getByRole("heading", { name: "Madar Wears" });
  const article = heading.closest("article");
  if (!article) throw new Error("Madar Wears article not found");
  return { article, queries: within(article) };
}

describe("Phase 5 client-work presentation", () => {
  it("renders exactly three client-work articles with safe external links", () => {
    const { container } = render(<ClientWorkGrid entries={CLIENT_WORK} />);

    expect(screen.getAllByRole("article")).toHaveLength(3);
    expect(screen.getByRole("link", { name: /Open Madar Wears/ })).toHaveAttribute(
      "rel",
      "noopener noreferrer",
    );
    expect(screen.getByRole("link", { name: /Open La Glosse/ })).toBeVisible();
    expect(screen.getByRole("link", { name: /Open Nexo/ })).toBeVisible();
    expect(screen.queryByTitle(/Nexo/i)).not.toBeInTheDocument();
    expect(container.querySelector("iframe")).toBeNull();
    expect(container.querySelector("video[autoplay]")).toBeNull();
  });

  it("switches the Madar Wears screenshot between desktop and mobile on request", async () => {
    const user = userEvent.setup();
    render(<ClientWorkGrid entries={CLIENT_WORK} />);
    const { queries } = getMadarWearsArticle();

    const desktopButton = queries.getByRole("button", { name: /^Desktop$/ });
    const mobileButton = queries.getByRole("button", { name: /^Mobile$/ });

    expect(desktopButton).toHaveAttribute("aria-pressed", "true");
    expect(mobileButton).toHaveAttribute("aria-pressed", "false");

    const initialAlt = queries.getByRole("img").getAttribute("alt");

    await user.click(mobileButton);

    expect(mobileButton).toHaveAttribute("aria-pressed", "true");
    expect(desktopButton).toHaveAttribute("aria-pressed", "false");
    const mobileAlt = queries.getByRole("img").getAttribute("alt");
    expect(mobileAlt).not.toBe(initialAlt);
  });

  it("mounts the Madar Wears recording only after the disclosure is opened, with safe playback attributes", async () => {
    const user = userEvent.setup();
    render(<ClientWorkGrid entries={CLIENT_WORK} />);
    const { article, queries } = getMadarWearsArticle();

    expect(article.querySelector("video")).toBeNull();

    const disclosure = queries.getByText(/Watch short recording/i);
    await user.click(disclosure);

    const video = article.querySelector("video");
    expect(video).not.toBeNull();
    expect(video).toHaveAttribute("controls");
    // React sets `muted` as a DOM property rather than an HTML attribute
    // (facebook/react#10389), so assert the property, not the attribute.
    expect(video?.muted).toBe(true);
    expect(video).toHaveAttribute("playsinline");
    expect(video).toHaveAttribute("preload", "metadata");
    expect(video?.getAttribute("poster")).toBeTruthy();
    expect(video?.parentElement?.textContent).toMatch(/\w/);
  });
});
