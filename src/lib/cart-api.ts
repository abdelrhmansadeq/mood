import { supabase } from "./supabase";

export type DbCartItem = {
    productId: number;
    name: string;
    price: number;
    image: string;
    size: string;
    color: string;
    quantity: number;
};

// ✅ جلب السلة من الداتابيز
export async function fetchCartFromDB(userId: string): Promise<DbCartItem[]> {
    try {
        const { data, error } = await supabase
            .from("carts")
            .select("items")
            .eq("user_id", userId)
            .maybeSingle();

        if (error || !data) return [];
        return (data.items as DbCartItem[]) || [];
    } catch (err) {
        console.error("Error fetching cart:", err);
        return [];
    }
}

// ✅ مزامنة السلة مع الداتابيز
export async function syncCartWithDB(
    userId: string,
    email: string,
    items: DbCartItem[],
    total: number
): Promise<void> {
    try {
        const { error } = await supabase
            .from("carts")
            .upsert(
                {
                    user_id: userId,
                    email: email,
                    items: items,
                    total: total,
                    updated_at: new Date().toISOString(),
                    email_sent: false, // تصفير الإيميل عشان لو رجع يضيف حاجة تاني
                },
                { onConflict: "user_id" }
            );

        if (error) console.error("Error syncing cart:", error);
    } catch (err) {
        console.error("Unexpected cart sync error:", err);
    }
}

// ✅ مسح السلة من الداتابيز (لما يشتري)
export async function clearCartFromDB(userId: string): Promise<void> {
    try {
        const { error } = await supabase
            .from("carts")
            .delete()
            .eq("user_id", userId);

        if (error) console.error("Error clearing cart:", error);
    } catch (err) {
        console.error("Unexpected clear cart error:", err);
    }
}