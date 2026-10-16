import { supabase } from "./supabase";

export type Address = {
    id: number;
    userId: string;
    fullName: string;
    phone: string;
    city: string;
    address: string;
    updatedAt: string;
};

type SupabaseAddress = {
    id: number;
    user_id: string;
    full_name: string | null;
    phone: string | null;
    city: string | null;
    address: string | null;
    updated_at: string;
};

function toAddress(row: SupabaseAddress): Address {
    return {
        id: row.id,
        userId: row.user_id,
        fullName: row.full_name || "",
        phone: row.phone || "",
        city: row.city || "",
        address: row.address || "",
        updatedAt: row.updated_at,
    };
}

export async function fetchUserAddress(
    userId: string
): Promise<Address | null> {
    const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

    if (error) {
        console.error("Error fetching address:", error);
        return null;
    }

    return data ? toAddress(data as SupabaseAddress) : null;
}

export async function saveUserAddress(params: {
    userId: string;
    fullName: string;
    phone: string;
    city: string;
    address: string;
}): Promise<{ error?: string }> {
    try {
        // نتحقق: هل عنده عنوان محفوظ؟
        const existing = await fetchUserAddress(params.userId);

        if (existing) {
            // update
            const { error } = await supabase
                .from("addresses")
                .update({
                    full_name: params.fullName,
                    phone: params.phone,
                    city: params.city,
                    address: params.address,
                    updated_at: new Date().toISOString(),
                })
                .eq("user_id", params.userId);

            if (error) {
                console.error("Error updating address:", error);
                return { error: "فشل حفظ العنوان" };
            }
        } else {
            // insert
            const { error } = await supabase.from("addresses").insert({
                user_id: params.userId,
                full_name: params.fullName,
                phone: params.phone,
                city: params.city,
                address: params.address,
            });

            if (error) {
                console.error("Error inserting address:", error);
                return { error: "فشل حفظ العنوان" };
            }
        }

        return {};
    } catch (e) {
        console.error("saveUserAddress error:", e);
        return { error: "حصلت مشكلة في الاتصال" };
    }
}