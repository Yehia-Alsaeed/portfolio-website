export type InboxMutationResult =
  | { status: "success"; id: string }
  | { status: "invalid" | "unauthorized" | "not-found" | "unavailable"; message: string };
