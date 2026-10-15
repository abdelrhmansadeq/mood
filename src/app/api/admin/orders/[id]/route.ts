import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

type Props = {
    params: Promise<{ id: string }>;
};

const VALID_STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

export async function PATCH(request: Request, { params }: Props) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { status } = body;

        if (!status || !VALID_STATUSES.includes(status)) {
            return NextResponse.json(
                { error: "حالة غير صحيحة" },
                { status: 400 }
            );
        }

        const { error } = await supabaseAdmin
            .from("orders")
            .update({ status })
            .eq("id", Number(id));

        if (error) {
            console.error("Error updating order:", error);
            return NextResponse.json(
                { error: "فشل تحديث الطلب" },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("API error:", error);
        return NextResponse.json(
            { error: "حصلت مشكلة في السيرفر" },
            { status: 500 }
        );
    }
}