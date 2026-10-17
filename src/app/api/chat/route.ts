import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// 🛡️ حماية بسيطة من السبام (Rate Limiting)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 15; // 15 رسالة في الدقيقة
const ONE_MINUTE = 60 * 1000;

function checkRateLimit(key: string): boolean {
    const now = Date.now();
    const record = rateLimitMap.get(key);
    if (!record || now > record.resetAt) {
        rateLimitMap.set(key, { count: 1, resetAt: now + ONE_MINUTE });
        return true;
    }
    if (record.count >= RATE_LIMIT) return false;
    record.count++;
    return true;
}

export async function POST(request: Request) {
    try {
        // 🛡️ تطبيق الـ Rate Limit
        const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
        if (!checkRateLimit(ip)) {
            return NextResponse.json(
                { error: "بعت رسائل كتير، استنى شوية وجرب تاني." },
                { status: 429 }
            );
        }

        const { message } = await request.json();

        if (!message || typeof message !== "string") {
            return NextResponse.json({ error: "الرسالة مطلوبة" }, { status: 400 });
        }

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: "مفتاح API غير مفعّل" }, { status: 500 });
        }

        // ✅ بنجيب 40 منتج بس عشان السرعة ونوفر توكنز
        const { data: products, error: productsError } = await supabaseAdmin
            .from("products")
            .select("id, name, name_en, price, category, description, stock, colors")
            .gt("stock", 0) // نجيب المتوفر بس
            .limit(40);

        if (productsError || !products) {
            return NextResponse.json({ error: "فشل تحميل المنتجات" }, { status: 500 });
        }

        const productList = products
            .map((p) => {
                const colorsInfo =
                    p.colors && Array.isArray(p.colors) && p.colors.length > 0
                        ? ` | الألوان: ${p.colors.map((c: { name: string }) => c.name).join(", ")}`
                        : "";
                return `- ${p.name} (${p.name_en}): ${p.price} ج.م | التصنيف: ${p.category}${colorsInfo} | الوصف: ${p.description}`;
            })
            .join("\n");

        const prompt = `أنت مساعد تسوق ذكي في متجر Mood للملابس العصرية. اسمك "Mood Assistant".
مهمتك: تساعد الزوار في اختيار المنتجات المناسبة لاحتياجاتهم.

قواعد مهمة:
1. ردّ بالعربي دايماً (إلا لو الزائر سأل بالإنجليزي).
2. كن ودود ومختصر (2-4 جمل).
3. لما تقترح منتجات، اذكر الاسم والسعر.
4. لو المنتج غير متوفر، اقترح بديل قريب.
5. متخترعش منتجات مش في القائمة تحت.

قائمة المنتجات المتوفرة في المتجر:
${productList}

سؤال الزائر: ${message}

ردّك:`;

        // ✅ تم تصحيح اسم الموديل
        const result = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: prompt,
        });

        const response = result.text;

        return NextResponse.json({ reply: response });
    } catch (error) {
        console.error("Gemini API error:", error);
        return NextResponse.json(
            { error: "حصلت مشكلة في الاتصال. حاول تاني." },
            { status: 500 }
        );
    }
}