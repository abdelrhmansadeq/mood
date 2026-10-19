"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAdmin } from "@/components/admin-context";
import { useToast } from "@/components/toast-context";
import { useRealtimeAllOrders } from "@/hooks/use-realtime-all-orders";
import { OrderListSkeleton } from "@/components/skeleton";
import { fetchAllOrders, updateOrderStatus, type Order } from "@/lib/orders-api";

const STATUS_OPTIONS: { value: Order["status"]; label: string; color: string; }[] = [
    { value: "pending", label: "قيد الانتظار", color: "bg-charcoal/10 text-charcoal" },
    { value: "confirmed", label: "تم التأكيد", color: "bg-gold/20 text-gold-dark" },
    { value: "shipped", label: "تم الشحن", color: "bg-blue-100 text-blue-700" },
    { value: "delivered", label: "تم التوصيل", color: "bg-success/10 text-success" },
    { value: "cancelled", label: "ملغي", color: "bg-error/10 text-error" },
];

export default function AdminOrdersPage() {
    const { isLoggedIn } = useAdmin();
    const { showToast } = useToast();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<Order["status"] | "all">("all");
    const [updatingId, setUpdatingId] = useState<number | null>(null);

    const lastRealtimeEvent = useRealtimeAllOrders();

    useEffect(() => {
        if (!isLoggedIn) return;
        fetchAllOrders()
            .then(setOrders)
            .catch((e) => {
                console.error(e);
                showToast("فشل تحميل الطلبات", "error");
            })
            .finally(() => setIsLoading(false));
    }, [isLoggedIn, showToast]);

    useEffect(() => {
        if (!lastRealtimeEvent || !isLoggedIn) return;
        fetchAllOrders().then(setOrders).catch((e) => console.error(e));
    }, [lastRealtimeEvent, isLoggedIn]);

    const filteredOrders = filter === "all" ? orders : orders.filter((o) => o.status === filter);

    const handleStatusChange = async (orderId: number, newStatus: Order["status"]) => {
        const previousOrders = orders;
        setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
        setUpdatingId(orderId);
        const result = await updateOrderStatus(orderId, newStatus);
        if (result.error) {
            setOrders(previousOrders);
            showToast(result.error, "error");
        } else {
            showToast("تم تحديث حالة الطلب", "success");
        }
        setUpdatingId(null);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-12">
            <div className="mb-6 md:mb-8">
                <Link href="/admin/dashboard" className="text-sm text-muted hover:text-gold flex items-center gap-1 w-fit">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    رجوع للوحة التحكم
                </Link>
            </div>

            <div className="flex items-center justify-between mb-6 md:mb-8">
                <div>
                    <p className="text-gold text-[10px] md:text-xs font-bold tracking-widest uppercase mb-1">Orders</p>
                    <h1 className="text-2xl md:text-4xl font-bold text-charcoal">الطلبات</h1>
                </div>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2 overflow-x-auto mb-6 pb-2">
                <button onClick={() => setFilter("all")} className={`px-4 py-2 rounded-full text-xs md:text-sm font-medium whitespace-nowrap transition-colors ${filter === "all" ? "bg-charcoal text-cream" : "bg-white border border-charcoal/10 text-charcoal/70"}`}>
                    الكل ({orders.length})
                </button>
                {STATUS_OPTIONS.map((opt) => {
                    const count = orders.filter((o) => o.status === opt.value).length;
                    return (
                        <button key={opt.value} onClick={() => setFilter(opt.value)} className={`px-4 py-2 rounded-full text-xs md:text-sm font-medium whitespace-nowrap transition-colors ${filter === opt.value ? "bg-charcoal text-cream" : "bg-white border border-charcoal/10 text-charcoal/70"}`}>
                            {opt.label} ({count})
                        </button>
                    );
                })}
            </div>

            {isLoading ? (
                <OrderListSkeleton count={3} />
            ) : filteredOrders.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-charcoal/10">
                    <p className="text-muted text-sm md:text-base">مفيش طلبات تطابق الفلتر ده.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredOrders.map((order) => {
                        const currentStatus = STATUS_OPTIONS.find((o) => o.value === order.status) || STATUS_OPTIONS[0];
                        return (
                            <div key={order.id} className="bg-white rounded-xl border border-charcoal/10 p-4 md:p-5">

                                {/* Header Card */}
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 mb-4 border-b border-charcoal/10">
                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                                        <div>
                                            <p className="text-[10px] md:text-xs text-muted mb-0.5">رقم الطلب</p>
                                            <Link href={`/admin/dashboard/orders/${order.id}`} className="text-sm font-bold text-gold hover:underline">
                                                {order.orderNumber}
                                            </Link>
                                        </div>
                                        <div>
                                            <p className="text-[10px] md:text-xs text-muted mb-0.5">التاريخ</p>
                                            <p className="text-xs md:text-sm text-charcoal">
                                                {new Date(order.createdAt).toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric" })}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] md:text-xs text-muted mb-0.5">العميل</p>
                                            <p className="text-sm font-medium text-charcoal">{order.fullName}</p>
                                        </div>
                                    </div>

                                    {/* Status & Dropdown (Mobile Friendly) */}
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2 md:mt-0">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${currentStatus.color} w-fit`}>
                      {currentStatus.label}
                    </span>
                                        <select
                                            value={order.status}
                                            onChange={(e) => handleStatusChange(order.id, e.target.value as Order["status"])}
                                            disabled={updatingId === order.id}
                                            className="w-full sm:w-auto px-3 py-2.5 rounded-lg border border-charcoal/15 bg-cream text-sm font-medium text-charcoal focus:outline-none focus:border-gold cursor-pointer disabled:opacity-50"
                                        >
                                            {STATUS_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                        </select>
                                    </div>
                                </div>

                                {/* Contact Info */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 text-sm">
                                    <div className="bg-cream/50 p-3 rounded-lg">
                                        <p className="text-xs text-muted mb-1">التليفون</p>
                                        <p className="text-sm font-medium text-charcoal" dir="ltr">{order.phone}</p>
                                    </div>
                                    <div className="bg-cream/50 p-3 rounded-lg">
                                        <p className="text-xs text-muted mb-1">المدينة</p>
                                        <p className="text-sm font-medium text-charcoal">{order.city}</p>
                                    </div>
                                    <div className="bg-cream/50 p-3 rounded-lg sm:col-span-2">
                                        <p className="text-xs text-muted mb-1">العنوان</p>
                                        <p className="text-sm font-medium text-charcoal">{order.address}</p>
                                    </div>
                                    {order.notes && (
                                        <div className="bg-gold/5 border border-gold/20 p-3 rounded-lg sm:col-span-2">
                                            <p className="text-xs text-gold-dark mb-1">ملاحظات</p>
                                            <p className="text-sm font-medium text-charcoal">{order.notes}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Items */}
                                <div className="space-y-3 mb-4 pt-4 border-t border-charcoal/10">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex gap-3 items-center">
                                            <div className="relative w-12 h-14 rounded-lg overflow-hidden bg-cream flex-shrink-0 border border-charcoal/5">
                                                <img src={item.image} alt={item.name} className="absolute inset-0 w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-charcoal truncate">{item.name}</p>
                                                <p className="text-xs text-muted mt-0.5">
                                                    المقاس: {item.size} | اللون: {item.color} | الكمية: {item.quantity}
                                                </p>
                                            </div>
                                            <p className="text-sm font-bold text-charcoal whitespace-nowrap">{item.price * item.quantity} ج.م</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Total */}
                                <div className="flex flex-col gap-2 pt-4 border-t border-charcoal/10 text-sm">
                                    <div className="flex justify-between text-muted"><span>الشحن</span><span>{order.shipping === 0 ? "مجاني" : `${order.shipping} ج.م`}</span></div>
                                    <div className="flex justify-between text-base font-bold text-charcoal bg-cream p-2 rounded-md"><span>الإجمالي</span><span>{order.total} ج.م</span></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}