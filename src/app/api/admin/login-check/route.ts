import { NextResponse } from "next/server";
import { loginRatelimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
    try {
        // 1. Rate Limit الأول (عشان نحمي Cloudflare API من السبام)
        const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";

        const { success } = await loginRatelimit.limit(ip);

        if (!success) {
            console.warn(`⚠️ محاولة دخول مشبوهة من IP: ${ip}`);
            return NextResponse.json(
                { error: "لقد تجاوزت الحد الأقصى للمحاولات (5 محاولات). يرجى المحاولة بعد 15 دقيقة." },
                { status: 429 }
            );
        }

        // 2. استخراج الـ Turnstile Token من الـ body
        const body = await request.json().catch(() => ({}));
        const token = body?.token;

        if (!token || typeof token !== "string") {
            return NextResponse.json(
                { error: "رمز التحقق من الروبوت مطلوب." },
                { status: 400 }
            );
        }

        // 3. التحقق من الـ Secret Key موجود
        const secretKey = process.env.TURNSTILE_SECRET_KEY;
        if (!secretKey) {
            console.error("TURNSTILE_SECRET_KEY is not set in environment variables");
            return NextResponse.json(
                { error: "خطأ في إعدادات السيرفر. تواصل مع الأدمن." },
                { status: 500 }
            );
        }

        // 4. التحقق من التوكن مع Cloudflare
        const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                secret: secretKey,
                response: token,
                remoteip: ip,
            }),
        });

        const verifyData = await verifyRes.json();

        if (!verifyData.success) {
            console.warn("Turnstile verification failed:", verifyData["error-codes"]);
            return NextResponse.json(
                { error: "فشل التحقق من أنك لست روبوت. جرب تاني." },
                { status: 400 }
            );
        }

        // 5. كل حاجة تمام
        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Login check error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}