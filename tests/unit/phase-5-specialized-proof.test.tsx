import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { AGENT_REPLAY_STEPS, MODEL_COMPARISONS } from "@/content/projects/proof";
import { AgentReplayStatic } from "@/features/case-study/proof/agent-replay-static";
import { AgentRunReplay } from "@/features/case-study/proof/agent-run-replay";
import { ModelComparisonStatic } from "@/features/case-study/proof/model-comparison-static";
import { ModelMicroscope } from "@/features/case-study/proof/model-microscope";

// A real Next.js build resolves static image imports to a `StaticImageData`
// object (width/height included); Vite/Vitest resolves the same import to a
// plain URL string, which next/image's real component then rejects for
// missing width/height. Render a plain <img> instead so this test exercises
// component logic, not the Next.js build-time asset pipeline.
vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt: string; src: string | { src: string } }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} src={typeof src === "string" ? src : src.src} />
  ),
}));

// jsdom does not implement matchMedia; the reduced-motion hooks under test
// call it unconditionally, so every test needs this polyfill in place.
beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    value: vi.fn().mockImplementation((query: string) => ({
      addEventListener: vi.fn(),
      matches: false,
      media: query,
      removeEventListener: vi.fn(),
    })),
    writable: true,
  });
});

describe("Phase 5 specialized proof data", () => {
  it("orders the three Oxford models FCN/SegNet/HRNet", () => {
    expect(MODEL_COMPARISONS.map((model) => model.id)).toEqual(["fcn", "segnet", "hrnet"]);
  });

  it("matches the approved HRNet metrics exactly", () => {
    const hrnet = MODEL_COMPARISONS.find((model) => model.id === "hrnet");
    expect(hrnet?.miou).toBe("0.9306");
    expect(hrnet?.inferenceTime).toBe("0.0633s");
    expect(hrnet?.parameters).toBe("11.44M");
  });

  it("orders the four replay steps Profiler/Generator/Critic/Optimizer", () => {
    expect(AGENT_REPLAY_STEPS.map((step) => step.id)).toEqual([
      "profiler",
      "generator",
      "critic",
      "optimizer",
    ]);
  });

  it("gives every replay step and model comparison non-empty text in every field", () => {
    for (const step of AGENT_REPLAY_STEPS) {
      for (const field of ["instruction", "input", "output", "decision"] as const) {
        expect(step[field].length, `${step.id}.${field}`).toBeGreaterThan(0);
      }
    }
    for (const model of MODEL_COMPARISONS) {
      for (const field of ["label", "miou", "inferenceTime", "parameters", "note"] as const) {
        expect(model[field].length, `${model.id}.${field}`).toBeGreaterThan(0);
      }
    }
  });

  it("never claims an API key, live timing in milliseconds, or an unpublished FCN parameter count", () => {
    const serialized = JSON.stringify(MODEL_COMPARISONS) + JSON.stringify(AGENT_REPLAY_STEPS);
    expect(serialized).not.toMatch(/api[_-]?key/i);
    expect(serialized).not.toMatch(/\d+\s?ms\b/);
    expect(MODEL_COMPARISONS.find((model) => model.id === "fcn")?.parameters).toBe("Not published");
    expect(MODEL_COMPARISONS.find((model) => model.id === "segnet")?.parameters).toBe("29.46M");
  });

  it("does not present the illustrative sample quality score as an aggregate benchmark", () => {
    const serialized = JSON.stringify(AGENT_REPLAY_STEPS);
    expect(serialized).not.toMatch(/average|aggregate|benchmark/i);
  });
});

describe("Phase 5 Model Comparison Microscope", () => {
  it("renders all three approved comparisons in the static fallback", () => {
    render(<ModelComparisonStatic models={MODEL_COMPARISONS} />);
    expect(screen.getByRole("heading", { name: "FCN-ResNet18" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "SegNet-VGG16" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "HRNet-W18" })).toBeVisible();
    expect(screen.getByText("0.9306")).toBeVisible();
  });

  it("lets a visitor select a model while keeping the evaluation frame constant", async () => {
    const user = userEvent.setup();
    render(<ModelMicroscope models={MODEL_COMPARISONS} />);

    const fcnButton = screen.getByRole("button", { name: /FCN-ResNet18/ });
    const hrnetButton = screen.getByRole("button", { name: /HRNet-W18/ });

    expect(fcnButton).toHaveAttribute("aria-pressed", "true");
    expect(hrnetButton).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("img")).toHaveAccessibleName(/FCN/);

    await user.click(hrnetButton);

    expect(hrnetButton).toHaveAttribute("aria-pressed", "true");
    expect(fcnButton).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("img")).toHaveAccessibleName(/HRNet/);
    expect(screen.getByText("0.9306")).toBeVisible();
  });
});

describe("Phase 5 Agent Run Replay", () => {
  it("renders the complete four-stage ordered transcript in the static fallback", () => {
    render(<AgentReplayStatic steps={AGENT_REPLAY_STEPS} />);
    for (const step of AGENT_REPLAY_STEPS) {
      expect(screen.getByText(step.label)).toBeVisible();
    }
  });

  it("advances through stages on direct selection and announces progress", async () => {
    const user = userEvent.setup();
    render(<AgentRunReplay steps={AGENT_REPLAY_STEPS} />);

    await user.click(screen.getByRole("button", { name: /^Critic$/ }));

    expect(screen.getByRole("button", { name: /^Critic$/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("status")).toHaveTextContent(/critic/i);
  });

  it("cancels the Play timer on Reset so no further stage advances after reset", () => {
    vi.useFakeTimers();
    render(<AgentRunReplay steps={AGENT_REPLAY_STEPS} />);

    fireEvent.click(screen.getByRole("button", { name: /^Play$/ }));
    vi.advanceTimersByTime(10);
    fireEvent.click(screen.getByRole("button", { name: /^Reset$/ }));
    const pressedAfterReset = screen.getByRole("button", { name: /^Profiler$/ });
    expect(pressedAfterReset).toHaveAttribute("aria-pressed", "true");

    vi.advanceTimersByTime(20_000);
    // If the old timer weren't cancelled, this would advance past Profiler.
    expect(screen.getByRole("button", { name: /^Profiler$/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    vi.useRealTimers();
  });
});
