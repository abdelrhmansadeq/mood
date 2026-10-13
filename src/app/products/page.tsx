"use client";

import { useState, useMemo } from "react";
import ProductCard from "@/components/product-card";
import { products } from "@/data/products";

type Category = "all" | "men" | "women";

export default function ProductsPage() {
    const [category, setCategory] = useState<Category>("all");
    const [searchQuery, setSearchQuery] = useState("");

    const filteredProducts = useMemo(() => {
        return products.filter((p) => {
            const matchCategory = category === "all" || p.category === category;
            const matchSearch =
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.nameEn.toLowerCase().includes(searchQuery.toLowerCase());
            return matchCategory && matchSearch;
        });
    }, [category, searchQuery]);

    const categories: { value: Category; label: string }[] = [
        { value: "all", label: "الكل" },
        { value: "men", label: "رجالي" },
        { value: "women", label: "نسائي" },
    ];

    return (
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
            {/* Header */}
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

            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 pb-6 border-b border-charcoal/10">
                {/* Category Tabs */}
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

                {/* Search */}
                <div className="relative w-full md:w-72">
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
            </div>

            {/* Products Count */}
            <p className="text-sm text-muted mb-6">
                {filteredProducts.length} منتج
            </p>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {filteredProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20">
                    <p className="text-muted mb-2">مفيش منتجات مطابقة للبحث</p>
                    <button
                        onClick={() => {
                            setCategory("all");
                            setSearchQuery("");
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