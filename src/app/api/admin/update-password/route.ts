import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
    try {
        const { oldPassword, newPassword, secretCode } = await request.json();

        // 1. التحقق من الرمز السري (اللي إحنا حطيناه في Vercel)
        if (secretCode !== process.env.ADMIN_SECRET_CODE) {
            return NextResponse.json({ error: "رمز التأكيد السري غير صحيح" }, { status: 403 });
        }

        // 2. التحقق من التوكن
        const authHeader = request.headers.get("authorization");
        const token = authHeader?.replace("Bearer ", "");
        if (!token) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
        if (authError || !user) return NextResponse.json({ error: "جلسة غير صالحة" }, { status: 401 });

        // 3. التحقق من الباسورد القديم
        const supabaseClient = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { error: signInError } = await supabaseClient.auth.signInWithPassword({
            email: user.email!,
            password: oldPassword,
        });

        if (signInError) {
            return NextResponse.json({ error: "الباسورد القديم غير صحيح" }, { status: 400 });
        }

        // 4. تحديث الباسورد
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            user.id,
            { password: newPassword }
        );

        if (updateError) {
            return NextResponse.json({ error: "فشل تحديث الباسورد" }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "حصلت مشكلة في السيرفر" }, { status: 500 });
    }
}