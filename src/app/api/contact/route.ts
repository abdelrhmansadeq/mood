import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// ✅ POST — حفظ رسالة جديدة
export async function POST(request: Request) {
    try {
        const { name, email, message } = await request.json();

        if (!name || !email || !message) {
            return NextResponse.json(
                { error: "كل الحقول مطلوبة" },
                { status: 400 }
            );
        }

        if (typeof name !== "string" || typeof email !== "string" || typeof message !== "string") {
            return NextResponse.json(
                { error: "بيانات غير صحيحة" },
                { status: 400 }
            );
        }

        // تحقق بسيط من الإيميل
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: "الإيميل غير صحيح" },
                { status: 400 }
            );
        }

        // تحقق من طول الرسالة
        if (message.trim().length < 10) {
            return NextResponse.json(
                { error: "الرسالة قصيرة جداً (10 أحرف على الأقل)" },
                { status: 400 }
            );
        }

        const { error } = await supabaseAdmin.from("contact_messages").insert({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            message: message.trim(),
        });

        if (error) {
            console.error("Contact error:", error);
            return NextResponse.json(
                { error: "فشل إرسال الرسالة" },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Contact API error:", error);
        return NextResponse.json(
            { error: "حصلت مشكلة في السيرفر" },
            { status: 500 }
        );
    }
}

// ✅ GET — للأدمن يشوف الرسائل
export async function GET(request: Request) {
    try {
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

        // التحقق من الأدمن
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

        const { data: messages, error: msgError } = await supabaseAdmin
            .from("contact_messages")
            .select("*")
            .order("created_at", { ascending: false });

        if (msgError) {
            console.error("Messages error:", msgError);
            return NextResponse.json(
                { error: "فشل تحميل الرسائل" },
                { status: 500 }
            );
        }

        return NextResponse.json({ messages });
    } catch (error) {
        console.error("Contact GET error:", error);
        return NextResponse.json(
            { error: "حصلت مشكلة في السيرفر" },
            { status: 500 }
        );
    }
}