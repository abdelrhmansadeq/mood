import Link from "next/link";
import ProductCard from "@/components/product-card";
import { products } from "@/data/products";

export default function Home() {
    const featured = products.filter((p) => p.isFeatured);

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
                    <div className="max-w-xl">
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
                        ].map((f) => (
                            <div key={f.title} className="text-center">
                                <h3 className="text-base font-semibold text-charcoal mb-1">
                                    {f.title}
                                </h3>
                                <p className="text-sm text-muted">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="flex items-end justify-between mb-10">
                        <div>
                            <p className="text-gold text-xs font-medium tracking-widest uppercase mb-2">
                                Featured
                            </p>
                            <h2 className="text-3xl md:text-4xl font-bold text-charcoal">
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

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        {featured.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>

                    <div className="md:hidden text-center mt-8">
                        <Link
                            href="/products"
                            className="inline-block text-sm font-medium text-gold border-b border-gold pb-1"
                        >
                            شوف كل المنتجات
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}