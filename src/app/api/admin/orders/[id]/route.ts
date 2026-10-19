import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendEmail, buildOrderStatusEmail } from "@/lib/email";
import { adminRatelimit } from "@/lib/rate-limit";
import { logAdminAction } from "@/lib/audit-logger"; // ✅ ضفنا الدالة

type Props = { params: Promise<{ id: string }> };

async function verifyAdmin(request: Request) {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) return null;
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) return null;
    const { data: adminCheck } = await supabaseAdmin.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
    return adminCheck ? user : null;
}

export async function GET(request: Request, { params }: Props) {
    try {
        const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
        const { success } = await adminRatelimit.limit(ip);
        if (!success) return NextResponse.json({ error: "بعت طلبات كتير جداً، استنى دقيقة." }, { status: 429 });

        const { id } = await params;
        const user = await verifyAdmin(request);
        if (!user) return NextResponse.json({ error: "مش مسموحلك" }, { status: 403 });

        const { data: order, error } = await supabaseAdmin.from("orders").select("*").eq("id", Number(id)).single();
        if (error || !order) return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });

        return NextResponse.json({ order });
    } catch (error) {
        return NextResponse.json({ error: "حصلت مشكلة في السيرفر" }, { status: 500 });
    }
}

const VALID_STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"] as const;
type OrderStatus = (typeof VALID_STATUSES)[number];

export async function PATCH(request: Request, { params }: Props) {
    try {
        const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
        const { success } = await adminRatelimit.limit(ip);
        if (!success) return NextResponse.json({ error: "بعت طلبات كتير جداً، استنى دقيقة." }, { status: 429 });

        const { id } = await params;
        const body = await request.json();
        const { status } = body as { status: OrderStatus };

        const user = await verifyAdmin(request);
        if (!user) return NextResponse.json({ error: "مش مسموحلك" }, { status: 403 });

        if (!status || !VALID_STATUSES.includes(status)) {
            return NextResponse.json({ error: "حالة غير صحيحة" }, { status: 400 });
        }

        const { data: currentOrder, error: fetchError } = await supabaseAdmin.from("orders").select("id, status, items, user_email, full_name, order_number").eq("id", Number(id)).single();
        if (fetchError || !currentOrder) return NextResponse.json({ error: "الطلب مش موجود" }, { status: 404 });

        const oldStatus = currentOrder.status as OrderStatus;
        if (oldStatus === status) return NextResponse.json({ success: true });

        const items = currentOrder.items as any[];

        // التعامل مع المخزون لو الطلب اتلغي أو رجع من الإلغاء
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

        // ✅ تسجيل الحركة في سجل النشاط
        await logAdminAction({
            adminId: user.id,
            adminEmail: user.email || "unknown",
            action: "تحديث حالة الطلب",
            entityType: "order",
            entityId: id,
            details: `تم تغيير الحالة من "${oldStatus}" إلى "${status}" للطلب ${currentOrder.order_number}`,
        });

        // إرسال إيميل للعميل
        if (currentOrder.user_email) {
            sendEmail({ to: currentOrder.user_email, toName: currentOrder.full_name, subject: `تحديث على طلبك ${currentOrder.order_number} - Mood`, htmlContent: buildOrderStatusEmail({ orderNumber: currentOrder.order_number, customerName: currentOrder.full_name, status }) })
                .catch((err) => console.error("Status email failed:", err));
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "حصلت مشكلة في السيرفر" }, { status: 500 });
    }
}