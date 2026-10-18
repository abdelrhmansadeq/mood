import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: Request) {
    try {
        const { code, cartTotal } = await request.json();

        if (!code) {
            return NextResponse.json({ error: "من فضلك اكتب كود الخصم" }, { status: 400 });
        }

        const cleanCode = code.trim().toUpperCase();

        // 1. البحث عن الكوبون
        const { data: coupon, error } = await supabaseAdmin
            .from("coupons")
            .select("*")
            .eq("code", cleanCode)
            .eq("is_active", true)
            .single();

        if (!coupon || error) {
            return NextResponse.json({ error: "كود الخصم غير صحيح أو غير مفعل" }, { status: 404 });
        }

        // 2. التحقق من تاريخ الصلاحية
        if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
            return NextResponse.json({ error: "كود الخصم ده انتهت صلاحيته" }, { status: 400 });
        }

        // 3. التحقق من عدد مرات الاستخدام
        if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
            return NextResponse.json({ error: "كود الخصم ده وصل للحد الأقصى للاستخدام" }, { status: 400 });
        }

        // 4. التحقق من الحد الأدنى للطلب
        if (cartTotal < coupon.min_order_amount) {
            return NextResponse.json({
                error: `الكود ده يتطلب حد أدنى للطلب ${coupon.min_order_amount} ج.م`
            }, { status: 400 });
        }

        // 5. حساب قيمة الخصم
        let discountAmount = 0;
        if (coupon.discount_percentage) {
            discountAmount = (cartTotal * coupon.discount_percentage) / 100;
        } else if (coupon.discount_fixed) {
            discountAmount = coupon.discount_fixed;
            if (discountAmount > cartTotal) {
                discountAmount = cartTotal; // الخصم ميكونش أكبر من إجمالي السلة
            }
        }

        return NextResponse.json({
            success: true,
            coupon: {
                code: coupon.code,
                discountAmount: Math.round(discountAmount), // تقريب لأقرب جنيه
            }
        });

    } catch (error) {
        console.error("Coupon validation error:", error);
        return NextResponse.json({ error: "حصلت مشكلة في السيرفر" }, { status: 500 });
    }
}