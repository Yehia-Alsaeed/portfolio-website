import type { RateLimitDecision } from "@/features/analytics/model";

import type { AuthSignInResult, LoginState } from "./model";

const ADMIN_LOGIN_SCOPE = "admin-login" as const;
const ADMIN_LOGIN_LIMIT = 5;
const ADMIN_LOGIN_WINDOW_SECONDS = 900 as const;
const INVALID_LOGIN_STATE: LoginState = {
  status: "invalid",
  message: "Invalid email or password.",
};

type LoginDependencies = {
  now: () => Date;
  rateLimitKey: () => string;
  consume: (input: {
    scope: typeof ADMIN_LOGIN_SCOPE;
    keyHash: string;
    limit: typeof ADMIN_LOGIN_LIMIT;
    windowSeconds: typeof ADMIN_LOGIN_WINDOW_SECONDS;
    now: Date;
  }) => Promise<RateLimitDecision>;
  signInEmail: (input: { email: string; password: string }) => Promise<AuthSignInResult>;
  signOut: () => Promise<unknown>;
  readAdminUserId: () => string;
};

function readString(
  formData: FormData,
  name: string,
  maxLength: number,
  options: { trim: boolean } = { trim: true },
): string | undefined {
  const value = formData.get(name);
  if (typeof value !== "string") return undefined;

  const normalized = options.trim ? value.trim() : value;
  if (!normalized.trim() || normalized.length > maxLength) return undefined;

  return normalized;
}

export async function authenticateAdminLogin(
  formData: FormData,
  dependencies: LoginDependencies,
): Promise<LoginState> {
  const email = readString(formData, "email", 254);
  const password = readString(formData, "password", 256, { trim: false });

  if (!email || !password || !email.includes("@")) return INVALID_LOGIN_STATE;

  const now = dependencies.now();
  const decision = await dependencies.consume({
    scope: ADMIN_LOGIN_SCOPE,
    keyHash: dependencies.rateLimitKey(),
    limit: ADMIN_LOGIN_LIMIT,
    windowSeconds: ADMIN_LOGIN_WINDOW_SECONDS,
    now,
  });

  if (!decision.allowed) {
    return {
      status: "rate-limited",
      message: "Too many attempts. Try again later.",
      retryAfterSeconds: decision.retryAfterSeconds,
    };
  }

  try {
    const result = await dependencies.signInEmail({ email, password });

    if (result.error || !result.data?.user?.id) return INVALID_LOGIN_STATE;

    if (result.data.user.id !== dependencies.readAdminUserId()) {
      await dependencies.signOut();
      return {
        status: "unauthorized",
        message: "This account cannot access the admin area.",
      };
    }

    return { status: "idle", message: "" };
  } catch {
    return { status: "unavailable", message: "Admin login is temporarily unavailable." };
  }
}
