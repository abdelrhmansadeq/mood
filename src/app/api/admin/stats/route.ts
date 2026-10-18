import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(request: Request) {
    try {
        // 1. التحقق من صلاحيات الأدمن
        const authHeader = request.headers.get("authorization");
        const token = authHeader?.replace("Bearer ", "");

        if (!token) return NextResponse.json({ error: "لازم تسجل دخول" }, { status: 401 });

        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
        if (authError || !user) return NextResponse.json({ error: "توكن غير صالح" }, { status: 401 });

        const { data: adminCheck } = await supabaseAdmin.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
        if (!adminCheck) return NextResponse.json({ error: "مش مسموحلك" }, { status: 403 });

        // 2. جلب كل الطلبات (عشان نحسب الإيرادات والطلبات)
        const { data: orders } = await supabaseAdmin.from("orders").select("total, status, created_at");

        // 3. الحسابات
        let totalRevenue = 0;
        let totalOrders = 0;
        let todayOrders = 0;

        const today = new Date();
        today.setHours(0, 0, 0, 0); // بداية اليوم

        if (orders) {
            orders.forEach((order) => {
                // بنحسب الطلبات اللي مش ملغية
                if (order.status !== "cancelled") {
                    totalRevenue += order.total;
                    totalOrders += 1;

                    const orderDate = new Date(order.created_at);
                    if (orderDate >= today) {
                        todayOrders += 1;
                    }
                }
            });
        }

        // 4. جلب المنتجات الأكثر مبيعاً
        const { data: topProducts } = await supabaseAdmin
            .from("products")
            .select("id, name, image, price, sold_count")
            .gt("sold_count", 0)
            .order("sold_count", { ascending: false })
            .limit(5);

        // 5. جلب المنتجات اللي مخزونها قرب يخلص (أقل من 10 وأكبر من 0)
        const { data: lowStockProducts } = await supabaseAdmin
            .from("products")
            .select("id, name, image, stock")
            .gt("stock", 0)
            .lte("stock", 10)
            .order("stock", { ascending: true })
            .limit(5);

        // 6. إرجاع النتيجة
        return NextResponse.json({
            stats: {
                totalRevenue,
                totalOrders,
                todayOrders,
            },
            topProducts: topProducts || [],
            lowStockProducts: lowStockProducts || [],
        });

    } catch (error) {
        console.error("Stats API error:", error);
        return NextResponse.json({ error: "حصلت مشكلة في السيرفر" }, { status: 500 });
    }
}