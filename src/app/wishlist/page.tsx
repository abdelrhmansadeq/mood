"use client";

import Link from "next/link";
import ProductCard from "@/components/product-card";
import { useWishlist } from "@/components/wishlist-context";
import { useProducts } from "@/components/products-context";

export default function WishlistPage() {
    const { items, clearWishlist } = useWishlist();
    const { products } = useProducts();

    const wishlistProducts = products.filter((p) => items.includes(p.id));

    return (
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 animate-fade-in">
            {/* Header */}
            <div className="text-center mb-12 animate-fade-up">
                <p className="text-gold text-xs font-medium tracking-widest uppercase mb-2">
                    Wishlist
                </p>
                <h1 className="text-4xl md:text-5xl font-bold text-charcoal mb-3">
                    المفضلة
                </h1>
                <p className="text-muted max-w-md mx-auto">
                    المنتجات اللي حفظتها للرجوع ليها بعدين
                </p>
            </div>

            {wishlistProducts.length > 0 ? (
                <>
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-charcoal/10 animate-fade-up">
                        <p className="text-sm text-muted">
                            {wishlistProducts.length} منتج
                        </p>
                        <button
                            onClick={clearWishlist}
                            className="text-sm text-error hover:underline"
                        >
                            امسح الكل
                        </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {wishlistProducts.map((product, idx) => (
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
                </>
            ) : (
                <div className="text-center py-20 animate-fade-up">
                    <div className="w-20 h-20 rounded-full bg-charcoal/5 flex items-center justify-center mx-auto mb-6">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="36"
                            height="36"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#6B6B6B"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                    </div>
                    <p className="text-muted mb-6">مفيش منتجات في المفضلة لحد الآن</p>
                    <Link
                        href="/products"
                        className="inline-block bg-charcoal hover:bg-gold text-cream hover:text-charcoal font-semibold px-6 py-3 rounded-md transition-colors"
                    >
                        ابدأ التسوق
                    </Link>
                </div>
            )}
        </div>
    );
}