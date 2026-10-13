"use client";

import { useCart } from "./cart-context";

export default function CartIcon() {
    const { totalItems, openCart } = useCart();

    return (
        <button
            onClick={openCart}
            className="relative p-2 text-charcoal hover:text-gold transition-colors"
            aria-label="Cart"
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
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {totalItems > 0 && (
                <span className="absolute top-0 right-0 bg-gold text-charcoal text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {totalItems}
        </span>
            )}
        </button>
    );
}