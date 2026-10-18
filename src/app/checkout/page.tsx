"use client";

import { useState, useEffect, useMemo } from "react";
import type { ChangeEvent, FormEvent } from "react";
import Link from "next/link";
import { useCart } from "@/components/cart-context";
import { useAuth } from "@/components/auth-context";
import { useProducts } from "@/components/products-context";
import { createOrder } from "@/lib/orders-api";
import { fetchUserAddress } from "@/lib/addresses-api";
import { z } from "zod";

type FormData = {
    fullName: string;
    phone: string;
    email: string; // ✅ ضفنا الإيميل
    city: string;
    address: string;
    notes: string;
};

export default function CheckoutPage() {
    const { items, totalPrice, clearCart } = useCart();
    const { user, isLoading: authLoading } = useAuth();
    const { products, refreshProducts } = useProducts();

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
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    // ✅ حالات كود الخصم
    const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number } | null>(null);
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
    const [couponError, setCouponError] = useState("");

    // ✅ التحقق من المخزون قبل الشحن
    const outOfStockItems = useMemo(() => {
        return items.filter((item) => {
            const product = products.find((p) => p.id === item.productId);
            if (!product) return true;

            if (product.colors && product.colors.length > 0) {
                const color = product.colors.find((c) => c.name === item.color);
                if (!color) return true;
                const stock = ((color.sizes || {}) as Record<string, number>)[item.size] || 0;
                return stock < item.quantity;
            } else {
                const stock = ((product.sizes || {}) as Record<string, number>)[item.size] || 0;
                return stock < item.quantity;
            }
        });
    }, [items, products]);

    useEffect(() => {
        // ✅ جلب بيانات المستخدم بس لو هو مسجل دخول
        if (!user) return;

        let isMounted = true;

        const loadData = async () => {
            const baseData = {
                fullName: user.user_metadata?.full_name || "",
                phone: user.user_metadata?.phone || "",
                email: user.email || "",
            };

            const savedAddress = await fetchUserAddress(user.id);
            if (!isMounted) return;

            if (savedAddress) {
                setFormData((prev) => ({
                    ...prev,
                    fullName: savedAddress.fullName || baseData.fullName,
                    phone: savedAddress.phone || baseData.phone,
                    email: baseData.email,
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

    const handleChange = (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setIsApplyingCoupon(true);
        setCouponError("");

        try {
            const res = await fetch("/api/coupons/validate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: couponCode, cartTotal: totalPrice }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "كود الخصم غير صالح");

            setAppliedCoupon(data.coupon);
            setCouponCode("");
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "حصلت مشكلة في تطبيق الكود";
            setCouponError(errorMessage);
        } finally {
            setIsApplyingCoupon(false);
        }
    };

    const shipping = totalPrice >= 500 ? 0 : 50;
    const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
    const finalTotal = Math.max(0, totalPrice + shipping - discountAmount);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");

        const checkoutSchema = z.object({
            fullName: z.string().min(3, "الاسم يجب أن يكون 3 أحرف على الأقل"),
            phone: z.string().regex(/^01[0125][0-9]{8}$/, "رقم الموبايل غير صحيح (مثال: 01012345678)"),
            email: z.string().email("الإيميل غير صحيح").optional().or(z.literal("")), // ✅ اختياري
            city: z.string().min(2, "المدينة مطلوبة"),
            address: z.string().min(5, "العنوان يجب أن يكون 5 أحرف على الأقل"),
        });

        const validation = checkoutSchema.safeParse(formData);

        if (!validation.success) {
            setError(validation.error.issues[0].message);
            return;
        }

        if (outOfStockItems.length > 0) {
            setError("فيه منتجات في سلتك خلصت من المخزون. يرجى تحديث السلة.");
            return;
        }

        setIsSubmitting(true);

        try {
            const result = await createOrder({
                fullName: formData.fullName,
                phone: formData.phone,
                email: formData.email, // ✅ بنبعت الإيميل
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
                couponCode: appliedCoupon?.code || null,
                discountAmount: discountAmount,
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

    // ✅ شيلنا شرط if (!user) return null; عشان الزائر يدخل

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
                    {user && (
                        <Link href="/account/orders" className="inline-block bg-charcoal hover:bg-gold text-cream hover:text-charcoal font-semibold px-6 py-3 rounded-md transition-colors">
                            طلباتي
                        </Link>
                    )}
                    <Link href="/products" className="inline-block border border-charcoal/20 hover:border-charcoal text-charcoal font-medium px-6 py-3 rounded-md transition-colors">
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
                <Link href="/products" className="inline-block bg-charcoal hover:bg-gold text-cream hover:text-charcoal font-semibold px-6 py-3 rounded-md transition-colors">
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
                            {user && (
                                <Link href="/account" className="text-sm text-gold hover:underline font-medium">
                                    تعديل العنوان المحفوظ
                                </Link>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-medium text-charcoal mb-2">الاسم الكامل *</label>
                                <input type="text" name="fullName" required value={formData.fullName} onChange={handleChange} className="w-full px-4 py-3 rounded-md border border-charcoal/15 bg-white text-sm focus:outline-none focus:border-gold" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-charcoal mb-2">رقم التليفون *</label>
                                <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 rounded-md border border-charcoal/15 bg-white text-sm focus:outline-none focus:border-gold" />
                            </div>
                        </div>

                        {/* ✅ خانة الإيميل الجديدة */}
                        <div>
                            <label className="block text-sm font-medium text-charcoal mb-2">الإيميل (اختياري - لتأكيد الطلب)</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 rounded-md border border-charcoal/15 bg-white text-sm focus:outline-none focus:border-gold" placeholder="example@email.com" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-charcoal mb-2">المدينة *</label>
                            <input type="text" name="city" required value={formData.city} onChange={handleChange} className="w-full px-4 py-3 rounded-md border border-charcoal/15 bg-white text-sm focus:outline-none focus:border-gold" placeholder="القاهرة" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-charcoal mb-2">العنوان بالتفصيل *</label>
                            <textarea name="address" required value={formData.address} onChange={handleChange} rows={3} className="w-full px-4 py-3 rounded-md border border-charcoal/15 bg-white text-sm focus:outline-none focus:border-gold resize-none" placeholder="الشارع، رقم العمارة، الدور، الشقة" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-charcoal mb-2">ملاحظات إضافية (اختياري)</label>
                            <textarea name="notes" value={formData.notes} onChange={handleChange} rows={2} className="w-full px-4 py-3 rounded-md border border-charcoal/15 bg-white text-sm focus:outline-none focus:border-gold resize-none" />
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg border border-charcoal/10 p-6 sticky top-24 animate-fade-up">
                            <h2 className="text-lg font-semibold text-charcoal mb-5">ملخص الطلب</h2>

                            <div className="space-y-4 mb-5 max-h-72 overflow-y-auto">
                                {items.map((item) => {
                                    const isOutOfStock = outOfStockItems.some(i => i.productId === item.productId && i.size === item.size && i.color === item.color);
                                    return (
                                        <div key={`${item.productId}-${item.size}-${item.color}`} className="flex gap-3">
                                            <div className="relative w-14 h-16 rounded-md overflow-hidden bg-cream flex-shrink-0 border border-charcoal/5">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={item.image} alt={item.name} className="absolute inset-0 w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-medium truncate ${isOutOfStock ? 'text-error line-through' : 'text-charcoal'}`}>{item.name}</p>
                                                <p className="text-xs text-muted">{item.size} × {item.quantity}</p>
                                                {isOutOfStock ? (
                                                    <p className="text-xs text-error font-medium mt-1">خلص من المخزون</p>
                                                ) : (
                                                    <p className="text-sm font-semibold text-charcoal">{item.price * item.quantity} ج.م</p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="border-t border-charcoal/10 pt-4 pb-4">
                                <label className="block text-sm font-medium text-charcoal mb-2">كود الخصم</label>
                                {!appliedCoupon ? (
                                    <div className="flex gap-2">
                                        <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="أدخل الكود هنا" className="flex-1 px-3 py-2 rounded-md border border-charcoal/15 bg-cream text-sm focus:outline-none focus:border-gold uppercase" />
                                        <button type="button" onClick={handleApplyCoupon} disabled={isApplyingCoupon || !couponCode.trim()} className="bg-charcoal hover:bg-gold text-cream hover:text-charcoal px-4 rounded-md text-sm font-medium transition-colors disabled:opacity-50">
                                            {isApplyingCoupon ? "..." : "تطبيق"}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between bg-success/10 border border-success/30 rounded-md p-3">
                                        <div className="flex items-center gap-2 text-success">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
                                            <span className="text-sm font-bold">{appliedCoupon.code}</span>
                                        </div>
                                        <button type="button" onClick={() => setAppliedCoupon(null)} className="text-error hover:text-error/80 text-xs font-bold">إلغاء</button>
                                    </div>
                                )}
                                {couponError && <p className="text-error text-xs mt-2">{couponError}</p>}
                            </div>

                            <div className="border-t border-charcoal/10 pt-5 space-y-2 text-sm">
                                <div className="flex justify-between text-muted"><span>المجموع الفرعي</span><span>{totalPrice} ج.م</span></div>
                                <div className="flex justify-between text-muted"><span>الشحن</span><span>{shipping === 0 ? "مجاني" : `${shipping} ج.م`}</span></div>
                                {appliedCoupon && (
                                    <div className="flex justify-between text-success font-medium"><span>الخصم ({appliedCoupon.code})</span><span>-{discountAmount} ج.م</span></div>
                                )}
                                <div className="flex justify-between text-base font-bold text-charcoal pt-3 border-t border-charcoal/10"><span>الإجمالي</span><span>{finalTotal} ج.م</span></div>
                            </div>

                            {error && <div className="mt-4 bg-error/10 text-error border border-error/30 rounded-md p-3 text-sm font-medium">{error}</div>}
                            {outOfStockItems.length > 0 && <div className="mt-4 bg-warning/10 text-warning-dark border border-warning/30 rounded-md p-3 text-sm font-medium">بعض المنتجات في سلتك خلصت. برجاء حذفها من السلة أو تحديث الكمية للمتابعة.</div>}

                            <div className="hidden md:block mt-6">
                                <button type="submit" disabled={isSubmitting || outOfStockItems.length > 0} className="w-full bg-charcoal hover:bg-gold text-cream hover:text-charcoal font-semibold h-12 rounded-md transition-colors disabled:opacity-50">
                                    {isSubmitting ? "جاري إرسال الطلب..." : "تأكيد الطلب"}
                                </button>
                                <p className="text-xs text-muted text-center mt-3">الدفع عند الاستلام</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="md:hidden fixed bottom-16 left-0 right-0 p-4 bg-cream/95 backdrop-blur-md border-t border-charcoal/10 z-30">
                    <button type="submit" disabled={isSubmitting || outOfStockItems.length > 0} className="w-full bg-charcoal hover:bg-gold text-cream hover:text-charcoal font-semibold h-12 rounded-md transition-colors disabled:opacity-50 shadow-lg">
                        {isSubmitting ? "جاري إرسال الطلب..." : "تأكيد الطلب"}
                    </button>
                    <p className="text-xs text-muted text-center mt-2">الدفع عند الاستلام</p>
                </div>
            </form>
        </div>
    );
}