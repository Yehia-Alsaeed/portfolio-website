import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import DesignSystemPage from "@/app/design-system/page";
import { DisplayModeProvider } from "@/features/display-mode/provider";

describe("design system gallery", () => {
  it("renders one h1 and every review section", () => {
    const { container } = render(
      <DisplayModeProvider>
        <DesignSystemPage />
      </DisplayModeProvider>,
    );

    expect(screen.getByRole("heading", { level: 1, name: "Design system" })).toBeVisible();
    expect(container.querySelectorAll("h1")).toHaveLength(1);

    for (const section of [
      "Typography",
      "Actions",
      "Form controls",
      "Metadata",
      "Statistics",
      "Project rows",
      "Page title",
      "Display modes",
    ]) {
      expect(screen.getByRole("heading", { level: 2, name: section })).toBeVisible();
    }
  });

  it("labels every form-control specimen", () => {
    render(
      <DisplayModeProvider>
        <DesignSystemPage />
      </DisplayModeProvider>,
    );

    expect(screen.getByLabelText("Name")).toBeVisible();
    expect(screen.getByLabelText("Email")).toBeVisible();
    expect(screen.getByLabelText("Inquiry type")).toBeVisible();
    expect(screen.getByLabelText("Message")).toBeVisible();
  });
});
