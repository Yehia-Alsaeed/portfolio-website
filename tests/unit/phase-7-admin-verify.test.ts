import { describe, expect, it } from "vitest";

import { buildSignInRequest } from "../../scripts/verify-neon-admin-login";

describe("Phase 7 admin login verifier", () => {
  it("adds origin data for Node-based sign-in verification", () => {
    expect(
      buildSignInRequest({
        baseUrl: "https://example.neonauth.dev",
        email: "admin@example.com",
        password: " A!pass! ",
      }),
    ).toEqual({
      email: "admin@example.com",
      password: " A!pass! ",
      callbackURL: "https://example.neonauth.dev",
      fetchOptions: {
        headers: {
          Origin: "https://example.neonauth.dev",
        },
      },
    });
  });
});
