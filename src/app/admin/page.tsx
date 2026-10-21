"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "@/components/admin-context";
import Turnstile from "react-turnstile";

export default function AdminLoginPage() {
    const router = useRouter();
    const { isLoggedIn, isLoading, login } = useAdmin();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

    // ✅ 1. بديل الـ ref: بنستخدم key عشان نعمل Reset للكابتشا
    const [turnstileKey, setTurnstileKey] = useState(0);

    useEffect(() => {
        if (!isLoading && isLoggedIn) {
            router.push("/admin/dashboard");
        }
    }, [isLoading, isLoggedIn, router]);

    // ✅ 3. دالة مساعدة لتصفير الكابتشا
    const resetTurnstile = () => {
        setTurnstileKey((prev) => prev + 1);
        setTurnstileToken(null);
    };

    // ✅ 4. تغيير FormEvent لـ React.FormEvent عشان نشيل تحذير الـ Deprecated
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");

        if (!turnstileToken) {
            setError("يرجى إكمال التحقق من أنك لست روبوت.");
            return;
        }

        setIsSubmitting(true);

        try {
            const checkRes = await fetch("/api/admin/login-check", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ token: turnstileToken }),
            });

            if (!checkRes.ok) {
                const errorData = await checkRes.json();
                setError(errorData.error || "تم حظر المحاولات مؤقتاً.");
                setIsSubmitting(false);
                resetTurnstile(); // ✅ تصفير لو الـ API رفض
                return;
            }

            const result = await login(email, password);

            if (result.error) {
                setError(result.error);
                setIsSubmitting(false);
                resetTurnstile(); // ✅ تصفير لو الباسورد غلط
            } else {
                router.push("/admin/dashboard");
            }
        } catch {
            // ✅ 2. شيلنا المتغير (err) لحل مشكلة ESLint
            setError("حصلت مشكلة في الاتصال بالسيرفر.");
            setIsSubmitting(false);
            resetTurnstile();
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center">
                <p className="text-muted">جاري التحميل...</p>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center px-6 py-12">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <p className="text-gold text-xs font-medium tracking-widest uppercase mb-2">
                        Admin Panel
                    </p>
                    <h1 className="text-3xl font-bold text-charcoal mb-2">
                        تسجيل دخول الأدمن
                    </h1>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-charcoal/10 p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-charcoal mb-2">الإيميل</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-md border border-charcoal/15 bg-white text-sm text-charcoal focus:outline-none focus:border-gold transition-colors"
                            placeholder="admin@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-charcoal mb-2">الباسورد</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-md border border-charcoal/15 bg-white text-sm text-charcoal focus:outline-none focus:border-gold transition-colors"
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="flex justify-center py-2">
                        <Turnstile
                            key={turnstileKey} // ✅ السحر هنا: لما الـ key يتغير، الكابتشا هتتصفر
                            sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                            theme="auto"
                            language="ar"
                            onSuccess={(token) => {
                                setTurnstileToken(token);
                                setError("");
                            }}
                            onError={() => setError("فشل في تحميل الكابتشا، يرجى تحديث الصفحة.")}
                            onExpire={() => setTurnstileToken(null)}
                        />
                    </div>

                    {error && (
                        <div className="bg-error/10 text-error border border-error/30 rounded-md p-3 text-sm font-medium">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting || !turnstileToken}
                        className="w-full bg-charcoal hover:bg-gold text-cream hover:text-charcoal font-semibold h-12 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? "جاري التحقق..." : "تسجيل الدخول"}
                    </button>
                </form>
            </div>
        </div>
    );
}