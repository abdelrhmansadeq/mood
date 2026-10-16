import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = "https://mood-khaki-beta.vercel.app";

    const staticPages = [
        { url: "", priority: 1.0, changeFrequency: "daily" as const },
        { url: "/products", priority: 0.9, changeFrequency: "daily" as const },
        { url: "/about", priority: 0.7, changeFrequency: "monthly" as const },
        { url: "/contact", priority: 0.7, changeFrequency: "monthly" as const },
        { url: "/wishlist", priority: 0.5, changeFrequency: "weekly" as const },
        { url: "/privacy", priority: 0.4, changeFrequency: "yearly" as const },
        { url: "/terms", priority: 0.4, changeFrequency: "yearly" as const },
    ];

    return staticPages.map((page) => ({
        url: `${baseUrl}${page.url}`,
        lastModified: new Date(),
        changeFrequency: page.changeFrequency,
        priority: page.priority,
    }));
}