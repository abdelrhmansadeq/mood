import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendEmail, buildContactEmail } from "@/lib/email";
import { randomBytes } from "crypto";

// ===== Rate Limiting (in-memory) =====
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 3;
const ONE_HOUR = 60 * 60 * 1000;

function checkRateLimit(key: string): { allowed: boolean; resetIn?: number } {
    const now = Date.now();
    const record = rateLimitMap.get(key);

    if (!record || now > record.resetAt) {
        rateLimitMap.set(key, { count: 1, resetAt: now + ONE_HOUR });
        return { allowed: true };
    }

    if (record.count >= RATE_LIMIT) {
        return { allowed: false, resetIn: record.resetAt - now };
    }

    record.count++;
    return { allowed: true };
}

// ===== POST: إرسال رسالة =====
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, message, honeypot } = body;

        if (honeypot && honeypot.trim() !== "") {
            return NextResponse.json({ success: true });
        }

        if (!name || !email || !message) {
            return NextResponse.json({ error: "كل الحقول مطلوبة" }, { status: 400 });
        }

        if (typeof name !== "string" || typeof email !== "string" || typeof message !== "string") {
            return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 400 });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({ error: "الإيميل غير صحيح" }, { status: 400 });
        }

        if (message.trim().length < 10) {
            return NextResponse.json({ error: "الرسالة قصيرة جداً (10 أحرف على الأقل)" }, { status: 400 });
        }

        const cleanName = name.trim();
        const cleanEmail = email.trim().toLowerCase();
        const cleanMessage = message.trim();

        const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
        const rateKey = `contact:${ip}`;
        const rate = checkRateLimit(rateKey);

        if (!rate.allowed) {
            const minutes = Math.ceil((rate.resetIn || 0) / 60000);
            return NextResponse.json({ error: `بعتّ رسائل كتير. استنى ${minutes} دقيقة وجرب تاني.` }, { status: 429 });
        }

        const authHeader = request.headers.get("authorization");
        const token = authHeader?.replace("Bearer ", "");

        let user: { id: string; email?: string } | null = null;

        if (token) {
            const { data: { user: authUser } } = await supabaseAdmin.auth.getUser(token);
            if (authUser) {
                user = { id: authUser.id, email: authUser.email };
            }
        }

        let finalEmail = cleanEmail;
        let isVerified = false;
        let userId: string | null = null;
        let verificationToken: string | null = null;

        if (user) {
            finalEmail = user.email || cleanEmail;
            isVerified = true;
            userId = user.id;
        } else {
            verificationToken = randomBytes(32).toString("hex");
        }

        const { data: insertedMessage, error } = await supabaseAdmin
            .from("contact_messages")
            .insert({
                name: cleanName,
                email: finalEmail,
                message: cleanMessage,
                is_verified: isVerified,
                user_id: userId,
                verification_token: verificationToken,
                verified_at: isVerified ? new Date().toISOString() : null,
                ip_address: ip,
            })
            .select()
            .single();

        if (error) {
            console.error("Contact error:", error);
            return NextResponse.json({ error: "فشل إرسال الرسالة" }, { status: 500 });
        }

        if (isVerified) {
            try {
                const adminEmail = process.env.BREVO_ADMIN_EMAIL;
                if (adminEmail) {
                    await sendEmail({
                        to: adminEmail,
                        toName: "Mood Admin",
                        subject: `📬 رسالة جديدة من ${cleanName}`,
                        htmlContent: buildContactEmail({ name: cleanName, email: finalEmail, message: cleanMessage }),
                    });
                }
            } catch (emailError) {
                console.error("Contact email failed:", emailError);
            }

            return NextResponse.json({ success: true, requiresVerification: false });
        }

        try {
            const verifyUrl = `${new URL(request.url).origin}/contact/verify?token=${verificationToken}`;
            await sendEmail({
                to: finalEmail,
                toName: cleanName,
                subject: "تأكيد رسالتك - Mood",
                htmlContent: buildVerificationEmail({ name: cleanName, message: cleanMessage, verifyUrl }),
            });
        } catch (emailError) {
            console.error("Verification email failed:", emailError);
        }

        return NextResponse.json({ success: true, requiresVerification: true });
    } catch (error) {
        console.error("Contact API error:", error);
        return NextResponse.json({ error: "حصلت مشكلة في السيرفر" }, { status: 500 });
    }
}

