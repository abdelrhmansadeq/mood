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

// ✅ الصفحة أصبحت Server Component
export default async function ProductPage({ params }: Props) {
    const { id } = await params;

    // 1. جلب المنتج الأساسي
    const { data: product } = await supabase
        .from("products")
        .select("*")
        .eq("id", Number(id))
        .single();

    if (!product) {
        notFound(); // بيوجهه لصفحة الـ 404 اللي أنت عاملها
    }

    // 2. جلب المنتجات المشابهة (نفس الفئة)
    const { data: related } = await supabase
        .from("products")
        .select("*")
        .eq("category", product.category)
        .neq("id", product.id)
        .limit(4);

    // 3. نمرر البيانات الجاهزة للـ Client Component
    return <ProductDetail product={product} related={related || []} />;
}