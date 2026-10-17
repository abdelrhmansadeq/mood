import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

const baseUrl = "https://mood-khaki-beta.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // الصفحات الثابتة
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 1.0,
        },
        {
            url: `${baseUrl}/products`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.9,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.7,
        },
        {
            url: `${baseUrl}/contact`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.7,
        },
        {
            url: `${baseUrl}/wishlist`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.5,
        },
        {
            url: `${baseUrl}/privacy`,
            lastModified: new Date(),
            changeFrequency: "yearly",
            priority: 0.4,
        },
        {
            url: `${baseUrl}/terms`,
            lastModified: new Date(),
            changeFrequency: "yearly",
            priority: 0.4,
        },
    ];

    // ✅ نجيب المنتجات من Supabase
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data: products } = await supabase
            .from("products")
            .select("id, created_at");

        if (!products) return staticPages;

        const productPages: MetadataRoute.Sitemap = products.map((product) => ({
            url: `${baseUrl}/products/${product.id}`,
            lastModified: product.created_at
                ? new Date(product.created_at)
                : new Date(),
            changeFrequency: "weekly",
            priority: 0.8,
        }));

        return [...staticPages, ...productPages];
    } catch (error) {
        console.error("Sitemap error:", error);
        return staticPages;
    }
}