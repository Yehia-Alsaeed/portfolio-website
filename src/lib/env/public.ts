const LOCAL_SITE_URL = "http://localhost:3000";
const CLOUD_NAME_PATTERN = /^[a-z0-9][a-z0-9-]*$/i;

export function resolveSiteUrl(value: string | undefined): URL {
  const url = new URL(value?.trim() || LOCAL_SITE_URL);

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("NEXT_PUBLIC_SITE_URL must use http or https");
  }

  return url;
}

/**
 * Cloudinary delivery is optional locally (project images fall back to the
 * checked-in demo assets) but must validate cleanly when it is configured.
 */
export function resolveCloudinaryCloudName(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;

  if (!CLOUD_NAME_PATTERN.test(trimmed)) {
    throw new Error(
      "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME must contain only letters, numbers, and hyphens",
    );
  }

  return trimmed;
}

export const publicEnv = {
  cloudinaryCloudName: resolveCloudinaryCloudName(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME),
  siteUrl: resolveSiteUrl(process.env.NEXT_PUBLIC_SITE_URL),
} as const;
