import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { chatRatelimit } from "@/lib/rate-limit";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function POST(request: Request) {
    try {
        const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
        const { success } = await chatRatelimit.limit(ip);
        if (!success) {
            return NextResponse.json({ error: "بعت رسائل كتير جداً، استنى دقيقة وجرب تاني." }, { status: 429 });
        }

        const { message, history } = await request.json();

        if (!message || typeof message !== "string") {
            return NextResponse.json({ error: "الرسالة مطلوبة" }, { status: 400 });
        }

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: "مفتاح API غير مفعّل" }, { status: 500 });
        }

        const { data: products, error: productsError } = await supabaseAdmin
            .from("products")
            .select("id, name, name_en, price, category, description, stock, colors")
            .neq("is_deleted", true)
            .gt("stock", 0)
            .limit(40);

        if (productsError || !products) {
            return NextResponse.json({ error: "فشل تحميل المنتجات" }, { status: 500 });
        }

        const productList = products
            .map((p) => {
                const colorsInfo = p.colors && Array.isArray(p.colors) && p.colors.length > 0
                    ? ` | الألوان: ${p.colors.map((c: { name: string }) => c.name).join(", ")}`
                    : "";
                return `- ${p.name} (${p.name_en}): ${p.price} ج.م | التصنيف: ${p.category}${colorsInfo}`;
            })
            .join("\n");

        const systemPrompt = `أنت مساعد تسوق ذكي في متجر Mood للملابس. اسمك "Mood Assistant".
مهمتك: مساعدة الزوار في اختيار المنتجات.
قواعد: رد بالعربي، كن مختصر (2-3 جمل)، اذكر الاسم والسعر.
المنتجات المتاحة:
${productList}`;

        const safeHistory = Array.isArray(history) ? history.slice(-10) : [];

        const formattedHistory = safeHistory.map((msg: { role: string; content: string }) => ({
            role: msg.role === "assistant" ? "model" : "user",
            parts: [{ text: msg.content }]
        }));

        formattedHistory.push({
            role: "user",
            parts: [{ text: message }]
        });

        const result = await ai.models.generateContent({
            model: "gemini-3.6-flash", // ✅ تركناها زي ما هي
            contents: formattedHistory,
            config: {
                systemInstruction: systemPrompt,
            }
        });

        // ✅ إصلاح 1: بدل ما نرمي Error، بنرجع Response مباشرة
        if (!result || !result.text) {
            return NextResponse.json(
                { error: "حدث خطأ في الاتصال بالمساعد الذكي. يرجى المحاولة لاحقاً." },
                { status: 500 }
            );
        }

        return NextResponse.json({ reply: result.text });
    } catch (error: unknown) { // ✅ إصلاح 2: غيرنا any لـ unknown
        console.error("Gemini API error:", error);
        return NextResponse.json(
            { error: "حدث خطأ في الاتصال بالمساعد الذكي. يرجى المحاولة لاحقاً." },
            { status: 500 }
        );
    }
}