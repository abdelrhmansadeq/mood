import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

async function verifyAdmin(request: Request) {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) return false;
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) return false;
    const { data: adminCheck } = await supabaseAdmin.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
    return !!adminCheck;
}

type Props = { params: Promise<{ id: string }> };

// ✅ تغيير حالة الكوبون (تفعيل/إيقاف)
export async function PATCH(request: Request, { params }: Props) {
    try {
        const isAdmin = await verifyAdmin(request);
        if (!isAdmin) return NextResponse.json({ error: "مش مسموحلك" }, { status: 403 });

        const { id } = await params;
        const { is_active } = await request.json();

        const { error } = await supabaseAdmin.from("coupons").update({ is_active }).eq("id", Number(id));
        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "فشل تحديث الكوبون" }, { status: 500 });
    }
}

// ✅ حذف كوبون
export async function DELETE(request: Request, { params }: Props) {
    try {
        const isAdmin = await verifyAdmin(request);
        if (!isAdmin) return NextResponse.json({ error: "مش مسموحلك" }, { status: 403 });

        const { id } = await params;
        const { error } = await supabaseAdmin.from("coupons").delete().eq("id", Number(id));
        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "فشل حذف الكوبون" }, { status: 500 });
    }
}