import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import {
  DISPLAY_MODE_STORAGE_KEY,
  nextDisplayMode,
  parseDisplayMode,
} from "@/features/display-mode/model";
import { ModeSwitcher } from "@/features/display-mode/mode-switcher";
import { DisplayModeProvider } from "@/features/display-mode/provider";

describe("display modes", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.dataset.mode = "paper";
  });

  it("parses storage safely and cycles deterministically", () => {
    expect(parseDisplayMode("night")).toBe("night");
    expect(parseDisplayMode("invalid")).toBe("paper");
    expect(nextDisplayMode("paper")).toBe("night");
    expect(nextDisplayMode("night")).toBe("mono");
    expect(nextDisplayMode("mono")).toBe("paper");
  });

  it("applies and persists an explicit choice", async () => {
    const user = userEvent.setup();
    render(
      <DisplayModeProvider>
        <ModeSwitcher />
      </DisplayModeProvider>,
    );
    await user.click(screen.getByRole("button", { name: "Night display mode" }));
    expect(document.documentElement).toHaveAttribute("data-mode", "night");
    expect(localStorage.getItem(DISPLAY_MODE_STORAGE_KEY)).toBe("night");
  });
});
