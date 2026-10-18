import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email || typeof email !== "string") {
            return NextResponse.json({ error: "الإيميل مطلوب" }, { status: 400 });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({ error: "الإيميل غير صحيح" }, { status: 400 });
        }

        const { error } = await supabaseAdmin
            .from("subscribers")
            .insert({ email: email.toLowerCase().trim() });

        if (error) {
            if (error.code === "23505") { // Unique violation
                return NextResponse.json({ error: "الإيميل ده مشترك بالفعل" }, { status: 400 });
            }
            throw error;
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Newsletter error:", error);
        return NextResponse.json({ error: "حصلت مشكلة، حاول تاني" }, { status: 500 });
    }
}