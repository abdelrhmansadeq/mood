"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { FormEvent } from "react";
import { useAuth } from "@/components/auth-context";

function LoginForm() {
    const searchParams = useSearchParams();
    const nextUrl = searchParams.get("next") || "/account";
    const { signIn } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        const { error: signInError } = await signIn(email, password);

        if (signInError) {
            setError("الإيميل أو الباسورد غلط");
            setIsLoading(false);
        } else {
            window.location.href = nextUrl;
        }
    };

    return (
        <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center px-4 sm:px-6 py-10 md:py-12 animate-fade-in">
            <div className="w-full max-w-md">
                <div className="text-center mb-8 md:mb-10 animate-fade-up">
                    <p className="text-gold text-[10px] md:text-xs font-bold tracking-widest uppercase mb-2">
                        Welcome Back
                    </p>
                    <h1 className="text-3xl md:text-4xl font-bold text-charcoal mb-2">
                        تسجيل الدخول
                    </h1>
                    <p className="text-muted text-sm md:text-base">أهلاً بيك في Mood تاني</p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="bg-white rounded-2xl md:rounded-xl border border-charcoal/10 p-5 md:p-8 space-y-5 animate-fade-up shadow-sm md:shadow-none"
                >
                    <div>
                        <label className="block text-sm font-medium text-charcoal mb-2">
                            الإيميل
                        </label>
                        <div className="relative">
                            <input
                                type="email"
                                required
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-4 ps-11 rounded-xl md:rounded-lg border border-charcoal/15 bg-cream md:bg-white text-base md:text-sm text-charcoal focus:outline-none focus:border-gold transition-colors"
                                placeholder="you@example.com"
                            />
                            <svg className="absolute top-1/2 -translate-y-1/2 start-3.5 w-5 h-5 text-muted" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                            </svg>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-charcoal">
                                الباسورد
                            </label>
                            <Link
                                href="/forgot-password"
                                className="text-xs text-gold hover:underline font-medium"
                            >
                                نسيت الباسورد؟
                            </Link>
                        </div>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-4 ps-11 pe-11 rounded-xl md:rounded-lg border border-charcoal/15 bg-cream md:bg-white text-base md:text-sm text-charcoal focus:outline-none focus:border-gold transition-colors"
                                placeholder="••••••••"
                            />
                            <svg className="absolute top-1/2 -translate-y-1/2 start-3.5 w-5 h-5 text-muted" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>

                            {/* ✅ زرار إظهار/إخفاء الباسورد */}
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute top-1/2 -translate-y-1/2 end-3.5 p-1 text-muted hover:text-charcoal transition-colors"
                                aria-label={showPassword ? "إخفاء الباسورد" : "إظهار الباسورد"}
                            >
                                {showPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-error/10 text-error border border-error/30 rounded-lg p-3 text-sm font-medium animate-fade-in">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-charcoal hover:bg-gold text-cream hover:text-charcoal font-bold h-14 rounded-xl md:rounded-lg transition-colors disabled:opacity-50 mt-2 shadow-md md:shadow-none"
                    >
                        {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
                    </button>
                </form>

                <p className="text-center text-sm text-muted mt-8">
                    معندكش حساب؟{" "}
                    <Link href="/signup" className="text-gold font-bold hover:underline">
                        سجل دلوقتي
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted">جاري التحميل...</div>}>
            <LoginForm />
        </Suspense>
    );
}