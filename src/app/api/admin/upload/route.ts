import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { randomUUID } from "crypto";

export async function POST(request: Request) {
    try {
        // 1. التحقق من صلاحيات الأدمن
        const authHeader = request.headers.get("authorization");
        const token = authHeader?.replace("Bearer ", "");

        if (!token) return NextResponse.json({ error: "لازم تسجل دخول" }, { status: 401 });

        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
        if (authError || !user) return NextResponse.json({ error: "توكن غير صالح" }, { status: 401 });

        const { data: adminCheck } = await supabaseAdmin.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
        if (!adminCheck) return NextResponse.json({ error: "مش مسموحلك" }, { status: 403 });

        // 2. استلام الصورة
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "مفيش صورة مرفقة" }, { status: 400 });
        }

        // التحقق من حجم الصورة (بحد أقصى 5 ميجا)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: "حجم الصورة كبير جداً (الأقصى 5 ميجا)" }, { status: 400 });
        }

        // التحقق من نوع الملف
        if (!file.type.startsWith("image/")) {
            return NextResponse.json({ error: "الملف لازم يكون صورة" }, { status: 400 });
        }

        // 3. رفع الصورة على Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${randomUUID()}.${fileExt}`;

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { data, error } = await supabaseAdmin.storage
            .from("products")
            .upload(fileName, buffer, {
                contentType: file.type,
                upsert: false,
            });

        if (error) {
            console.error("Upload error:", error);
            return NextResponse.json({ error: "فشل رفع الصورة" }, { status: 500 });
        }

        // 4. نرجع الرابط النهائي للصورة
        const { data: { publicUrl } } = supabaseAdmin.storage
            .from("products")
            .getPublicUrl(fileName);

        return NextResponse.json({ url: publicUrl });

    } catch (error) {
        console.error("API upload error:", error);
        return NextResponse.json({ error: "حصلت مشكلة في السيرفر" }, { status: 500 });
    }
}