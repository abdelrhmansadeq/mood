import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { products } from "@/data/products";

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

        const productList = products
            .map(
                (p) =>
                    `- ${p.name} (${p.nameEn}): ${p.price} ج.م | التصنيف: ${p.category} | الوصف: ${p.description}`
            )
            .join("\n");

        const prompt = `أنت مساعد تسوق ذكي في متجر Mood للملابس العصرية. اسمك "Mood Assistant".
مهمتك: تساعد الزوار في اختيار المنتجات المناسبة لاحتياجاتهم.

قواعد مهمة:
1. ردّ بالعربي دايماً (إلا لو الزائر سأل بالإنجليزي).
2. كن ودود ومختصر (2-4 جمل).
3. لما تقترح منتجات، اذكر الاسم والسعر.
4. لو مفيش منتج مناسب، اقترح بديل قريب.
5. لو الزائر سأل عن حاجة مش في المتجر، اعتذر بلطف واقترح حاجة موجودة.
6. متخترعش منتجات مش في القائمة تحت.

قائمة المنتجات المتوفرة في المتجر:
${productList}

سؤال الزائر: ${message}

ردّك:`;

        const result = await ai.models.generateContent({
            model: "gemini-flash-latest",
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