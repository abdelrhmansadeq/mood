"use client";

import { useState } from "react";
import { useCart } from "./cart-context";
import { useProducts } from "./products-context";

type AiItem = { id: number; name: string; category: string };
type Outfit = { title: string; reason: string; items: AiItem[] };

export default function AiStylist() {
    const [occasion, setOccasion] = useState("");
    const [vibe, setVibe] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [outfits, setOutfits] = useState<Outfit[]>([]);
    const [error, setError] = useState("");

    const { addItem, openCart } = useCart();
    const { products } = useProducts();

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!occasion || !vibe) return;

        setIsLoading(true);
        setError("");
        setOutfits([]);

        try {
            const res = await fetch("/api/stylist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ occasion, vibe }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "حصلت مشكلة");

            setOutfits(data.data.outfits || []);
        } catch (err: unknown) {
            if (err instanceof Error) setError(err.message);
            else setError("حصلت مشكلة في الاتصال");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddToCart = (item: AiItem) => {
        const fullProduct = products.find((p) => p.id === item.id);
        if (!fullProduct) return;

        let size = "M";
        let color = "أسود";
        let image = fullProduct.image || "";

        if (fullProduct.colors && fullProduct.colors.length > 0) {
            const firstColor = fullProduct.colors[0];
            color = firstColor.name;
            if (firstColor.image) image = firstColor.image;

            // ✅ الحل هنا: عملنا Cast للـ sizes عشان TypeScript ميزعلش
            const sizesObj = (firstColor.sizes || {}) as Record<string, number>;
            const availableSizes = Object.keys(sizesObj).filter(
                (s) => (sizesObj[s] || 0) > 0
            );
            if (availableSizes.length > 0) size = availableSizes[0];

        } else if (fullProduct.sizes) {
            // ✅ الحل هنا كمان
            const sizesObj = fullProduct.sizes as Record<string, number>;
            const availableSizes = Object.keys(sizesObj).filter(
                (s) => (sizesObj[s] || 0) > 0
            );
            if (availableSizes.length > 0) size = availableSizes[0];
        }

        addItem({
            productId: fullProduct.id,
            name: fullProduct.name,
            nameEn: fullProduct.nameEn,
            price: fullProduct.salePrice || fullProduct.price,
            image: image,
            size: size,
            color: color,
            quantity: 1,
        });

        openCart();
    };

    return (
        <section className="py-20 bg-white border-y border-charcoal/10">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">

                {/* Header */}
                <div className="text-center mb-10">
                    <p className="text-gold text-xs font-medium tracking-widest uppercase mb-2">
                        AI Fashion Stylist
                    </p>
                    <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-3">
                        مصمم الأزياء الذكي ✨
                    </h2>
                    <p className="text-muted max-w-lg mx-auto">
                        محتار تلبس إيه؟ اختار المناسبة والستايل، ودع الذكاء الاصطناعي يقترحلك 3 لووكات كاملة من منتجاتنا.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleGenerate} className="max-w-3xl mx-auto bg-cream p-6 md:p-8 rounded-xl border border-charcoal/10 mb-12 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-charcoal mb-2">المناسبة</label>
                            <select
                                value={occasion}
                                onChange={(e) => setOccasion(e.target.value)}
                                className="w-full px-4 py-3 rounded-md border border-charcoal/15 bg-white text-sm text-charcoal focus:outline-none focus:border-gold transition-colors cursor-pointer"
                                required
                            >
                                <option value="" disabled>اختار المناسبة...</option>
                                <option value="جامعة أو كلية">جامعة أو كلية</option>
                                <option value="خروجة كاجوال مع الأصحاب">خروجة مع الأصحاب</option>
                                <option value="مناسبة رسمية أو عمل">مناسبة رسمية / عمل</option>
                                <option value="سهرة أو مناسبة خاصة">سهرة / مناسبة خاصة</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-charcoal mb-2">الستايل المفضل</label>
                            <select
                                value={vibe}
                                onChange={(e) => setVibe(e.target.value)}
                                className="w-full px-4 py-3 rounded-md border border-charcoal/15 bg-white text-sm text-charcoal focus:outline-none focus:border-gold transition-colors cursor-pointer"
                                required
                            >
                                <option value="" disabled>اختار الستايل...</option>
                                <option value="بسيط وأنيق (Minimal)">بسيط وأنيق (Minimal)</option>
                                <option value="ستريت وير (Streetwear)">ستريت وير (Streetwear)</option>
                                <option value="كلاسيك (Classic)">كلاسيك (Classic)</option>
                                <option value="رياضي (Sporty)">رياضي (Sporty)</option>
                            </select>
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading || !occasion || !vibe}
                        className="w-full bg-charcoal hover:bg-gold text-cream hover:text-charcoal font-semibold h-12 rounded-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
                                جاري تصميم اللوك...
                            </>
                        ) : (
                            "اقترح لي لووكات ✨"
                        )}
                    </button>
                    {error && <p className="text-error text-sm text-center mt-4">{error}</p>}
                </form>

                {/* Results */}
                {outfits.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-up">
                        {outfits.map((outfit, idx) => (
                            <div key={idx} className="bg-cream rounded-xl border border-charcoal/10 p-6 flex flex-col">
                                <h3 className="text-xl font-bold text-charcoal mb-2">{outfit.title}</h3>
                                <p className="text-sm text-muted mb-6 flex-grow">{outfit.reason}</p>

                                <div className="space-y-3 mb-6">
                                    {outfit.items.map((item, itemIdx) => {
                                        const fullProduct = products.find((p) => p.id === item.id);
                                        return (
                                            <div key={itemIdx} className="flex items-center justify-between bg-white p-2 rounded-md border border-charcoal/5">
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    {fullProduct && (
                                                        /* eslint-disable-next-line @next/next/no-img-element */
                                                        <img src={fullProduct.image} alt={item.name} className="w-10 h-12 object-cover rounded" />
                                                    )}
                                                    <div className="truncate">
                                                        <p className="text-sm font-medium text-charcoal truncate">{item.name}</p>
                                                        <p className="text-xs text-muted">{fullProduct?.price} ج.م</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleAddToCart(item)}
                                                    className="text-xs bg-charcoal text-cream px-3 py-1.5 rounded hover:bg-gold hover:text-charcoal transition-colors whitespace-nowrap"
                                                >
                                                    أضف +
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}