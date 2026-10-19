import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendEmail, buildOrderStatusEmail } from "@/lib/email";

type Props = { params: Promise<{ id: string }> };

// ✅ دالة جلب طلب واحد (عشان الفاتورة)
export async function GET(request: Request, { params }: Props) {
    try {
        const { id } = await params;
        const authHeader = request.headers.get("authorization");
        const token = authHeader?.replace("Bearer ", "");

        if (!token) return NextResponse.json({ error: "لازم تسجل دخول" }, { status: 401 });
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
        if (authError || !user) return NextResponse.json({ error: "توكن غير صالح" }, { status: 401 });

        const { data: adminCheck } = await supabaseAdmin.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
        if (!adminCheck) return NextResponse.json({ error: "مش مسموحلك" }, { status: 403 });

        const { data: order, error } = await supabaseAdmin.from("orders").select("*").eq("id", Number(id)).single();
        if (error || !order) return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });

        return NextResponse.json({ order });
    } catch (error) {
        return NextResponse.json({ error: "حصلت مشكلة في السيرفر" }, { status: 500 });
    }
}

const VALID_STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"] as const;
type OrderStatus = (typeof VALID_STATUSES)[number];

// ✅ دالة تعديل الحالة (اللي كانت موجودة أصلاً)
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

        const { data: currentOrder, error: fetchError } = await supabaseAdmin.from("orders").select("id, status, items, user_email, full_name, order_number").eq("id", Number(id)).single();
        if (fetchError || !currentOrder) return NextResponse.json({ error: "الطلب مش موجود" }, { status: 404 });

        const oldStatus = currentOrder.status as OrderStatus;
        if (oldStatus === status) return NextResponse.json({ success: true });

        const items = currentOrder.items as any[];

        if (status === "cancelled" || oldStatus === "cancelled") {
            const productIds = items.map((i: any) => i.productId);
            const { data: dbProducts } = await supabaseAdmin.from("products").select("id, colors").in("id", productIds);
            const productMap = new Map(dbProducts?.map((p) => [p.id, p]) || []);

            for (const item of items) {
                const product = productMap.get(item.productId);
                const hasColors = product?.colors && Array.isArray(product.colors) && product.colors.length > 0;

                if (status === "cancelled" && oldStatus !== "cancelled") {
                    if (hasColors) await supabaseAdmin.rpc("increase_product_color_stock", { p_product_id: item.productId, p_color_name: item.color, p_size: item.size, p_quantity: item.quantity });
                    else await supabaseAdmin.rpc("increase_product_size_stock", { p_product_id: item.productId, p_size: item.size, p_quantity: item.quantity });
                } else if (oldStatus === "cancelled" && status !== "cancelled") {
                    if (hasColors) await supabaseAdmin.rpc("decrease_product_color_stock", { p_product_id: item.productId, p_color_name: item.color, p_size: item.size, p_quantity: item.quantity });
                    else await supabaseAdmin.rpc("decrease_product_size_stock", { p_product_id: item.productId, p_size: item.size, p_quantity: item.quantity });
                }
            }
        }

        const { error: updateError } = await supabaseAdmin.from("orders").update({ status }).eq("id", Number(id));
        if (updateError) return NextResponse.json({ error: "فشل تحديث الطلب" }, { status: 500 });

        if (currentOrder.user_email) {
            sendEmail({ to: currentOrder.user_email, toName: currentOrder.full_name, subject: `تحديث على طلبك ${currentOrder.order_number} - Mood`, htmlContent: buildOrderStatusEmail({ orderNumber: currentOrder.order_number, customerName: currentOrder.full_name, status }) })
                .catch((err) => console.error("Status email failed:", err));
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "حصلت مشكلة في السيرفر" }, { status: 500 });
    }
}