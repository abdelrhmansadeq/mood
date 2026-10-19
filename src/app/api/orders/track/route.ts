import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: Request) {
    try {
        const { orderNumber, contactInfo } = await request.json();

        if (!orderNumber || !contactInfo) {
            return NextResponse.json({ error: "رقم الطلب وبيانات التواصل مطلوبين" }, { status: 400 });
        }

        // بنجيب الطلب برقمه
        const { data: order, error } = await supabaseAdmin
            .from("orders")
            .select("id, order_number, status, created_at, total, full_name, items")
            .eq("order_number", orderNumber.trim().toUpperCase())
            .single();

        if (error || !order) {
            return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
        }

        // التأكد إن اللي بيسأل هو صاحب الطلب (بمطابقة الإيميل أو التليفون)
        const { data: fullOrder } = await supabaseAdmin
            .from("orders")
            .select("phone, user_email")
            .eq("id", order.id)
            .single();

        const isMatch =
            fullOrder?.phone === contactInfo.trim() ||
            fullOrder?.user_email === contactInfo.trim().toLowerCase();

        if (!isMatch) {
            return NextResponse.json({ error: "بيانات التواصل غير صحيحة لهذا الطلب" }, { status: 403 });
        }

        return NextResponse.json({ order });
    } catch (error) {
        return NextResponse.json({ error: "حصلت مشكلة في السيرفر" }, { status: 500 });
    }
}