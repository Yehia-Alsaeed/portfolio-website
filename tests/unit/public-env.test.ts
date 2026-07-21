import { describe, expect, it } from "vitest";

import { resolveCloudinaryCloudName, resolveSiteUrl } from "@/lib/env/public";

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

describe("resolveCloudinaryCloudName", () => {
  it("is undefined when absent, so project images fall back to local assets", () => {
    expect(resolveCloudinaryCloudName(undefined)).toBeUndefined();
    expect(resolveCloudinaryCloudName("")).toBeUndefined();
    expect(resolveCloudinaryCloudName("   ")).toBeUndefined();
  });

  it("trims and accepts a valid cloud name", () => {
    expect(resolveCloudinaryCloudName(" demo-cloud-1 ")).toBe("demo-cloud-1");
  });

  it("rejects a cloud name with characters outside letters, numbers, and hyphens", () => {
    expect(() => resolveCloudinaryCloudName("demo cloud")).toThrow(
      "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME must contain only letters, numbers, and hyphens",
    );
    expect(() => resolveCloudinaryCloudName("demo/cloud")).toThrow(
      "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME must contain only letters, numbers, and hyphens",
    );
  });
});
