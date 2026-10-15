"use client";
import ProductReviews from "./product-reviews";

import { useState } from "react";
import Link from "next/link";
import type { Product } from "@/data/products";
import { useCart } from "./cart-context";

type Props = {
    product: Product;
    related: Product[];
};

const SIZES = ["S", "M", "L", "XL", "XXL"];

const COLORS = [
    { name: "أسود", value: "#1F1F1F" },
    { name: "أبيض", value: "#FFFFFF" },
    { name: "بيج", value: "#D4B896" },
    { name: "نبيتي", value: "#7B2D26" },
];

export default function ProductDetail({ product, related }: Props) {
    const [selectedSize, setSelectedSize] = useState("M");
    const [selectedColor, setSelectedColor] = useState(COLORS[0].value);
    const [quantity, setQuantity] = useState(1);
    const [addedMessage, setAddedMessage] = useState(false);

    const { addItem, openCart } = useCart();

    const handleAddToCart = () => {
        addItem({
            productId: product.id,
            name: product.name,
            nameEn: product.nameEn,
            price: product.price,
            image: product.image,
            size: selectedSize,
            color: selectedColor,
            quantity,
        });
        setAddedMessage(true);
        openCart();
        setTimeout(() => setAddedMessage(false), 2500);
    };

    return (
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
            {/* Breadcrumbs */}
            <nav className="text-sm text-muted mb-8">
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
                    className="relative w-full rounded-lg overflow-hidden bg-cream"
                    style={{ aspectRatio: "3 / 4" }}
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={product.image}
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                </div>

                {/* Info */}
                <div className="flex flex-col">
                    {/* Category */}
                    <p className="text-gold text-xs font-medium tracking-widest uppercase mb-3">
                        {product.category === "men" ? "رجالي" : "نسائي"}
                    </p>

                    {/* Title */}
                    <h1 className="text-3xl md:text-4xl font-bold text-charcoal mb-2">
                        {product.name}
                    </h1>
                    <p className="text-muted mb-6">{product.nameEn}</p>

                    {/* Price */}
                    <p className="text-3xl font-bold text-charcoal mb-6">
                        {product.price} <span className="text-lg">ج.م</span>
                    </p>

                    {/* Description */}
                    <p className="text-charcoal/80 leading-relaxed mb-8">
                        {product.description}
                    </p>

                    {/* Size Picker */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-sm font-medium text-charcoal">المقاس</label>
                            <span className="text-sm text-muted">{selectedSize}</span>
                        </div>
                        <div className="flex gap-2">
                            {SIZES.map((size) => (
                                <button
                                    key={size}
                                    onClick={() => setSelectedSize(size)}
                                    className={`w-12 h-12 rounded-md text-sm font-medium border transition-colors ${
                                        selectedSize === size
                                            ? "border-charcoal bg-charcoal text-cream"
                                            : "border-charcoal/20 text-charcoal hover:border-charcoal"
                                    }`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Color Picker */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-sm font-medium text-charcoal">اللون</label>
                            <span className="text-sm text-muted">
                {COLORS.find((c) => c.value === selectedColor)?.name}
              </span>
                        </div>
                        <div className="flex gap-3">
                            {COLORS.map((color) => (
                                <button
                                    key={color.value}
                                    onClick={() => setSelectedColor(color.value)}
                                    aria-label={color.name}
                                    className={`w-9 h-9 rounded-full border-2 transition-all ${
                                        selectedColor === color.value
                                            ? "border-gold scale-110"
                                            : "border-charcoal/20"
                                    }`}
                                    style={{ backgroundColor: color.value }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Quantity + Add to Cart */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex items-center border border-charcoal/20 rounded-md">
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="w-10 h-12 text-charcoal hover:text-gold transition-colors"
                                aria-label="تقليل"
                            >
                                −
                            </button>
                            <span className="w-10 text-center font-medium">{quantity}</span>
                            <button
                                onClick={() => setQuantity(quantity + 1)}
                                className="w-10 h-12 text-charcoal hover:text-gold transition-colors"
                                aria-label="زيادة"
                            >
                                +
                            </button>
                        </div>

                        <button
                            onClick={handleAddToCart}
                            className="flex-1 bg-charcoal hover:bg-gold text-cream hover:text-charcoal font-semibold h-12 rounded-md transition-colors"
                        >
                            أضف للسلة
                        </button>
                    </div>

                    {/* Feedback */}
                    {addedMessage && (
                        <div className="bg-success/10 text-success border border-success/30 rounded-md p-3 text-sm text-center mb-6">
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
                    <h2 className="text-2xl font-bold text-charcoal mb-6">منتجات مشابهة</h2>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        {related.map((p) => (
                            <Link
                                key={p.id}
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
                        ))}
                    </div>
                </section>
            )}
            {/* Reviews */}
            <ProductReviews productId={product.id} />
        </div>
    );
}