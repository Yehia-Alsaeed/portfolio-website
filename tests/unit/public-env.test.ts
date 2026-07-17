import { describe, expect, it } from "vitest";

import { resolveSiteUrl } from "@/lib/env/public";

describe("resolveSiteUrl", () => {
  it("uses the safe local URL when the value is absent", () => {
    expect(resolveSiteUrl(undefined).href).toBe("http://localhost:3000/");
  });

  it("normalizes an explicit HTTP or HTTPS origin", () => {
    expect(resolveSiteUrl(" https://portfolio.example/path ").origin).toBe(
      "https://portfolio.example",
    );
  });

  it("rejects non-HTTP protocols", () => {
    expect(() => resolveSiteUrl("ftp://portfolio.example")).toThrow(
      "NEXT_PUBLIC_SITE_URL must use http or https",
    );
  });
});
