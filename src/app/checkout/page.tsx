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
    email: string;
    city: string;
    address: string;
    notes: string;
};

export default function CheckoutPage() {
    const { items, totalPrice, clearCart } = useCart();
    const { user, isLoading: authLoading } = useAuth();
    const { products, refreshProducts } = useProducts();

    const [formData, setFormData] = useState<FormData>({
        fullName: "", phone: "", email: "", city: "", address: "", notes: "",
    });
    const [submitted, setSubmitted] = useState(false);
    const [orderNumber, setOrderNumber] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number } | null>(null);
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
    const [couponError, setCouponError] = useState("");

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
                setFormData((prev) => ({ ...prev, ...baseData }));
            }
        };
        void loadData();
        return () => { isMounted = false; };
    }, [user]);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (fieldErrors[e.target.name]) {
            setFieldErrors(prev => ({ ...prev, [e.target.name]: "" }));
        }
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
        setFieldErrors({});

        const checkoutSchema = z.object({
            fullName: z.string().min(3, "الاسم يجب أن يكون 3 أحرف على الأقل"),
            phone: z.string().regex(/^01[0125][0-9]{8}$/, "رقم الموبايل غير صحيح (مثال: 01012345678)"),
            email: z.string().email("الإيميل غير صحيح").optional().or(z.literal("")),
            city: z.string().min(2, "المدينة مطلوبة"),
            address: z.string().min(5, "العنوان يجب أن يكون 5 أحرف على الأقل"),
        });

        const validation = checkoutSchema.safeParse(formData);

        if (!validation.success) {
            const errors: Record<string, string> = {};
            validation.error.issues.forEach((issue) => {
                if (issue.path[0]) errors[issue.path[0] as string] = issue.message;
            });
            setFieldErrors(errors);
            setError("فيه أخطاء في البيانات. يرجى مراجعة الحقول المطلوبة.");
            return;
        }

        if (outOfStockItems.length > 0) {
            setError("فيه منتجات في سلتك خلصت من المخزون. يرجى تحديث السلة.");
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await createOrder({
                fullName: formData.fullName, phone: formData.phone, email: formData.email,
                city: formData.city, address: formData.address, notes: formData.notes,
                items: items.map((item) => ({
                    productId: item.productId, name: item.name, nameEn: item.nameEn,
                    price: item.price, image: item.image, size: item.size, color: item.color, quantity: item.quantity,
                })),
                couponCode: appliedCoupon?.code || null, discountAmount: discountAmount,
            });

            if (result.error) { setError(result.error); setIsSubmitting(false); return; }
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

    const handleWhatsAppOrder = () => {
        if (!formData.fullName || !formData.phone || !formData.city || !formData.address) {
            setError("رجاءً املأ بيانات الشحن (الاسم، التليفون، المدينة، العنوان) أولاً.");
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
        }
        const storePhone = "201000000000";
        let text = `*طلب جديد من متجر Mood*\n\n`;
        text += `*بيانات العميل:*\n`;
        text += `👤 الاسم: ${formData.fullName}\n`;
        text += `📞 التليفون: ${formData.phone}\n`;
        text += `📍 المدينة: ${formData.city}\n`;
        text += `🏠 العنوان: ${formData.address}\n`;
        if (formData.notes) text += `📝 ملاحظات: ${formData.notes}\n`;
        text += `\n*المنتجات:*\n`;
        items.forEach((item, index) => {
            text += `${index + 1}. ${item.name} (مقاس: ${item.size}، لون: ${item.color}) - ${item.quantity} × ${item.price} = ${item.quantity * item.price} ج.م\n`;
        });
        if (appliedCoupon) text += `\n🎟️ كوبون الخصم: ${appliedCoupon.code} (خصم ${discountAmount} ج.م)`;
        text += `\n*الإجمالي النهائي:* ${finalTotal} ج.م`;
        window.open(`https://wa.me/${storePhone}?text=${encodeURIComponent(text)}`, "_blank");
    };

    if (authLoading) return <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center"><p className="text-muted">جاري التحميل...</p></div>;

    if (submitted) {
        return (
            <div className="max-w-2xl mx-auto px-6 py-20 text-center animate-fade-in">
                <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6 animate-fade-up">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
                <h1 className="text-3xl font-bold text-charcoal mb-3 animate-fade-up">تم استلام طلبك!</h1>
                <p className="text-muted mb-6 animate-fade-up">شكراً لك. هنتواصل معاك قريباً لتأكيد الطلب.</p>
                <div className="bg-white border border-charcoal/10 rounded-lg p-6 mb-8 inline-block animate-fade-up">
                    <p className="text-xs text-muted mb-1">رقم الطلب</p>
                    <p className="text-2xl font-bold text-gold">{orderNumber}</p>
                </div>
                <div className="flex justify-center gap-4 flex-wrap animate-fade-up">
                    {user && <Link href="/account/orders" className="inline-block bg-charcoal hover:bg-gold text-cream hover:text-charcoal font-semibold px-6 py-3 rounded-md transition-colors">طلباتي</Link>}
                    <Link href="/products" className="inline-block border border-charcoal/20 hover:border-charcoal text-charcoal font-medium px-6 py-3 rounded-md transition-colors">متابعة التسوق</Link>
                </div>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="max-w-2xl mx-auto px-6 py-20 text-center animate-fade-in">
                <h1 className="text-2xl font-bold text-charcoal mb-3">السلة فاضية</h1>
                <p className="text-muted mb-8">مفيش منتجات في السلة عشان تكمل الطلب.</p>
                <Link href="/products" className="inline-block bg-charcoal hover:bg-gold text-cream hover:text-charcoal font-semibold px-6 py-3 rounded-md transition-colors">ابدأ التسوق</Link>
            </div>
        );
    }

    return (
        // ✅ زودنا المساحة تحت الصفحة لـ pb-56 عشان الزرار العائم ميتداخلش مع المحتوى
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12 pb-56 md:pb-12 animate-fade-in w-full">
            <div className="mb-8 md:mb-10 animate-fade-up">
                <p className="text-gold text-xs font-medium tracking-widest uppercase mb-2">Checkout</p>
                <h1 className="text-3xl md:text-4xl font-bold text-charcoal">إتمام الشراء</h1>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
                    {/* Form Fields */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-lg font-semibold text-charcoal">بيانات الشحن</h2>
                            {user && <Link href="/account" className="text-sm text-gold hover:underline font-medium">تعديل العنوان المحفوظ</Link>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-medium text-charcoal mb-2">الاسم الكامل *</label>
                                <input type="text" name="fullName" required value={formData.fullName} onChange={handleChange} className={`w-full px-4 py-3.5 rounded-lg border bg-white text-base transition-colors focus:outline-none ${fieldErrors.fullName ? "border-error focus:border-error" : "border-charcoal/15 focus:border-gold"}`} />
                                {fieldErrors.fullName && <p className="text-xs text-error mt-1.5">{fieldErrors.fullName}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-charcoal mb-2">رقم التليفون *</label>
                                <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className={`w-full px-4 py-3.5 rounded-lg border bg-white text-base transition-colors focus:outline-none ${fieldErrors.phone ? "border-error focus:border-error" : "border-charcoal/15 focus:border-gold"}`} />
                                {fieldErrors.phone && <p className="text-xs text-error mt-1.5">{fieldErrors.phone}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-charcoal mb-2">الإيميل (اختياري)</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} className={`w-full px-4 py-3.5 rounded-lg border bg-white text-base transition-colors focus:outline-none ${fieldErrors.email ? "border-error focus:border-error" : "border-charcoal/15 focus:border-gold"}`} placeholder="example@email.com" />
                            {fieldErrors.email && <p className="text-xs text-error mt-1.5">{fieldErrors.email}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-charcoal mb-2">المدينة *</label>
                            <input type="text" name="city" required value={formData.city} onChange={handleChange} className={`w-full px-4 py-3.5 rounded-lg border bg-white text-base transition-colors focus:outline-none ${fieldErrors.city ? "border-error focus:border-error" : "border-charcoal/15 focus:border-gold"}`} placeholder="القاهرة" />
                            {fieldErrors.city && <p className="text-xs text-error mt-1.5">{fieldErrors.city}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-charcoal mb-2">العنوان بالتفصيل *</label>
                            <textarea name="address" required value={formData.address} onChange={handleChange} rows={3} className={`w-full px-4 py-3.5 rounded-lg border bg-white text-base transition-colors resize-none focus:outline-none ${fieldErrors.address ? "border-error focus:border-error" : "border-charcoal/15 focus:border-gold"}`} placeholder="الشارع، رقم العمارة، الدور، الشقة" />
                            {fieldErrors.address && <p className="text-xs text-error mt-1.5">{fieldErrors.address}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-charcoal mb-2">ملاحظات إضافية (اختياري)</label>
                            <textarea name="notes" value={formData.notes} onChange={handleChange} rows={2} className="w-full px-4 py-3.5 rounded-lg border border-charcoal/15 bg-white text-base focus:outline-none focus:border-gold resize-none" />
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl border border-charcoal/10 p-6 sticky top-24 animate-fade-up">
                            <h2 className="text-lg font-semibold text-charcoal mb-5">ملخص الطلب</h2>
                            <div className="space-y-4 mb-5 max-h-60 overflow-y-auto pr-1">
                                {items.map((item) => {
                                    const isOutOfStock = outOfStockItems.some(i => i.productId === item.productId && i.size === item.size && i.color === item.color);
                                    return (
                                        <div key={`${item.productId}-${item.size}-${item.color}`} className="flex gap-3">
                                            <div className="relative w-14 h-16 rounded-md overflow-hidden bg-cream flex-shrink-0 border border-charcoal/5">
                                                <img src={item.image} alt={item.name} className="absolute inset-0 w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-medium truncate ${isOutOfStock ? 'text-error line-through' : 'text-charcoal'}`}>{item.name}</p>
                                                <p className="text-xs text-muted">{item.size} × {item.quantity}</p>
                                                {isOutOfStock ? <p className="text-xs text-error font-medium mt-1">خلص من المخزون</p> : <p className="text-sm font-semibold text-charcoal">{item.price * item.quantity} ج.م</p>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="border-t border-charcoal/10 pt-4 pb-4">
                                <label className="block text-sm font-medium text-charcoal mb-2">كود الخصم</label>
                                {!appliedCoupon ? (
                                    <div className="flex gap-2 w-full">
                                        <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="أدخل الكود" className="flex-1 min-w-0 px-3 py-2.5 rounded-md border border-charcoal/15 bg-cream text-sm focus:outline-none focus:border-gold uppercase" />
                                        <button type="button" onClick={handleApplyCoupon} disabled={isApplyingCoupon || !couponCode.trim()} className="bg-charcoal hover:bg-gold text-cream hover:text-charcoal px-4 rounded-md text-sm font-medium transition-colors disabled:opacity-50 flex-shrink-0">{isApplyingCoupon ? "..." : "تطبيق"}</button>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between bg-success/10 border border-success/30 rounded-md p-3">
                                        <span className="text-sm font-bold text-success">{appliedCoupon.code}</span>
                                        <button type="button" onClick={() => setAppliedCoupon(null)} className="text-error hover:text-error/80 text-xs font-bold">إلغاء</button>
                                    </div>
                                )}
                                {couponError && <p className="text-error text-xs mt-2">{couponError}</p>}
                            </div>

                            <div className="border-t border-charcoal/10 pt-5 space-y-2.5 text-sm">
                                <div className="flex justify-between text-muted"><span>المجموع الفرعي</span><span>{totalPrice} ج.م</span></div>
                                <div className="flex justify-between text-muted"><span>الشحن</span><span>{shipping === 0 ? "مجاني" : `${shipping} ج.م`}</span></div>
                                {appliedCoupon && <div className="flex justify-between text-success font-medium"><span>الخصم ({appliedCoupon.code})</span><span>-{discountAmount} ج.م</span></div>}
                                <div className="flex justify-between text-lg font-bold text-charcoal pt-3 border-t border-charcoal/10"><span>الإجمالي</span><span>{finalTotal} ج.م</span></div>
                            </div>

                            {error && <div className="mt-4 bg-error/10 text-error border border-error/30 rounded-md p-3 text-sm font-medium">{error}</div>}
                            {outOfStockItems.length > 0 && <div className="mt-4 bg-warning/10 text-warning-dark border border-warning/30 rounded-md p-3 text-sm font-medium">بعض المنتجات في سلتك خلصت. برجاء حذفها من السلة.</div>}

                            {/* Desktop Submit Buttons */}
                            <div className="hidden md:flex flex-col gap-3 mt-6">
                                <button type="submit" disabled={isSubmitting || outOfStockItems.length > 0} className="w-full bg-charcoal hover:bg-gold text-cream hover:text-charcoal font-semibold h-12 rounded-lg transition-colors disabled:opacity-50">
                                    {isSubmitting ? "جاري إرسال الطلب..." : "تأكيد الطلب"}
                                </button>
                                <button type="button" onClick={handleWhatsAppOrder} disabled={outOfStockItems.length > 0} className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold h-12 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 448 512" fill="currentColor"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zM223.9 411.1c-33.9 0-67.1-9.1-95.9-26.3l-6.9-4.1-71.2 18.7 19.1-69.4-4.5-7.1c-18.9-30.1-28.9-64.6-28.9-100.5 0-102 83.2-185 185.1-185 49.4 0 95.9 19.3 130.8 54.3 34.8 34.9 54.1 81.4 54.1 130.8 0 102-83.2 185.1-185.1 185.1zm101.5-138.4c-5.6-2.8-33.1-16.3-38.2-18.2-5.1-1.9-8.9-2.8-12.6 2.8-3.7 5.6-14.5 18.2-17.8 21.9-3.3 3.7-6.5 4.2-12.1 1.4-5.6-2.8-23.6-8.7-45-27.7-16.6-14.8-27.8-33.1-31.1-38.7-3.3-5.6-.3-8.6 2.4-11.4 2.5-2.5 5.6-6.5 8.4-9.8 2.8-3.3 3.7-5.6 5.6-9.3 1.9-3.7.9-6.9-.5-9.8-1.4-2.8-12.6-30.4-17.3-41.5-4.6-11.1-9.2-9.6-12.6-9.8-3.3-.2-7.1-.2-10.8-.2-3.7 0-9.8 1.4-14.9 6.9-5.1 5.6-19.6 19.1-19.6 46.7 0 27.6 20 54.3 22.8 58 2.8 3.7 39.4 60.2 95.5 84.3 13.3 5.8 23.8 9.2 31.9 11.8 13.4 4.3 25.6 3.7 35.2 2.2 10.7-1.7 33.1-13.5 37.7-26.6 4.6-13 4.6-24.1 3.2-26.6-1.4-2.5-5.1-4.1-10.7-6.9z"/></svg>
                                    اطلب عبر واتساب
                                </button>
                                <p className="text-xs text-muted text-center mt-1">الدفع عند الاستلام</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ✅ Mobile Sticky Button - تم تعديله ليكون أبيض صريح ومستقر ومش بيغطي على حاجة */}
                <div className="md:hidden fixed bottom-[64px] inset-x-0 p-4 bg-white border-t border-charcoal/10 z-40 shadow-[0_-8px_20px_rgba(0,0,0,0.08)]" style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}>
                    <div className="flex gap-3">
                        <button type="submit" disabled={isSubmitting || outOfStockItems.length > 0} className="flex-1 bg-charcoal hover:bg-gold text-cream hover:text-charcoal font-semibold h-12 rounded-lg transition-colors disabled:opacity-50 shadow-sm">
                            {isSubmitting ? "جاري الإرسال..." : "تأكيد الطلب"}
                        </button>
                        <div className="bg-cream/80 border border-charcoal/10 rounded-lg px-4 flex flex-col items-center justify-center min-w-[80px]">
                            <span className="text-[10px] text-muted">الإجمالي</span>
                            <span className="text-sm font-bold text-charcoal">{finalTotal} ج.م</span>
                        </div>
                        <button type="button" onClick={handleWhatsAppOrder} disabled={outOfStockItems.length > 0} className="w-12 h-12 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-lg transition-colors flex items-center justify-center shadow-sm flex-shrink-0 disabled:opacity-50">
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 448 512" fill="currentColor"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zM223.9 411.1c-33.9 0-67.1-9.1-95.9-26.3l-6.9-4.1-71.2 18.7 19.1-69.4-4.5-7.1c-18.9-30.1-28.9-64.6-28.9-100.5 0-102 83.2-185 185.1-185 49.4 0 95.9 19.3 130.8 54.3 34.8 34.9 54.1 81.4 54.1 130.8 0 102-83.2 185.1-185.1 185.1zm101.5-138.4c-5.6-2.8-33.1-16.3-38.2-18.2-5.1-1.9-8.9-2.8-12.6 2.8-3.7 5.6-14.5 18.2-17.8 21.9-3.3 3.7-6.5 4.2-12.1 1.4-5.6-2.8-23.6-8.7-45-27.7-16.6-14.8-27.8-33.1-31.1-38.7-3.3-5.6-.3-8.6 2.4-11.4 2.5-2.5 5.6-6.5 8.4-9.8 2.8-3.3 3.7-5.6 5.6-9.3 1.9-3.7.9-6.9-.5-9.8-1.4-2.8-12.6-30.4-17.3-41.5-4.6-11.1-9.2-9.6-12.6-9.8-3.3-.2-7.1-.2-10.8-.2-3.7 0-9.8 1.4-14.9 6.9-5.1 5.6-19.6 19.1-19.6 46.7 0 27.6 20 54.3 22.8 58 2.8 3.7 39.4 60.2 95.5 84.3 13.3 5.8 23.8 9.2 31.9 11.8 13.4 4.3 25.6 3.7 35.2 2.2 10.7-1.7 33.1-13.5 37.7-26.6 4.6-13 4.6-24.1 3.2-26.6-1.4-2.5-5.1-4.1-10.7-6.9z"/></svg>
                        </button>
                    </div>
                    <p className="text-[10px] text-muted text-center mt-2">الدفع عند الاستلام</p>
                </div>
            </form>
        </div>
    );
}