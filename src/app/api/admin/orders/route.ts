import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(request: Request) {
    try {
        // ✅ التحقق من الـ token
        const authHeader = request.headers.get("authorization");
        const token = authHeader?.replace("Bearer ", "");

        if (!token) {
            return NextResponse.json(
                { error: "لازم تسجل دخول الأول" },
                { status: 401 }
            );
        }

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

        // ✅ نجيب كل الطلبات
        const { data: orders, error: ordersError } = await supabaseAdmin
            .from("orders")
            .select("*")
            .order("created_at", { ascending: false });

        if (ordersError) {
            console.error("Orders error:", ordersError);
            return NextResponse.json(
                { error: "فشل تحميل الطلبات" },
                { status: 500 }
            );
        }

        return NextResponse.json({ orders });
    } catch (error) {
        console.error("API error:", error);
        return NextResponse.json(
            { error: "حصلت مشكلة في السيرفر" },
            { status: 500 }
        );
    }
}