import type { MetadataRoute } from "next";

import { publicEnv } from "@/lib/env/public";

export default function robots(): MetadataRoute.Robots {
  const origin = publicEnv.siteUrl.origin;

  return {
    rules: [
      {
        allow: "/",
        disallow: "/admin",
        userAgent: "*",
      },
    ],
    host: origin,
    sitemap: `${origin}/sitemap.xml`,
  };
}
