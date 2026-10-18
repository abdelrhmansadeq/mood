import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { randomUUID } from "crypto";

export async function POST(request: Request) {
    try {
        const authHeader = request.headers.get("authorization");
        const token = authHeader?.replace("Bearer ", "");
        if (!token) return NextResponse.json({ error: "لازم تسجل دخول" }, { status: 401 });

        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
        if (authError || !user) return NextResponse.json({ error: "توكن غير صالح" }, { status: 401 });

        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) return NextResponse.json({ error: "مفيش صورة" }, { status: 400 });
        if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "حجم الصورة كبير (الأقصى 5 ميجا)" }, { status: 400 });
        if (!file.type.startsWith("image/")) return NextResponse.json({ error: "الملف لازم يكون صورة" }, { status: 400 });

        const fileExt = file.name.split('.').pop();
        const fileName = `${randomUUID()}.${fileExt}`;
        const buffer = Buffer.from(await file.arrayBuffer());

        const { error } = await supabaseAdmin.storage
            .from("reviews")
            .upload(fileName, buffer, { contentType: file.type, upsert: false });

        if (error) return NextResponse.json({ error: "فشل رفع الصورة" }, { status: 500 });

        const { data: { publicUrl } } = supabaseAdmin.storage.from("reviews").getPublicUrl(fileName);
        return NextResponse.json({ url: publicUrl });

    } catch (error) {
        return NextResponse.json({ error: "حصلت مشكلة في السيرفر" }, { status: 500 });
    }
}