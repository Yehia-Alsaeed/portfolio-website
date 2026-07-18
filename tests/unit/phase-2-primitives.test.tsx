import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { MetadataRow } from "@/components/ui/metadata-row";
import { PageTitle } from "@/components/ui/page-title";
import { ProjectRow } from "@/components/ui/project-row";
import { RuledSection } from "@/components/ui/ruled-section";
import { StatCell } from "@/components/ui/stat-cell";

describe("Phase 2 primitives", () => {
  it("renders semantic controls and labelled data", () => {
    render(
      <>
        <Button>Send</Button>
        <FormField id="email" label="Email">
          <input id="email" />
        </FormField>
        <MetadataRow items={[{ label: "Role", value: "AI/ML Engineer" }]} />
        <StatCell label="Projects" value="17" />
      </>,
    );
    expect(screen.getByRole("button", { name: "Send" })).toBeVisible();
    expect(screen.getByLabelText("Email")).toBeVisible();
    expect(screen.getByText("Role")).toBeVisible();
    expect(screen.getByText("17")).toBeVisible();
  });

  it("keeps rows and titles route-neutral", () => {
    render(
      <>
        <PageTitle eyebrow="Portfolio" title="Yehia Alsaeed" subtitle="AI/ML Engineer" />
        <RuledSection title="Selected work" meta="2025 to 2026">
          <p>Body</p>
        </RuledSection>
        <ProjectRow
          index="01"
          name="Example system"
          category="Machine learning"
          year="2026"
          href="/"
        />
      </>,
    );
    expect(screen.getByRole("heading", { level: 1, name: "Yehia Alsaeed" })).toBeVisible();
    expect(screen.getByRole("heading", { level: 2, name: "Selected work" })).toBeVisible();
    expect(screen.getByRole("link", { name: /Example system/ })).toHaveAttribute("href", "/");
  });
});
