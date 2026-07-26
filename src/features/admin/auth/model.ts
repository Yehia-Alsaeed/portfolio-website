export type AdminAccess =
  | { status: "authorized"; user: { id: string; name?: string | null } }
  | { status: "anonymous" | "expired" | "unauthorized" };

export type LoginState = {
  status: "idle" | "invalid" | "rate-limited" | "unauthorized" | "unavailable";
  message: string;
  retryAfterSeconds?: number;
};

export type AuthSessionResult = {
  data?: { user?: { id?: string | null; name?: string | null } | null } | null;
  error?: unknown;
};

export type AuthSignInResult = {
  data?: { user?: { id?: string | null } | null } | null;
  error?: unknown;
};

export class AdminAuthError extends Error {
  constructor(public readonly status: Exclude<AdminAccess["status"], "authorized">) {
    super("Admin authorization required");
    this.name = "AdminAuthError";
  }
}
