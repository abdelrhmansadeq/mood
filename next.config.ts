import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        // ✅ السماح لـ Next.js بعرض الصور من Supabase Storage
        protocol: "https",
        hostname: "dfignsrhvefuxjihtynh.supabase.co",
      },
      {
        // ✅ السماح لـ Next.js بعرض الصور من محرك بحث Bing
        protocol: "https",
        hostname: "tse2.mm.bing.net",
      },
    ],
  },
};

export default nextConfig;