"use client";

import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [hasSession, setHasSession] = useState<boolean | null>(null);

    useEffect(() => {
        // Supabase بيحط التوكن في الـ URL hash
        // الـ SDK بيلقطه تلقائياً ويعمل session مؤقت
        const checkSession = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession();
            setHasSession(!!session);
        };

        checkSession();

        // نستمع لتغيير الحالة (لما الـ token يتطبق)
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === "PASSWORD_RECOVERY" || session) {
                setHasSession(true);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");

        if (password.length < 6) {
            setError("الباسورد لازم 6 أحرف على الأقل");
            return;
        }

        if (password !== confirmPassword) {
            setError("الباسوردين مش متطابقين");
            return;
        }

        setIsSubmitting(true);

        const { error: updateError } = await supabase.auth.updateUser({
            password,
        });

        if (updateError) {
            setError("حصلت مشكلة. حاول تاني.");
            setIsSubmitting(false);
            return;
        }

        setSuccess(true);
        setIsSubmitting(false);

        // بعد 2 ثانية، وديه على الصفحة الرئيسية
        setTimeout(() => {
            router.push("/account");
        }, 2000);
    };

    // Loading
    if (hasSession === null) {
        return (
            <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center">
                <p className="text-muted">جاري التحقق...</p>
            </div>
        );
    }

    // لو مفيش session صالح
    if (!hasSession) {
        return (
            <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center px-6 py-12 animate-fade-in">
                <div className="w-full max-w-md text-center">
                    <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-4">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="32"
                            height="32"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#EF4444"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-charcoal mb-3">
                        الرابط غير صالح
                    </h1>
                    <p className="text-muted mb-6">
                        الرابط ممكن يكون منتهي الصلاحية أو مستخدم من قبل.
                    </p>
                    <Link
                        href="/forgot-password"
                        className="inline-block bg-charcoal hover:bg-gold text-cream hover:text-charcoal font-semibold px-6 py-3 rounded-md transition-colors"
                    >
                        اطلب رابط جديد
                    </Link>
                </div>
            </div>
        );
    }

    // Success
    if (success) {
        return (
            <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center px-6 py-12 animate-fade-in">
                <div className="w-full max-w-md text-center">
                    <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="32"
                            height="32"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#10B981"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-charcoal mb-3">
                        تم تغيير الباسورد
                    </h1>
                    <p className="text-muted">جاري تحويلك لحسابك...</p>
                </div>
            </div>
        );
    }

    // Form
    return (
        <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center px-6 py-12 animate-fade-in">
            <div className="w-full max-w-md">
                <div className="text-center mb-8 animate-fade-up">
                    <p className="text-gold text-xs font-medium tracking-widest uppercase mb-2">
                        Reset Password
                    </p>
                    <h1 className="text-3xl font-bold text-charcoal mb-2">
                        باسورد جديد
                    </h1>
                    <p className="text-muted text-sm">
                        اكتب باسوردك الجديد
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="bg-white rounded-lg border border-charcoal/10 p-6 space-y-5 animate-fade-up"
                >
                    <div>
                        <label className="block text-sm font-medium text-charcoal mb-2">
                            الباسورد الجديد
                        </label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-md border border-charcoal/15 bg-white text-sm text-charcoal focus:outline-none focus:border-gold transition-colors"
                            placeholder="6 أحرف على الأقل"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-charcoal mb-2">
                            تأكيد الباسورد
                        </label>
                        <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-md border border-charcoal/15 bg-white text-sm text-charcoal focus:outline-none focus:border-gold transition-colors"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <div className="bg-error/10 text-error border border-error/30 rounded-md p-3 text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-charcoal hover:bg-gold text-cream hover:text-charcoal font-semibold h-12 rounded-md transition-colors disabled:opacity-50"
                    >
                        {isSubmitting ? "جاري الحفظ..." : "حفظ الباسورد الجديد"}
                    </button>
                </form>
            </div>
        </div>
    );
}