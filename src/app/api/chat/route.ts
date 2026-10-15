import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function POST(request: Request) {
    try {
        const { message } = await request.json();

        if (!message || typeof message !== "string") {
            return NextResponse.json(
                { error: "الرسالة مطلوبة" },
                { status: 400 }
            );
        }

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json(
                { error: "مفتاح API غير مفعّل" },
                { status: 500 }
            );
        }

        // ✅ نجيب المنتجات من Supabase (مش من الكود)
        const { data: products, error: productsError } = await supabaseAdmin
            .from("products")
            .select("id, name, name_en, price, category, description, stock, colors")
            .order("id", { ascending: true });

        if (productsError || !products) {
            return NextResponse.json(
                { error: "فشل تحميل المنتجات" },
                { status: 500 }
            );
        }

        // نبني قايمة المنتجات للنموذج
        const productList = products
            .map((p) => {
                const stockInfo =
                    p.stock > 0 ? `متوفر (${p.stock} قطعة)` : "غير متوفر";
                const colorsInfo =
                    p.colors &&
                    Array.isArray(p.colors) &&
                    p.colors.length > 0
                        ? ` | الألوان: ${p.colors
                            .map((c: { name: string }) => c.name)
                            .join(", ")}`
                        : "";
                return `- ${p.name} (${p.name_en}): ${p.price} ج.م | التصنيف: ${p.category} | ${stockInfo}${colorsInfo} | الوصف: ${p.description}`;
            })
            .join("\n");

        const prompt = `أنت مساعد تسوق ذكي في متجر Mood للملابس العصرية. اسمك "Mood Assistant".
مهمتك: تساعد الزوار في اختيار المنتجات المناسبة لاحتياجاتهم.

قواعد مهمة:
1. ردّ بالعربي دايماً (إلا لو الزائر سأل بالإنجليزي).
2. كن ودود ومختصر (2-4 جمل).
3. لما تقترح منتجات، اذكر الاسم والسعر.
4. لو المنتج غير متوفر، اقترح بديل قريب.
5. لو الزائر سأل عن حاجة مش في المتجر، اعتذر بلطف واقترح حاجة موجودة.
6. متخترعش منتجات مش في القائمة تحت.

قائمة المنتجات المتوفرة في المتجر:
${productList}

سؤال الزائر: ${message}

ردّك:`;

        const result = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: prompt,
            config: {
                thinkingConfig: {
                    thinkingBudget: 0,
                },
            },
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