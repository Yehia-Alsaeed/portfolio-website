import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ContactMessageDto } from "@/features/admin/analytics/model";
import { DeleteDialog } from "@/features/admin/inbox/delete-dialog";
import { MessageRow } from "@/features/admin/inbox/message-row";

const { setMessageReadAction, deleteMessageAction } = vi.hoisted(() => ({
  deleteMessageAction: vi.fn(),
  setMessageReadAction: vi.fn(),
}));

vi.mock("@/features/admin/inbox/actions", () => ({ deleteMessageAction, setMessageReadAction }));

beforeEach(() => {
  setMessageReadAction.mockReset();
  deleteMessageAction.mockReset();
});

const message: ContactMessageDto = {
  createdAt: "2026-07-01T00:00:00.000Z",
  email: "ada@example.com",
  id: "11111111-1111-1111-1111-111111111111",
  inquiryType: "Job opportunity",
  isRead: false,
  message: "Hello there",
  name: "Ada Lovelace",
};

describe("MessageRow", () => {
  it("marks the message read on click and calls the server action", async () => {
    setMessageReadAction.mockResolvedValueOnce({ id: message.id, status: "success" });
    render(<MessageRow message={message} />);

    const row = screen.getByRole("button", { name: "Mark message from Ada Lovelace as read" });
    expect(row).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(row);

    await waitFor(() => expect(setMessageReadAction).toHaveBeenCalledWith(message.id, true));
    expect(
      screen.getByRole("button", { name: "Mark message from Ada Lovelace as unread" }),
    ).toBeInTheDocument();
  });

  it("rolls back the optimistic toggle when the server action fails", async () => {
    setMessageReadAction.mockResolvedValueOnce({ message: "nope", status: "unavailable" });
    render(<MessageRow message={message} />);

    fireEvent.click(screen.getByRole("button", { name: /Mark message from Ada Lovelace/ }));

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Mark message from Ada Lovelace as read" }),
      ).toBeInTheDocument(),
    );
  });
});

describe("DeleteDialog", () => {
  it("requires confirmation before deleting", async () => {
    render(<DeleteDialog id={message.id} name={message.name} />);

    fireEvent.click(screen.getByRole("button", { name: "Delete message from Ada Lovelace" }));
    expect(deleteMessageAction).not.toHaveBeenCalled();

    const dialog = await screen.findByRole("alertdialog");
    expect(within(dialog).getByText(/cannot be undone/i)).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole("button", { name: "Delete" }));
    await waitFor(() => expect(deleteMessageAction).toHaveBeenCalledWith(message.id));
  });

  it("deletes nothing when cancelled", async () => {
    render(<DeleteDialog id={message.id} name={message.name} />);
    fireEvent.click(screen.getByRole("button", { name: "Delete message from Ada Lovelace" }));

    const dialog = await screen.findByRole("alertdialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));

    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
    expect(deleteMessageAction).not.toHaveBeenCalled();
  });
});
