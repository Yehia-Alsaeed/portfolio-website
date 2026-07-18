import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import ErrorPage from "@/app/error";
import Loading from "@/app/loading";
import NotFound from "@/app/not-found";

describe("Phase 2 route boundaries", () => {
  it("announces the loading state politely", () => {
    render(<Loading />);

    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(screen.getByText("Loading page")).toBeInTheDocument();
  });

  it("alerts on error, retries through reset, and offers a way home", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const reset = vi.fn();
    const user = userEvent.setup();
    render(<ErrorPage error={new Error("boom")} reset={reset} />);

    expect(screen.getByRole("alert")).toBeVisible();
    expect(screen.queryByText(/boom/)).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(reset).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
    consoleError.mockRestore();
  });

  it("renders the branded 404 with recovery links", () => {
    const { container } = render(<NotFound />);

    expect(screen.getByRole("heading", { level: 1, name: "404" })).toBeVisible();
    expect(container.querySelectorAll("h1")).toHaveLength(1);
    expect(screen.getByText("Page not found")).toBeVisible();
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Projects" })).toHaveAttribute("href", "/projects");
  });
});
