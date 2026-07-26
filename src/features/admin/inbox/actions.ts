"use server";

import { revalidatePath } from "next/cache";

import {
  deleteContactMessage,
  isValidContactMessageId,
  setContactMessageRead,
} from "@/db/queries/admin-contact";

import type { InboxMutationResult } from "./model";

function revalidateAdminViews(): void {
  revalidatePath("/admin");
  revalidatePath("/admin/inbox");
}

export async function setMessageReadAction(
  id: string,
  isRead: boolean,
): Promise<InboxMutationResult> {
  if (!isValidContactMessageId(id)) {
    return { status: "invalid", message: "Invalid message id." };
  }

  try {
    const updated = await setContactMessageRead({ id, isRead });
    if (!updated) return { status: "not-found", message: "Message was not found." };
    revalidateAdminViews();
    return { status: "success", id };
  } catch {
    return { status: "unavailable", message: "Inbox is temporarily unavailable." };
  }
}

export async function deleteMessageAction(id: string): Promise<InboxMutationResult> {
  if (!isValidContactMessageId(id)) {
    return { status: "invalid", message: "Invalid message id." };
  }

  try {
    const deleted = await deleteContactMessage(id);
    if (!deleted) return { status: "not-found", message: "Message was not found." };
    revalidateAdminViews();
    return { status: "success", id };
  } catch {
    return { status: "unavailable", message: "Inbox is temporarily unavailable." };
  }
}
