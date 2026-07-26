import { describe, expect, it } from "vitest";

import {
  AUTH_SIGNUP_BLOCK_STATUS,
  isAnonymousAdminPath,
  isBlockedAuthPath,
  isProtectedAdminPath,
} from "@/features/admin/auth/server";
import { config } from "@/proxy";

describe("Phase 7 auth route and proxy boundaries", () => {
  it("blocks public signup endpoints before Neon Auth handles them", () => {
    expect(isBlockedAuthPath("/api/auth/sign-up/email")).toBe(true);
    expect(isBlockedAuthPath("/api/auth/sign-up")).toBe(true);
    expect(isBlockedAuthPath("/api/auth/sign-in/email")).toBe(false);
    expect(AUTH_SIGNUP_BLOCK_STATUS).toBe(404);
  });

  it("keeps /admin/login reachable anonymously", () => {
    expect(isAnonymousAdminPath("/admin/login")).toBe(true);
    expect(isProtectedAdminPath("/admin/login")).toBe(false);
  });

  it("protects /admin, /admin/inbox, and unknown /admin paths", () => {
    expect(isProtectedAdminPath("/admin")).toBe(true);
    expect(isProtectedAdminPath("/admin/inbox")).toBe(true);
    expect(isProtectedAdminPath("/admin/anything")).toBe(true);
  });

  it("does not match public routes or auth APIs in Proxy config", () => {
    expect(config.matcher).toEqual(["/admin/:path*"]);
    expect(isProtectedAdminPath("/")).toBe(false);
    expect(isProtectedAdminPath("/projects")).toBe(false);
    expect(isProtectedAdminPath("/api/auth/sign-in/email")).toBe(false);
  });
});
