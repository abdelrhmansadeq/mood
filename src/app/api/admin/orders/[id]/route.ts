import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendEmail, buildOrderStatusEmail } from "@/lib/email";

type Props = {
    params: Promise<{ id: string }>;
};

const VALID_STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"] as const;
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

        const authHeader = request.headers.get("authorization");
        const token = authHeader?.replace("Bearer ", "");

        if (!token) return NextResponse.json({ error: "لازم تسجل دخول الأول" }, { status: 401 });

        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
        if (authError || !user) return NextResponse.json({ error: "لازم تسجل دخول الأول" }, { status: 401 });

        const { data: adminCheck } = await supabaseAdmin.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
        if (!adminCheck) return NextResponse.json({ error: "مش مسموحلك بالعملية دي" }, { status: 403 });

        if (!status || !VALID_STATUSES.includes(status)) {
            return NextResponse.json({ error: "حالة غير صحيحة" }, { status: 400 });
        }

        const { data: currentOrder, error: fetchError } = await supabaseAdmin
            .from("orders")
            .select("id, status, items, user_email, full_name, order_number")
            .eq("id", Number(id))
            .single();

        if (fetchError || !currentOrder) return NextResponse.json({ error: "الطلب مش موجود" }, { status: 404 });

        const oldStatus = currentOrder.status as OrderStatus;

        if (oldStatus === status) return NextResponse.json({ success: true });

        const items = currentOrder.items as OrderItem[];

        // ✅ تحسين الأداء: نجيب المنتجات مرة واحدة لو هنلمس المخزون
        if (status === "cancelled" || oldStatus === "cancelled") {
            const productIds = items.map((i) => i.productId);
            const { data: dbProducts } = await supabaseAdmin.from("products").select("id, colors").in("id", productIds);
            const productMap = new Map(dbProducts?.map((p) => [p.id, p]) || []);

            for (const item of items) {
                const product = productMap.get(item.productId);
                const hasColors = product?.colors && Array.isArray(product.colors) && product.colors.length > 0;

                if (status === "cancelled" && oldStatus !== "cancelled") {
                    // إرجاع المخزون
                    if (hasColors) {
                        await supabaseAdmin.rpc("increase_product_color_stock", { p_product_id: item.productId, p_color_name: item.color, p_size: item.size, p_quantity: item.quantity });
                    } else {
                        await supabaseAdmin.rpc("increase_product_size_stock", { p_product_id: item.productId, p_size: item.size, p_quantity: item.quantity });
                    }
                } else if (oldStatus === "cancelled" && status !== "cancelled") {
                    // خصم المخزون تاني
                    if (hasColors) {
                        await supabaseAdmin.rpc("decrease_product_color_stock", { p_product_id: item.productId, p_color_name: item.color, p_size: item.size, p_quantity: item.quantity });
                    } else {
                        await supabaseAdmin.rpc("decrease_product_size_stock", { p_product_id: item.productId, p_size: item.size, p_quantity: item.quantity });
                    }
                }
            }
        }

        // تحديث حالة الطلب
        const { error: updateError } = await supabaseAdmin.from("orders").update({ status }).eq("id", Number(id));

        if (updateError) {
            console.error("Update error:", updateError);
            return NextResponse.json({ error: "فشل تحديث الطلب" }, { status: 500 });
        }

        // ✅ إرسال الإيميل بدون تعطيل الرد
        if (currentOrder.user_email) {
            sendEmail({
                to: currentOrder.user_email,
                toName: currentOrder.full_name,
                subject: `تحديث على طلبك ${currentOrder.order_number} - Mood`,
                htmlContent: buildOrderStatusEmail({
                    orderNumber: currentOrder.order_number,
                    customerName: currentOrder.full_name,
                    status,
                }),
            }).catch((emailError) => console.error("Status email failed:", emailError));
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("API error:", error);
        return NextResponse.json({ error: "حصلت مشكلة في السيرفر" }, { status: 500 });
    }
}