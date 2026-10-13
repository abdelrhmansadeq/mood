"use client";

import Link from "next/link";
import { useCart } from "./cart-context";

export default function CartDrawer() {
    const { items, isOpen, closeCart, removeItem, updateQuantity, totalPrice } = useCart();

    return (
        <>
            {/* Overlay */}
            <div
                onClick={closeCart}
                className={`fixed inset-0 bg-charcoal/50 z-[60] transition-opacity duration-300 ${
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
            />

            {/* Drawer */}
            <aside
                className={`fixed top-0 left-0 h-full w-full max-w-md bg-cream z-[70] shadow-2xl transition-transform duration-300 flex flex-col ${
                    isOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-charcoal/10">
                    <h2 className="text-lg font-bold text-charcoal">
                        سلة التسوق ({items.length})
                    </h2>
                    <button
                        onClick={closeCart}
                        className="p-2 text-charcoal hover:text-gold transition-colors"
                        aria-label="Close"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                        >
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto p-5">
                    {items.length === 0 ? (
                        <div className="text-center py-16">
                            <p className="text-muted mb-4">السلة فاضية</p>
                            <Link
                                href="/products"
                                onClick={closeCart}
                                className="inline-block text-gold text-sm font-medium hover:underline"
                            >
                                ابدأ التسوق
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {items.map((item) => (
                                <div
                                    key={`${item.productId}-${item.size}-${item.color}`}
                                    className="flex gap-4 bg-white rounded-lg p-3"
                                >
                                    {/* Image */}
                                    <div className="relative w-20 h-24 rounded-md overflow-hidden bg-cream flex-shrink-0">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="absolute inset-0 w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-medium text-charcoal truncate">
                                            {item.name}
                                        </h3>
                                        <p className="text-xs text-muted mb-2">
                                            المقاس: {item.size}
                                        </p>
                                        <p className="text-sm font-semibold text-charcoal mb-2">
                                            {item.price} ج.م
                                        </p>

                                        {/* Quantity Controls */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center border border-charcoal/15 rounded-md">
                                                <button
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item.productId,
                                                            item.size,
                                                            item.color,
                                                            item.quantity - 1
                                                        )
                                                    }
                                                    className="w-7 h-7 text-sm text-charcoal hover:text-gold"
                                                    aria-label="تقليل"
                                                >
                                                    −
                                                </button>
                                                <span className="w-7 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                                                <button
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item.productId,
                                                            item.size,
                                                            item.color,
                                                            item.quantity + 1
                                                        )
                                                    }
                                                    className="w-7 h-7 text-sm text-charcoal hover:text-gold"
                                                    aria-label="زيادة"
                                                >
                                                    +
                                                </button>
                                            </div>

                                            <button
                                                onClick={() =>
                                                    removeItem(item.productId, item.size, item.color)
                                                }
                                                className="text-xs text-error hover:underline"
                                            >
                                                حذف
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div className="border-t border-charcoal/10 p-5 bg-white">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm text-muted">الإجمالي</span>
                            <span className="text-xl font-bold text-charcoal">
                {totalPrice} ج.م
              </span>
                        </div>
                        <Link
                            href="/checkout"
                            onClick={closeCart}
                            className="block text-center bg-charcoal hover:bg-gold text-cream hover:text-charcoal font-semibold h-12 rounded-md transition-colors leading-[3rem]"
                        >
                            إتمام الشراء
                        </Link>
                    </div>
                )}
            </aside>
        </>
    );
}