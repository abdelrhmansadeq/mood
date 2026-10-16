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

    const isOutOfStock = product.stock === 0;

    // سعر البيع الفعلي
    const hasSale =
        product.salePrice != null && product.salePrice < product.price;
    const finalPrice = hasSale ? product.salePrice! : product.price;
    const discountPercent = hasSale
        ? Math.round(((product.price - product.salePrice!) / product.price) * 100)
        : 0;

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
                    className={`absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
                        isOutOfStock ? "opacity-50" : ""
                    }`}
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

                {/* Sale Badge */}
                {hasSale && !isOutOfStock && (
                    <div className="absolute top-3 right-3 bg-error text-white text-xs font-bold px-2.5 py-1 rounded-full">
                        خصم {discountPercent}%
                    </div>
                )}

                {/* Out of Stock Badge */}
                {isOutOfStock && (
                    <div className="absolute top-3 right-3 bg-charcoal/90 text-cream text-xs font-medium px-3 py-1.5 rounded-full">
                        نفد المخزون
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="p-4">
                <h3 className="text-sm font-medium text-charcoal mb-1 group-hover:text-gold transition-colors">
                    {product.name}
                </h3>
                <p className="text-xs text-muted mb-2">{product.nameEn}</p>

                {/* Rating */}
                {product.reviewsCount && product.reviewsCount > 0 ? (
                    <div className="flex items-center gap-1.5 mb-2">
                        <Stars value={product.avgRating || 0} />
                        <span className="text-xs text-muted">
              ({product.reviewsCount})
            </span>
                    </div>
                ) : (
                    <div className="flex items-center gap-1.5 mb-2">
                        <Stars value={0} />
                        <span className="text-[10px] text-muted">لا يوجد تقييمات</span>
                    </div>
                )}

                {/* Price */}
                {hasSale ? (
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-base font-bold text-error">
                            {finalPrice} <span className="text-xs">ج.م</span>
                        </p>
                        <p className="text-xs text-muted line-through">
                            {product.price} ج.م
                        </p>
                    </div>
                ) : (
                    <p className="text-base font-semibold text-charcoal">
                        {product.price} <span className="text-xs">ج.م</span>
                    </p>
                )}

                {isOutOfStock && (
                    <p className="text-xs text-error font-medium mt-1">
                        غير متوفر حالياً
                    </p>
                )}
            </div>
        </Link>
    );
}

/* === Stars Component === */
function Stars({ value }: { value: number }) {
    return (
        <div className="flex gap-0.5" dir="ltr">
            {[1, 2, 3, 4, 5].map((star) => (
                <svg
                    key={star}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill={star <= Math.round(value) ? "#C89B5A" : "none"}
                    stroke={star <= Math.round(value) ? "#C89B5A" : "#B0B0B0"}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-3 h-3"
                >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
            ))}
        </div>
    );
}