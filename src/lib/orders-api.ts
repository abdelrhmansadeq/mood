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
    total: number;
    items: OrderItem[];
    status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
    createdAt: string;
};

type SupabaseOrder = {
    id: number;
    user_id: string;
    order_number: string;
    full_name: string;
    phone: string;
    city: string;
    address: string;
    notes: string | null;
    subtotal: number;
    shipping: number;
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
        total: row.total,
        items: row.items,
        status: row.status,
        createdAt: row.created_at,
    };
}

export async function createOrder(params: {
    userId: string;
    fullName: string;
    phone: string;
    city: string;
    address: string;
    notes: string;
    items: OrderItem[];
}): Promise<{ order?: Order; error?: string }> {
    try {
        const res = await fetch("/api/orders/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
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
                total: data.order.total,
                items: data.order.items,
                status: data.order.status,
                createdAt: data.order.created_at,
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
    const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

    if (error) {
        console.error("Error fetching order:", error);
        return null;
    }

    return toOrder(data as SupabaseOrder);
}

export async function fetchAllOrders(): Promise<Order[]> {
    const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching all orders:", error);
        throw error;
    }

    return (data as SupabaseOrder[]).map(toOrder);
}