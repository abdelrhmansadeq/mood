import { createBrowserClient } from "@supabase/ssr";

// ✅ استخدام createBrowserClient عشان يحفظ الجلسة في الكوكيز بدل الـ localStorage
export const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);