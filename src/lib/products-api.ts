import { supabase } from "./supabase";
import type { Product, ProductSizes, ProductColorVariant } from "@/data/products";

type SupabaseProduct = {
    id: number;
    name: string;
    name_en: string;
    price: number;
    sale_price: number | null;
    image: string;
    images: string[] | null;
    category: "men" | "women" | "kids" | "shoes" | "accessories";
    description: string;
    is_featured: boolean;
    stock: number;
    sizes: ProductSizes;
    colors: ProductColorVariant[];
    avg_rating: number | null;
    reviews_count: number | null;
    sold_count: number | null;
    meta_title: string | null;       // ✅ جديد
    meta_description: string | null; // ✅ جديد
    is_deleted: boolean | null;
    created_at: string;
};

const defaultSizes: ProductSizes = { S: 0, M: 0, L: 0, XL: 0, XXL: 0 };

function toProduct(row: SupabaseProduct): Product {
    return {
        id: row.id,
        name: row.name,
        nameEn: row.name_en,
        price: row.price,
        salePrice: row.sale_price,
        image: row.image,
        images: row.images || [],
        category: row.category,
        description: row.description,
        isFeatured: row.is_featured,
        stock: row.stock,
        sizes: row.sizes || defaultSizes,
        colors: row.colors || [],
        avgRating: row.avg_rating ? Number(row.avg_rating) : 0,
        reviewsCount: row.reviews_count || 0,
        soldCount: row.sold_count || 0,
        metaTitle: row.meta_title || null,       // ✅ جديد
        metaDescription: row.meta_description || null, // ✅ جديد
    };
}

function calculateTotalStock(sizes: ProductSizes, colors: ProductColorVariant[]): number {
    if (colors && colors.length > 0) {
        return colors.reduce((total, color) => {
            return total + Object.values(color.sizes || defaultSizes).reduce((a, b) => a + b, 0);
        }, 0);
    }
    return Object.values(sizes || defaultSizes).reduce((a, b) => a + b, 0);
}

export async function fetchProducts(): Promise<Product[]> {
    const { data, error } = await supabase
        .from("products")
        .select("*")
        .neq("is_deleted", true)
        .order("id", { ascending: true });

    if (error) {
        console.error("Error fetching products:", error);
        throw error;
    }

    return (data as SupabaseProduct[]).map(toProduct);
}

export async function addProductToDB(product: Omit<Product, "id">): Promise<Product> {
    const sizes = product.sizes || defaultSizes;
    const colors = product.colors || [];
    const totalStock = calculateTotalStock(sizes, colors);

    const { data, error } = await supabase
        .from("products")
        .insert({
            name: product.name,
            name_en: product.nameEn,
            price: product.price,
            sale_price: product.salePrice ?? null,
            image: product.image,
            images: product.images || [],
            category: product.category,
            description: product.description,
            is_featured: product.isFeatured || false,
            stock: totalStock,
            sizes,
            colors,
            is_deleted: false,
            meta_title: product.metaTitle || null,       // ✅ جديد
            meta_description: product.metaDescription || null, // ✅ جديد
        })
        .select()
        .single();

    if (error) {
        console.error("Error adding product:", error);
        throw error;
    }

    return toProduct(data as SupabaseProduct);
}

export async function updateProductInDB(id: number, updates: Partial<Product>): Promise<Product> {
    const dbUpdates: Record<string, unknown> = {};

    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.nameEn !== undefined) dbUpdates.name_en = updates.nameEn;
    if (updates.price !== undefined) dbUpdates.price = updates.price;
    if (updates.salePrice !== undefined) dbUpdates.sale_price = updates.salePrice;
    if (updates.image !== undefined) dbUpdates.image = updates.image;
    if (updates.images !== undefined) dbUpdates.images = updates.images;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.isFeatured !== undefined) dbUpdates.is_featured = updates.isFeatured;

    // ✅ الحقول الجديدة
    if (updates.metaTitle !== undefined) dbUpdates.meta_title = updates.metaTitle;
    if (updates.metaDescription !== undefined) dbUpdates.meta_description = updates.metaDescription;

    if (updates.sizes !== undefined) dbUpdates.sizes = updates.sizes;
    if (updates.colors !== undefined) dbUpdates.colors = updates.colors;

    if (updates.sizes !== undefined || updates.colors !== undefined) {
        const sizes = updates.sizes ?? defaultSizes;
        const colors = updates.colors ?? [];
        dbUpdates.stock = calculateTotalStock(sizes, colors);
    }

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
    const { error } = await supabase
        .from("products")
        .update({ is_deleted: true })
        .eq("id", id);

    if (error) {
        console.error("Error deleting product:", error);
        throw error;
    }
}