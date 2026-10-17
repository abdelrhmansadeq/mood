"use client";

import { useState, useEffect } from "react";
import type { ChangeEvent, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart-context";
import { useAuth } from "@/components/auth-context";
import { useProducts } from "@/components/products-context";
import { createOrder } from "@/lib/orders-api";
import { fetchUserAddress } from "@/lib/addresses-api";
import { z } from "zod";

type FormData = {
    fullName: string;
    phone: string;
    city: string;
    address: string;
    notes: string;
};

export default function CheckoutPage() {
    const router = useRouter();
    const { items, totalPrice, clearCart } = useCart();
    const { user, isLoading: authLoading } = useAuth();
    const { refreshProducts } = useProducts();

    const [formData, setFormData] = useState<FormData>({
        fullName: "",
        phone: "",
        city: "",
        address: "",
        notes: "",
    });
    const [submitted, setSubmitted] = useState(false);
    const [orderNumber, setOrderNumber] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!user) return;

        let isMounted = true;

        const loadData = async () => {
            const baseData = {
                fullName: user.user_metadata?.full_name || "",
                phone: user.user_metadata?.phone || "",
            };

            const savedAddress = await fetchUserAddress(user.id);
            if (!isMounted) return;

            if (savedAddress) {
                setFormData((prev) => ({
                    ...prev,
                    fullName: savedAddress.fullName || baseData.fullName,
                    phone: savedAddress.phone || baseData.phone,
                    city: savedAddress.city,
                    address: savedAddress.address,
                }));
            } else {
                setFormData((prev) => ({
                    ...prev,
                    ...baseData,
                }));
            }
        };

        void loadData();

        return () => {
            isMounted = false;
        };
    }, [user]);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login");
        }
    }, [user, authLoading, router]);

    const handleChange = (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const shipping = totalPrice >= 500 ? 0 : 50;
    const finalTotal = totalPrice + shipping;

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");

        if (!user) {
            setError("لازم تسجل دخول الأول");
            return;
        }

        // ✅ التحقق من البيانات قبل إرسالها للسيرفر
        const checkoutSchema = z.object({
            fullName: z.string().min(3, "الاسم يجب أن يكون 3 أحرف على الأقل"),
            phone: z.string().regex(/^01[0125][0-9]{8}$/, "رقم الموبايل غير صحيح (مثال: 01012345678)"),
            city: z.string().min(2, "المدينة مطلوبة"),
            address: z.string().min(5, "العنوان يجب أن يكون 5 أحرف على الأقل"),
        });

        const validation = checkoutSchema.safeParse(formData);

        if (!validation.success) {
            setError(validation.error.issues[0].message);
            return;
        }

        setIsSubmitting(true);

        try {
            const result = await createOrder({
                fullName: formData.fullName,
                phone: formData.phone,
                city: formData.city,
                address: formData.address,
                notes: formData.notes,
                items: items.map((item) => ({
                    productId: item.productId,
                    name: item.name,
                    nameEn: item.nameEn,
                    price: item.price,
                    image: item.image,
                    size: item.size,
                    color: item.color,
                    quantity: item.quantity,
                })),
            });

            if (result.error) {
                setError(result.error);
                setIsSubmitting(false);
                return;
            }

            if (result.order) {
                setOrderNumber(result.order.orderNumber);
                setSubmitted(true);
                clearCart();
                await refreshProducts();
                window.scrollTo({ top: 0, behavior: "smooth" });
            }
        } catch (e) {
            console.error("Order error:", e);
            setError("حصلت مشكلة في حفظ الطلب. حاول تاني.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center">
                <p className="text-muted">جاري التحميل...</p>
            </div>
        );
    }

    if (!user) return null;

    if (submitted) {
        return (
            <div className="max-w-2xl mx-auto px-6 py-20 text-center animate-fade-in">
                <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6 animate-fade-up">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                </div>
                <h1 className="text-3xl font-bold text-charcoal mb-3 animate-fade-up">
                    تم استلام طلبك!
                </h1>
                <p className="text-muted mb-6 animate-fade-up">
                    شكراً لك. هنتواصل معاك قريباً لتأكيد الطلب.
                </p>
                <div className="bg-white border border-charcoal/10 rounded-lg p-6 mb-8 inline-block animate-fade-up">
                    <p className="text-xs text-muted mb-1">رقم الطلب</p>
                    <p className="text-2xl font-bold text-gold">{orderNumber}</p>
                </div>
                <div className="flex justify-center gap-4 flex-wrap animate-fade-up">
                    <Link
                        href="/account/orders"
                        className="inline-block bg-charcoal hover:bg-gold text-cream hover:text-charcoal font-semibold px-6 py-3 rounded-md transition-colors"
                    >
                        طلباتي
                    </Link>
                    <Link
                        href="/products"
                        className="inline-block border border-charcoal/20 hover:border-charcoal text-charcoal font-medium px-6 py-3 rounded-md transition-colors"
                    >
                        متابعة التسوق
                    </Link>
                </div>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="max-w-2xl mx-auto px-6 py-20 text-center animate-fade-in">
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

    return (
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 animate-fade-in pb-32 md:pb-12">
            <div className="mb-10 animate-fade-up">
                <p className="text-gold text-xs font-medium tracking-widest uppercase mb-2">
                    Checkout
                </p>
                <h1 className="text-3xl md:text-4xl font-bold text-charcoal">
                    إتمام الشراء
                </h1>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-5">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-charcoal">
                                بيانات الشحن
                            </h2>
                            <Link
                                href="/account"
                                className="text-sm text-gold hover:underline font-medium"
                            >
                                تعديل العنوان المحفوظ
                            </Link>
                        </div>

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
                                />
                            </div>
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
                            />
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg border border-charcoal/10 p-6 sticky top-24 animate-fade-up">
                            <h2 className="text-lg font-semibold text-charcoal mb-5">
                                ملخص الطلب
                            </h2>

                            <div className="space-y-4 mb-5 max-h-72 overflow-y-auto">
                                {items.map((item) => (
                                    <div
                                        key={`${item.productId}-${item.size}-${item.color}`}
                                        className="flex gap-3"
                                    >
                                        <div className="relative w-14 h-16 rounded-md overflow-hidden bg-cream flex-shrink-0">
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

                            <div className="border-t border-charcoal/10 pt-5 space-y-2 text-sm">
                                <div className="flex justify-between text-muted">
                                    <span>المجموع الفرعي</span>
                                    <span>{totalPrice} ج.م</span>
                                </div>
                                <div className="flex justify-between text-muted">
                                    <span>الشحن</span>
                                    <span>{shipping === 0 ? "مجاني" : `${shipping} ج.م`}</span>
                                </div>
                                <div className="flex justify-between text-base font-bold text-charcoal pt-3 border-t border-charcoal/10">
                                    <span>الإجمالي</span>
                                    <span>{finalTotal} ج.م</span>
                                </div>
                            </div>

                            {error && (
                                <div className="mt-4 bg-error/10 text-error border border-error/30 rounded-md p-3 text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Desktop Submit Button */}
                            <div className="hidden md:block mt-6">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-charcoal hover:bg-gold text-cream hover:text-charcoal font-semibold h-12 rounded-md transition-colors disabled:opacity-50"
                                >
                                    {isSubmitting ? "جاري إرسال الطلب..." : "تأكيد الطلب"}
                                </button>
                                <p className="text-xs text-muted text-center mt-3">
                                    الدفع عند الاستلام
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Sticky Submit Button */}
                <div className="md:hidden fixed bottom-16 left-0 right-0 p-4 bg-cream/95 backdrop-blur-md border-t border-charcoal/10 z-30">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-charcoal hover:bg-gold text-cream hover:text-charcoal font-semibold h-12 rounded-md transition-colors disabled:opacity-50 shadow-lg"
                    >
                        {isSubmitting ? "جاري إرسال الطلب..." : "تأكيد الطلب"}
                    </button>
                    <p className="text-xs text-muted text-center mt-2">
                        الدفع عند الاستلام
                    </p>
                </div>
            </form>
        </div>
    );
}