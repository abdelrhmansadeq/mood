import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

type OrderItem = {
    productId: number;
    name: string;
    nameEn: string;
    price: number;
    image: string;
    size: string;
    color: string;
    quantity: number;
};

type RequestBody = {
    fullName: string;
    phone: string;
    city: string;
    address: string;
    notes: string;
    items: OrderItem[];
};

type SupabaseProduct = {
    id: number;
    name: string;
    price: number;
    sale_price: number | null;
    stock: number;
    sizes: Record<string, number>;
    colors: Array<{
        name: string;
        hex: string;
        image: string;
        sizes: Record<string, number>;
    }>;
};

export async function POST(request: Request) {
    try {
        const body: RequestBody = await request.json();
        const { fullName, phone, city, address, notes, items } = body;

        const authHeader = request.headers.get("authorization");
        const token = authHeader?.replace("Bearer ", "");

        if (!token) {
            return NextResponse.json(
                { error: "لازم تسجل دخول الأول" },
                { status: 401 }
            );
        }

        const {
            data: { user: authUser },
            error: authError,
        } = await supabaseAdmin.auth.getUser(token);

        if (authError || !authUser) {
            return NextResponse.json(
                { error: "لازم تسجل دخول الأول" },
                { status: 401 }
            );
        }

        if (!items || items.length === 0) {
            return NextResponse.json(
                { error: "بيانات ناقصة" },
                { status: 400 }
            );
        }

        const userId = authUser.id;
        const userEmail = authUser.email || "";

        // 1) نجيب المنتجات من الداتابيز
        const productIds = items.map((i) => i.productId);
        const { data: dbProducts, error: fetchError } = await supabaseAdmin
            .from("products")
            .select("id, name, price, sale_price, stock, sizes, colors")
            .in("id", productIds);

        if (fetchError || !dbProducts) {
            return NextResponse.json(
                { error: "فشل التحقق من المنتجات" },
                { status: 500 }
            );
        }

        // 2) تحقق من المخزون
        for (const item of items) {
            const product = dbProducts.find(
                (p: SupabaseProduct) => p.id === item.productId
            ) as SupabaseProduct | undefined;

            if (!product) {
                return NextResponse.json(
                    { error: `المنتج "${item.name}" مش موجود` },
                    { status: 400 }
                );
            }

            const hasColors = product.colors && product.colors.length > 0;

            if (hasColors) {
                const color = product.colors.find((c) => c.name === item.color);
                if (!color) {
                    return NextResponse.json(
                        { error: `اللون "${item.color}" غير متوفر في "${product.name}"` },
                        { status: 400 }
                    );
                }
                const sizeStock = color.sizes?.[item.size] || 0;
                if (sizeStock < item.quantity) {
                    return NextResponse.json(
                        {
                            error: `"${product.name}" - ${item.color} مقاس ${item.size}: متاح ${sizeStock} قطعة بس`,
                        },
                        { status: 400 }
                    );
                }
            } else {
                const sizeStock = product.sizes?.[item.size] || 0;
                if (sizeStock < item.quantity) {
                    return NextResponse.json(
                        {
                            error: `"${product.name}" مقاس ${item.size}: متاح ${sizeStock} قطعة بس`,
                        },
                        { status: 400 }
                    );
                }
            }
        }

        // 3) نحسب الإجماليات بالسعر الفعلي (sale_price لو موجود)
        const enrichedItems = items.map((item) => {
            const product = dbProducts.find(
                (p: SupabaseProduct) => p.id === item.productId
            )!;
            const effectivePrice =
                product.sale_price != null && product.sale_price < product.price
                    ? product.sale_price
                    : product.price;
            return { ...item, price: effectivePrice };
        });

        const subtotal = enrichedItems.reduce(
            (sum, i) => sum + i.price * i.quantity,
            0
        );
        const shipping = subtotal >= 500 ? 0 : 50;
        const total = subtotal + shipping;

        // 4) نخصم المخزون + نتتبع
        const deductedItems: Array<{
            productId: number;
            color: string;
            size: string;
            quantity: number;
            hasColors: boolean;
        }> = [];

        for (const item of enrichedItems) {
            const product = dbProducts.find(
                (p: SupabaseProduct) => p.id === item.productId
            ) as SupabaseProduct;
            const hasColors = product.colors && product.colors.length > 0;

            let success = false;
            let rpcError: unknown = null;

            if (hasColors) {
                const result = await supabaseAdmin.rpc("decrease_product_color_stock", {
                    p_product_id: item.productId,
                    p_color_name: item.color,
                    p_size: item.size,
                    p_quantity: item.quantity,
                });
                success = result.data as boolean;
                rpcError = result.error;
            } else {
                const result = await supabaseAdmin.rpc("decrease_product_size_stock", {
                    p_product_id: item.productId,
                    p_size: item.size,
                    p_quantity: item.quantity,
                });
                success = result.data as boolean;
                rpcError = result.error;
            }

            if (rpcError || !success) {
                for (const deducted of deductedItems) {
                    if (deducted.hasColors) {
                        await supabaseAdmin.rpc("increase_product_color_stock", {
                            p_product_id: deducted.productId,
                            p_color_name: deducted.color,
                            p_size: deducted.size,
                            p_quantity: deducted.quantity,
                        });
                    } else {
                        await supabaseAdmin.rpc("increase_product_size_stock", {
                            p_product_id: deducted.productId,
                            p_size: deducted.size,
                            p_quantity: deducted.quantity,
                        });
                    }
                }

                return NextResponse.json(
                    { error: `المنتج "${item.name}" خلص من المخزون` },
                    { status: 400 }
                );
            }

            deductedItems.push({
                productId: item.productId,
                color: item.color,
                size: item.size,
                quantity: item.quantity,
                hasColors,
            });
        }

        // 5) نعمل الطلب
        const orderNumber = "MOOD-" + Math.floor(100000 + Math.random() * 900000);

        const { data: order, error: orderError } = await supabaseAdmin
            .from("orders")
            .insert({
                user_id: userId,
                user_email: userEmail,
                order_number: orderNumber,
                full_name: fullName,
                phone,
                city,
                address,
                notes: notes || null,
                subtotal,
                shipping,
                total,
                items: enrichedItems,
            })
            .select()
            .single();

        if (orderError) {
            console.error("Order error:", orderError);
            for (const deducted of deductedItems) {
                if (deducted.hasColors) {
                    await supabaseAdmin.rpc("increase_product_color_stock", {
                        p_product_id: deducted.productId,
                        p_color_name: deducted.color,
                        p_size: deducted.size,
                        p_quantity: deducted.quantity,
                    });
                } else {
                    await supabaseAdmin.rpc("increase_product_size_stock", {
                        p_product_id: deducted.productId,
                        p_size: deducted.size,
                        p_quantity: deducted.quantity,
                    });
                }
            }
            return NextResponse.json(
                { error: "فشل إنشاء الطلب" },
                { status: 500 }
            );
        }

        // 6) نزود عدّاد المبيعات
        for (const item of enrichedItems) {
            await supabaseAdmin.rpc("increment_sold_count", {
                p_product_id: item.productId,
                p_quantity: item.quantity,
            });
        }

        return NextResponse.json({ order });
    } catch (error) {
        console.error("API error:", error);
        return NextResponse.json(
            { error: "حصلت مشكلة في السيرفر" },
            { status: 500 }
        );
    }
}