import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ContactFormState } from "@/features/contact/model";

const submitContactMock = vi.fn();

vi.mock("@/features/contact/actions", () => ({
  submitContact: (previousState: ContactFormState, formData: FormData) =>
    submitContactMock(previousState, formData),
}));

async function fillRequiredFields(user: ReturnType<typeof userEvent.setup>) {
  await user.selectOptions(screen.getByLabelText("Inquiry type"), "Freelance project");
  await user.type(screen.getByLabelText("Name"), "Ada Lovelace");
  await user.type(screen.getByLabelText("Email"), "ada@example.com");
  await user.type(screen.getByLabelText("Message"), "Hello there");
}

beforeEach(() => {
  submitContactMock.mockReset();
});

describe("Phase 6 contact form", () => {
  it("renders a honeypot field hidden from sighted users", async () => {
    const { ContactForm } = await import("@/features/contact/contact-form");
    render(<ContactForm />);

    const honeypot = document.querySelector('input[name="website"]');

    expect(honeypot).not.toBeNull();
    expect(honeypot).toHaveAttribute("aria-hidden", "true");
    expect(honeypot).toHaveAttribute("tabindex", "-1");
  });

  it("disables the submit button and announces pending state while sending", async () => {
    let resolveAction: (state: ContactFormState) => void = () => undefined;

    submitContactMock.mockImplementation(
      () =>
        new Promise<ContactFormState>((resolve) => {
          resolveAction = resolve;
        }),
    );

    const { ContactForm } = await import("@/features/contact/contact-form");
    const user = userEvent.setup();
    render(<ContactForm />);
    await fillRequiredFields(user);
    await user.click(screen.getByRole("button", { name: "Send message" }));

    const pendingButton = await screen.findByRole("button", { name: "Sending..." });

    expect(pendingButton).toBeDisabled();

    resolveAction({ status: "success", message: "Message saved.", fieldErrors: {} });
  });

  it("focuses the alert summary and marks the invalid field on a validation failure", async () => {
    submitContactMock.mockResolvedValue({
      status: "invalid",
      message: "Complete every field with a valid email address.",
      fieldErrors: { email: "Enter a valid email address." },
      values: {
        inquiryType: "Freelance project",
        name: "Ada Lovelace",
        email: "not-an-email",
        message: "Hello there",
      },
    } satisfies ContactFormState);

    const { ContactForm } = await import("@/features/contact/contact-form");
    const user = userEvent.setup();
    render(<ContactForm />);
    await fillRequiredFields(user);
    await user.click(screen.getByRole("button", { name: "Send message" }));

    const alert = await screen.findByRole("alert");

    expect(alert).toHaveFocus();

    const emailInput = screen.getByLabelText("Email");

    expect(emailInput).toHaveAttribute("aria-invalid", "true");
    expect(emailInput.getAttribute("aria-describedby")).toContain("contact-email-error");
  });

  it("announces success with no mailto fallback", async () => {
    submitContactMock.mockResolvedValue({
      status: "success",
      message: "Message saved.",
      fieldErrors: {},
    } satisfies ContactFormState);

    const { ContactForm } = await import("@/features/contact/contact-form");
    const user = userEvent.setup();
    render(<ContactForm />);
    await fillRequiredFields(user);
    await user.click(screen.getByRole("button", { name: "Send message" }));

    const status = await screen.findByRole("status");

    expect(status).toHaveTextContent("Message saved.");
    expect(screen.queryByRole("link", { name: "Email this message instead" })).toBeNull();
  });

  it("offers the mailto fallback when the database is unavailable", async () => {
    submitContactMock.mockResolvedValue({
      status: "unavailable",
      message: "Your message could not be saved. Email directly instead.",
      fieldErrors: {},
      values: {
        inquiryType: "Freelance project",
        name: "Ada Lovelace",
        email: "ada@example.com",
        message: "Hello there",
      },
    } satisfies ContactFormState);

    const { ContactForm } = await import("@/features/contact/contact-form");
    const user = userEvent.setup();
    render(<ContactForm />);
    await fillRequiredFields(user);
    await user.click(screen.getByRole("button", { name: "Send message" }));

    const fallback = await screen.findByRole("link", { name: "Email this message instead" });

    expect(fallback).toHaveAttribute("href", expect.stringContaining("mailto:"));
  });
});
