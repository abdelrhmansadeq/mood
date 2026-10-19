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
    meta_title: string | null;
    meta_description: string | null;
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
        metaTitle: row.meta_title || null,
        metaDescription: row.meta_description || null,
    };
}

// ✅ دالة مساعدة لتسجيل الحركة من الفرونت إند
async function logAction(action: string, entityId: string | number, details: string) {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        await fetch("/api/admin/audit-logs", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
                action,
                entityType: "product",
                entityId,
                details,
            }),
        });
    } catch (err) {
        console.error("Failed to log action:", err);
    }
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
            meta_title: product.metaTitle || null,
            meta_description: product.metaDescription || null,
        })
        .select()
        .single();

    if (error) {
        console.error("Error adding product:", error);
        throw error;
    }

    const newProduct = toProduct(data as SupabaseProduct);
    // ✅ تسجيل إضافة المنتج
    await logAction("إضافة منتج جديد", newProduct.id, `تم إضافة المنتج "${newProduct.name}"`);

    return newProduct;
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

    const updatedProduct = toProduct(data as SupabaseProduct);
    // ✅ تسجيل تعديل المنتج
    await logAction("تعديل منتج", updatedProduct.id, `تم تعديل بيانات المنتج "${updatedProduct.name}"`);

    return updatedProduct;
}

export async function deleteProductFromDB(id: number): Promise<void> {
    // بنجيب اسم المنتج الأول عشان نكتبه في السجل
    const { data: product } = await supabase.from("products").select("name").eq("id", id).single();

    const { error } = await supabase
        .from("products")
        .update({ is_deleted: true })
        .eq("id", id);

    if (error) {
        console.error("Error deleting product:", error);
        throw error;
    }

    // ✅ تسجيل حذف المنتج
    await logAction("حذف منتج", id, `تم حذف المنتج "${product?.name || "غير معروف"}"`);
}