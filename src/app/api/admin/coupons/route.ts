import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { z } from "zod";

// التحقق من صلاحيات الأدمن
async function verifyAdmin(request: Request) {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) return false;

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) return false;

    const { data: adminCheck } = await supabaseAdmin.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
    return !!adminCheck;
}

// ✅ جلب الكوبونات
export async function GET(request: Request) {
    try {
        const isAdmin = await verifyAdmin(request);
        if (!isAdmin) return NextResponse.json({ error: "مش مسموحلك" }, { status: 403 });

        const { data: coupons, error } = await supabaseAdmin
            .from("coupons")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) throw error;
        return NextResponse.json({ coupons });
    } catch (error) {
        return NextResponse.json({ error: "فشل تحميل الكوبونات" }, { status: 500 });
    }
}

// ✅ إضافة كوبون جديد
const couponSchema = z.object({
    code: z.string().min(3, "الكود يجب أن يكون 3 أحرف على الأقل"),
    discount_type: z.enum(["percentage", "fixed"]),
    discount_value: z.number().positive("قيمة الخصم يجب أن تكون أكبر من صفر"),
    min_order_amount: z.number().min(0).default(0),
    max_uses: z.number().nullable().optional(),
    expires_at: z.string().nullable().optional(),
}).refine((data) => {
    if (data.discount_type === "percentage" && data.discount_value > 100) return false;
    return true;
}, { message: "نسبة الخصم لا يمكن أن تتجاوز 100%", path: ["discount_value"] });

export async function POST(request: Request) {
    try {
        const isAdmin = await verifyAdmin(request);
        if (!isAdmin) return NextResponse.json({ error: "مش مسموحلك" }, { status: 403 });

        const body = await request.json();
        const validation = couponSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
        }

        const { code, discount_type, discount_value, min_order_amount, max_uses, expires_at } = validation.data;

        const { error } = await supabaseAdmin.from("coupons").insert({
            code: code.toUpperCase().trim(),
            discount_percentage: discount_type === "percentage" ? discount_value : null,
            discount_fixed: discount_type === "fixed" ? discount_value : null,
            min_order_amount,
            max_uses: max_uses || null,
            expires_at: expires_at || null,
            is_active: true,
        });

        if (error) {
            if (error.code === "23505") { // كود الخطأ لو الكود مكرر
                return NextResponse.json({ error: "كود الخصم ده موجود بالفعل" }, { status: 400 });
            }
            throw error;
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "فشل إضافة الكوبون" }, { status: 500 });
    }
}