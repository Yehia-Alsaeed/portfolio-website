import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PageTitle } from "@/components/ui/page-title";

function accentedText(container: HTMLElement) {
  return Array.from(container.querySelectorAll(".text-accent-text")).map(
    (node) => node.textContent,
  );
}

describe("PageTitle accent", () => {
  it("highlights a single phrase, as the projects page uses it", () => {
    const { container } = render(<PageTitle accent="All" title="All projects" />);

    expect(screen.getByRole("heading", { level: 1, name: "All projects" })).toBeInTheDocument();
    expect(accentedText(container)).toEqual(["All"]);
  });

  it("highlights several phrases in title order and keeps the heading name intact", () => {
    const { container } = render(
      <PageTitle
        accent={["win clients", "sell"]}
        title="Stores that sell. Sites that win clients."
      />,
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "Stores that sell. Sites that win clients." }),
    ).toBeInTheDocument();
    expect(accentedText(container)).toEqual(["sell", "win clients"]);
  });

  it("ignores phrases that are missing from the title or overlap an earlier one", () => {
    const { container } = render(
      <PageTitle accent={["absent", "win clients", "clients"]} title="Sites that win clients." />,
    );

    expect(accentedText(container)).toEqual(["win clients"]);
  });
});
