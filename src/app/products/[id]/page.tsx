"use client";

import { use } from "react";
import Link from "next/link";
import ProductDetail from "@/components/product-detail";
import { useProducts } from "@/components/products-context";

type Props = {
    params: Promise<{ id: string }>;
};

export default function ProductPage({ params }: Props) {
    const { id } = use(params);
    const { products } = useProducts();
    const product = products.find((p) => p.id === Number(id));

    if (!product) {
        return (
            <div className="max-w-2xl mx-auto px-6 py-20 text-center">
                <h1 className="text-3xl font-bold text-charcoal mb-4">
                    المنتج غير موجود
                </h1>
                <p className="text-muted mb-8">
                    يمكن المنتج اتحذف أو الرابط غلط.
                </p>
                <Link
                    href="/products"
                    className="inline-block bg-charcoal hover:bg-gold text-cream hover:text-charcoal font-semibold px-6 py-3 rounded-md transition-colors"
                >
                    رجوع للمنتجات
                </Link>
            </div>
        );
    }

    const related = products
        .filter((p) => p.category === product.category && p.id !== product.id)
        .slice(0, 4);

    return <ProductDetail product={product} related={related} />;
}