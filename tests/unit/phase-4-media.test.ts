import { afterEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

function restoreEnv() {
  if (ORIGINAL_CLOUD_NAME === undefined) delete process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  else process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = ORIGINAL_CLOUD_NAME;
}

async function loadCloudinaryModule() {
  vi.resetModules();
  return import("@/features/media/cloudinary");
}

describe("buildCloudinaryImageUrl", () => {
  afterEach(() => {
    restoreEnv();
    vi.resetModules();
  });

  it("returns undefined when no cloud name is configured (falls back to local asset)", async () => {
    delete process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const { buildCloudinaryImageUrl } = await loadCloudinaryModule();

    expect(buildCloudinaryImageUrl("prestige-home")).toBeUndefined();
  });

  it("builds a fixed-transformation URL for an allowlisted publicId", async () => {
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = "demo-cloud";
    const { buildCloudinaryImageUrl } = await loadCloudinaryModule();

    expect(buildCloudinaryImageUrl("prestige-home")).toBe(
      "https://res.cloudinary.com/demo-cloud/image/upload/f_auto,q_auto,c_limit,w_1600/prestige-home",
    );
  });

  it("honors a caller-supplied numeric width", async () => {
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = "demo-cloud";
    const { buildCloudinaryImageUrl } = await loadCloudinaryModule();

    expect(buildCloudinaryImageUrl("prestige-home", 400)).toBe(
      "https://res.cloudinary.com/demo-cloud/image/upload/f_auto,q_auto,c_limit,w_400/prestige-home",
    );
  });

  it("refuses a publicId outside the approved asset register", async () => {
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = "demo-cloud";
    const { buildCloudinaryImageUrl } = await loadCloudinaryModule();

    expect(buildCloudinaryImageUrl("unapproved-image")).toBeUndefined();
  });

  it("refuses a non-integer or non-positive width", async () => {
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = "demo-cloud";
    const { buildCloudinaryImageUrl } = await loadCloudinaryModule();

    expect(buildCloudinaryImageUrl("prestige-home", 0)).toBeUndefined();
    expect(buildCloudinaryImageUrl("prestige-home", 12.5)).toBeUndefined();
    expect(buildCloudinaryImageUrl("prestige-home", -100)).toBeUndefined();
  });
});

describe("ALLOWED_MEDIA_PUBLIC_IDS", () => {
  it("matches the eight assets approved in docs/content/asset-register.md exactly", async () => {
    const { ALLOWED_MEDIA_PUBLIC_IDS } = await loadCloudinaryModule();

    expect(ALLOWED_MEDIA_PUBLIC_IDS).toEqual(
      new Set([
        "skillbridge-interview",
        "skillbridge-results",
        "prestige-home",
        "prestige-collection",
        "pets-fcn",
        "pets-segnet",
        "pets-hrnet",
        "study-planner-architecture",
      ]),
    );
  });
});
