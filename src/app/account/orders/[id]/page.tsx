"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-context";
import { fetchOrderById, type Order } from "@/lib/orders-api";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    pending: { label: "قيد الانتظار", color: "bg-charcoal/10 text-charcoal" },
    confirmed: { label: "تم التأكيد", color: "bg-gold/20 text-gold-dark" },
    shipped: { label: "تم الشحن", color: "bg-blue-100 text-blue-700" },
    delivered: { label: "تم التوصيل", color: "bg-success/10 text-success" },
    cancelled: { label: "ملغي", color: "bg-error/10 text-error" },
};

type Props = {
    params: Promise<{ id: string }>;
};

export default function OrderDetailPage({ params }: Props) {
    const { id } = use(params);
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth();
    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login");
            return;
        }

        if (user) {
            fetchOrderById(Number(id))
                .then((data) => {
                    if (!data) {
                        setNotFound(true);
                    } else {
                        setOrder(data);
                    }
                })
                .catch((e) => {
                    console.error(e);
                    setNotFound(true);
                })
                .finally(() => setIsLoading(false));
        }
    }, [user, authLoading, router, id]);

    if (authLoading || isLoading) {
        return (
            <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center">
                <p className="text-muted">جاري التحميل...</p>
            </div>
        );
    }

    if (notFound || !order) {
        return (
            <div className="max-w-2xl mx-auto px-6 py-20 text-center">
                <h1 className="text-2xl font-bold text-charcoal mb-3">
                    الطلب غير موجود
                </h1>
                <p className="text-muted mb-8">يمكن الطلب اتحذف أو الرابط غلط.</p>
                <Link
                    href="/account/orders"
                    className="inline-block bg-charcoal hover:bg-gold text-cream hover:text-charcoal font-semibold px-6 py-3 rounded-md transition-colors"
                >
                    رجوع للطلبات
                </Link>
            </div>
        );
    }

    const status = STATUS_LABELS[order.status] || STATUS_LABELS.pending;

    return (
        <div className="max-w-4xl mx-auto px-6 lg:px-8 py-12">
            <div className="mb-8">
                <Link
                    href="/account/orders"
                    className="text-sm text-muted hover:text-gold"
                >
                    ← رجوع للطلبات
                </Link>
            </div>

            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-charcoal/10">
                <div>
                    <p className="text-gold text-xs font-medium tracking-widest uppercase mb-2">
                        Order Details
                    </p>
                    <h1 className="text-2xl md:text-3xl font-bold text-charcoal">
                        {order.orderNumber}
                    </h1>
                    <p className="text-sm text-muted mt-2">
                        {new Date(order.createdAt).toLocaleDateString("ar-EG", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </p>
                </div>
                <div
                    className={`px-4 py-2 rounded-full text-sm font-medium ${status.color}`}
                >
                    {status.label}
                </div>
            </div>

            {/* Shipping Info */}
            <div className="bg-white rounded-lg border border-charcoal/10 p-6 mb-6">
                <h2 className="text-lg font-semibold text-charcoal mb-4">
                    بيانات الشحن
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-muted mb-1">الاسم</p>
                        <p className="text-charcoal font-medium">{order.fullName}</p>
                    </div>
                    <div>
                        <p className="text-muted mb-1">التليفون</p>
                        <p className="text-charcoal font-medium" dir="ltr">
                            {order.phone}
                        </p>
                    </div>
                    <div className="md:col-span-2">
                        <p className="text-muted mb-1">المدينة</p>
                        <p className="text-charcoal font-medium">{order.city}</p>
                    </div>
                    <div className="md:col-span-2">
                        <p className="text-muted mb-1">العنوان</p>
                        <p className="text-charcoal font-medium">{order.address}</p>
                    </div>
                    {order.notes && (
                        <div className="md:col-span-2">
                            <p className="text-muted mb-1">ملاحظات</p>
                            <p className="text-charcoal font-medium">{order.notes}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Items */}
            <div className="bg-white rounded-lg border border-charcoal/10 p-6 mb-6">
                <h2 className="text-lg font-semibold text-charcoal mb-4">
                    المنتجات ({order.items.length})
                </h2>
                <div className="space-y-4">
                    {order.items.map((item, idx) => (
                        <div
                            key={idx}
                            className="flex gap-4 pb-4 border-b border-charcoal/5 last:border-b-0 last:pb-0"
                        >
                            <div className="relative w-16 h-20 rounded-md overflow-hidden bg-cream flex-shrink-0">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <Link
                                    href={`/products/${item.productId}`}
                                    className="text-sm font-medium text-charcoal hover:text-gold transition-colors"
                                >
                                    {item.name}
                                </Link>
                                <p className="text-xs text-muted mb-1">{item.nameEn}</p>
                                <p className="text-xs text-muted">
                                    المقاس: {item.size} | الكمية: {item.quantity}
                                </p>
                            </div>
                            <p className="text-sm font-semibold text-charcoal whitespace-nowrap">
                                {item.price * item.quantity} ج.م
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Total */}
            <div className="bg-white rounded-lg border border-charcoal/10 p-6">
                <h2 className="text-lg font-semibold text-charcoal mb-4">
                    ملخص الحساب
                </h2>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-muted">
                        <span>المجموع الفرعي</span>
                        <span>{order.subtotal} ج.م</span>
                    </div>
                    <div className="flex justify-between text-muted">
                        <span>الشحن</span>
                        <span>{order.shipping === 0 ? "مجاني" : `${order.shipping} ج.م`}</span>
                    </div>
                    <div className="flex justify-between text-base font-bold text-charcoal pt-4 mt-4 border-t border-charcoal/10">
                        <span>الإجمالي</span>
                        <span>{order.total} ج.م</span>
                    </div>
                </div>
                <p className="text-xs text-muted text-center mt-6 pt-4 border-t border-charcoal/10">
                    الدفع عند الاستلام
                </p>
            </div>
        </div>
    );
}