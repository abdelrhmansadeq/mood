import { supabase } from "./supabase";

export type ContactMessage = {
    id: number;
    name: string;
    email: string;
    message: string;
    isRead: boolean;
    isVerified: boolean;
    userId: string | null;
    createdAt: string;
    verifiedAt: string | null;
};

type SupabaseMessage = {
    id: number;
    name: string;
    email: string;
    message: string;
    is_read: boolean;
    is_verified: boolean;
    user_id: string | null;
    created_at: string;
    verified_at: string | null;
};

function toMessage(row: SupabaseMessage): ContactMessage {
    return {
        id: row.id,
        name: row.name,
        email: row.email,
        message: row.message,
        isRead: row.is_read,
        isVerified: row.is_verified,
        userId: row.user_id,
        createdAt: row.created_at,
        verifiedAt: row.verified_at,
    };
}

// ✅ إرسال رسالة
export async function submitContactMessage(params: {
    name: string;
    email: string;
    message: string;
    honeypot?: string;
}): Promise<{ error?: string; requiresVerification?: boolean }> {
    try {
        const {
            data: { session },
        } = await supabase.auth.getSession();

        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };

        if (session) {
            headers.Authorization = `Bearer ${session.access_token}`;
        }

        const res = await fetch("/api/contact", {
            method: "POST",
            headers,
            body: JSON.stringify(params),
        });

        const data = await res.json();

        if (!res.ok) {
            return { error: data.error || "حصلت مشكلة" };
        }

        return {
            requiresVerification: data.requiresVerification === true,
        };
    } catch (e) {
        console.error("submitContactMessage error:", e);
        return { error: "حصلت مشكلة في الاتصال" };
    }
}

// ✅ جلب الرسائل الموثقة فقط (للأدمن)
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

// ✅ إضافة دالة تحويل الرسالة لمقروءة (جديد)
export async function markMessageAsRead(messageId: number): Promise<{ error?: string }> {
    try {
        const {
            data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
            return { error: "لازم تسجل دخول الأول" };
        }

        const res = await fetch("/api/contact", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ messageId }),
        });

        const data = await res.json();

        if (!res.ok) {
            return { error: data.error || "حصلت مشكلة" };
        }

        return {};
    } catch (e) {
        console.error("markMessageAsRead error:", e);
        return { error: "حصلت مشكلة في الاتصال" };
    }
}