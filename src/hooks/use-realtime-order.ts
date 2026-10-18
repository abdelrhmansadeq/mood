"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Order, OrderItem } from "@/lib/orders-api";

// ✅ 1. تحديث الـ Type عشان يشمل الحقول الجديدة
type SupabaseOrder = {
    id: number;
    user_id: string;
    user_email: string | null;
    order_number: string;
    full_name: string;
    phone: string;
    city: string;
    address: string;
    notes: string | null;
    subtotal: number;
    shipping: number;
    discount_amount: number | null; // ✅ جديد
    coupon_code: string | null;     // ✅ جديد
    total: number;
    items: OrderItem[];
    status: Order["status"];
    created_at: string;
};

// ✅ 2. تحديث دالة التحويل عشان تمرر الحقول الجديدة
function toOrder(row: SupabaseOrder): Order {
    return {
        id: row.id,
        orderNumber: row.order_number,
        fullName: row.full_name,
        phone: row.phone,
        city: row.city,
        address: row.address,
        notes: row.notes,
        subtotal: row.subtotal,
        shipping: row.shipping,
        discountAmount: row.discount_amount || 0, // ✅ جديد
        couponCode: row.coupon_code || null,     // ✅ جديد
        total: row.total,
        items: row.items,
        status: row.status,
        createdAt: row.created_at,
        userEmail: row.user_email,
    };
}

export function useRealtimeOrder(orderId: number | null): Order | null {
    const [realtimeOrder, setRealtimeOrder] = useState<Order | null>(null);

    useEffect(() => {
        if (!orderId) return;

        const channel = supabase
            .channel(`order-${orderId}`)
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "orders",
                    filter: `id=eq.${orderId}`,
                },
                (payload) => {
                    const newRow = payload.new as SupabaseOrder;
                    setRealtimeOrder(toOrder(newRow));
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [orderId]);

    return realtimeOrder;
}