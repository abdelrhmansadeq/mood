"use client";

import Link from "next/link";
import ProductCard from "@/components/product-card";
import { useProducts } from "@/components/products-context";
import { ProductGridSkeleton } from "@/components/skeleton";
import AiStylist from "@/components/ai-stylist";

export default function Home() {
    const { products, isLoading } = useProducts();

    const featured = products.filter((p) => p.isFeatured);
    const bestSellers = [...products]
        .filter((p) => (p.soldCount || 0) > 0)
        .sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0))
        .slice(0, 4);
    const newArrivals = [...products].reverse().slice(0, 4);

    return (
        <div className="overflow-x-hidden">
            {/* ================= HERO SECTION ================= */}
            {/* ✅ قللنا الارتفاع على الموبايل من 75vh لـ 60vh */}
            <section className="relative h-[60vh] min-h-[400px] md:h-[75vh] md:min-h-[500px] flex items-center overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1920&q=80"
                    alt="Mood Fashion"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/40 to-transparent md:bg-charcoal/50" />

                <div className="relative max-w-7xl mx-auto px-4 md:px-8 w-full mt-4 md:mt-0">
                    <div className="max-w-xl animate-fade-up">
                        <p className="text-gold text-[10px] md:text-sm font-medium tracking-widest mb-2 md:mb-4 uppercase">
                            Mood — الأناقة تبدأ من هنا
                        </p>
                        <h1 className="text-3xl md:text-6xl lg:text-7xl font-bold text-cream leading-tight mb-3 md:mb-6">
                            أناقتك، <br />
                            بأسلوبك.
                        </h1>
                        <p className="text-cream/90 text-xs md:text-lg mb-5 md:mb-8 leading-relaxed max-w-xs md:max-w-none">
                            اكتشف تشكيلة مميزة من الملابس العصرية بتصاميم تناسب ذوقك.
                        </p>
                        {/* ✅ صغرنا حجم الأزرار شوية على الموبايل */}
                        <div className="flex flex-col sm:flex-row gap-2.5 md:gap-4">
                            <Link
                                href="/products"
                                className="inline-block text-center bg-gold hover:bg-gold-dark text-charcoal font-bold px-8 py-3 md:py-3.5 rounded-full md:rounded-md transition-colors"
                            >
                                تسوق الآن
                            </Link>
                            <Link
                                href="/about"
                                className="inline-block text-center border border-cream/50 hover:border-cream hover:bg-cream/10 text-cream font-medium px-8 py-3 md:py-3.5 rounded-full md:rounded-md transition-colors backdrop-blur-sm"
                            >
                                اعرف أكثر
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= FEATURES STRIP ================= */}
            <section className="bg-white py-4 md:py-10 border-b border-charcoal/5">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="grid grid-cols-3 gap-2 md:gap-8 divide-x divide-charcoal/10 md:divide-none">
                        {[
                            { title: "شحن مجاني", desc: "أكثر من 500 ج.م" },
                            { title: "إرجاع مجاني", desc: "خلال 14 يوم" },
                            { title: "دعم 24/7", desc: "جاهزين لمساعدتك" },
                        ].map((f, idx) => (
                            <div
                                key={f.title}
                                className="text-center animate-fade-up opacity-0 px-1 md:px-0"
                                style={{ animationDelay: `${idx * 100}ms`, animationFillMode: "forwards" }}
                            >
                                <h3 className="text-[12px] md:text-base font-bold text-charcoal mb-1">{f.title}</h3>
                                <p className="text-[9px] md:text-sm text-muted">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ================= BEST SELLERS ================= */}
            {!isLoading && bestSellers.length > 0 && (
                <section className="py-8 md:py-20 border-b border-charcoal/5">
                    <div className="max-w-7xl mx-auto px-4 md:px-8">
                        <div className="flex items-end justify-between mb-4 md:mb-10">
                            <div className="animate-fade-up">
                                <p className="text-gold text-[10px] md:text-xs font-bold tracking-widest uppercase mb-1 md:mb-2">
                                    Best Sellers
                                </p>
                                <h2 className="text-xl md:text-4xl font-bold text-charcoal">
                                    الأكثر مبيعاً
                                </h2>
                            </div>
                            <Link
                                href="/products"
                                className="text-[11px] md:text-sm font-bold text-gold hover:text-gold-dark transition-colors border-b border-transparent md:border-charcoal/20 hover:border-gold pb-0.5 flex items-center gap-1"
                            >
                                عرض الكل
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                            </Link>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                            {bestSellers.map((product, idx) => (
                                <div
                                    key={product.id}
                                    className="animate-fade-up opacity-0"
                                    style={{ animationDelay: `${idx * 80}ms`, animationFillMode: "forwards" }}
                                >
                                    <ProductCard product={product} />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ================= FEATURED PRODUCTS ================= */}
            <section className="py-8 md:py-20">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="flex items-end justify-between mb-4 md:mb-10">
                        <div className="animate-fade-up">
                            <p className="text-gold text-[10px] md:text-xs font-bold tracking-widest uppercase mb-1 md:mb-2">
                                Featured
                            </p>
                            <h2 className="text-xl md:text-4xl font-bold text-charcoal">
                                منتجات مميزة
                            </h2>
                        </div>
                        <Link
                            href="/products"
                            className="text-[11px] md:text-sm font-bold text-gold hover:text-gold-dark transition-colors border-b border-transparent md:border-charcoal/20 hover:border-gold pb-0.5 flex items-center gap-1"
                        >
                            عرض الكل
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                        </Link>
                    </div>

                    {isLoading ? (
                        <ProductGridSkeleton count={4} />
                    ) : featured.length > 0 ? (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                            {featured.map((product, idx) => (
                                <div
                                    key={product.id}
                                    className="animate-fade-up opacity-0"
                                    style={{ animationDelay: `${idx * 80}ms`, animationFillMode: "forwards" }}
                                >
                                    <ProductCard product={product} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-sm text-muted py-8">مفيش منتجات مميزة حالياً.</p>
                    )}
                </div>
            </section>

            {/* ================= NEW ARRIVALS ================= */}
            {!isLoading && newArrivals.length > 0 && (
                <section className="py-8 md:py-20 bg-white border-t border-charcoal/5">
                    <div className="max-w-7xl mx-auto px-4 md:px-8">
                        <div className="flex items-end justify-between mb-4 md:mb-10">
                            <div className="animate-fade-up">
                                <p className="text-gold text-[10px] md:text-xs font-bold tracking-widest uppercase mb-1 md:mb-2">
                                    New Arrivals
                                </p>
                                <h2 className="text-xl md:text-4xl font-bold text-charcoal">
                                    وصل حديثاً
                                </h2>
                            </div>
                            <Link
                                href="/products"
                                className="text-[11px] md:text-sm font-bold text-gold hover:text-gold-dark transition-colors border-b border-transparent md:border-charcoal/20 hover:border-gold pb-0.5 flex items-center gap-1"
                            >
                                عرض الكل
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                            </Link>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                            {newArrivals.map((product, idx) => (
                                <div
                                    key={product.id}
                                    className="animate-fade-up opacity-0"
                                    style={{ animationDelay: `${idx * 80}ms`, animationFillMode: "forwards" }}
                                >
                                    <ProductCard product={product} />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ================= AI STYLIST ================= */}
            <AiStylist />

            {/* ================= FINAL CTA ================= */}
            <section className="py-10 md:py-20 bg-cream border-t border-charcoal/5">
                <div className="max-w-3xl mx-auto px-6 text-center">
                    <h2 className="text-xl md:text-3xl font-bold text-charcoal mb-2 md:mb-4 animate-fade-up">
                        جاهز تكتشف تشكيلتنا؟
                    </h2>
                    <p className="text-xs md:text-base text-muted mb-5 md:mb-8 animate-fade-up">
                        آلاف القطع المميزة بانتظارك
                    </p>
                    <Link
                        href="/products"
                        className="inline-block bg-charcoal hover:bg-gold text-cream hover:text-charcoal font-bold px-8 md:px-10 py-3 md:py-3.5 rounded-full md:rounded-md transition-colors animate-fade-up shadow-lg text-sm md:text-base"
                    >
                        تسوق الآن
                    </Link>
                </div>
            </section>
        </div>
    );
}