"use client";
import { ProductGridSkeleton } from "@/components/skeleton";

import { useState, useMemo } from "react";
import ProductCard from "@/components/product-card";
import { useProducts } from "@/components/products-context";

type Category = "all" | "men" | "women" | "kids";
type SortOption = "featured" | "price-asc" | "price-desc" | "name-asc";

export default function ProductsPage() {
    const { products, isLoading } = useProducts();
    const [category, setCategory] = useState<Category>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<SortOption>("featured");

    const filteredProducts = useMemo(() => {
        const filtered = products.filter((p) => {
            const matchCategory = category === "all" || p.category === category;
            const matchSearch =
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.nameEn.toLowerCase().includes(searchQuery.toLowerCase());
            return matchCategory && matchSearch;
        });

        const sorted = [...filtered];
        switch (sortBy) {
            case "price-asc":
                sorted.sort((a, b) => a.price - b.price);
                break;
            case "price-desc":
                sorted.sort((a, b) => b.price - a.price);
                break;
            case "name-asc":
                sorted.sort((a, b) => a.name.localeCompare(b.name, "ar"));
                break;
            case "featured":
            default:
                sorted.sort((a, b) => {
                    if (a.isFeatured && !b.isFeatured) return -1;
                    if (!a.isFeatured && b.isFeatured) return 1;
                    return 0;
                });
        }
        return sorted;
    }, [products, category, searchQuery, sortBy]);

    const categories: { value: Category; label: string }[] = [
        { value: "all", label: "الكل" },
        { value: "men", label: "رجالي" },
        { value: "women", label: "نسائي" },
        { value: "kids", label: "أطفال" },
    ];

    const sortOptions: { value: SortOption; label: string }[] = [
        { value: "featured", label: "المميزة أولاً" },
        { value: "price-asc", label: "السعر: من الأقل للأعلى" },
        { value: "price-desc", label: "السعر: من الأعلى للأقل" },
        { value: "name-asc", label: "الاسم (أ - ي)" },
    ];

    return (
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
            <div className="text-center mb-12">
                <p className="text-gold text-xs font-medium tracking-widest uppercase mb-2">
                    Shop
                </p>
                <h1 className="text-4xl md:text-5xl font-bold text-charcoal mb-3">
                    كل المنتجات
                </h1>
                <p className="text-muted max-w-md mx-auto">
                    اكتشف تشكيلتنا الكاملة من الملابس العصرية
                </p>
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 pb-6 border-b border-charcoal/10">
                <div className="flex items-center gap-2 overflow-x-auto">
                    {categories.map((cat) => (
                        <button
                            key={cat.value}
                            onClick={() => setCategory(cat.value)}
                            className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                                category === cat.value
                                    ? "bg-charcoal text-cream"
                                    : "bg-transparent text-charcoal/70 hover:bg-charcoal/5"
                            }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <div className="relative flex-1 sm:flex-none sm:w-64">
                        <input
                            type="text"
                            placeholder="ابحث عن منتج..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-2.5 ps-10 rounded-full border border-charcoal/15 bg-white text-sm text-charcoal placeholder:text-muted focus:outline-none focus:border-gold transition-colors"
                        />
                        <svg
                            className="absolute top-1/2 -translate-y-1/2 start-3.5 w-4 h-4 text-muted"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.35-4.35" />
                        </svg>
                    </div>

                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                        className="px-4 py-2.5 rounded-full border border-charcoal/15 bg-white text-sm text-charcoal focus:outline-none focus:border-gold transition-colors cursor-pointer"
                    >
                        {sortOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <p className="text-sm text-muted mb-6">
                {filteredProducts.length} منتج
            </p>

            {isLoading ? (
                <ProductGridSkeleton count={8} />
            ) : filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {filteredProducts.map((product, idx) => (
                        <div
                            key={product.id}
                            className="animate-fade-up opacity-0"
                            style={{
                                animationDelay: `${idx * 50}ms`,
                                animationFillMode: "forwards",
                            }}
                        >
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20">
                    <p className="text-muted mb-2">مفيش منتجات مطابقة للبحث</p>
                    <button
                        onClick={() => {
                            setCategory("all");
                            setSearchQuery("");
                            setSortBy("featured");
                        }}
                        className="text-gold text-sm font-medium hover:underline"
                    >
                        امسح الفلاتر
                    </button>
                </div>
            )}
        </div>
    );
}