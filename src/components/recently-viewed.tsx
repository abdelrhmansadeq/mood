"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Product } from "@/data/products";

export default function RecentlyViewed({ currentProductId }: { currentProductId: number }) {
    const [recent, setRecent] = useState<Product[]>([]);

    useEffect(() => {
        // بنجيب المنتجات اللي اتفرج عليها من الـ localStorage
        const stored = localStorage.getItem("mood-recently-viewed");
        if (stored) {
            try {
                const parsed: Product[] = JSON.parse(stored);
                // بنشيل المنتج الحالي عشان ميتكررش
                const filtered = parsed.filter((p) => p.id !== currentProductId);
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setRecent(filtered.slice(0, 4));
            } catch (e) {
                console.error(e);
            }
        }
    }, [currentProductId]);

    if (recent.length === 0) return null;

    return (
        <section className="mt-16 pt-10 border-t border-charcoal/10">
            <h2 className="text-xl md:text-2xl font-bold text-charcoal mb-5">شوهدت مؤخراً 👀</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                {recent.map((p) => (
                    <Link key={p.id} href={`/products/${p.id}`} className="group block bg-white rounded-lg overflow-hidden border border-charcoal/5 hover:border-gold/30 transition-all hover:shadow-lg">
                        <div className="relative w-full overflow-hidden bg-cream" style={{ aspectRatio: "3 / 4" }}>
                            <img src={p.image} alt={p.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                        <div className="p-3">
                            <h3 className="text-xs md:text-sm font-medium text-charcoal truncate">{p.name}</h3>
                            <p className="text-sm font-semibold text-charcoal mt-1">{p.salePrice ?? p.price} ج.م</p>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}