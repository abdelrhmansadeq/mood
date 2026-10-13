"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/cart-context";

type FormData = {
    fullName: string;
    phone: string;
    email: string;
    city: string;
    address: string;
    notes: string;
};

export default function CheckoutPage() {
    const { items, totalPrice, clearCart } = useCart();
    const [formData, setFormData] = useState<FormData>({
        fullName: "",
        phone: "",
        email: "",
        city: "",
        address: "",
        notes: "",
    });
    const [submitted, setSubmitted] = useState(false);
    const [orderNumber, setOrderNumber] = useState("");

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const num = "MOOD-" + Math.floor(100000 + Math.random() * 900000);
        setOrderNumber(num);
        setSubmitted(true);
        clearCart();
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Success Screen
    if (submitted) {
        return (
            <div className="max-w-2xl mx-auto px-6 py-20 text-center">
                <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="40"
                        height="40"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#10B981"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                </div>
                <h1 className="text-3xl font-bold text-charcoal mb-3">
                    تم استلام طلبك!
                </h1>
                <p className="text-muted mb-6">
                    شكراً لك. هنتواصل معاك قريباً لتأكيد الطلب.
                </p>
                <div className="bg-white border border-charcoal/10 rounded-lg p-6 mb-8 inline-block">
                    <p className="text-xs text-muted mb-1">رقم الطلب</p>
                    <p className="text-2xl font-bold text-gold">{orderNumber}</p>
                </div>
                <div className="flex justify-center gap-4">
                    <Link
                        href="/products"
                        className="inline-block bg-charcoal hover:bg-gold text-cream hover:text-charcoal font-semibold px-6 py-3 rounded-md transition-colors"
                    >
                        متابعة التسوق
                    </Link>
                    <Link
                        href="/"
                        className="inline-block border border-charcoal/20 hover:border-charcoal text-charcoal font-medium px-6 py-3 rounded-md transition-colors"
                    >
                        الصفحة الرئيسية
                    </Link>
                </div>
            </div>
        );
    }

    // Empty Cart
    if (items.length === 0) {
        return (
            <div className="max-w-2xl mx-auto px-6 py-20 text-center">
                <h1 className="text-2xl font-bold text-charcoal mb-3">
                    السلة فاضية
                </h1>
                <p className="text-muted mb-8">
                    مفيش منتجات في السلة عشان تكمل الطلب.
                </p>
                <Link
                    href="/products"
                    className="inline-block bg-charcoal hover:bg-gold text-cream hover:text-charcoal font-semibold px-6 py-3 rounded-md transition-colors"
                >
                    ابدأ التسوق
                </Link>
            </div>
        );
    }

    // Checkout Form
    return (
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
            {/* Header */}
            <div className="mb-10">
                <p className="text-gold text-xs font-medium tracking-widest uppercase mb-2">
                    Checkout
                </p>
                <h1 className="text-3xl md:text-4xl font-bold text-charcoal">
                    إتمام الشراء
                </h1>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Shipping Form */}
                    <div className="lg:col-span-2 space-y-5">
                        <h2 className="text-lg font-semibold text-charcoal mb-4">
                            بيانات الشحن
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-medium text-charcoal mb-2">
                                    الاسم الكامل *
                                </label>
                                <input
                                    type="text"
                                    name="fullName"
                                    required
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-md border border-charcoal/15 bg-white text-sm text-charcoal focus:outline-none focus:border-gold transition-colors"
                                    placeholder="محمد أحمد"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-charcoal mb-2">
                                    رقم التليفون *
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    required
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-md border border-charcoal/15 bg-white text-sm text-charcoal focus:outline-none focus:border-gold transition-colors"
                                    placeholder="+20 100 000 0000"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-charcoal mb-2">
                                الإيميل (اختياري)
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-md border border-charcoal/15 bg-white text-sm text-charcoal focus:outline-none focus:border-gold transition-colors"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-charcoal mb-2">
                                المدينة *
                            </label>
                            <input
                                type="text"
                                name="city"
                                required
                                value={formData.city}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-md border border-charcoal/15 bg-white text-sm text-charcoal focus:outline-none focus:border-gold transition-colors"
                                placeholder="القاهرة"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-charcoal mb-2">
                                العنوان بالتفصيل *
                            </label>
                            <textarea
                                name="address"
                                required
                                value={formData.address}
                                onChange={handleChange}
                                rows={3}
                                className="w-full px-4 py-3 rounded-md border border-charcoal/15 bg-white text-sm text-charcoal focus:outline-none focus:border-gold transition-colors resize-none"
                                placeholder="الشارع، رقم العمارة، الدور، الشقة"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-charcoal mb-2">
                                ملاحظات إضافية (اختياري)
                            </label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                rows={2}
                                className="w-full px-4 py-3 rounded-md border border-charcoal/15 bg-white text-sm text-charcoal focus:outline-none focus:border-gold transition-colors resize-none"
                                placeholder="أي تعليمات خاصة بالتوصيل"
                            />
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg border border-charcoal/10 p-6 sticky top-24">
                            <h2 className="text-lg font-semibold text-charcoal mb-5">
                                ملخص الطلب
                            </h2>

                            {/* Items */}
                            <div className="space-y-4 mb-5 max-h-72 overflow-y-auto">
                                {items.map((item) => (
                                    <div
                                        key={`${item.productId}-${item.size}-${item.color}`}
                                        className="flex gap-3"
                                    >
                                        <div className="relative w-14 h-16 rounded-md overflow-hidden bg-cream flex-shrink-0">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="absolute inset-0 w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-charcoal truncate">
                                                {item.name}
                                            </p>
                                            <p className="text-xs text-muted">
                                                {item.size} × {item.quantity}
                                            </p>
                                            <p className="text-sm font-semibold text-charcoal">
                                                {item.price * item.quantity} ج.م
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Totals */}
                            <div className="border-t border-charcoal/10 pt-5 space-y-2 text-sm">
                                <div className="flex justify-between text-muted">
                                    <span>المجموع الفرعي</span>
                                    <span>{totalPrice} ج.م</span>
                                </div>
                                <div className="flex justify-between text-muted">
                                    <span>الشحن</span>
                                    <span>{totalPrice >= 500 ? "مجاني" : "50 ج.م"}</span>
                                </div>
                                <div className="flex justify-between text-base font-bold text-charcoal pt-3 border-t border-charcoal/10">
                                    <span>الإجمالي</span>
                                    <span>
                    {totalPrice >= 500 ? totalPrice : totalPrice + 50} ج.م
                  </span>
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                className="w-full mt-6 bg-charcoal hover:bg-gold text-cream hover:text-charcoal font-semibold h-12 rounded-md transition-colors"
                            >
                                تأكيد الطلب
                            </button>
                            <p className="text-xs text-muted text-center mt-3">
                                الدفع عند الاستلام
                            </p>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}