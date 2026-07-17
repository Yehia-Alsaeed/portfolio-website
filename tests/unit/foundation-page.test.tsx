import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import FoundationPage from "@/app/page";

describe("FoundationPage", () => {
  it("renders one factual identity heading inside the foundation marker", () => {
    const { container } = render(<FoundationPage />);

    expect(screen.getByRole("heading", { level: 1, name: "Yehia Alsaeed" })).toBeVisible();
    expect(container.querySelectorAll("h1")).toHaveLength(1);
    expect(container.querySelector("main")).toHaveAttribute("data-foundation-shell", "true");
  });
});
