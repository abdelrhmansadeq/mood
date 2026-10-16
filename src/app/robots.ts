import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    const baseUrl = "https://mood-khaki-beta.vercel.app";

    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: [
                    "/admin/",
                    "/api/",
                    "/account/",
                    "/checkout/",
                    "/login",
                    "/signup",
                    "/forgot-password",
                    "/reset-password",
                ],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}