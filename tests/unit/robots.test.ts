import { describe, expect, it } from "vitest";

import robots from "@/app/robots";

describe("robots.txt", () => {
  it("allows every crawler to index the whole site", () => {
    const result = robots();
    expect(result.rules).toEqual({ userAgent: "*", allow: "/" });
  });

  it("advertises a host derived from the configured site URL", () => {
    const result = robots();
    expect(result.host).toBe("http://localhost:3000");
  });
});
