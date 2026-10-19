import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get("authorization");
        const token = authHeader?.replace("Bearer ", "");
        if (!token) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
        if (authError || !user) return NextResponse.json({ error: "توكن غير صالح" }, { status: 401 });

        const { data: adminCheck } = await supabaseAdmin.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
        if (!adminCheck) return NextResponse.json({ error: "مش مسموحلك" }, { status: 403 });

        const { data: logs, error } = await supabaseAdmin
            .from("audit_logs")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(100);

        if (error) throw error;
        return NextResponse.json({ logs });
    } catch (error) {
        return NextResponse.json({ error: "فشل تحميل السجل" }, { status: 500 });
    }
}

// ✅ ضفنا دالة POST عشان نسجل الحركات من الفرونت إند بأمان
export async function POST(request: Request) {
    try {
        const authHeader = request.headers.get("authorization");
        const token = authHeader?.replace("Bearer ", "");
        if (!token) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
        if (authError || !user) return NextResponse.json({ error: "توكن غير صالح" }, { status: 401 });

        const { data: adminCheck } = await supabaseAdmin.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
        if (!adminCheck) return NextResponse.json({ error: "مش مسموحلك" }, { status: 403 });

        const body = await request.json();
        const { action, entityType, entityId, details } = body;

        const { error } = await supabaseAdmin.from("audit_logs").insert({
            admin_id: user.id,
            admin_email: user.email,
            action,
            entity_type: entityType,
            entity_id: entityId ? String(entityId) : null,
            details,
        });

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "فشل تسجيل الحركة" }, { status: 500 });
    }
}