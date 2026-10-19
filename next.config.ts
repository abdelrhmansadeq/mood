import { withSentryConfig } from "@sentry/nextjs/config";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "dfignsrhvefuxjihtynh.supabase.co",
      },
      {
        protocol: "https",
        hostname: "tse2.mm.bing.net",
      },
    ],
  },

  serverExternalPackages: ["sharp"],

  // ✅ إضافة هيدرز الأمان (Security Headers)
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY", // يمنع أي موقع تاني من إنه يحط موقعك جوه إطار (Clickjacking)
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff", // يمنع المتصفح من تخمين نوع الملفات (مهم جداً للصور والملفات)
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin", // بيحمي بيانات المستخدم لما يتنقل من موقعك لموقع تاني
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()", // بيمنع أي كود من إنه يطلب إذن الكاميرا أو الميكروفون
          },
        ],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "abdelrhman-team",

  project: "mood-store",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
});
