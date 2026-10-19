"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Product, ProductSizes } from "@/data/products";
import { useCart } from "./cart-context";
import { useToast } from "./toast-context";
import { useWishlist } from "./wishlist-context";
import ProductReviews from "./product-reviews";
import RecentlyViewed from "./recently-viewed";

type Props = { product: Product; related: Product[]; };

const SIZES: Array<keyof ProductSizes> = ["S", "M", "L", "XL", "XXL"];
const defaultSizes: ProductSizes = { S: 0, M: 0, L: 0, XL: 0, XXL: 0 };

export default function ProductDetail({ product, related }: Props) {
    const hasColors = product.colors && product.colors.length > 0;

    const initialSizes = hasColors ? product.colors[0]?.sizes : product.sizes;
    const initialAvailableSize = SIZES.find((s) => (initialSizes?.[s] || 0) > 0) || "M";
    const initialImage = hasColors && product.colors[0]?.image ? product.colors[0].image : (product.images?.[0] || product.image);

    const [selectedColorIndex, setSelectedColorIndex] = useState(0);
    const [selectedSize, setSelectedSize] = useState<keyof ProductSizes>(initialAvailableSize);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState<string>(initialImage);
    const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

    const { addItem, openCart } = useCart();
    const { showToast } = useToast();
    const { toggleItem, isInWishlist } = useWishlist();
    const isFavorite = isInWishlist(product.id);

    useEffect(() => {
        try {
            const stored = localStorage.getItem("mood-recently-viewed");
            let list: Product[] = stored ? JSON.parse(stored) : [];
            list = list.filter((p) => p.id !== product.id);
            list.unshift(product);
            list = list.slice(0, 10);
            localStorage.setItem("mood-recently-viewed", JSON.stringify(list));
        } catch (e) { console.error(e); }
    }, [product]);

    const hasSale = product.salePrice != null && product.salePrice < product.price;
    const finalPrice = hasSale ? product.salePrice! : product.price;
    const discountPercent = hasSale ? Math.round(((product.price - product.salePrice!) / product.price) * 100) : 0;

    const currentSizes: ProductSizes = hasColors ? product.colors[selectedColorIndex]?.sizes || defaultSizes : product.sizes || defaultSizes;
    const currentColorName = hasColors ? product.colors[selectedColorIndex]?.name : null;
    const currentColorHex = hasColors ? product.colors[selectedColorIndex]?.hex : null;
    const currentColorImage = hasColors ? product.colors[selectedColorIndex]?.image : null;

    const galleryImages: string[] = (() => {
        const baseImages = product.images && product.images.length > 0 ? product.images : [product.image];
        if (hasColors && currentColorImage) {
            const others = baseImages.filter((img) => img !== currentColorImage);
            return [currentColorImage, ...others];
        }
        return baseImages;
    })();

    const totalCurrentStock = hasColors
        ? product.colors.reduce((total, color) => total + Object.values(color.sizes || defaultSizes).reduce((a, b) => a + b, 0), 0)
        : Object.values(product.sizes || defaultSizes).reduce((a, b) => a + b, 0);

    const isOutOfStock = totalCurrentStock === 0;
    const sizeStock = currentSizes[selectedSize] || 0;
    const reachedMax = quantity >= sizeStock;
    const canAddToCart = !isOutOfStock && sizeStock > 0;

    const handleAddToCart = () => {
        if (!canAddToCart) return;
        addItem({
            productId: product.id, name: product.name, nameEn: product.nameEn, price: finalPrice,
            image: selectedImage, size: selectedSize, color: currentColorName || "افتراضي", quantity,
        });
        showToast("تمت الإضافة للسلة", "success");
        openCart();
    };

    const handleColorChange = (idx: number) => {
        setSelectedColorIndex(idx);
        setQuantity(1);
        const newColorImage = product.colors[idx]?.image;
        if (newColorImage) setSelectedImage(newColorImage);
        const newSizes = product.colors[idx]?.sizes || product.sizes || defaultSizes;
        const firstAvailable = SIZES.find((s) => (newSizes[s] || 0) > 0);
        if (firstAvailable) setSelectedSize(firstAvailable);
    };

    const colorTotalStock = hasColors ? Object.values(currentSizes).reduce((a, b) => a + b, 0) : totalCurrentStock;
    const hasGallery = galleryImages.length > 1;

    return (
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 md:py-12 pb-32 md:pb-12">
            <nav className="text-sm text-muted mb-8 animate-fade-in hidden md:block">
                <Link href="/" className="hover:text-gold">الرئيسية</Link><span className="mx-2">/</span>
                <Link href="/products" className="hover:text-gold">المنتجات</Link><span className="mx-2">/</span>
                <span className="text-charcoal">{product.name}</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 mb-20">
                <div className="animate-fade-in">
                    <div className="relative w-full rounded-lg overflow-hidden bg-cream group cursor-zoom-in" style={{ aspectRatio: "3 / 4" }}>
                        {/* ✅ ضفنا sizes هنا */}
                        <Image
                            src={selectedImage}
                            alt={product.name}
                            fill
                            sizes="(max-width: 1024px) 100vw, 50vw"
                            className={`object-cover animate-fade-in transition-transform duration-500 group-hover:scale-125 ${isOutOfStock ? "opacity-50" : ""}`}
                        />
                        {hasSale && !isOutOfStock && <div className="absolute top-4 left-4 bg-error text-white text-sm font-bold px-3 py-1.5 rounded-full z-10">خصم {discountPercent}%</div>}
                        {isOutOfStock && <div className="absolute top-4 right-4 bg-charcoal/90 text-cream text-sm font-medium px-4 py-2 rounded-full z-10">نفد المخزون</div>}
                    </div>

                    {hasGallery && (
                        <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
                            {galleryImages.map((img, idx) => (
                                <button key={`${img}-${idx}`} onClick={() => setSelectedImage(img)} className={`relative w-16 h-20 md:w-20 md:h-24 rounded-md overflow-hidden flex-shrink-0 border-2 transition-all ${selectedImage === img ? "border-gold" : "border-charcoal/10 hover:border-charcoal/40"}`}>
                                    {/* ✅ ضفنا sizes هنا */}
                                    <Image src={img} alt={`${product.name} - صورة ${idx + 1}`} fill sizes="80px" className="object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex flex-col animate-fade-up">
                    <p className="text-gold text-xs font-medium tracking-widest uppercase mb-3">
                        {product.category === "men" ? "رجالي" : product.category === "women" ? "نسائي" : product.category === "kids" ? "أطفال" : product.category === "shoes" ? "أحذية" : "إكسسوارات"}
                    </p>

                    <div className="flex items-start justify-between gap-3 mb-2">
                        <h1 className="text-2xl md:text-4xl font-bold text-charcoal">{product.name}</h1>
                        <button
                            onClick={() => { toggleItem(product.id); showToast(isFavorite ? "تمت الإزالة من المفضلة" : "تمت الإضافة للمفضلة", "success"); }}
                            className={`flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all ${isFavorite ? "bg-error border-error text-white" : "bg-white border-charcoal/15 text-charcoal hover:border-error hover:text-error"}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                        </button>
                    </div>
                    <p className="text-muted mb-4 md:mb-6 text-sm md:text-base">{product.nameEn}</p>

                    {hasSale ? (
                        <div className="flex items-center gap-3 flex-wrap mb-3 md:mb-4">
                            <p className="text-2xl md:text-3xl font-bold text-error">{finalPrice} <span className="text-lg">ج.م</span></p>
                            <p className="text-base md:text-lg text-muted line-through">{product.price} ج.م</p>
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="bg-error text-white text-xs font-bold px-2.5 py-1 rounded-full">خصم {discountPercent}%</span>
                                <span className="bg-error/10 text-error text-xs font-bold px-2 py-1 rounded-full">وفّر {product.price - finalPrice} ج.م</span>
                            </div>
                        </div>
                    ) : (
                        <p className="text-2xl md:text-3xl font-bold text-charcoal mb-3 md:mb-4">{product.price} <span className="text-lg">ج.م</span></p>
                    )}

                    {isOutOfStock ? <p className="text-sm text-error font-medium mb-4 md:mb-6">نفد المخزون</p> : totalCurrentStock < 10 ? <p className="text-sm text-gold font-medium mb-4 md:mb-6">باقي {totalCurrentStock} قطع فقط</p> : <p className="text-sm text-success font-medium mb-4 md:mb-6">متوفر ({totalCurrentStock} قطعة)</p>}

                    <p className="text-charcoal/80 leading-relaxed mb-6 md:mb-8 text-sm md:text-base">{product.description}</p>

                    {hasColors && (
                        <div className="mb-5 md:mb-6">
                            <div className="flex items-center justify-between mb-3">
                                <label className="text-sm font-medium text-charcoal">اللون</label>
                                <span className="text-sm text-muted flex items-center gap-2">
                  <span className="inline-block w-3 h-3 rounded-full border border-charcoal/20" style={{ backgroundColor: currentColorHex || "#000" }} />
                                    {currentColorName} ({colorTotalStock} قطعة)
                </span>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {product.colors.map((color, idx) => {
                                    const colorStock = Object.values(color.sizes || defaultSizes).reduce((a, b) => a + b, 0);
                                    return (
                                        <button key={idx} onClick={() => handleColorChange(idx)} className={`relative w-11 h-11 md:w-12 md:h-12 rounded-full border-2 transition-all ${selectedColorIndex === idx ? "border-gold scale-110" : "border-charcoal/20 hover:border-charcoal/50"} ${colorStock === 0 ? "opacity-40" : ""}`}>
                                            <span className="absolute inset-1 rounded-full" style={{ backgroundColor: color.hex }} />
                                            {colorStock === 0 && <span className="absolute inset-0 flex items-center justify-center text-xs text-error font-bold">✕</span>}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="mb-5 md:mb-6">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <label className="text-sm font-medium text-charcoal">المقاس</label>
                                <button onClick={() => setIsSizeGuideOpen(true)} className="text-xs text-gold hover:text-gold-dark font-medium flex items-center gap-1 border-b border-gold hover:border-gold-dark pb-0.5 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z" /><path d="m14.5 12.5 2-2" /><path d="m11.5 9.5 2-2" /><path d="m8.5 6.5 2-2" /><path d="m17.5 15.5 2-2" /></svg>
                                    دليل المقاسات
                                </button>
                            </div>
                            <span className="text-sm text-muted">{sizeStock > 0 ? `متوفر ${sizeStock}` : "غير متوفر"}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {SIZES.map((size) => {
                                const stock = currentSizes[size] || 0;
                                const disabled = stock === 0;
                                const isSelected = selectedSize === size;
                                return (
                                    <button key={size} onClick={() => !disabled && (setSelectedSize(size), setQuantity(1))} disabled={disabled} className={`relative w-12 h-11 md:w-14 md:h-12 rounded-md text-sm font-medium border transition-all ${isSelected ? "border-charcoal bg-charcoal text-cream scale-105" : disabled ? "border-charcoal/10 text-charcoal/30 cursor-not-allowed line-through" : "border-charcoal/20 text-charcoal hover:border-charcoal"}`}>
                                        {size}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-4 mb-2">
                        <div className="flex items-center border border-charcoal/20 rounded-md">
                            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={!canAddToCart} className="w-10 h-12 text-charcoal hover:text-gold disabled:opacity-40 disabled:cursor-not-allowed">−</button>
                            <span className="w-10 text-center font-medium">{quantity}</span>
                            <button onClick={() => setQuantity(Math.min(sizeStock, quantity + 1))} disabled={!canAddToCart || reachedMax} className="w-10 h-12 text-charcoal hover:text-gold disabled:opacity-40 disabled:cursor-not-allowed">+</button>
                        </div>
                        <button onClick={handleAddToCart} disabled={!canAddToCart} className="flex-1 bg-charcoal hover:bg-gold text-cream hover:text-charcoal font-semibold h-12 rounded-md transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed">
                            {isOutOfStock ? "نفد المخزون" : sizeStock === 0 ? "المقاس غير متوفر" : "أضف للسلة"}
                        </button>
                    </div>

                    {reachedMax && canAddToCart && <p className="text-xs text-gold mb-4 md:mb-6">وصلت للحد الأقصى المتاح ({sizeStock} قطعة)</p>}

                    <div className="border-t border-charcoal/10 pt-5 md:pt-6 space-y-2 md:space-y-3 text-sm text-charcoal/70">
                        <p>✓ شحن مجاني للطلبات أكثر من 500 ج.م</p>
                        <p>✓ إرجاع مجاني خلال 14 يوم</p>
                        <p>✓ دعم 24/7</p>
                    </div>
                </div>
            </div>

            {related.length > 0 && (
                <section>
                    <h2 className="text-xl md:text-2xl font-bold text-charcoal mb-5 md:mb-6 animate-fade-up">منتجات مشابهة</h2>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                        {related.map((p, idx) => (
                            <div key={p.id} className="animate-fade-up opacity-0" style={{ animationDelay: `${idx * 80}ms`, animationFillMode: "forwards" }}>
                                <Link href={`/products/${p.id}`} className="group block bg-white rounded-lg overflow-hidden border border-charcoal/5 hover:border-gold/30 transition-all hover:shadow-lg">
                                    <div className="relative w-full aspect-[3/4] overflow-hidden bg-cream">
                                        {/* ✅ ضفنا sizes هنا */}
                                        <Image src={p.image} alt={p.name} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                    </div>
                                    <div className="p-3 md:p-4">
                                        <h3 className="text-xs md:text-sm font-medium text-charcoal mb-1 group-hover:text-gold transition-colors">{p.name}</h3>
                                        <p className="text-[10px] md:text-xs text-muted mb-2">{p.nameEn}</p>
                                        <p className="text-sm md:text-base font-semibold text-charcoal">{p.salePrice ?? p.price} <span className="text-xs">ج.م</span></p>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <RecentlyViewed currentProductId={product.id} />
            <ProductReviews productId={product.id} />

            {isSizeGuideOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-cream rounded-xl p-6 md:p-8 w-full max-w-2xl shadow-2xl animate-fade-up border border-charcoal/10 relative">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-charcoal">دليل المقاسات</h3>
                            <button onClick={() => setIsSizeGuideOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-muted hover:text-error hover:bg-error/10 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg></button>
                        </div>
                        <div className="overflow-x-auto mb-6">
                            <table className="w-full text-sm text-right text-charcoal">
                                <thead className="text-xs text-charcoal/70 uppercase bg-charcoal/5">
                                <tr><th className="px-4 py-3 rounded-r-lg">المقاس</th><th className="px-4 py-3">الصدر (سم)</th><th className="px-4 py-3">الوسط (سم)</th><th className="px-4 py-3 rounded-l-lg">الأرداف (سم)</th></tr>
                                </thead>
                                <tbody>
                                <tr className="border-b border-charcoal/5 hover:bg-white/50 transition-colors"><td className="px-4 py-3 font-bold text-charcoal">S</td><td className="px-4 py-3">88 - 92</td><td className="px-4 py-3">72 - 76</td><td className="px-4 py-3">90 - 94</td></tr>
                                <tr className="border-b border-charcoal/5 hover:bg-white/50 transition-colors"><td className="px-4 py-3 font-bold text-charcoal">M</td><td className="px-4 py-3">93 - 97</td><td className="px-4 py-3">77 - 81</td><td className="px-4 py-3">95 - 99</td></tr>
                                <tr className="border-b border-charcoal/5 hover:bg-white/50 transition-colors"><td className="px-4 py-3 font-bold text-charcoal">L</td><td className="px-4 py-3">98 - 102</td><td className="px-4 py-3">82 - 86</td><td className="px-4 py-3">100 - 104</td></tr>
                                <tr className="border-b border-charcoal/5 hover:bg-white/50 transition-colors"><td className="px-4 py-3 font-bold text-charcoal">XL</td><td className="px-4 py-3">103 - 107</td><td className="px-4 py-3">87 - 91</td><td className="px-4 py-3">105 - 109</td></tr>
                                <tr className="hover:bg-white/50 transition-colors"><td className="px-4 py-3 font-bold text-charcoal">XXL</td><td className="px-4 py-3">108 - 112</td><td className="px-4 py-3">92 - 96</td><td className="px-4 py-3">110 - 114</td></tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="bg-gold/10 border border-gold/20 text-charcoal p-4 rounded-lg flex gap-3 items-start">
                            <span className="text-xl">💡</span>
                            <p className="text-sm leading-relaxed"><strong>نصيحة:</strong> لو مقاسك بيقع بين مقاسين، يفضل تختار المقاس الأكبر عشان راحة أكثر أثناء الحركة. المقاسات دي تقريبية وبتختلف حسب القصة (Fit) بتاعة كل منتج.</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="md:hidden fixed bottom-16 inset-x-0 z-30 bg-cream/95 backdrop-blur-md border-t border-charcoal/10 shadow-[0_-4px_12px_rgba(0,0,0,0.04)]" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
                <div className="flex items-center gap-2 p-3">
                    <div className="flex items-center border border-charcoal/20 rounded-md bg-white">
                        <button onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={!canAddToCart} className="w-8 h-11 text-charcoal disabled:opacity-40">−</button>
                        <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                        <button onClick={() => setQuantity(Math.min(sizeStock, quantity + 1))} disabled={!canAddToCart || reachedMax} className="w-8 h-11 text-charcoal disabled:opacity-40">+</button>
                    </div>
                    <button onClick={handleAddToCart} disabled={!canAddToCart} className="flex-1 bg-charcoal text-cream font-semibold h-11 rounded-md text-sm transition-all active:scale-[0.98] disabled:opacity-40 flex items-center justify-between px-4">
                        <span>{isOutOfStock ? "نفد المخزون" : sizeStock === 0 ? "المقاس غير متوفر" : "أضف للسلة"}</span>
                        <span className="text-gold font-bold">{finalPrice * quantity} ج.م</span>
                    </button>
                </div>
            </div>
        </div>
    );
}