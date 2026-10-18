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
    ],
  },
};

export default nextConfig;