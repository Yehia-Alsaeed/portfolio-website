import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SiteShell } from "@/components/layout/site-shell";
import { DisplayModeProvider } from "@/features/display-mode/provider";

function renderShell() {
  return render(
    <DisplayModeProvider>
      <SiteShell>
        <h1>Route heading</h1>
      </SiteShell>
    </DisplayModeProvider>,
  );
}

describe("SiteShell", () => {
  it("renders one skip link targeting the main content", () => {
    renderShell();

    const skipLink = screen.getByRole("link", { name: "Skip to content" });
    expect(skipLink).toHaveAttribute("href", "#main-content");
  });

  it("exposes exactly one of each global landmark", () => {
    renderShell();

    expect(screen.getAllByRole("banner")).toHaveLength(1);
    expect(screen.getAllByRole("navigation", { name: "Primary" })).toHaveLength(1);
    expect(screen.getAllByRole("main")).toHaveLength(1);
    expect(screen.getAllByRole("contentinfo")).toHaveLength(1);
    expect(screen.getByRole("main")).toHaveAttribute("id", "main-content");
  });

  it("names the logo and primary navigation links", () => {
    renderShell();

    expect(screen.getByRole("link", { name: "Yehia Alsaeed home" })).toBeVisible();
    const navigation = screen.getByRole("navigation", { name: "Primary" });
    expect(within(navigation).getByRole("link", { name: "Home" })).toBeVisible();
    expect(within(navigation).getByRole("link", { name: "Projects" })).toBeVisible();
    expect(within(navigation).getByRole("link", { name: "Services" })).toBeVisible();
    expect(within(navigation).getByRole("link", { name: "Contact" })).toHaveAttribute(
      "href",
      "/#contact",
    );
  });

  it("keeps the contact target, approved email, and tracked CV link in the footer", () => {
    renderShell();

    const footer = screen.getByRole("contentinfo");
    expect(footer).toHaveAttribute("id", "contact");
    expect(within(footer).getByRole("link", { name: "yehias3eed11@gmail.com" })).toHaveAttribute(
      "href",
      "mailto:yehias3eed11@gmail.com",
    );
    expect(within(footer).getByRole("link", { name: "GitHub" })).toHaveAttribute(
      "href",
      "https://github.com/Yehia-Alsaeed",
    );
    expect(within(footer).getByRole("link", { name: "LinkedIn" })).toHaveAttribute(
      "href",
      "https://www.linkedin.com/in/yehia-alsaeed",
    );
    const cvLink = within(footer).getByRole("link", { name: "Download CV" });
    expect(cvLink).toHaveAttribute("href", "/cv/Yehia_Alsaeed_CV_AI.pdf");
    expect(cvLink).toHaveAttribute("download");
    expect(within(footer).getByText("2026 - Yehia Alsaeed")).toBeVisible();
  });

  it("contains no under-construction language", () => {
    const { container } = renderShell();

    expect(container.textContent).not.toMatch(/foundation preview|under construction/i);
  });
});