// ===== GET: للأدمن — يجيب الرسائل الموثقة فقط =====
export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get("authorization");
        const token = authHeader?.replace("Bearer ", "");

        if (!token) return NextResponse.json({ error: "لازم تسجل دخول الأول" }, { status: 401 });

        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
        if (authError || !user) return NextResponse.json({ error: "لازم تسجل دخول الأول" }, { status: 401 });

        const { data: adminCheck } = await supabaseAdmin.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
        if (!adminCheck) return NextResponse.json({ error: "مش مسموحلك بالعملية دي" }, { status: 403 });

        const { data: messages, error: msgError } = await supabaseAdmin
            .from("contact_messages")
            .select("*")
            .eq("is_verified", true)
            .order("created_at", { ascending: false });

        if (msgError) {
            console.error("Messages error:", msgError);
            return NextResponse.json({ error: "فشل تحميل الرسائل" }, { status: 500 });
        }

        return NextResponse.json({ messages });
    } catch (error) {
        console.error("Contact GET error:", error);
        return NextResponse.json({ error: "حصلت مشكلة في السيرفر" }, { status: 500 });
    }
}

// ✅ PATCH: تحديث حالة الرسالة لمقروءة
export async function PATCH(request: Request) {
    try {
        const authHeader = request.headers.get("authorization");
        const token = authHeader?.replace("Bearer ", "");

        if (!token) return NextResponse.json({ error: "لازم تسجل دخول الأول" }, { status: 401 });

        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
        if (authError || !user) return NextResponse.json({ error: "لازم تسجل دخول الأول" }, { status: 401 });

        const { data: adminCheck } = await supabaseAdmin.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
        if (!adminCheck) return NextResponse.json({ error: "مش مسموحلك بالعملية دي" }, { status: 403 });

        const body = await request.json();
        const { messageId } = body;

        if (!messageId) return NextResponse.json({ error: "رقم الرسالة مطلوب" }, { status: 400 });

        const { error: updateError } = await supabaseAdmin
            .from("contact_messages")
            .update({ is_read: true })
            .eq("id", messageId);

        if (updateError) {
            console.error("Mark as read error:", updateError);
            return NextResponse.json({ error: "فشل تحديث حالة الرسالة" }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Contact PATCH error:", error);
        return NextResponse.json({ error: "حصلت مشكلة في السيرفر" }, { status: 500 });
    }
}

function buildVerificationEmail(data: { name: string; message: string; verifyUrl: string; }): string {
    return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8" /></head>
<body style="font-family: Arial, sans-serif; background-color: #FAFAF7; margin: 0; padding: 20px;">
<div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; border: 1px solid #eee;">
<div style="background: #1F1F1F; color: #FAFAF7; padding: 24px; text-align: center;"><h1 style="margin: 0; font-size: 28px; color: #C89B5A;">Mood</h1><p style="margin: 8px 0 0; font-size: 14px;">متجر الأناقة</p></div>
<div style="padding: 30px; text-align: center;">
<div style="font-size: 50px; margin-bottom: 15px;">📩</div>
<h2 style="color: #1F1F1F; margin-top: 0;">مرحباً ${data.name}،</h2>
<p style="color: #666; line-height: 1.7; font-size: 15px; margin-bottom: 25px;">وصلتنا رسالتك من صفحة "تواصل معنا".<br />عشان نتأكد إن الإيميل بتاعك فعلًا، <strong>اضغط على الزرار ده</strong> قبل ما نبعت الرسالة لفريقنا.</p>
<div style="background: #FAFAF7; border-radius: 6px; padding: 20px; margin: 20px 0; text-align: right;"><p style="margin: 0; color: #666; font-size: 13px; margin-bottom: 8px;">رسالتك:</p><p style="color: #1F1F1F; line-height: 1.7; margin: 0; white-space: pre-wrap;">${data.message}</p></div>
<a href="${data.verifyUrl}" style="display: inline-block; background: #C89B5A; color: white; padding: 16px 40px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; margin: 20px 0;">✅ تأكيد الرسالة</a>
<p style="color: #999; font-size: 12px; margin-top: 25px; line-height: 1.6;">لو مش إنت اللي بعت الرسالة دي، تجاهل الإيميل ومفيش أي حاجة هتحصل.</p>
</div>
<div style="background: #FAFAF7; padding: 20px; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #eee;">© ${new Date().getFullYear()} Mood. جميع الحقوق محفوظة.</div>
</div>
</body>
</html>
`;
}