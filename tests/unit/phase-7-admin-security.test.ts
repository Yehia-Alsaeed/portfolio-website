import { describe, expect, it } from "vitest";

import nextConfig from "../../next.config";
import { config as proxyConfig } from "@/proxy";
import { isBlockedAuthPath } from "@/features/admin/auth/server";

describe("Phase 7 admin security regression", () => {
  it("keeps direct signup paths disabled", () => {
    expect(isBlockedAuthPath("/api/auth/sign-up")).toBe(true);
    expect(isBlockedAuthPath("/api/auth/sign-up/email")).toBe(true);
  });

  it("blocks every identity-creation and privileged-plugin path Neon Auth exposes", () => {
    // Confirmed against @neondatabase/auth's own route surface (its type
    // declarations), not guessed - see phase-8-report.md Stage 5.
    const blocked = [
      "/api/auth/sign-in/social",
      "/api/auth/sign-in/magic-link",
      "/api/auth/sign-in/email-otp",
      "/api/auth/magic-link/verify",
      "/api/auth/email-otp/send-verification-otp",
      "/api/auth/email-otp/verify-email",
      "/api/auth/token/anonymous",
      "/api/auth/admin/create-user",
      "/api/auth/admin/impersonate-user",
      "/api/auth/admin/set-role",
      "/api/auth/request-password-reset",
      "/api/auth/reset-password",
      "/api/auth/organization/create",
    ];

    for (const path of blocked) {
      expect(isBlockedAuthPath(path), path).toBe(true);
    }
  });

  it("does not block the legitimate admin's own session/login endpoints", () => {
    // Only the pre-provisioned admin can ever reach these (signup is fully
    // blocked above), so self-service session management stays available.
    const allowed = [
      "/api/auth/sign-in/email",
      "/api/auth/get-session",
      "/api/auth/sign-out",
      "/api/auth/change-password",
      "/api/auth/token",
      "/api/auth/jwt",
    ];

    for (const path of allowed) {
      expect(isBlockedAuthPath(path), path).toBe(false);
    }
  });

  it("matches only admin pages in proxy", () => {
    expect(proxyConfig.matcher).toEqual(["/admin/:path*"]);
  });

  it("adds noindex and private no-store headers to admin responses", async () => {
    const headers = await nextConfig.headers?.();
    const adminHeaders = headers?.find((entry) => entry.source === "/admin/:path*")?.headers;

    expect(adminHeaders).toContainEqual({
      key: "X-Robots-Tag",
      value: "noindex, nofollow, noarchive",
    });
    expect(adminHeaders).toContainEqual({ key: "Cache-Control", value: "private, no-store" });
  });

  it("applies the enforced security-header policy to every route", async () => {
    const headers = await nextConfig.headers?.();
    const globalHeaders = headers?.find((entry) => entry.source === "/:path*")?.headers ?? [];
    const byKey = Object.fromEntries(globalHeaders.map((h) => [h.key, h.value]));

    expect(byKey["Content-Security-Policy"]).toBeDefined();
    expect(byKey["Content-Security-Policy-Report-Only"]).toBeUndefined();
    expect(byKey["Strict-Transport-Security"]).toBe("max-age=63072000; includeSubDomains");
    expect(byKey["X-Content-Type-Options"]).toBe("nosniff");
    expect(byKey["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
    expect(byKey["X-Frame-Options"]).toBe("DENY");
    expect(byKey["Permissions-Policy"]).toContain("camera=()");
  });

  it("never allows unsafe-eval in the production CSP", async () => {
    const originalEnv = process.env.NODE_ENV;
    // @ts-expect-error -- test-only override of a read-only env binding
    process.env.NODE_ENV = "production";

    try {
      const headers = await nextConfig.headers?.();
      const csp = headers
        ?.find((entry) => entry.source === "/:path*")
        ?.headers.find((h) => h.key === "Content-Security-Policy")?.value;

      expect(csp).not.toContain("unsafe-eval");
      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("object-src 'none'");
      expect(csp).toContain("frame-ancestors 'none'");
    } finally {
      // @ts-expect-error -- restoring the same read-only env binding
      process.env.NODE_ENV = originalEnv;
    }
  });
});
