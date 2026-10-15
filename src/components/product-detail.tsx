"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Product, ProductSizes } from "@/data/products";
import { useCart } from "./cart-context";
import ProductReviews from "./product-reviews";

type Props = {
    product: Product;
    related: Product[];
};

const SIZES: Array<keyof ProductSizes> = ["S", "M", "L", "XL", "XXL"];

const defaultSizes: ProductSizes = { S: 0, M: 0, L: 0, XL: 0, XXL: 0 };

export default function ProductDetail({ product, related }: Props) {
    const hasColors = product.colors && product.colors.length > 0;

    const [selectedColorIndex, setSelectedColorIndex] = useState(0);
    const [selectedSize, setSelectedSize] = useState<keyof ProductSizes>("M");
    const [quantity, setQuantity] = useState(1);
    const [addedMessage, setAddedMessage] = useState(false);

    const { addItem, openCart } = useCart();

    const currentSizes: ProductSizes = hasColors
        ? product.colors[selectedColorIndex]?.sizes || defaultSizes
        : product.sizes || defaultSizes;

    const currentImage = hasColors
        ? product.colors[selectedColorIndex]?.image || product.image
        : product.image;

    const currentColorName = hasColors
        ? product.colors[selectedColorIndex]?.name
        : null;

    const currentColorHex = hasColors
        ? product.colors[selectedColorIndex]?.hex
        : null;

    const firstAvailableSize = SIZES.find((s) => (currentSizes[s] || 0) > 0);

    useEffect(() => {
        if (firstAvailableSize && (currentSizes[selectedSize] || 0) === 0) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSelectedSize(firstAvailableSize);
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setQuantity(1);
        }
    }, [selectedColorIndex, firstAvailableSize, currentSizes, selectedSize]);

    const totalCurrentStock = hasColors
        ? product.colors.reduce((total, color) => {
            return (
                total +
                Object.values(color.sizes || defaultSizes).reduce((a, b) => a + b, 0)
            );
        }, 0)
        : Object.values(product.sizes || defaultSizes).reduce((a, b) => a + b, 0);

    const isOutOfStock = totalCurrentStock === 0;
    const sizeStock = currentSizes[selectedSize] || 0;
    const reachedMax = quantity >= sizeStock;
    const canAddToCart = !isOutOfStock && sizeStock > 0;

    const handleAddToCart = () => {
        if (!canAddToCart) return;
        addItem({
            productId: product.id,
            name: product.name,
            nameEn: product.nameEn,
            price: product.price,
            image: currentImage,
            size: selectedSize,
            color: currentColorName || "افتراضي",
            quantity,
        });
        setAddedMessage(true);
        openCart();
        setTimeout(() => setAddedMessage(false), 2500);
    };

    const handleSizeChange = (size: keyof ProductSizes) => {
        setSelectedSize(size);
        setQuantity(1);
    };

    const handleColorChange = (idx: number) => {
        setSelectedColorIndex(idx);
        setQuantity(1);
    };

    const colorTotalStock = hasColors
        ? Object.values(currentSizes).reduce((a, b) => a + b, 0)
        : totalCurrentStock;

    return (
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
            {/* Breadcrumbs */}
            <nav className="text-sm text-muted mb-8 animate-fade-in">
                <Link href="/" className="hover:text-gold">الرئيسية</Link>
                <span className="mx-2">/</span>
                <Link href="/products" className="hover:text-gold">المنتجات</Link>
                <span className="mx-2">/</span>
                <span className="text-charcoal">{product.name}</span>
            </nav>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 mb-20">
                {/* Image */}
                <div
                    className="relative w-full rounded-lg overflow-hidden bg-cream animate-fade-in"
                    style={{ aspectRatio: "3 / 4" }}
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        key={currentImage}
                        src={currentImage}
                        alt={product.name}
                        className={`absolute inset-0 w-full h-full object-cover animate-fade-in ${
                            isOutOfStock ? "opacity-50" : ""
                        }`}
                    />
                    {isOutOfStock && (
                        <div className="absolute top-4 right-4 bg-charcoal/90 text-cream text-sm font-medium px-4 py-2 rounded-full">
                            نفد المخزون
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="flex flex-col animate-fade-up">
                    {/* Category */}
                    <p className="text-gold text-xs font-medium tracking-widest uppercase mb-3">
                        {product.category === "men"
                            ? "رجالي"
                            : product.category === "women"
                                ? "نسائي"
                                : "أطفال"}
                    </p>

                    {/* Title */}
                    <h1 className="text-3xl md:text-4xl font-bold text-charcoal mb-2">
                        {product.name}
                    </h1>
                    <p className="text-muted mb-6">{product.nameEn}</p>

                    {/* Price */}
                    <p className="text-3xl font-bold text-charcoal mb-4">
                        {product.price} <span className="text-lg">ج.م</span>
                    </p>

                    {/* Stock Status */}
                    {isOutOfStock ? (
                        <p className="text-sm text-error font-medium mb-6">نفد المخزون</p>
                    ) : totalCurrentStock < 10 ? (
                        <p className="text-sm text-gold font-medium mb-6">
                            باقي {totalCurrentStock} قطع فقط
                        </p>
                    ) : (
                        <p className="text-sm text-success font-medium mb-6">
                            متوفر ({totalCurrentStock} قطعة)
                        </p>
                    )}

                    {/* Description */}
                    <p className="text-charcoal/80 leading-relaxed mb-8">
                        {product.description}
                    </p>

                    {/* Color Picker */}
                    {hasColors && (
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-3">
                                <label className="text-sm font-medium text-charcoal">اللون</label>
                                <span className="text-sm text-muted flex items-center gap-2">
                  <span
                      className="inline-block w-3 h-3 rounded-full border border-charcoal/20"
                      style={{ backgroundColor: currentColorHex || "#000" }}
                  />
                                    {currentColorName} ({colorTotalStock} قطعة)
                </span>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {product.colors.map((color, idx) => {
                                    const colorStock = Object.values(
                                        color.sizes || defaultSizes
                                    ).reduce((a, b) => a + b, 0);
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => handleColorChange(idx)}
                                            aria-label={color.name}
                                            title={`${color.name} (${colorStock} قطعة)`}
                                            className={`relative w-12 h-12 rounded-full border-2 transition-all ${
                                                selectedColorIndex === idx
                                                    ? "border-gold scale-110"
                                                    : "border-charcoal/20 hover:border-charcoal/50"
                                            } ${colorStock === 0 ? "opacity-40" : ""}`}
                                        >
                      <span
                          className="absolute inset-1 rounded-full"
                          style={{ backgroundColor: color.hex }}
                      />
                                            {colorStock === 0 && (
                                                <span className="absolute inset-0 flex items-center justify-center text-xs text-error font-bold">
                          ✕
                        </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Size Picker */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-sm font-medium text-charcoal">المقاس</label>
                            <span className="text-sm text-muted">
                {sizeStock > 0 ? `متوفر ${sizeStock}` : "غير متوفر"}
              </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {SIZES.map((size) => {
                                const stock = currentSizes[size] || 0;
                                const disabled = stock === 0;
                                const isSelected = selectedSize === size;
                                return (
                                    <button
                                        key={size}
                                        onClick={() => !disabled && handleSizeChange(size)}
                                        disabled={disabled}
                                        className={`relative w-14 h-12 rounded-md text-sm font-medium border transition-all ${
                                            isSelected
                                                ? "border-charcoal bg-charcoal text-cream scale-105"
                                                : disabled
                                                    ? "border-charcoal/10 text-charcoal/30 cursor-not-allowed line-through"
                                                    : "border-charcoal/20 text-charcoal hover:border-charcoal"
                                        }`}
                                    >
                                        {size}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Quantity + Add to Cart */}
                    <div className="flex items-center gap-4 mb-2">
                        <div className="flex items-center border border-charcoal/20 rounded-md">
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                disabled={!canAddToCart}
                                className="w-10 h-12 text-charcoal hover:text-gold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                aria-label="تقليل"
                            >
                                −
                            </button>
                            <span className="w-10 text-center font-medium">{quantity}</span>
                            <button
                                onClick={() => setQuantity(Math.min(sizeStock, quantity + 1))}
                                disabled={!canAddToCart || reachedMax}
                                className="w-10 h-12 text-charcoal hover:text-gold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                aria-label="زيادة"
                            >
                                +
                            </button>
                        </div>

                        <button
                            onClick={handleAddToCart}
                            disabled={!canAddToCart}
                            className="flex-1 bg-charcoal hover:bg-gold text-cream hover:text-charcoal font-semibold h-12 rounded-md transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-charcoal disabled:hover:text-cream"
                        >
                            {isOutOfStock
                                ? "نفد المخزون"
                                : sizeStock === 0
                                    ? "المقاس غير متوفر"
                                    : "أضف للسلة"}
                        </button>
                    </div>

                    {/* Max Reached */}
                    {reachedMax && canAddToCart && (
                        <p className="text-xs text-gold mb-6">
                            وصلت للحد الأقصى المتاح ({sizeStock} قطعة)
                        </p>
                    )}

                    {/* Feedback */}
                    {addedMessage && (
                        <div className="bg-success/10 text-success border border-success/30 rounded-md p-3 text-sm text-center mb-6 mt-2 animate-fade-down">
                            ✓ تمت الإضافة للسلة
                        </div>
                    )}

                    {/* Info Boxes */}
                    <div className="border-t border-charcoal/10 pt-6 space-y-3 text-sm text-charcoal/70">
                        <p>✓ شحن مجاني للطلبات أكثر من 500 ج.م</p>
                        <p>✓ إرجاع مجاني خلال 14 يوم</p>
                        <p>✓ دعم 24/7</p>
                    </div>
                </div>
            </div>

            {/* Related Products */}
            {related.length > 0 && (
                <section>
                    <h2 className="text-2xl font-bold text-charcoal mb-6 animate-fade-up">
                        منتجات مشابهة
                    </h2>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        {related.map((p, idx) => (
                            <div
                                key={p.id}
                                className="animate-fade-up opacity-0"
                                style={{
                                    animationDelay: `${idx * 80}ms`,
                                    animationFillMode: "forwards",
                                }}
                            >
                                <Link
                                    href={`/products/${p.id}`}
                                    className="group block bg-white rounded-lg overflow-hidden border border-charcoal/5 hover:border-gold/30 transition-all hover:shadow-lg"
                                >
                                    <div
                                        className="relative w-full overflow-hidden bg-cream"
                                        style={{ aspectRatio: "3 / 4" }}
                                    >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={p.image}
                                            alt={p.name}
                                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                    <div className="p-4">
                                        <h3 className="text-sm font-medium text-charcoal mb-1 group-hover:text-gold transition-colors">
                                            {p.name}
                                        </h3>
                                        <p className="text-xs text-muted mb-2">{p.nameEn}</p>
                                        <p className="text-base font-semibold text-charcoal">
                                            {p.price} <span className="text-xs">ج.م</span>
                                        </p>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Reviews */}
            <ProductReviews productId={product.id} />
        </div>
    );
}