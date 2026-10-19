"use client";

import { useState } from "react";
import Link from "next/link";

// ✅ تعريف أنواع البيانات بدل any
type OrderItem = {
    name: string;
    quantity: number;
    price: number;
};

type TrackedOrder = {
    id: number;
    order_number: string;
    status: string;
    created_at: string;
    total: number;
    full_name: string;
    items: OrderItem[];
};

export default function TrackOrderPage() {
    const [orderNumber, setOrderNumber] = useState("");
    const [contactInfo, setContactInfo] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [order, setOrder] = useState<TrackedOrder | null>(null);

    // ✅ استخدام React.FormEvent بدل FormEvent
    const handleTrack = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setOrder(null);

        try {
            const res = await fetch("/api/orders/track", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderNumber, contactInfo }),
            });

            const data = await res.json();

            // ✅ بدل ما نعمل throw ونمسكه، بنتعامل مع الخطأ مباشرة
            if (!res.ok) {
                setError(data.error || "الطلب غير موجود");
                return;
            }

            setOrder(data.order as TrackedOrder);
        } catch (err) {
            // ✅ استخدام unknown بدل any
            const errorMessage = err instanceof Error ? err.message : "حدث خطأ في الاتصال";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const statusMap: Record<string, { label: string, color: string }> = {
        pending: { label: "قيد الانتظار", color: "text-gold" },
        confirmed: { label: "تم التأكيد", color: "text-gold" },
        shipped: { label: "تم الشحن", color: "text-blue-500" },
        delivered: { label: "تم التوصيل", color: "text-success" },
        cancelled: { label: "ملغي", color: "text-error" },
    };

    return (
        <div className="max-w-xl mx-auto px-6 py-20 animate-fade-in">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-charcoal mb-2">تتبع طلبك</h1>
                <p className="text-muted">ادخل رقم الطلب وبيانات التواصل عشان تعرف حالة طلبك.</p>
            </div>

            <form onSubmit={handleTrack} className="bg-white p-6 rounded-lg border border-charcoal/10 shadow-sm space-y-4 mb-8">
                <div>
                    <label className="block text-sm font-medium mb-2">رقم الطلب (مثال: MOOD-123456)</label>
                    <input
                        type="text"
                        required
                        value={orderNumber}
                        onChange={(e) => setOrderNumber(e.target.value)}
                        className="w-full px-4 py-3 rounded-md border border-charcoal/15 bg-white text-base focus:border-gold outline-none uppercase"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">رقم الموبايل أو الإيميل اللي طلبت بيه</label>
                    <input
                        type="text"
                        required
                        value={contactInfo}
                        onChange={(e) => setContactInfo(e.target.value)}
                        className="w-full px-4 py-3 rounded-md border border-charcoal/15 bg-white text-base focus:border-gold outline-none"
                    />
                </div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-charcoal text-cream h-12 rounded-md font-semibold disabled:opacity-50"
                >
                    {isLoading ? "جاري البحث..." : "تتبع الطلب"}
                </button>
                {error && <p className="text-error text-sm text-center">{error}</p>}
            </form>

            {order && (
                <div className="bg-white p-6 rounded-lg border border-gold/30 shadow-lg animate-fade-up">
                    <div className="flex justify-between items-center border-b border-charcoal/10 pb-4 mb-4">
                        <div>
                            <p className="text-sm text-muted">رقم الطلب</p>
                            <p className="font-bold text-gold">{order.order_number}</p>
                        </div>
                        <div className="text-left">
                            <p className="text-sm text-muted">الحالة</p>
                            <p className={`font-bold ${statusMap[order.status]?.color || 'text-charcoal'}`}>
                                {statusMap[order.status]?.label || order.status}
                            </p>
                        </div>
                    </div>
                    <p className="text-sm text-muted mb-4">تاريخ الطلب: {new Date(order.created_at).toLocaleDateString("ar-EG")}</p>

                    {/* ✅ عرض المنتجات في صفحة التتبع */}
                    <div className="space-y-3 mb-6">
                        {order.items && order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                                <span>{item.quantity}x {item.name}</span>
                                <span className="font-semibold">{item.price * item.quantity} ج.م</span>
                            </div>
                        ))}
                        <div className="pt-3 border-t border-charcoal/10 flex justify-between font-bold">
                            <span>الإجمالي</span>
                            <span>{order.total} ج.م</span>
                        </div>
                    </div>
                    <Link href={`/products`} className="block text-center w-full border border-charcoal/20 text-charcoal py-3 rounded-md hover:bg-charcoal hover:text-cream transition-colors">
                        متابعة التسوق
                    </Link>
                </div>
            )}
        </div>
    );
}