import { supabase } from "./supabase";

export type OrderItem = {
    productId: number;
    name: string;
    nameEn: string;
    price: number;
    image: string;
    size: string;
    color: string;
    quantity: number;
};

export type Order = {
    id: number;
    orderNumber: string;
    fullName: string;
    phone: string;
    city: string;
    address: string;
    notes: string | null;
    subtotal: number;
    shipping: number;
    discountAmount: number; // ✅ جديد
    couponCode: string | null; // ✅ جديد
    total: number;
    items: OrderItem[];
    status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
    createdAt: string;
    userEmail: string | null;
};

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
    discount_amount: number | null;
    coupon_code: string | null;
    total: number;
    items: OrderItem[];
    status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
    created_at: string;
};

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
        discountAmount: row.discount_amount || 0,
        couponCode: row.coupon_code || null,
        total: row.total,
        items: row.items,
        status: row.status,
        createdAt: row.created_at,
        userEmail: row.user_email,
    };
}

export async function createOrder(params: {
    fullName: string;
    phone: string;
    city: string;
    address: string;
    notes: string;
    items: OrderItem[];
    couponCode?: string | null;
    discountAmount?: number;
}): Promise<{ order?: Order; error?: string }> {
    try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            return { error: "لازم تسجل دخول الأول" };
        }

        const res = await fetch("/api/orders/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify(params),
        });

        const data = await res.json();

        if (!res.ok) {
            return { error: data.error || "حصلت مشكلة" };
        }

        return {
            order: {
                id: data.order.id,
                orderNumber: data.order.order_number,
                fullName: data.order.full_name,
                phone: data.order.phone,
                city: data.order.city,
                address: data.order.address,
                notes: data.order.notes,
                subtotal: data.order.subtotal,
                shipping: data.order.shipping,
                discountAmount: data.order.discount_amount || 0,
                couponCode: data.order.coupon_code || null,
                total: data.order.total,
                items: data.order.items,
                status: data.order.status,
                createdAt: data.order.created_at,
                userEmail: data.order.user_email,
            },
        };
    } catch (e) {
        console.error("createOrder error:", e);
        return { error: "حصلت مشكلة في الاتصال" };
    }
}

export async function fetchUserOrders(userId: string): Promise<Order[]> {
    const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching orders:", error);
        throw error;
    }

    return (data as SupabaseOrder[]).map(toOrder);
}

export async function fetchOrderById(orderId: number): Promise<Order | null> {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) return null;

    const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .eq("user_id", session.user.id)
        .maybeSingle();

    if (error) {
        console.error("Error fetching order:", error);
        return null;
    }

    if (!data) return null;

    return toOrder(data as SupabaseOrder);
}

export async function fetchAllOrders(): Promise<Order[]> {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        throw new Error("لازم تسجل دخول الأول");
    }

    const res = await fetch("/api/admin/orders", {
        headers: {
            Authorization: `Bearer ${session.access_token}`,
        },
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error || "فشل تحميل الطلبات");
    }

    return (data.orders as SupabaseOrder[]).map(toOrder);
}

export async function updateOrderStatus(
    orderId: number,
    status: Order["status"]
): Promise<{ error?: string }> {
    try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) return { error: "لازم تسجل دخول الأول" };

        const res = await fetch(`/api/admin/orders/${orderId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ status }),
        });

        const data = await res.json();

        if (!res.ok) return { error: data.error || "حصلت مشكلة" };

        return {};
    } catch (e) {
        console.error("updateOrderStatus error:", e);
        return { error: "حصلت مشكلة في الاتصال" };
    }
}

export async function cancelOrder(orderId: number): Promise<{ error?: string }> {
    try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) return { error: "لازم تسجل دخول الأول" };

        const res = await fetch(`/api/orders/${orderId}/cancel`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${session.access_token}`,
            },
        });

        const data = await res.json();

        if (!res.ok) return { error: data.error || "حصلت مشكلة" };

        return {};
    } catch (e) {
        console.error("cancelOrder error:", e);
        return { error: "حصلت مشكلة في الاتصال" };
    }
}