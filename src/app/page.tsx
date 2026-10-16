"use client";

import Link from "next/link";
import ProductCard from "@/components/product-card";
import { useProducts } from "@/components/products-context";
import { ProductGridSkeleton } from "@/components/skeleton";

export default function Home() {
    const { products, isLoading } = useProducts();

    const featured = products.filter((p) => p.isFeatured);

    // Best Sellers: الأعلى مبيعاً
    const bestSellers = [...products]
        .filter((p) => (p.soldCount || 0) > 0)
        .sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0))
        .slice(0, 4);

    // New Arrivals: أحدث 4 منتجات (بترتيب عكسي)
    const newArrivals = [...products].reverse().slice(0, 4);

    return (
        <div>
            {/* Hero Section */}
            <section className="relative h-[65vh] min-h-[500px] flex items-center overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1920&q=80"
                    alt="Mood Fashion"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-charcoal/50" />

                <div className="relative max-w-7xl mx-auto px-6 lg:px-8 w-full">
                    <div className="max-w-xl animate-fade-up">
                        <p className="text-gold text-sm font-medium tracking-widest mb-4 uppercase">
                            Mood — الأناقة تبدأ من هنا
                        </p>
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-cream leading-tight mb-6">
                            أناقتك، <br />
                            بأسلوبك.
                        </h1>
                        <p className="text-cream/80 text-lg mb-8 leading-relaxed">
                            اكتشف تشكيلة مميزة من الملابس العصرية بتصاميم تناسب ذوقك.
                        </p>
                        <div className="flex gap-4">
                            <Link
                                href="/products"
                                className="inline-block bg-gold hover:bg-gold-dark text-charcoal font-semibold px-8 py-3 rounded-md transition-colors"
                            >
                                تسوق الآن
                            </Link>
                            <Link
                                href="/about"
                                className="inline-block border border-cream/40 hover:border-cream text-cream font-medium px-8 py-3 rounded-md transition-colors"
                            >
                                اعرف أكثر
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="bg-white py-12 border-b border-charcoal/5">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { title: "شحن مجاني", desc: "للطلبات أكثر من 500 ج.م" },
                            { title: "إرجاع مجاني", desc: "خلال 14 يوم من الاستلام" },
                            { title: "دعم 24/7", desc: "فريقنا جاهز لمساعدتك" },
                        ].map((f, idx) => (
                            <div
                                key={f.title}
                                className="text-center animate-fade-up opacity-0"
                                style={{
                                    animationDelay: `${idx * 100}ms`,
                                    animationFillMode: "forwards",
                                }}
                            >
                                <h3 className="text-base font-semibold text-charcoal mb-1">
                                    {f.title}
                                </h3>
                                <p className="text-sm text-muted">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Best Sellers */}
            {!isLoading && bestSellers.length > 0 && (
                <section className="py-16 md:py-20 border-b border-charcoal/5">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <div className="flex items-end justify-between mb-8 md:mb-10">
                            <div className="animate-fade-up">
                                <p className="text-gold text-xs font-medium tracking-widest uppercase mb-2">
                                    Best Sellers
                                </p>
                                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-charcoal">
                                    الأكثر مبيعاً
                                </h2>
                            </div>
                            <Link
                                href="/products"
                                className="hidden md:inline-block text-sm font-medium text-charcoal hover:text-gold transition-colors border-b border-charcoal/20 hover:border-gold pb-1"
                            >
                                شوف كل المنتجات
                            </Link>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                            {bestSellers.map((product, idx) => (
                                <div
                                    key={product.id}
                                    className="animate-fade-up opacity-0"
                                    style={{
                                        animationDelay: `${idx * 80}ms`,
                                        animationFillMode: "forwards",
                                    }}
                                >
                                    <ProductCard product={product} />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Featured Products */}
            <section className="py-16 md:py-20">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="flex items-end justify-between mb-8 md:mb-10">
                        <div className="animate-fade-up">
                            <p className="text-gold text-xs font-medium tracking-widest uppercase mb-2">
                                Featured
                            </p>
                            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-charcoal">
                                منتجات مميزة
                            </h2>
                        </div>
                        <Link
                            href="/products"
                            className="hidden md:inline-block text-sm font-medium text-charcoal hover:text-gold transition-colors border-b border-charcoal/20 hover:border-gold pb-1"
                        >
                            شوف كل المنتجات
                        </Link>
                    </div>

                    {isLoading ? (
                        <ProductGridSkeleton count={4} />
                    ) : featured.length > 0 ? (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                            {featured.map((product, idx) => (
                                <div
                                    key={product.id}
                                    className="animate-fade-up opacity-0"
                                    style={{
                                        animationDelay: `${idx * 80}ms`,
                                        animationFillMode: "forwards",
                                    }}
                                >
                                    <ProductCard product={product} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-muted py-12">
                            مفيش منتجات مميزة حالياً.
                        </p>
                    )}
                </div>
            </section>

            {/* New Arrivals */}
            {!isLoading && newArrivals.length > 0 && (
                <section className="py-16 md:py-20 bg-white border-t border-charcoal/5">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <div className="flex items-end justify-between mb-8 md:mb-10">
                            <div className="animate-fade-up">
                                <p className="text-gold text-xs font-medium tracking-widest uppercase mb-2">
                                    New Arrivals
                                </p>
                                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-charcoal">
                                    وصل حديثاً
                                </h2>
                            </div>
                            <Link
                                href="/products"
                                className="hidden md:inline-block text-sm font-medium text-charcoal hover:text-gold transition-colors border-b border-charcoal/20 hover:border-gold pb-1"
                            >
                                شوف كل المنتجات
                            </Link>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                            {newArrivals.map((product, idx) => (
                                <div
                                    key={product.id}
                                    className="animate-fade-up opacity-0"
                                    style={{
                                        animationDelay: `${idx * 80}ms`,
                                        animationFillMode: "forwards",
                                    }}
                                >
                                    <ProductCard product={product} />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Final CTA */}
            <section className="py-16 md:py-20 bg-cream">
                <div className="max-w-3xl mx-auto px-6 text-center">
                    <h2 className="text-2xl md:text-3xl font-bold text-charcoal mb-4 animate-fade-up">
                        جاهز تكتشف تشكيلتنا؟
                    </h2>
                    <p className="text-muted mb-8 animate-fade-up">
                        آلاف القطع المميزة بانتظارك
                    </p>
                    <Link
                        href="/products"
                        className="inline-block bg-charcoal hover:bg-gold text-cream hover:text-charcoal font-semibold px-8 py-3 rounded-md transition-colors animate-fade-up"
                    >
                        تسوق الآن
                    </Link>
                </div>
            </section>
        </div>
    );
}