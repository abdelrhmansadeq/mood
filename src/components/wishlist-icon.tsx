"use client";

import Link from "next/link";
import { useWishlist } from "./wishlist-context";

export default function WishlistIcon() {
    const { totalItems } = useWishlist();

    return (
        <Link
            href="/wishlist"
            className="relative p-2 text-charcoal hover:text-gold transition-colors"
            aria-label="المفضلة"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {totalItems > 0 && (
                <span className="absolute top-0 right-0 bg-error text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {totalItems}
        </span>
            )}
        </Link>
    );
}