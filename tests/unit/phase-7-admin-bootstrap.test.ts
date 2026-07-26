import { describe, expect, it } from "vitest";

import {
  buildAdminSignupInput,
  extractCreatedUserId,
  normalizeAuthBaseUrl,
} from "../../scripts/bootstrap-neon-admin";

describe("Phase 7 admin bootstrap helper", () => {
  it("normalizes the Neon Auth base URL without changing the host", () => {
    expect(normalizeAuthBaseUrl(" https://example.neonauth.dev/ ")).toBe(
      "https://example.neonauth.dev",
    );
  });

  it("rejects invalid bootstrap inputs without echoing the password", () => {
    expect(() =>
      buildAdminSignupInput({
        baseUrl: "not-a-url",
        email: "admin@example.com",
        name: "Yehia Alsaeed",
        password: "super-secret-admin-password",
      }),
    ).toThrow("NEON_AUTH_BASE_URL must be a valid http(s) URL");

    expect(() =>
      buildAdminSignupInput({
        baseUrl: "https://example.neonauth.dev",
        email: "admin@example.com",
        name: "Yehia Alsaeed",
        password: "short",
      }),
    ).toThrow("Admin password must be at least 8 characters");
  });

  it("builds the signup payload from trimmed email and name", () => {
    expect(
      buildAdminSignupInput({
        baseUrl: "https://example.neonauth.dev/",
        email: " admin@example.com ",
        name: " Yehia Alsaeed ",
        password: "correct horse battery staple",
      }),
    ).toEqual({
      baseUrl: "https://example.neonauth.dev",
      email: "admin@example.com",
      name: "Yehia Alsaeed",
      password: "correct horse battery staple",
    });
  });

  it("extracts the created user id from Neon Auth signup responses", () => {
    expect(extractCreatedUserId({ data: { user: { id: "user_123" } }, error: null })).toBe(
      "user_123",
    );
    expect(extractCreatedUserId({ user: { id: "user_456" } })).toBe("user_456");
  });
});
