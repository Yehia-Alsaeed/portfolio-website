import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LoginForm } from "@/features/admin/login-form";

const { loginAction } = vi.hoisted(() => ({ loginAction: vi.fn() }));

vi.mock("@/features/admin/auth/actions", () => ({ loginAction }));

beforeEach(() => {
  loginAction.mockReset();
});

describe("LoginForm", () => {
  it("moves focus to the error alert after a failed sign-in attempt", async () => {
    loginAction.mockResolvedValue({ message: "Invalid email or password.", status: "invalid" });
    render(<LoginForm />);

    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    const alert = await screen.findByRole("alert");
    await waitFor(() => expect(alert).toHaveFocus());
    expect(alert).toHaveTextContent("Invalid email or password.");
  });
});
