import { supabase } from "./supabase";
import type { Product } from "@/data/products";

type SupabaseProduct = {
    id: number;
    name: string;
    name_en: string;
    price: number;
    image: string;
    category: "men" | "women" | "kids";
    description: string;
    is_featured: boolean;
    created_at: string;
};

function toProduct(row: SupabaseProduct): Product {
    return {
        id: row.id,
        name: row.name,
        nameEn: row.name_en,
        price: row.price,
        image: row.image,
        category: row.category,
        description: row.description,
        isFeatured: row.is_featured,
    };
}

export async function fetchProducts(): Promise<Product[]> {
    const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("id", { ascending: true });

    if (error) {
        console.error("Error fetching products:", error);
        throw error;
    }

    return (data as SupabaseProduct[]).map(toProduct);
}

export async function addProductToDB(
    product: Omit<Product, "id">
): Promise<Product> {
    const { data, error } = await supabase
        .from("products")
        .insert({
            name: product.name,
            name_en: product.nameEn,
            price: product.price,
            image: product.image,
            category: product.category,
            description: product.description,
            is_featured: product.isFeatured || false,
        })
        .select()
        .single();

    if (error) {
        console.error("Error adding product:", error);
        throw error;
    }

    return toProduct(data as SupabaseProduct);
}

export async function updateProductInDB(
    id: number,
    updates: Partial<Product>
): Promise<Product> {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.nameEn !== undefined) dbUpdates.name_en = updates.nameEn;
    if (updates.price !== undefined) dbUpdates.price = updates.price;
    if (updates.image !== undefined) dbUpdates.image = updates.image;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.description !== undefined)
        dbUpdates.description = updates.description;
    if (updates.isFeatured !== undefined) dbUpdates.is_featured = updates.isFeatured;

    const { data, error } = await supabase
        .from("products")
        .update(dbUpdates)
        .eq("id", id)
        .select()
        .single();

    if (error) {
        console.error("Error updating product:", error);
        throw error;
    }

    return toProduct(data as SupabaseProduct);
}

export async function deleteProductFromDB(id: number): Promise<void> {
    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
        console.error("Error deleting product:", error);
        throw error;
    }
}

export async function resetProductsInDB(): Promise<void> {
    // نحذف كل المنتجات
    const { error: deleteError } = await supabase
        .from("products")
        .delete()
        .neq("id", 0);
    if (deleteError) throw deleteError;

    // نرجع الـ seed products من data/products.ts
    const { products: seedProducts } = await import("@/data/products");

    const rows = seedProducts.map((p) => ({
        name: p.name,
        name_en: p.nameEn,
        price: p.price,
        image: p.image,
        category: p.category,
        description: p.description,
        is_featured: p.isFeatured || false,
    }));

    const { error: insertError } = await supabase.from("products").insert(rows);
    if (insertError) throw insertError;
}