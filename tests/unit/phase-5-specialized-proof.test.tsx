import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { MODEL_COMPARISONS } from "@/content/projects/proof";
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

  it("gives every model comparison non-empty text in every field", () => {
    for (const model of MODEL_COMPARISONS) {
      for (const field of ["label", "miou", "inferenceTime", "parameters", "note"] as const) {
        expect(model[field].length, `${model.id}.${field}`).toBeGreaterThan(0);
      }
    }
  });

  it("never claims an API key, live timing in milliseconds, or an unpublished FCN parameter count", () => {
    const serialized = JSON.stringify(MODEL_COMPARISONS);
    expect(serialized).not.toMatch(/api[_-]?key/i);
    expect(serialized).not.toMatch(/\d+\s?ms\b/);
    expect(MODEL_COMPARISONS.find((model) => model.id === "fcn")?.parameters).toBe("Not published");
    expect(MODEL_COMPARISONS.find((model) => model.id === "segnet")?.parameters).toBe("29.46M");
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
