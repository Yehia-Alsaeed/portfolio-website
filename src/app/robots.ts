import type { MetadataRoute } from "next";

import { publicEnv } from "@/lib/env/public";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        allow: "/",
        disallow: "/admin",
        userAgent: "*",
      },
    ],
    host: publicEnv.siteUrl.origin,
  };
}
