"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);

        const { error: resetError } = await supabase.auth.resetPasswordForEmail(
            email,
            {
                redirectTo: `${window.location.origin}/reset-password`,
            }
        );

        if (resetError) {
            setError("حصلت مشكلة. تأكد من الإيميل وحاول تاني.");
            setIsSubmitting(false);
            return;
        }

        setSent(true);
        setIsSubmitting(false);
    };

    return (
        <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center px-6 py-12 animate-fade-in">
            <div className="w-full max-w-md">
                <div className="text-center mb-8 animate-fade-up">
                    <p className="text-gold text-xs font-medium tracking-widest uppercase mb-2">
                        Forgot Password
                    </p>
                    <h1 className="text-3xl font-bold text-charcoal mb-2">
                        نسيت الباسورد؟
                    </h1>
                    <p className="text-muted text-sm">
                        اكتب إيميلك وهنبعتلك لينك لإعادة التعيين
                    </p>
                </div>

                {sent ? (
                    <div className="bg-white rounded-lg border border-success/30 p-6 text-center animate-fade-up">
                        <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="28"
                                height="28"
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
                        <h2 className="text-lg font-bold text-charcoal mb-2">
                            تم إرسال الإيميل
                        </h2>
                        <p className="text-sm text-muted mb-6">
                            تفقد بريدك الإلكتروني (<span dir="ltr">{email}</span>) واضغط على
                            اللينك لإعادة تعيين الباسورد.
                        </p>
                        <Link
                            href="/login"
                            className="inline-block text-gold font-medium text-sm hover:underline"
                        >
                            رجوع لتسجيل الدخول
                        </Link>
                    </div>
                ) : (
                    <form
                        onSubmit={handleSubmit}
                        className="bg-white rounded-lg border border-charcoal/10 p-6 space-y-5 animate-fade-up"
                    >
                        <div>
                            <label className="block text-sm font-medium text-charcoal mb-2">
                                الإيميل
                            </label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-md border border-charcoal/15 bg-white text-sm text-charcoal focus:outline-none focus:border-gold transition-colors"
                                placeholder="you@example.com"
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
                            {isSubmitting ? "جاري الإرسال..." : "إرسال لينك إعادة التعيين"}
                        </button>

                        <p className="text-center text-sm text-muted pt-2 border-t border-charcoal/10">
                            فاكر الباسورد؟{" "}
                            <Link
                                href="/login"
                                className="text-gold font-medium hover:underline"
                            >
                                سجل دخول
                            </Link>
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
}