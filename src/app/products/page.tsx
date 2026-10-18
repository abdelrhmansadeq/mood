"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProductCard from "@/components/product-card";
import { useProducts } from "@/components/products-context";
import { ProductGridSkeleton } from "@/components/skeleton";
import { ALL_CATEGORIES, getCategoryLabel } from "@/data/products";
import type { ProductCategory } from "@/data/products";

type CategoryFilter = "all" | ProductCategory;
type SortOption = "featured" | "price-asc" | "price-desc" | "name-asc";
type PriceRange = "all" | "under-200" | "200-500" | "500-800" | "above-800";

export default function ProductsPage() {
    const router = useRouter();
    const { products, isLoading } = useProducts();

    // الفلاتر الأصلية بتاعتك
    const [category, setCategory] = useState<CategoryFilter>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<SortOption>("featured");
    const [priceRange, setPriceRange] = useState<PriceRange>("all");

    // ✅ حالة إظهار قائمة الاقتراحات
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    // ✅ إخفاء الاقتراحات لو المستخدم داس في أي مكان برة مربع البحث
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // ✅ استخراج أول 5 منتجات للاقتراحات
    const suggestions = useMemo(() => {
        if (searchQuery.trim().length < 2) return [];
        const q = searchQuery.toLowerCase();
        return products
            .filter((p) =>
                p.name.toLowerCase().includes(q) ||
                p.nameEn.toLowerCase().includes(q)
            )
            .slice(0, 5);
    }, [searchQuery, products]);

    const handleSuggestionClick = (id: number) => {
        setShowSuggestions(false);
        router.push(`/products/${id}`);
    };

    // الفلترة الأصلية بتاعتك
    const filteredProducts = useMemo(() => {
        const filtered = products.filter((p) => {
            const matchCategory = category === "all" || p.category === category;
            const q = searchQuery.toLowerCase();
            const matchSearch =
                p.name.toLowerCase().includes(q) ||
                p.nameEn.toLowerCase().includes(q) ||
                p.description.toLowerCase().includes(q);

            let matchPrice = true;
            switch (priceRange) {
                case "under-200": matchPrice = p.price < 200; break;
                case "200-500": matchPrice = p.price >= 200 && p.price <= 500; break;
                case "500-800": matchPrice = p.price > 500 && p.price <= 800; break;
                case "above-800": matchPrice = p.price > 800; break;
                case "all":
                default: matchPrice = true;
            }

            return matchCategory && matchSearch && matchPrice;
        });

        const sorted = [...filtered];
        switch (sortBy) {
            case "price-asc": sorted.sort((a, b) => a.price - b.price); break;
            case "price-desc": sorted.sort((a, b) => b.price - a.price); break;
            case "name-asc": sorted.sort((a, b) => a.name.localeCompare(b.name, "ar")); break;
            case "featured":
            default:
                sorted.sort((a, b) => {
                    if (a.isFeatured && !b.isFeatured) return -1;
                    if (!a.isFeatured && b.isFeatured) return 1;
                    return 0;
                });
        }
        return sorted;
    }, [products, category, searchQuery, sortBy, priceRange]);

    const categories: { value: CategoryFilter; label: string }[] = [
        { value: "all", label: "الكل" },
        ...ALL_CATEGORIES.map((c) => ({
            value: c,
            label: getCategoryLabel(c),
        })),
    ];

    const sortOptions: { value: SortOption; label: string }[] = [
        { value: "featured", label: "المميزة أولاً" },
        { value: "price-asc", label: "السعر: من الأقل للأعلى" },
        { value: "price-desc", label: "السعر: من الأعلى للأقل" },
        { value: "name-asc", label: "الاسم (أ - ي)" },
    ];

    const priceOptions: { value: PriceRange; label: string }[] = [
        { value: "all", label: "كل الأسعار" },
        { value: "under-200", label: "أقل من 200 ج.م" },
        { value: "200-500", label: "200 - 500 ج.م" },
        { value: "500-800", label: "500 - 800 ج.م" },
        { value: "above-800", label: "أكتر من 800 ج.م" },
    ];

    const hasActiveFilters = category !== "all" || searchQuery !== "" || priceRange !== "all";

    return (
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
            {/* Header */}
            <div className="text-center mb-12 animate-fade-up">
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

            {/* Filters */}
            <div className="mb-8 pb-6 border-b border-charcoal/10">
                {/* Categories */}
                <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-4">
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

                {/* Search + Sort + Price */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">

                    {/* ✅ مربع البحث مع الاقتراحات */}
                    <div className="relative sm:col-span-2 md:col-span-1" ref={searchRef}>
                        <input
                            type="text"
                            placeholder="ابحث عن منتج..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setShowSuggestions(true);
                            }}
                            onFocus={() => setShowSuggestions(true)}
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

                        {/* ✅ القائمة المنسدلة اللي بتظهر أول 5 نتائج */}
                        {showSuggestions && suggestions.length > 0 && (
                            <div className="absolute top-full mt-2 w-full bg-white border border-charcoal/10 rounded-lg shadow-xl z-50 overflow-hidden animate-fade-in">
                                {suggestions.map((product) => (
                                    <button
                                        key={product.id}
                                        onClick={() => handleSuggestionClick(product.id)}
                                        className="w-full flex items-center gap-3 p-2.5 hover:bg-cream transition-colors text-right border-b border-charcoal/5 last:border-0"
                                    >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="w-10 h-12 object-cover rounded"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-charcoal truncate">
                                                {product.name}
                                            </p>
                                            <p className="text-xs text-muted truncate">
                                                {product.nameEn}
                                            </p>
                                        </div>
                                        <p className="text-sm font-bold text-gold">
                                            {product.salePrice ?? product.price} ج.م
                                        </p>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sort */}
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

                    {/* Price Range */}
                    <select
                        value={priceRange}
                        onChange={(e) => setPriceRange(e.target.value as PriceRange)}
                        className="px-4 py-2.5 rounded-full border border-charcoal/15 bg-white text-sm text-charcoal focus:outline-none focus:border-gold transition-colors cursor-pointer"
                    >
                        {priceOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Result Count */}
            {!isLoading && (
                <div className="flex items-center justify-between mb-6">
                    <p className="text-sm text-muted">
                        {filteredProducts.length} منتج
                    </p>
                    {hasActiveFilters && (
                        <button
                            onClick={() => {
                                setCategory("all");
                                setSearchQuery("");
                                setSortBy("featured");
                                setPriceRange("all");
                            }}
                            className="text-sm text-gold hover:underline font-medium"
                        >
                            امسح كل الفلاتر
                        </button>
                    )}
                </div>
            )}

            {/* Grid */}
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
                            setPriceRange("all");
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