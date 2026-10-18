import Link from "next/link";
import { notFound } from "next/navigation";
import ProductDetail from "@/components/product-detail";
import { supabase } from "@/lib/supabase";

type Props = {
    params: Promise<{ id: string }>;
};

// ✅ دالة الـ SEO الديناميكي
export async function generateMetadata({ params }: Props) {
    const { id } = await params;

    const { data: product } = await supabase
        .from("products")
        .select("name, description, image")
        .eq("id", Number(id))
        .single();

    if (!product) {
        return { title: "المنتج غير موجود - Mood" };
    }

    return {
        title: `${product.name} - Mood`,
        description: product.description || `تسوق ${product.name} من متجر Mood بأفضل الأسعار.`,
        openGraph: {
            title: `${product.name} - Mood`,
            description: product.description,
            images: product.image ? [{ url: product.image }] : [],
        },
    };
}

// ✅ الصفحة (Server Component)
export default async function ProductPage({ params }: Props) {
    const { id } = await params;

    // 1. جلب المنتج الأساسي
    const { data: product } = await supabase
        .from("products")
        .select("*")
        .eq("id", Number(id))
        .single();

    if (!product) {
        notFound();
    }

    // 2. جلب المنتجات المشابهة
    const { data: related } = await supabase
        .from("products")
        .select("*")
        .eq("category", product.category)
        .neq("id", product.id)
        .limit(4);

    // ✅ 3. تجهيز بيانات JSON-LD لمحركات البحث
    const productPrice = product.sale_price || product.price;
    const isAvailable = product.stock > 0;

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        image: product.image,
        description: product.description,
        sku: product.id.toString(),
        offers: {
            "@type": "Offer",
            url: `https://mood-khaki-beta.vercel.app/products/${product.id}`,
            priceCurrency: "EGP",
            price: productPrice,
            itemCondition: "https://schema.org/NewCondition",
            availability: isAvailable ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        },
        // لو المنتج عنده تقييمات، بنضيفها
        ...(product.reviews_count > 0 && {
            aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: product.avg_rating,
                reviewCount: product.reviews_count,
            },
        }),
    };

    return (
        <>
            {/* ✅ حقن كود الـ JSON-LD */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <ProductDetail product={product} related={related || []} />
        </>
    );
}