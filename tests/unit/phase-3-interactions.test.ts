import { describe, expect, it } from "vitest";

import { buildContactMailto } from "@/features/contact/mailto";
import { nextDisplayMode } from "@/features/display-mode/model";
import { nextPosterTemplate } from "@/features/poster-mode/poster-mode-provider";
import { isEditableTarget, shouldCycleDisplayMode } from "@/lib/keyboard";

describe("phase three interaction helpers", () => {
  it("detects editable targets and accepts only an unmodified N", () => {
    const input = document.createElement("input");
    const textarea = document.createElement("textarea");
    const select = document.createElement("select");
    const editable = document.createElement("div");
    editable.contentEditable = "true";

    expect(isEditableTarget(input)).toBe(true);
    expect(isEditableTarget(textarea)).toBe(true);
    expect(isEditableTarget(select)).toBe(true);
    expect(isEditableTarget(editable)).toBe(true);
    expect(isEditableTarget(document.body)).toBe(false);

    expect(
      shouldCycleDisplayMode({
        altKey: false,
        ctrlKey: false,
        key: "n",
        metaKey: false,
        target: document.body,
      }),
    ).toBe(true);
    expect(
      shouldCycleDisplayMode({
        altKey: false,
        ctrlKey: true,
        key: "n",
        metaKey: false,
        target: document.body,
      }),
    ).toBe(false);
    expect(
      shouldCycleDisplayMode({
        altKey: false,
        ctrlKey: false,
        key: "n",
        metaKey: false,
        target: input,
      }),
    ).toBe(false);
  });

  it("builds a fixed-recipient mailto with safely encoded contact fields", () => {
    const mailto = buildContactMailto({
      email: "sam+portfolio@example.com",
      inquiryType: "Freelance project",
      message: "Build & launch?\nBudget: $5k",
      name: "Sam / Co.",
    });

    expect(mailto).toBe(
      "mailto:yehias3eed11@gmail.com?subject=Portfolio%20inquiry%3A%20Freelance%20project%20-%20Sam%20%2F%20Co.&body=Reply%20email%3A%20sam%2Bportfolio%40example.com%0A%0AMessage%3A%0ABuild%20%26%20launch%3F%0ABudget%3A%20%245k",
    );
  });

  it("cycles display and poster modes deterministically", () => {
    expect(nextDisplayMode("paper")).toBe("night");
    expect(nextDisplayMode("night")).toBe("mono");
    expect(nextDisplayMode("mono")).toBe("paper");
    expect(nextPosterTemplate("index")).toBe("metric");
    expect(nextPosterTemplate("metric")).toBe("index");
  });
});
