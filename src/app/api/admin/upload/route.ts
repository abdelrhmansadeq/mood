import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { randomUUID } from "crypto";
import sharp from "sharp"; // ✅ ضفنا مكتبة الضغط

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

        if (!file.type.startsWith("image/")) {
            return NextResponse.json({ error: "الملف لازم يكون صورة" }, { status: 400 });
        }

        // 3. ضغط الصورة باستخدام sharp
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        let compressedBuffer;
        try {
            compressedBuffer = await sharp(buffer)
                .resize({ width: 1000, withoutEnlargement: true }) // تصغير العرض لـ 1000 بكسل كحد أقصى
                .webp({ quality: 80 }) // تحويل لصيغة webp عالية الجودة وخفيفة
                .toBuffer();
        } catch (sharpError) {
            console.error("Sharp compression error:", sharpError);
            return NextResponse.json({ error: "فشل معالجة الصورة، تأكد من صحة الملف" }, { status: 400 });
        }

        // 4. رفع الصورة المضغوطة على Supabase Storage
        const fileName = `${randomUUID()}.webp`; // بنحفظها دايماً webp

        const { data, error } = await supabaseAdmin.storage
            .from("products")
            .upload(fileName, compressedBuffer, {
                contentType: "image/webp", // نوع الملف بقى webp
                upsert: false,
            });

        if (error) {
            console.error("Upload error:", error);
            return NextResponse.json({ error: "فشل رفع الصورة" }, { status: 500 });
        }

        // 5. نرجع الرابط النهائي للصورة
        const { data: { publicUrl } } = supabaseAdmin.storage
            .from("products")
            .getPublicUrl(fileName);

        return NextResponse.json({ url: publicUrl });

    } catch (error) {
        console.error("API upload error:", error);
        return NextResponse.json({ error: "حصلت مشكلة في السيرفر" }, { status: 500 });
    }
}