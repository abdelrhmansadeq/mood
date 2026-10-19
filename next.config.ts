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

  // ✅ إعدادات مكتبة sharp عشان تشتغل على Vercel
  serverExternalPackages: ["sharp"],
};

export default nextConfig;