"use client";

import * as React from "react";

import type { ArchitectureProof } from "@/content/projects/proof";
import type { ArchitectureXRayProps } from "@/features/case-study/proof/architecture-xray";

export type ArchitectureXRayLauncherProps = { proof: ArchitectureProof };

type CanvasComponent = React.ComponentType<ArchitectureXRayProps>;

type LoadState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; Canvas: CanvasComponent }
  | { status: "error" };

export function ArchitectureXRayLauncher({ proof }: ArchitectureXRayLauncherProps) {
  const [state, setState] = React.useState<LoadState>({ status: "idle" });

  async function handleActivate() {
    setState({ status: "loading" });
    try {
      const canvasModule = await import("./architecture-xray");
      setState({ Canvas: canvasModule.ArchitectureXRay, status: "ready" });
    } catch {
      setState({ status: "error" });
    }
  }

  if (state.status === "ready") {
    const Canvas = state.Canvas;
    return (
      <div className="mt-8">
        <section
          aria-label={`Interactive architecture: ${proof.title}`}
          className="border-line border"
        >
          <Canvas proof={proof} />
        </section>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <button
        className="border-line hover:bg-ink hover:text-paper inline-flex min-h-11 cursor-pointer items-center border px-4 font-mono text-[0.6875rem] font-bold tracking-[0.1em] uppercase transition-colors disabled:cursor-wait disabled:opacity-60"
        disabled={state.status === "loading"}
        onClick={handleActivate}
        type="button"
      >
        {state.status === "loading" ? "Loading…" : "Explore interactive architecture"}
      </button>
      <p aria-live="polite" className="text-dim mt-2 min-h-4 font-mono text-xs" role="status">
        {state.status === "loading" ? "Loading the interactive diagram…" : null}
        {state.status === "error"
          ? "Couldn't load the interactive diagram. The architecture proof above is still complete — try again shortly."
          : null}
      </p>
    </div>
  );
}
