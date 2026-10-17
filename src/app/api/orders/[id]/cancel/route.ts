import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendEmail, buildOrderCancelledAdminEmail } from "@/lib/email";

type Props = {
    params: Promise<{ id: string }>;
};

type OrderItem = {
    productId: number;
    name: string;
    size: string;
    color: string;
    quantity: number;
};

export async function POST(request: Request, { params }: Props) {
    try {
        const { id } = await params;

        const authHeader = request.headers.get("authorization");
        const token = authHeader?.replace("Bearer ", "");

        if (!token) {
            return NextResponse.json({ error: "لازم تسجل دخول الأول" }, { status: 401 });
        }

        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json({ error: "لازم تسجل دخول الأول" }, { status: 401 });
        }

        const { data: order, error: orderError } = await supabaseAdmin
            .from("orders")
            .select("id, user_id, status, items, user_email, full_name, phone, city, total, order_number")
            .eq("id", Number(id))
            .single();

        if (orderError || !order) {
            return NextResponse.json({ error: "الطلب مش موجود" }, { status: 404 });
        }

        if (order.user_id !== user.id) {
            return NextResponse.json({ error: "مش مسموحلك تلغي الطلب ده" }, { status: 403 });
        }

        if (order.status === "cancelled") {
            return NextResponse.json({ error: "الطلب ملغي بالفعل" }, { status: 400 });
        }

        if (order.status === "shipped" || order.status === "delivered") {
            return NextResponse.json({ error: "مش ممكن تلغي الطلب دلوقتي. لو استلمت المنتج، تواصل معنا للإرجاع." }, { status: 400 });
        }

        // Atomic update لمنع الـ Race Condition
        const { data: updatedRows, error: updateError } = await supabaseAdmin
            .from("orders")
            .update({ status: "cancelled" })
            .eq("id", Number(id))
            .in("status", ["pending", "confirmed"])
            .select("id");

        if (updateError || !updatedRows || updatedRows.length === 0) {
            return NextResponse.json({ error: "مش ممكن تلغي الطلب دلوقتي. ممكن حالته اتغيرت." }, { status: 409 });
        }

        const items = order.items as OrderItem[];

        // ✅ 1. إصلاح مشكلة N+1: نجيب كل المنتجات مرة واحدة
        const productIds = items.map((i) => i.productId);
        const { data: dbProducts } = await supabaseAdmin
            .from("products")
            .select("id, colors")
            .in("id", productIds);

        const productMap = new Map(dbProducts?.map((p) => [p.id, p]) || []);

        // ✅ 2. استرجاع المخزون
        for (const item of items) {
            const product = productMap.get(item.productId);
            const hasColors = product?.colors && Array.isArray(product.colors) && product.colors.length > 0;

            try {
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
            } catch (rpcError) {
                console.error(`Failed to restore stock for product ${item.productId}:`, rpcError);
            }
        }

        // ✅ 3. إرسال الإيميل بدون تعطيل الرد (Fire and forget)
        const adminEmail = process.env.BREVO_ADMIN_EMAIL;
        if (adminEmail && order.user_email) {
            sendEmail({
                to: adminEmail,
                toName: "Mood Admin",
                subject: `❌ العميل ألغى الطلب ${order.order_number}`,
                htmlContent: buildOrderCancelledAdminEmail({
                    orderNumber: order.order_number,
                    customerName: order.full_name,
                    customerEmail: order.user_email,
                    phone: order.phone,
                    city: order.city,
                    total: order.total,
                }),
            }).catch((emailError) => console.error("Cancel admin email failed:", emailError));
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Cancel order error:", error);
        return NextResponse.json({ error: "حصلت مشكلة في السيرفر" }, { status: 500 });
    }
}