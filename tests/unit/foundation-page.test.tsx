import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import HomePage from "@/app/page";
import ProjectsPage from "@/app/projects/page";
import ServicesPage from "@/app/services/page";
import { DisplayModeProvider } from "@/features/display-mode/provider";

function renderPage(page: React.ReactNode) {
  return render(<DisplayModeProvider>{page}</DisplayModeProvider>);
}

describe("Phase 2 route frames", () => {
  it("renders the home frame with profile metadata and exactly one h1", () => {
    const { container } = renderPage(<HomePage />);

    expect(screen.getByRole("heading", { level: 1, name: "Yehia Alsaeed" })).toBeVisible();
    expect(container.querySelectorAll("h1")).toHaveLength(1);
    expect(screen.getByText("AI/ML Engineer + Web Dev")).toBeVisible();
    expect(screen.getByText("Cairo, Egypt")).toBeVisible();
    expect(screen.getByText("Open to roles and clients")).toBeVisible();
    expect(screen.getByRole("group", { name: "Display mode" })).toBeVisible();
    expect(container.textContent).not.toMatch(/foundation preview|under construction/i);
  });

  it("renders the projects frame with a factual index section", () => {
    const { container } = renderPage(<ProjectsPage />);

    expect(screen.getByRole("heading", { level: 1, name: "Projects" })).toBeVisible();
    expect(container.querySelectorAll("h1")).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 2, name: "Project index" })).toBeVisible();
    expect(container.textContent).not.toMatch(/foundation preview|under construction|phase/i);
  });

  it("renders the services frame with a factual client section", () => {
    const { container } = renderPage(<ServicesPage />);

    expect(screen.getByRole("heading", { level: 1, name: "Services" })).toBeVisible();
    expect(container.querySelectorAll("h1")).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 2, name: "Client services" })).toBeVisible();
    expect(container.textContent).not.toMatch(/foundation preview|under construction|phase/i);
  });
});
