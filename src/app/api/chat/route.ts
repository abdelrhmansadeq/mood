import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { chatRatelimit } from "@/lib/rate-limit"; // ✅ ضفنا الحماية

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function POST(request: Request) {
    try {
        // ✅ تطبيق الحماية
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
            .neq("is_deleted", true) // ✅ بنجيب المنتجات اللي مش محذوفة
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

        const formattedHistory = (history || []).map((msg: { role: string; content: string }) => ({
            role: msg.role === "assistant" ? "model" : "user",
            parts: [{ text: msg.content }]
        }));

        formattedHistory.push({
            role: "user",
            parts: [{ text: message }]
        });

        const result = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: formattedHistory,
            config: {
                systemInstruction: systemPrompt,
            }
        });

        if (!result || !result.text) {
            throw new Error("لم يتم استلام رد من الذكاء الاصطناعي");
        }

        return NextResponse.json({ reply: result.text });
    } catch (error: any) {
        console.error("Gemini API error:", error);
        return NextResponse.json(
            { error: `مشكلة في الـ AI: ${error.message || "تأكد من الـ API Key"}` },
            { status: 500 }
        );
    }
}