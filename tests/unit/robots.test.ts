import { describe, expect, it } from "vitest";

import robots from "@/app/robots";

describe("robots.txt", () => {
  it("allows public pages while disallowing the private admin area", () => {
    const result = robots();
    expect(result.rules).toEqual([{ userAgent: "*", allow: "/", disallow: "/admin" }]);
  });

  it("advertises a host derived from the configured site URL", () => {
    const result = robots();
    expect(result.host).toBe("http://localhost:3000");
  });
});
