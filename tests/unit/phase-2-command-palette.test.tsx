import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CommandPalette } from "@/features/command-palette/command-palette";
import { DisplayModeProvider } from "@/features/display-mode/provider";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

// jsdom implements neither scrollIntoView nor ResizeObserver, both of which
// cmdk uses; stub them so the palette can mount in unit tests.
window.HTMLElement.prototype.scrollIntoView = () => {};
window.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe("command palette", () => {
  beforeEach(() => {
    push.mockClear();
    localStorage.clear();
    document.documentElement.dataset.mode = "paper";
  });

  it("opens, filters, runs a command, closes, and restores focus", async () => {
    const user = userEvent.setup();
    render(
      <DisplayModeProvider>
        <CommandPalette />
      </DisplayModeProvider>,
    );
    const trigger = screen.getByRole("button", { name: "Open command palette" });
    await user.click(trigger);
    const search = await screen.findByRole("combobox", { name: "Search commands" });
    await user.type(search, "night");
    await user.click(screen.getByRole("option", { name: "Use Night mode" }));
    expect(document.documentElement).toHaveAttribute("data-mode", "night");
    await waitFor(() => {
      expect(trigger).toHaveFocus();
    });
  });

  it("opens with Ctrl+K and closes with Escape", async () => {
    const user = userEvent.setup();
    render(
      <DisplayModeProvider>
        <CommandPalette />
      </DisplayModeProvider>,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await user.keyboard("{Control>}k{/Control}");
    expect(await screen.findByRole("dialog")).toBeVisible();
    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("does not intercept Ctrl+K while typing in a text input", async () => {
    const user = userEvent.setup();
    render(
      <DisplayModeProvider>
        <label htmlFor="note">Note</label>
        <input id="note" type="text" />
        <CommandPalette />
      </DisplayModeProvider>,
    );
    await user.click(screen.getByLabelText("Note"));
    await user.keyboard("{Control>}k{/Control}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
