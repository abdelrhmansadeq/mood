"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type OrderItem = {
    productId: number;
    name: string;
    size: string;
    color: string;
    quantity: number;
    price: number;
};

type Order = {
    id: number;
    order_number: string;
    full_name: string;
    phone: string;
    city: string;
    address: string;
    notes: string | null;
    subtotal: number;
    shipping: number;
    discount_amount: number;
    coupon_code: string | null;
    total: number;
    items: OrderItem[];
    status: string;
    created_at: string;
    user_email: string | null;
};

export default function AdminOrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) return;

                // ✅ بنجيب الطلب من الـ API بتاعنا بدل الداتابيز مباشرة
                const res = await fetch(`/api/admin/orders/${id}`, {
                    headers: { Authorization: `Bearer ${session.access_token}` },
                });

                const data = await res.json();
                if (res.ok && data.order) {
                    setOrder(data.order);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrder();
    }, [id]);

    const handlePrint = () => {
        window.print();
    };

    if (isLoading) return <div className="p-12 text-center text-muted">جاري التحميل...</div>;
    if (!order) return <div className="p-12 text-center text-error">الطلب غير موجود</div>;

    return (
        <div className="max-w-4xl mx-auto px-6 py-12">
            {/* أزرار التحكم (بتختفي وقت الطباعة) */}
            <div className="flex justify-between items-center mb-8 print:hidden">
                <Link href="/admin/dashboard/orders" className="text-sm text-muted hover:text-gold">
                    ← رجوع للطلبات
                </Link>
                <button onClick={handlePrint} className="bg-charcoal hover:bg-gold text-cream hover:text-charcoal px-4 py-2 rounded-md transition-colors text-sm flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                    طباعة الفاتورة
                </button>
            </div>

            {/* الفاتورة */}
            <div className="bg-white border border-charcoal/10 rounded-xl p-8 print:border-0 print:shadow-none print:p-0">
                <div className="flex justify-between items-start border-b border-charcoal/10 pb-6 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-charcoal mb-1">Mood</h1>
                        <p className="text-sm text-muted">متجر الأناقة</p>
                    </div>
                    <div className="text-left">
                        <p className="text-lg font-bold text-gold mb-1">{order.order_number}</p>
                        <p className="text-sm text-muted">{new Date(order.created_at).toLocaleDateString("ar-EG")}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                        <h3 className="text-sm font-bold text-charcoal mb-2">بيانات العميل</h3>
                        <p className="text-sm text-charcoal/80 leading-relaxed">
                            {order.full_name}<br />
                            {order.phone}<br />
                            {order.user_email && <span>{order.user_email}</span>}
                        </p>
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-charcoal mb-2">عنوان الشحن</h3>
                        <p className="text-sm text-charcoal/80 leading-relaxed">
                            {order.city}، {order.address}
                        </p>
                    </div>
                </div>

                {/* جدول المنتجات */}
                <table className="w-full text-sm mb-8">
                    <thead className="bg-charcoal/5 border-b border-charcoal/10 text-charcoal">
                    <tr>
                        <th className="text-right py-3 px-2">المنتج</th>
                        <th className="text-center py-3 px-2">المقاس/اللون</th>
                        <th className="text-center py-3 px-2">الكمية</th>
                        <th className="text-left py-3 px-2">السعر</th>
                    </tr>
                    </thead>
                    <tbody>
                    {order.items.map((item, idx) => (
                        <tr key={idx} className="border-b border-charcoal/5">
                            <td className="py-3 px-2 font-medium text-charcoal">{item.name}</td>
                            <td className="py-3 px-2 text-center text-muted">{item.size} / {item.color}</td>
                            <td className="py-3 px-2 text-center text-charcoal">{item.quantity}</td>
                            <td className="py-3 px-2 text-left font-semibold text-charcoal">{item.price * item.quantity} ج.م</td>
                        </tr>
                    ))}
                    </tbody>
                </table>

                {/* الإجماليات */}
                <div className="w-1/2 mr-auto space-y-2 text-sm border-t border-charcoal/10 pt-4">
                    <div className="flex justify-between text-muted"><span>المجموع الفرعي:</span><span>{order.subtotal} ج.م</span></div>
                    <div className="flex justify-between text-muted"><span>الشحن:</span><span>{order.shipping === 0 ? "مجاني" : `${order.shipping} ج.م`}</span></div>
                    {order.discount_amount > 0 && (
                        <div className="flex justify-between text-success font-medium"><span>الخصم ({order.coupon_code}):</span><span>-{order.discount_amount} ج.م</span></div>
                    )}
                    <div className="flex justify-between font-bold text-lg text-charcoal pt-2 border-t border-charcoal/10"><span>الإجمالي:</span><span>{order.total} ج.م</span></div>
                </div>

                {order.notes && (
                    <div className="mt-8 pt-4 border-t border-charcoal/10">
                        <h3 className="text-sm font-bold text-charcoal mb-1">ملاحظات العميل:</h3>
                        <p className="text-sm text-muted">{order.notes}</p>
                    </div>
                )}
            </div>
        </div>
    );
}