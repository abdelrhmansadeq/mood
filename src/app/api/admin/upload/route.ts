import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { randomUUID } from "crypto";
import sharp from "sharp";
import { fileTypeFromBuffer } from "file-type"; // ✅ ضفنا مكتبة الفحص

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

        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: "حجم الصورة كبير جداً (الأقصى 5 ميجا)" }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // ✅ 3. فحص البصمة الرقمية للملف (File Signature)
        const type = await fileTypeFromBuffer(buffer);
        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

        if (!type || !allowedTypes.includes(type.mime)) {
            return NextResponse.json(
                { error: "الملف المرفوع غير آمن أو ليس صورة حقيقية" },
                { status: 400 }
            );
        }

        // 4. ضغط الصورة باستخدام sharp
        let compressedBuffer;
        try {
            compressedBuffer = await sharp(buffer)
                .resize({ width: 1000, withoutEnlargement: true })
                .webp({ quality: 80 })
                .toBuffer();
        } catch (sharpError) {
            console.error("Sharp compression error:", sharpError);
            return NextResponse.json({ error: "فشل معالجة الصورة، تأكد من صحة الملف" }, { status: 400 });
        }

        // 5. رفع الصورة المضغوطة
        const fileName = `${randomUUID()}.webp`;

        const { error } = await supabaseAdmin.storage
            .from("products")
            .upload(fileName, compressedBuffer, {
                contentType: "image/webp",
                upsert: false,
            });

        if (error) {
            console.error("Upload error:", error);
            return NextResponse.json({ error: "فشل رفع الصورة" }, { status: 500 });
        }

        const { data: { publicUrl } } = supabaseAdmin.storage
            .from("products")
            .getPublicUrl(fileName);

        return NextResponse.json({ url: publicUrl });

    } catch (error) {
        console.error("API upload error:", error);
        return NextResponse.json({ error: "حصلت مشكلة في السيرفر" }, { status: 500 });
    }
}