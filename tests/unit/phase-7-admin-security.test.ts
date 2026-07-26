import { describe, expect, it } from "vitest";

import nextConfig from "../../next.config";
import { config as proxyConfig } from "@/proxy";
import { isBlockedAuthPath } from "@/features/admin/auth/server";

describe("Phase 7 admin security regression", () => {
  it("keeps direct signup paths disabled", () => {
    expect(isBlockedAuthPath("/api/auth/sign-up")).toBe(true);
    expect(isBlockedAuthPath("/api/auth/sign-up/email")).toBe(true);
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
});
