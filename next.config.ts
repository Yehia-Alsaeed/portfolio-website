import type { NextConfig } from "next";

// Read directly rather than importing the validated `publicEnv` helper: this
// file is evaluated by Next's own config loader, outside the app's `@/*`
// module graph.
const cloudinaryCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim();

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "16kb",
    },
  },
  images: {
    remotePatterns: cloudinaryCloudName
      ? [
          {
            hostname: "res.cloudinary.com",
            pathname: `/${cloudinaryCloudName}/image/upload/**`,
            protocol: "https",
          },
        ]
      : [],
  },
  poweredByHeader: false,
  reactStrictMode: true,
  typedRoutes: true,
};

export default nextConfig;
