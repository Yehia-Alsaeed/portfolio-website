import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { ContactPage } from "@/features/admin/analytics/model";
import { Inbox } from "@/features/admin/inbox/inbox";

const page: ContactPage = {
  unreadCount: 1,
  rows: [
    {
      id: "2d6c56f8-11e9-4d88-b98a-57d8d01cf8f3",
      inquiryType: "Freelance project",
      name: "Ada Lovelace",
      email: "ada@example.com",
      message: "Line one\nLine two",
      isRead: false,
      createdAt: "2026-07-26T04:00:00.000Z",
    },
  ],
};

describe("Phase 7 inbox UI", () => {
  it("renders unread count, message rows, mailto link, and escaped plain text", () => {
    render(<Inbox page={page} />);

    expect(screen.getByRole("heading", { level: 1, name: "Contact inbox." })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Newest messages" })).toBeInTheDocument();
    expect(screen.getByText("1 unread")).toBeInTheDocument();
    expect(screen.getByText(/Ada Lovelace \/ Freelance project/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Mark message from Ada Lovelace as read" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "ada@example.com" })).toHaveAttribute(
      "href",
      "mailto:ada@example.com",
    );
    expect(screen.getByText("Line one")).toBeInTheDocument();
    expect(screen.getByText("Line two")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 3, name: "Ada Lovelace - Freelance project" }),
    ).toBeInTheDocument();
  });

  it("renders a truthful empty inbox state", () => {
    render(<Inbox page={{ rows: [], unreadCount: 0 }} />);

    expect(screen.getByText("No messages yet.")).toBeInTheDocument();
    expect(screen.queryByText("sample")).not.toBeInTheDocument();
  });
});
