import { NextResponse } from "next/server";
import { loginRatelimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
    try {
        const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";

        const { success } = await loginRatelimit.limit(ip);

        if (!success) {
            console.warn(`⚠️ محاولة دخول مشبوهة من IP: ${ip}`);
            return NextResponse.json(
                { error: "لقد تجاوزت الحد الأقصى للمحاولات (5 محاولات). يرجى المحاولة بعد 15 دقيقة." },
                { status: 429 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}