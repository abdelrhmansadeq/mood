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

    const [category, setCategory] = useState<CategoryFilter>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<SortOption>("featured");
    const [priceRange, setPriceRange] = useState<PriceRange>("all");

    // ✅ حالة فتح وقفل الفلاتر في الموبايل
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const suggestions = useMemo(() => {
        if (searchQuery.trim().length < 2) return [];
        const q = searchQuery.toLowerCase();
        return products
            .filter((p) => p.name.toLowerCase().includes(q) || p.nameEn.toLowerCase().includes(q))
            .slice(0, 5);
    }, [searchQuery, products]);

    const handleSuggestionClick = (id: number) => {
        setShowSuggestions(false);
        router.push(`/products/${id}`);
    };

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
        ...ALL_CATEGORIES.map((c) => ({ value: c, label: getCategoryLabel(c) })),
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

    const hasActiveFilters = category !== "all" || searchQuery !== "" || priceRange !== "all" || sortBy !== "featured";

    const clearFilters = () => {
        setCategory("all");
        setSearchQuery("");
        setSortBy("featured");
        setPriceRange("all");
    };

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12 animate-fade-in">
            {/* Header */}
            <div className="text-center mb-8 md:mb-12 animate-fade-up">
                <p className="text-gold text-xs font-medium tracking-widest uppercase mb-2">Shop</p>
                <h1 className="text-3xl md:text-5xl font-bold text-charcoal mb-3">كل المنتجات</h1>
                <p className="text-muted max-w-md mx-auto text-sm md:text-base">اكتشف تشكيلتنا الكاملة من الملابس العصرية</p>
            </div>

            {/* ===== MOBILE SEARCH & FILTER BUTTON ===== */}
            <div className="md:hidden flex items-center gap-2 mb-6">
                <div className="relative flex-1" ref={searchRef}>
                    <input
                        type="text"
                        placeholder="ابحث عن منتج..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setShowSuggestions(true);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        className="w-full px-4 py-3 ps-10 rounded-full border border-charcoal/15 bg-white text-base text-charcoal focus:outline-none focus:border-gold transition-colors"
                    />
                    <svg className="absolute top-1/2 -translate-y-1/2 start-3.5 w-5 h-5 text-muted" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                    </svg>
                    {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute top-full mt-2 w-full bg-white border border-charcoal/10 rounded-lg shadow-xl z-50 overflow-hidden animate-fade-in">
                            {suggestions.map((product) => (
                                <button key={product.id} onClick={() => handleSuggestionClick(product.id)} className="w-full flex items-center gap-3 p-3 hover:bg-cream transition-colors text-right border-b border-charcoal/5 last:border-0">
                                    <img src={product.image} alt={product.name} className="w-10 h-12 object-cover rounded" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-charcoal truncate">{product.name}</p>
                                    </div>
                                    <p className="text-sm font-bold text-gold">{product.salePrice ?? product.price} ج.م</p>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Filter Button */}
                <button
                    onClick={() => setIsFilterOpen(true)}
                    className="bg-charcoal text-cream h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line>
                    </svg>
                </button>
            </div>

            {/* ===== DESKTOP FILTERS ===== */}
            <div className="hidden md:block mb-8 pb-6 border-b border-charcoal/10">
                <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-4">
                    {categories.map((cat) => (
                        <button key={cat.value} onClick={() => setCategory(cat.value)} className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${category === cat.value ? "bg-charcoal text-cream" : "bg-transparent text-charcoal/70 hover:bg-charcoal/5"}`}>
                            {cat.label}
                        </button>
                    ))}
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <div className="relative" ref={searchRef}>
                        <input type="text" placeholder="ابحث عن منتج..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setShowSuggestions(true); }} onFocus={() => setShowSuggestions(true)} className="w-full px-4 py-2.5 ps-10 rounded-full border border-charcoal/15 bg-white text-sm focus:outline-none focus:border-gold transition-colors" />
                        <svg className="absolute top-1/2 -translate-y-1/2 start-3.5 w-4 h-4 text-muted" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
                        {showSuggestions && suggestions.length > 0 && (
                            <div className="absolute top-full mt-2 w-full bg-white border border-charcoal/10 rounded-lg shadow-xl z-50 overflow-hidden">
                                {suggestions.map((product) => (
                                    <button key={product.id} onClick={() => handleSuggestionClick(product.id)} className="w-full flex items-center gap-3 p-2.5 hover:bg-cream transition-colors text-right border-b border-charcoal/5 last:border-0">
                                        <img src={product.image} alt={product.name} className="w-10 h-12 object-cover rounded" />
                                        <div className="flex-1 min-w-0"><p className="text-sm font-medium text-charcoal truncate">{product.name}</p></div>
                                        <p className="text-sm font-bold text-gold">{product.salePrice ?? product.price} ج.م</p>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)} className="px-4 py-2.5 rounded-full border border-charcoal/15 bg-white text-sm focus:outline-none focus:border-gold cursor-pointer">
                        {sortOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                    <select value={priceRange} onChange={(e) => setPriceRange(e.target.value as PriceRange)} className="px-4 py-2.5 rounded-full border border-charcoal/15 bg-white text-sm focus:outline-none focus:border-gold cursor-pointer">
                        {priceOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                </div>
            </div>

            {/* Result Count */}
            {!isLoading && (
                <div className="flex items-center justify-between mb-6">
                    <p className="text-sm text-muted">{filteredProducts.length} منتج</p>
                    {hasActiveFilters && (
                        <button onClick={clearFilters} className="text-sm text-gold hover:underline font-medium">امسح كل الفلاتر</button>
                    )}
                </div>
            )}

            {/* Grid */}
            {isLoading ? (
                <ProductGridSkeleton count={8} />
            ) : filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                    {filteredProducts.map((product, idx) => (
                        <div key={product.id} className="animate-fade-up opacity-0" style={{ animationDelay: `${idx * 50}ms`, animationFillMode: "forwards" }}>
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20">
                    <p className="text-muted mb-2">مفيش منتجات مطابقة للبحث</p>
                    <button onClick={clearFilters} className="text-gold text-sm font-medium hover:underline">امسح الفلاتر</button>
                </div>
            )}

            {/* ===== MOBILE BOTTOM SHEET FILTERS ===== */}
            {isFilterOpen && (
                <div className="md:hidden fixed inset-0 z-[100] flex flex-col justify-end">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm animate-fade-in" onClick={() => setIsFilterOpen(false)} />

                    {/* Sheet Content */}
                    <div className="relative bg-white w-full rounded-t-3xl shadow-2xl p-6 max-h-[85vh] overflow-y-auto animate-slide-up">

                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-charcoal/10">
                            <h2 className="text-xl font-bold text-charcoal">تصفية وترتيب</h2>
                            <button onClick={() => setIsFilterOpen(false)} className="w-8 h-8 bg-cream rounded-full flex items-center justify-center text-charcoal">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Categories */}
                            <div>
                                <h3 className="text-sm font-bold text-charcoal mb-3">الفئات</h3>
                                <div className="flex flex-wrap gap-2">
                                    {categories.map((cat) => (
                                        <button key={cat.value} onClick={() => setCategory(cat.value)} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${category === cat.value ? "bg-charcoal text-cream" : "bg-cream text-charcoal/70 border border-charcoal/10"}`}>
                                            {cat.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Sort */}
                            <div>
                                <h3 className="text-sm font-bold text-charcoal mb-3">الترتيب</h3>
                                <div className="flex flex-col gap-2">
                                    {sortOptions.map((opt) => (
                                        <button key={opt.value} onClick={() => setSortBy(opt.value)} className={`flex items-center justify-between p-3 rounded-lg border text-sm transition-colors ${sortBy === opt.value ? "border-gold bg-gold/5 text-charcoal font-medium" : "border-charcoal/10 text-muted"}`}>
                                            {opt.label}
                                            {sortBy === opt.value && <div className="w-3 h-3 rounded-full bg-gold" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Price */}
                            <div>
                                <h3 className="text-sm font-bold text-charcoal mb-3">السعر</h3>
                                <div className="flex flex-col gap-2">
                                    {priceOptions.map((opt) => (
                                        <button key={opt.value} onClick={() => setPriceRange(opt.value)} className={`flex items-center justify-between p-3 rounded-lg border text-sm transition-colors ${priceRange === opt.value ? "border-gold bg-gold/5 text-charcoal font-medium" : "border-charcoal/10 text-muted"}`}>
                                            {opt.label}
                                            {priceRange === opt.value && <div className="w-3 h-3 rounded-full bg-gold" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Apply Button */}
                        <div className="mt-8 pt-4 border-t border-charcoal/10 sticky bottom-0 bg-white">
                            <button onClick={() => setIsFilterOpen(false)} className="w-full bg-charcoal hover:bg-gold text-cream hover:text-charcoal font-semibold h-14 rounded-lg transition-colors shadow-lg">
                                عرض النتائج ({filteredProducts.length})
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}