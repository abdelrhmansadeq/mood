"use client";

import Link from "next/link";
import type { Product } from "@/data/products";
import { useWishlist } from "./wishlist-context";

type Props = {
    product: Product;
};

export default function ProductCard({ product }: Props) {
    const { toggleItem, isInWishlist } = useWishlist();
    const isFavorite = isInWishlist(product.id);

    const handleToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        toggleItem(product.id);
    };

    return (
        <Link
            href={`/products/${product.id}`}
            className="group block bg-white rounded-lg overflow-hidden border border-charcoal/5 hover:border-gold/30 transition-all duration-300 hover:shadow-lg"
        >
            {/* Image */}
            <div className="relative aspect-[3/4] overflow-hidden bg-cream">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={product.image}
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Wishlist Button */}
                <button
                    onClick={handleToggle}
                    aria-label={isFavorite ? "إزالة من المفضلة" : "أضف للمفضلة"}
                    className={`absolute top-3 left-3 w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                        isFavorite
                            ? "bg-error text-white"
                            : "bg-white/90 backdrop-blur-sm text-charcoal hover:bg-white"
                    }`}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill={isFavorite ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                </button>
            </div>

            {/* Info */}
            <div className="p-4">
                <h3 className="text-sm font-medium text-charcoal mb-1 group-hover:text-gold transition-colors">
                    {product.name}
                </h3>
                <p className="text-xs text-muted mb-2">{product.nameEn}</p>
                <p className="text-base font-semibold text-charcoal">
                    {product.price} <span className="text-xs">ج.م</span>
                </p>
            </div>
        </Link>
    );
}