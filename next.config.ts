import type { NextConfig } from "next";

const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
  "img-src 'self' data: blob: https:",
  "font-src 'self' fonts.gstatic.com",
  "connect-src 'self' https://api.ipify.org https://ipapi.co https://*.supabase.co",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const repoOwner = process.env.VERCEL_GIT_REPO_OWNER || process.env.NEXT_PUBLIC_VERCEL_GIT_REPO_OWNER || 'Farrux-Developer';
const repoSlug = process.env.VERCEL_GIT_REPO_SLUG || process.env.NEXT_PUBLIC_VERCEL_GIT_REPO_SLUG || 'Habit-Tracker';
const githubReleasesUrl = `https://github.com/${repoOwner}/${repoSlug}/releases`;

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: false,
  serverExternalPackages: [],
  turbopack: { rules: {} },
  images: { formats: ["image/avif", "image/webp"] },
  typescript: { ignoreBuildErrors: false },
  env: {
    NEXT_PUBLIC_GITHUB_RELEASES_URL: githubReleasesUrl,
    NEXT_PUBLIC_VERCEL_GIT_REPO_OWNER: repoOwner,
    NEXT_PUBLIC_VERCEL_GIT_REPO_SLUG: repoSlug,
  },

  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: '.*\\.vercel\\.app',
          },
        ],
        destination: `https://github.com/${repoOwner}/${repoSlug}/releases/latest`,
        permanent: false,
      },
    ];
  },

  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: '(?<host>.*\\.vercel\\.app)',
          },
        ],
        destination: `https://github.com/${process.env.VERCEL_GIT_REPO_OWNER || 'Farrux-Developer'}/${process.env.VERCEL_GIT_REPO_SLUG || 'Habit-Tracker'}/releases/latest`,
        permanent: false,
      },
    ];
  },

  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: ".*\\.vercel\\.app",
          },
        ],
        destination: `${githubReleasesUrl}/latest`,
        permanent: false,
      },
    ];
  },

  // ============================================================
  // Security Headers
  // ============================================================
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
    ];
  },
};

export default nextConfig;
