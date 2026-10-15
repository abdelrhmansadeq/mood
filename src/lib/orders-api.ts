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
    subtotal: number;
    shipping: number;
    total: number;
    items: OrderItem[];
}): Promise<Order> {
    const orderNumber = "MOOD-" + Math.floor(100000 + Math.random() * 900000);

    const { data, error } = await supabase
        .from("orders")
        .insert({
            user_id: params.userId,
            order_number: orderNumber,
            full_name: params.fullName,
            phone: params.phone,
            city: params.city,
            address: params.address,
            notes: params.notes || null,
            subtotal: params.subtotal,
            shipping: params.shipping,
            total: params.total,
            items: params.items,
        })
        .select()
        .single();

    if (error) {
        console.error("Error creating order:", error);
        throw error;
    }

    return toOrder(data as SupabaseOrder);
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

export async function updateOrderStatus(
    orderId: number,
    status: Order["status"]
): Promise<void> {
    const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", orderId);

    if (error) {
        console.error("Error updating order status:", error);
        throw error;
    }
}