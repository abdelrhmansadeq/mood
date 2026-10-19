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

export default nextConfig;