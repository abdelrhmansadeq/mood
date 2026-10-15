import { supabase } from "./supabase";

export type ContactMessage = {
    id: number;
    name: string;
    email: string;
    message: string;
    isRead: boolean;
    createdAt: string;
};

type SupabaseMessage = {
    id: number;
    name: string;
    email: string;
    message: string;
    is_read: boolean;
    created_at: string;
};

function toMessage(row: SupabaseMessage): ContactMessage {
    return {
        id: row.id,
        name: row.name,
        email: row.email,
        message: row.message,
        isRead: row.is_read,
        createdAt: row.created_at,
    };
}

// ✅ إرسال رسالة (من العميل)
export async function submitContactMessage(params: {
    name: string;
    email: string;
    message: string;
}): Promise<{ error?: string }> {
    try {
        const res = await fetch("/api/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(params),
        });

        const data = await res.json();

        if (!res.ok) {
            return { error: data.error || "حصلت مشكلة" };
        }

        return {};
    } catch (e) {
        console.error("submitContactMessage error:", e);
        return { error: "حصلت مشكلة في الاتصال" };
    }
}

// ✅ جلب الرسائل (للأدمن)
export async function fetchAllMessages(): Promise<ContactMessage[]> {
    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
        throw new Error("لازم تسجل دخول الأول");
    }

    const res = await fetch("/api/contact", {
        headers: {
            Authorization: `Bearer ${session.access_token}`,
        },
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error || "فشل تحميل الرسائل");
    }

    return (data.messages as SupabaseMessage[]).map(toMessage);
}