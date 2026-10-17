import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendEmail, buildContactEmail } from "@/lib/email";

export async function POST(request: Request) {
    try {
        const { token } = await request.json();

        if (!token || typeof token !== "string") {
            return NextResponse.json(
                { error: "الرابط غير صحيح" },
                { status: 400 }
            );
        }

        // ✅ ندوّر على الرسالة بالـ token
        const { data: message, error: fetchError } = await supabaseAdmin
            .from("contact_messages")
            .select("*")
            .eq("verification_token", token)
            .eq("is_verified", false)
            .maybeSingle();

        if (fetchError || !message) {
            return NextResponse.json(
                { error: "الرابط منتهي أو مستخدم من قبل" },
                { status: 400 }
            );
        }

        // ✅ نأكد الرسالة
        const { error: updateError } = await supabaseAdmin
            .from("contact_messages")
            .update({
                is_verified: true,
                verified_at: new Date().toISOString(),
                verification_token: null,
            })
            .eq("id", message.id);

        if (updateError) {
            console.error("Verify error:", updateError);
            return NextResponse.json(
                { error: "فشل تأكيد الرسالة" },
                { status: 500 }
            );
        }

        // ✅ نبعت الإيميل للأدمن (دلوقتي بس)
        try {
            const adminEmail = process.env.BREVO_ADMIN_EMAIL;
            if (adminEmail) {
                await sendEmail({
                    to: adminEmail,
                    toName: "Mood Admin",
                    subject: `📬 رسالة جديدة موثقة من ${message.name}`,
                    htmlContent: buildContactEmail({
                        name: message.name,
                        email: message.email,
                        message: message.message,
                    }),
                });
            }
        } catch (emailError) {
            console.error("Admin contact email failed:", emailError);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Verify API error:", error);
        return NextResponse.json(
            { error: "حصلت مشكلة في السيرفر" },
            { status: 500 }
        );
    }
}