import { describe, expect, it, vi } from "vitest";

import { authenticateAdminLogin } from "@/features/admin/auth/login";

function formData(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

describe("Phase 7 admin login", () => {
  it("returns one generic invalid state for malformed credentials", async () => {
    const result = await authenticateAdminLogin(formData({ email: "", password: "" }), {
      now: () => new Date("2026-07-26T00:00:00Z"),
      rateLimitKey: () => "a".repeat(64),
      consume: vi.fn(),
      signInEmail: vi.fn(),
      signOut: vi.fn(),
      readAdminUserId: () => "admin-user-id",
    });

    expect(result).toEqual({
      status: "invalid",
      message: "Invalid email or password.",
    });
  });

  it("consumes the admin-login rate limit before calling Neon Auth", async () => {
    const consume = vi.fn().mockResolvedValue({ allowed: true, count: 1, retryAfterSeconds: 0 });
    const signInEmail = vi.fn().mockResolvedValue({
      data: { user: { id: "admin-user-id" } },
      error: null,
    });

    await authenticateAdminLogin(
      formData({ email: "admin@example.com", password: "correct horse battery staple" }),
      {
        now: () => new Date("2026-07-26T00:00:00Z"),
        rateLimitKey: () => "b".repeat(64),
        consume,
        signInEmail,
        signOut: vi.fn(),
        readAdminUserId: () => "admin-user-id",
      },
    );

    expect(consume).toHaveBeenCalledWith({
      scope: "admin-login",
      keyHash: "b".repeat(64),
      limit: 5,
      windowSeconds: 900,
      now: new Date("2026-07-26T00:00:00Z"),
    });
    expect(signInEmail).toHaveBeenCalledTimes(1);
  });

  it("returns a fixed rate-limited state on the sixth attempt in the window", async () => {
    const result = await authenticateAdminLogin(
      formData({ email: "admin@example.com", password: "correct horse battery staple" }),
      {
        now: () => new Date("2026-07-26T00:00:00Z"),
        rateLimitKey: () => "c".repeat(64),
        consume: vi.fn().mockResolvedValue({
          allowed: false,
          count: 6,
          retryAfterSeconds: 300,
        }),
        signInEmail: vi.fn(),
        signOut: vi.fn(),
        readAdminUserId: () => "admin-user-id",
      },
    );

    expect(result).toEqual({
      status: "rate-limited",
      message: "Too many attempts. Try again later.",
      retryAfterSeconds: 300,
    });
  });

  it("uses the same generic state for invalid credentials and unknown email", async () => {
    const result = await authenticateAdminLogin(
      formData({ email: "unknown@example.com", password: "wrong password" }),
      {
        now: () => new Date("2026-07-26T00:00:00Z"),
        rateLimitKey: () => "d".repeat(64),
        consume: vi.fn().mockResolvedValue({ allowed: true, count: 1, retryAfterSeconds: 0 }),
        signInEmail: vi.fn().mockResolvedValue({ data: null, error: { status: 401 } }),
        signOut: vi.fn(),
        readAdminUserId: () => "admin-user-id",
      },
    );

    expect(result).toEqual({
      status: "invalid",
      message: "Invalid email or password.",
    });
  });

  it("signs out and rejects a non-admin account without returning credentials", async () => {
    const signOut = vi.fn().mockResolvedValue({ data: null, error: null });
    const result = await authenticateAdminLogin(
      formData({ email: "other@example.com", password: "correct horse battery staple" }),
      {
        now: () => new Date("2026-07-26T00:00:00Z"),
        rateLimitKey: () => "e".repeat(64),
        consume: vi.fn().mockResolvedValue({ allowed: true, count: 1, retryAfterSeconds: 0 }),
        signInEmail: vi.fn().mockResolvedValue({
          data: { user: { id: "other-user-id" } },
          error: null,
        }),
        signOut,
        readAdminUserId: () => "admin-user-id",
      },
    );

    expect(result).toEqual({
      status: "unauthorized",
      message: "This account cannot access the admin area.",
    });
    expect(JSON.stringify(result)).not.toContain("correct horse battery staple");
    expect(signOut).toHaveBeenCalledTimes(1);
  });
});
