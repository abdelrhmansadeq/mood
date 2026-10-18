import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get("authorization");
        const token = authHeader?.replace("Bearer ", "");

        if (!token) return NextResponse.json({ error: "لازم تسجل دخول" }, { status: 401 });

        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
        if (authError || !user) return NextResponse.json({ error: "توكن غير صالح" }, { status: 401 });

        const { data: adminCheck } = await supabaseAdmin.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
        if (!adminCheck) return NextResponse.json({ error: "مش مسموحلك" }, { status: 403 });

        const { data: subscribers, error } = await supabaseAdmin
            .from("subscribers")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) throw error;

        return NextResponse.json({ subscribers });
    } catch (error) {
        return NextResponse.json({ error: "فشل تحميل المشتركين" }, { status: 500 });
    }
}