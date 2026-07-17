const LOCAL_SITE_URL = "http://localhost:3000";

export function resolveSiteUrl(value: string | undefined): URL {
  const url = new URL(value?.trim() || LOCAL_SITE_URL);

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("NEXT_PUBLIC_SITE_URL must use http or https");
  }

  return url;
}

export const publicEnv = {
  siteUrl: resolveSiteUrl(process.env.NEXT_PUBLIC_SITE_URL),
} as const;
