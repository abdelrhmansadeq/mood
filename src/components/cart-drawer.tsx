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
                className={`fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-[60] transition-opacity duration-300 ${
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
            />

            {/* Drawer - Bottom Sheet on Mobile, Side Drawer on Desktop */}
            <aside
                className={`fixed z-[70] bg-cream shadow-2xl flex flex-col transition-transform duration-300 ease-out
          /* Mobile (Bottom Sheet) */
          bottom-0 inset-x-0 w-full h-[85vh] rounded-t-3xl
          /* Desktop (Side Drawer) */
          md:top-0 md:bottom-auto md:left-0 md:right-auto md:h-full md:w-[420px] md:max-w-md md:rounded-none md:rounded-tr-3xl
          ${
                    isOpen
                        ? "translate-y-0 md:translate-x-0"
                        : "translate-y-full md:-translate-x-full md:translate-y-0"
                }
        `}
            >
                {/* Mobile Drag Handle */}
                <div className="md:hidden flex justify-center pt-3 pb-1" onClick={closeCart}>
                    <div className="w-12 h-1.5 bg-charcoal/20 rounded-full" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-charcoal/10">
                    <h2 className="text-lg md:text-xl font-bold text-charcoal flex items-center gap-2">
                        سلة التسوق
                        <span className="bg-gold/20 text-gold-dark text-xs px-2 py-0.5 rounded-full">
              {items.length}
            </span>
                    </h2>
                    <button
                        onClick={closeCart}
                        className="p-2 bg-charcoal/5 text-charcoal rounded-full hover:bg-charcoal/10 transition-colors"
                        aria-label="Close"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto p-4 md:p-5">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in">
                            <div className="w-20 h-20 bg-charcoal/5 rounded-full flex items-center justify-center mb-4 text-charcoal/30">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                                </svg>
                            </div>
                            <p className="text-lg font-bold text-charcoal mb-2">السلة فاضية</p>
                            <p className="text-sm text-muted mb-6">لسه مضفتش أي منتجات.</p>
                            <Link
                                href="/products"
                                onClick={closeCart}
                                className="bg-charcoal text-cream px-8 py-3 rounded-md font-semibold hover:bg-gold hover:text-charcoal transition-colors"
                            >
                                ابدأ التسوق
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {items.map((item) => (
                                <div
                                    key={`${item.productId}-${item.size}-${item.color}`}
                                    className="flex gap-3 bg-white rounded-xl p-3 border border-charcoal/5 shadow-sm"
                                >
                                    {/* Image */}
                                    <div className="relative w-20 h-24 rounded-lg overflow-hidden bg-cream flex-shrink-0">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="absolute inset-0 w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                                        <div>
                                            <h3 className="text-sm font-bold text-charcoal truncate">
                                                {item.name}
                                            </h3>
                                            <p className="text-xs text-muted mt-0.5">
                                                المقاس: {item.size} | اللون: {item.color}
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between mt-2">
                                            {/* Quantity Controls (أكبر للموبايل) */}
                                            <div className="flex items-center border border-charcoal/15 rounded-md bg-cream">
                                                <button
                                                    onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity - 1)}
                                                    className="w-9 h-9 text-lg text-charcoal hover:text-gold flex items-center justify-center disabled:opacity-40"
                                                    disabled={item.quantity <= 1}
                                                    aria-label="تقليل"
                                                >
                                                    −
                                                </button>
                                                <span className="w-8 text-center text-sm font-bold">
                          {item.quantity}
                        </span>
                                                <button
                                                    onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity + 1)}
                                                    className="w-9 h-9 text-lg text-charcoal hover:text-gold flex items-center justify-center"
                                                    aria-label="زيادة"
                                                >
                                                    +
                                                </button>
                                            </div>

                                            {/* Price & Delete */}
                                            <div className="flex flex-col items-end">
                        <span className="text-sm font-bold text-charcoal">
                          {item.price * item.quantity} ج.م
                        </span>
                                                <button
                                                    onClick={() => removeItem(item.productId, item.size, item.color)}
                                                    className="text-[11px] text-error hover:underline font-medium mt-1 flex items-center gap-1"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                                                    حذف
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div
                        className="border-t border-charcoal/10 p-5 bg-white rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)]"
                        style={{ paddingBottom: "calc(1.25rem + env(safe-area-inset-bottom))" }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm text-muted">الإجمالي</span>
                            <span className="text-2xl font-bold text-charcoal">
                {totalPrice} <span className="text-sm">ج.م</span>
              </span>
                        </div>
                        <Link
                            href="/checkout"
                            onClick={closeCart}
                            className="flex items-center justify-center w-full bg-charcoal hover:bg-gold text-cream hover:text-charcoal font-bold h-14 rounded-xl transition-colors text-lg shadow-lg"
                        >
                            إتمام الشراء
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                        </Link>
                    </div>
                )}
            </aside>
        </>
    );
}