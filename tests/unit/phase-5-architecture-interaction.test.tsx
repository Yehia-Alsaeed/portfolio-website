import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ARCHITECTURE_PROOFS } from "@/content/projects/proof";

const proof = ARCHITECTURE_PROOFS[0]!;

vi.mock("@/features/case-study/proof/architecture-xray", () => ({
  ArchitectureXRay: ({ proof: canvasProof }: { proof: typeof proof }) => (
    <div data-testid="mock-canvas">{canvasProof.title}</div>
  ),
}));

describe("Phase 5 Architecture X-Ray launcher", () => {
  it("keeps the interactive region out of the DOM until explicitly activated", async () => {
    const { ArchitectureXRayLauncher } =
      await import("@/features/case-study/proof/architecture-xray-launcher");
    const user = userEvent.setup();
    render(<ArchitectureXRayLauncher proof={proof} />);

    expect(screen.queryByRole("region", { name: /Interactive architecture/ })).toBeNull();

    await user.click(screen.getByRole("button", { name: /Explore interactive architecture/ }));

    expect(await screen.findByRole("region", { name: /Interactive architecture/ })).toBeVisible();
    expect(screen.getByTestId("mock-canvas")).toHaveTextContent(proof.title);
  });

  it("keeps an aria-live status region mounted so loading state is announced", async () => {
    const { ArchitectureXRayLauncher } =
      await import("@/features/case-study/proof/architecture-xray-launcher");
    const user = userEvent.setup();
    render(<ArchitectureXRayLauncher proof={proof} />);

    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-live", "polite");

    await user.click(screen.getByRole("button", { name: /Explore interactive architecture/ }));

    expect(await screen.findByRole("region", { name: /Interactive architecture/ })).toBeVisible();
  });

  it("announces an error and never removes the static proof when the canvas module fails to load", async () => {
    vi.resetModules();
    vi.doMock("@/features/case-study/proof/architecture-xray", () => {
      throw new Error("chunk load failed");
    });

    const { ArchitectureXRayLauncher: LauncherWithFailingImport } =
      await import("@/features/case-study/proof/architecture-xray-launcher");
    const { ArchitectureStatic } = await import("@/features/case-study/proof/architecture-static");

    const user = userEvent.setup();
    render(
      <div>
        <ArchitectureStatic proof={proof} />
        <LauncherWithFailingImport proof={proof} />
      </div>,
    );

    await user.click(screen.getByRole("button", { name: /Explore interactive architecture/ }));

    expect(await screen.findByRole("status")).toHaveTextContent(/couldn't load|failed|try again/i);
    // The static reading order for the first node must still be present.
    expect(screen.getByText(proof.nodes[0]!.label)).toBeVisible();

    vi.doUnmock("@/features/case-study/proof/architecture-xray");
  });
});
