import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function POST(request: Request) {
    try {
        const { occasion, vibe } = await request.json();

        if (!occasion || !vibe) {
            return NextResponse.json(
                { error: "المناسبة والستايل مطلوبين" },
                { status: 400 }
            );
        }

        // 1. نجيب المنتجات المتاحة (بس اللي في المخزون)
        const { data: products, error } = await supabaseAdmin
            .from("products")
            .select("id, name, category, price, colors")
            .gt("stock", 0)
            .limit(50); // بنجيب 50 منتج عشان نوفر توكنز

        if (error || !products) {
            return NextResponse.json(
                { error: "فشل تحميل المنتجات" },
                { status: 500 }
            );
        }

        // 2. نجهز قائمة المنتجات للـ AI
        const productList = products
            .map(
                (p) =>
                    `ID: ${p.id} | Name: ${p.name} | Category: ${p.category} | Price: ${p.price} EGP`
            )
            .join("\n");

        // 3. البرومبت (Prompt Engineering)
        const prompt = `أنت خبير أزياء (Fashion Stylist) في متجر "Mood".
مهمتك: تصميم 3 لووكات (Outfits) كاملة بناءً على طلب العميل، باستخدام المنتجات المتاحة فقط.

طلب العميل:
- المناسبة: ${occasion}
- الستايل المفضل: ${vibe}

قائمة المنتجات المتاحة (استخدم الـ ID بتاعها عشان أضيفها للسلة):
${productList}

قواعد صارمة:
1. كل لووك لازم يحتوي على (قطعة علوي + قطعة سفلي + حذاء/إكسسوار) إذا كان متاحاً.
2. متخترعش منتجات مش في القائمة.
3. ارجع النتيجة بتنسيق JSON فقط (بدون أي كلام إضافي أو Markdown).
4. الشكل المطلوب:
{
  "outfits": [
    {
      "title": "اسم اللوك (مثلاً: الكاجوال الأنيق)",
      "reason": "ليه اللوك ده مناسب للعميل (جملة واحدة)",
      "items": [
        { "id": 1, "name": "اسم المنتج", "category": "التصنيف" }
      ]
    }
  ]
}`;

        // 4. نطلب من Gemini يرد بـ JSON
        const result = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json", // ✅ إجبار الـ AI يرد بـ JSON
            },
        });

        const responseText = result.text;
        if (!responseText) {
            throw new Error("Empty response from AI");
        }

        // 5. نحوّل النص لـ JSON ونبعته للفرونت إند
        const aiData = JSON.parse(responseText);

        return NextResponse.json({ success: true, data: aiData });
    } catch (error) {
        console.error("AI Stylist error:", error);
        return NextResponse.json(
            { error: "حصلت مشكلة في توليد اللوك. جرب تاني." },
            { status: 500 }
        );
    }
}