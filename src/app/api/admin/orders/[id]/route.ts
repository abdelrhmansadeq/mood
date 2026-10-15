import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

type Props = {
    params: Promise<{ id: string }>;
};

const VALID_STATUSES = [
    "pending",
    "confirmed",
    "shipped",
    "delivered",
    "cancelled",
] as const;

type OrderStatus = (typeof VALID_STATUSES)[number];

type OrderItem = {
    productId: number;
    name: string;
    size: string;
    color: string;
    quantity: number;
};

export async function PATCH(request: Request, { params }: Props) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { status } = body as { status: OrderStatus };

        // ✅ التحقق من الـ token
        const authHeader = request.headers.get("authorization");
        const token = authHeader?.replace("Bearer ", "");

        if (!token) {
            return NextResponse.json(
                { error: "لازم تسجل دخول الأول" },
                { status: 401 }
            );
        }

        // التحقق من المستخدم
        const {
            data: { user },
            error: authError,
        } = await supabaseAdmin.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json(
                { error: "لازم تسجل دخول الأول" },
                { status: 401 }
            );
        }

        // ✅ التحقق من إن المستخدم أدمن
        const { data: adminCheck } = await supabaseAdmin
            .from("admins")
            .select("user_id")
            .eq("user_id", user.id)
            .maybeSingle();

        if (!adminCheck) {
            return NextResponse.json(
                { error: "مش مسموحلك بالعملية دي" },
                { status: 403 }
            );
        }

        // التحقق من الحالة
        if (!status || !VALID_STATUSES.includes(status)) {
            return NextResponse.json(
                { error: "حالة غير صحيحة" },
                { status: 400 }
            );
        }

        // ناخد الطلب الحالي
        const { data: currentOrder, error: fetchError } = await supabaseAdmin
            .from("orders")
            .select("id, status, items")
            .eq("id", Number(id))
            .single();

        if (fetchError || !currentOrder) {
            return NextResponse.json(
                { error: "الطلب مش موجود" },
                { status: 404 }
            );
        }

        const oldStatus = currentOrder.status as OrderStatus;

        // ✅ لو الطلب بيتلغى (ومكنش ملغي قبل كده) → نرجّع المخزون
        if (status === "cancelled" && oldStatus !== "cancelled") {
            const items = currentOrder.items as OrderItem[];

            // نرجع المخزون لكل منتج
            for (const item of items) {
                // نجيب المنتج عشان نعرف لو له ألوان
                const { data: product } = await supabaseAdmin
                    .from("products")
                    .select("colors")
                    .eq("id", item.productId)
                    .single();

                const hasColors =
                    product?.colors && Array.isArray(product.colors) && product.colors.length > 0;

                if (hasColors) {
                    await supabaseAdmin.rpc("increase_product_color_stock", {
                        p_product_id: item.productId,
                        p_color_name: item.color,
                        p_size: item.size,
                        p_quantity: item.quantity,
                    });
                } else {
                    await supabaseAdmin.rpc("increase_product_size_stock", {
                        p_product_id: item.productId,
                        p_size: item.size,
                        p_quantity: item.quantity,
                    });
                }
            }
        }

        // ✅ لو الطلب رجع من "cancelled" لحالة تانية → نخصم المخزون تاني
        if (oldStatus === "cancelled" && status !== "cancelled") {
            const items = currentOrder.items as OrderItem[];

            for (const item of items) {
                const { data: product } = await supabaseAdmin
                    .from("products")
                    .select("colors")
                    .eq("id", item.productId)
                    .single();

                const hasColors =
                    product?.colors && Array.isArray(product.colors) && product.colors.length > 0;

                if (hasColors) {
                    await supabaseAdmin.rpc("decrease_product_color_stock", {
                        p_product_id: item.productId,
                        p_color_name: item.color,
                        p_size: item.size,
                        p_quantity: item.quantity,
                    });
                } else {
                    await supabaseAdmin.rpc("decrease_product_size_stock", {
                        p_product_id: item.productId,
                        p_size: item.size,
                        p_quantity: item.quantity,
                    });
                }
            }
        }

        // نحدّث حالة الطلب
        const { error: updateError } = await supabaseAdmin
            .from("orders")
            .update({ status })
            .eq("id", Number(id));

        if (updateError) {
            console.error("Update error:", updateError);
            return NextResponse.json(
                { error: "فشل تحديث الطلب" },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("API error:", error);
        return NextResponse.json(
            { error: "حصلت مشكلة في السيرفر" },
            { status: 500 }
        );
    }
}