"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-context";
import { fetchUserOrders, type Order } from "@/lib/orders-api";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    pending: { label: "قيد الانتظار", color: "bg-charcoal/10 text-charcoal" },
    confirmed: { label: "تم التأكيد", color: "bg-gold/20 text-gold-dark" },
    shipped: { label: "تم الشحن", color: "bg-blue-100 text-blue-700" },
    delivered: { label: "تم التوصيل", color: "bg-success/10 text-success" },
    cancelled: { label: "ملغي", color: "bg-error/10 text-error" },
};

export default function OrdersPage() {
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login");
            return;
        }

        if (user) {
            fetchUserOrders(user.id)
                .then(setOrders)
                .catch((e) => console.error(e))
                .finally(() => setIsLoading(false));
        }
    }, [user, authLoading, router]);

    if (authLoading || isLoading) {
        return (
            <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center">
                <p className="text-muted">جاري التحميل...</p>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="max-w-4xl mx-auto px-6 lg:px-8 py-12 animate-fade-in">
            <div className="mb-8">
                <Link href="/account" className="text-sm text-muted hover:text-gold">
                    ← رجوع لحسابي
                </Link>
            </div>

            <div className="mb-10 animate-fade-up">
                <p className="text-gold text-xs font-medium tracking-widest uppercase mb-2">
                    Orders
                </p>
                <h1 className="text-3xl md:text-4xl font-bold text-charcoal">
                    طلباتي
                </h1>
            </div>

            {orders.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-lg border border-charcoal/10 animate-fade-up">
                    <p className="text-muted mb-6">مفيش طلبات لحد الآن</p>
                    <Link
                        href="/products"
                        className="inline-block bg-charcoal hover:bg-gold text-cream hover:text-charcoal font-semibold px-6 py-3 rounded-md transition-colors"
                    >
                        ابدأ التسوق
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order, idx) => {
                        const status = STATUS_LABELS[order.status] || STATUS_LABELS.pending;
                        return (
                            <Link
                                key={order.id}
                                href={`/account/orders/${order.id}`}
                                className="block bg-white rounded-lg border border-charcoal/10 hover:border-gold p-5 transition-all hover:shadow-lg animate-fade-up opacity-0"
                                style={{
                                    animationDelay: `${idx * 80}ms`,
                                    animationFillMode: "forwards",
                                }}
                            >
                                {/* Header */}
                                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-charcoal/10">
                                    <div>
                                        <p className="text-xs text-muted mb-1">رقم الطلب</p>
                                        <p className="text-sm font-bold text-gold">
                                            {order.orderNumber}
                                        </p>
                                    </div>
                                    <div
                                        className={`px-3 py-1 rounded-full text-xs font-medium ${status.color}`}
                                    >
                                        {status.label}
                                    </div>
                                </div>

                                {/* Items */}
                                <div className="space-y-3 mb-4">
                                    {order.items.map((item, i) => (
                                        <div key={i} className="flex gap-3">
                                            <div className="relative w-12 h-14 rounded-md overflow-hidden bg-cream flex-shrink-0">
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
                                            </div>
                                            <p className="text-sm font-semibold text-charcoal whitespace-nowrap">
                                                {item.price * item.quantity} ج.م
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                {/* Footer */}
                                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-charcoal/10">
                                    <div className="text-xs text-muted">
                                        {new Date(order.createdAt).toLocaleDateString("ar-EG", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </div>
                                    <div className="text-sm font-bold text-charcoal">
                                        الإجمالي: {order.total} ج.م
                                    </div>
                                </div>

                                <div className="text-xs text-gold font-medium mt-3 pt-3 border-t border-charcoal/10">
                                    عرض التفاصيل →
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}