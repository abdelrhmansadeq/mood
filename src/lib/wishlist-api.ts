import { supabase } from "./supabase";

// ✅ جلب مفضلة المستخدم
export async function fetchUserWishlist(userId: string): Promise<number[]> {
    const { data, error } = await supabase
        .from("wishlists")
        .select("product_id")
        .eq("user_id", userId);

    if (error) {
        console.error("Error fetching wishlist:", error);
        return [];
    }

    return data.map((item) => item.product_id);
}

// ✅ إضافة منتج للمفضلة
export async function addToWishlist(userId: string, productId: number): Promise<boolean> {
    const { error } = await supabase
        .from("wishlists")
        .insert({ user_id: userId, product_id: productId });

    if (error) {
        // لو الخطأ بسبب إن المنتج موجود بالفعل (Unique constraint)
        if (error.code === "23505") return true;
        console.error("Error adding to wishlist:", error);
        return false;
    }

    return true;
}

// ✅ إزالة منتج من المفضلة
export async function removeFromWishlist(userId: string, productId: number): Promise<boolean> {
    const { error } = await supabase
        .from("wishlists")
        .delete()
        .eq("user_id", userId)
        .eq("product_id", productId);

    if (error) {
        console.error("Error removing from wishlist:", error);
        return false;
    }

    return true;
}