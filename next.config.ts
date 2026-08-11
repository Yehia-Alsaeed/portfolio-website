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
  async headers() {
    // Public routes stay statically rendered (a locked constraint), so a
    // per-request nonce is not an option - a nonce would force every public
    // page onto the dynamic render path. This is the strictest policy the
    // actual production build supports without one. 'unsafe-inline' remains
    // on script-src and style-src because Next's own RSC hydration payload
    // (`self.__next_f.push(...)`, unique per render, so it cannot be
    // pre-hashed) and responsive media components use controlled inline
    // dimensions. Every other directive is still meaningfully restrictive:
    // no remote script/style host, no third-party image/font/connect
    // origin beyond the one configured Cloudinary cloud, no plugin objects,
    // and no framing in or out. See docs/implementation/phase-8-report.md
    // Stage 5 for the full evidence trail.
    // 'unsafe-eval' is added only under `next dev`: React's development
    // build uses eval() to reconstruct stack traces for its debugging
    // overlay (confirmed via the exact console warning naming this), and
    // explicitly never does in production - `next build`/`next start` never
    // add it.
    const isDevelopment = process.env.NODE_ENV === "development";
    const contentSecurityPolicy = [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ""}`,
      "style-src 'self' 'unsafe-inline'",
      `img-src 'self'${cloudinaryCloudName ? " https://res.cloudinary.com" : ""}`,
      "font-src 'self'",
      "connect-src 'self'",
      "media-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "frame-src 'none'",
    ].join("; ");

    return [
      {
        headers: [
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
          },
          { key: "X-Frame-Options", value: "DENY" },
        ],
        source: "/:path*",
      },
      {
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
          { key: "Cache-Control", value: "private, no-store" },
        ],
        source: "/admin/:path*",
      },
      {
        headers: [{ key: "Cache-Control", value: "private, no-store" }],
        source: "/api/auth/:path*",
      },
      {
        // Both are static files under `public/` that Yehia replaces
        // manually and infrequently (a new CV, a new client-work
        // recording) without the filename ever changing, so `immutable`
        // would risk serving stale content indefinitely. A moderate fresh
        // window with mandatory revalidation after that is a meaningfully
        // better default than Next's own `max-age=0` for these paths
        // without that risk.
        headers: [{ key: "Cache-Control", value: "public, max-age=3600, must-revalidate" }],
        source: "/cv/:path*",
      },
      {
        headers: [{ key: "Cache-Control", value: "public, max-age=3600, must-revalidate" }],
        source: "/media/:path*",
      },
    ];
  },
  typedRoutes: true,
};

export default nextConfig;
