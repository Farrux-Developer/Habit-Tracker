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

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: false,
  serverExternalPackages: [],
  turbopack: { rules: {} },
  images: { formats: ["image/avif", "image/webp"] },
  typescript: { ignoreBuildErrors: false },

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
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: '(?<host>.*)\\.vercel\\.app',
          },
        ],
        destination: 'https://github.com/Farrux-Developer/Habit-Tracker/releases',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
