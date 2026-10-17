"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useAuth } from "@/components/auth-context";
import GoogleLoginButton from "@/components/google-login-button";

export default function LoginPage() {
    const router = useRouter();
    const { user, signIn } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (user) router.push("/account");
    }, [user, router]);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        const { error: signInError } = await signIn(email, password);

        if (signInError) {
            setError("الإيميل أو الباسورد غلط");
            setIsLoading(false);
        } else {
            router.push("/account");
        }
    };

    return (
        <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center px-6 py-12 animate-fade-in">
            <div className="w-full max-w-md">
                <div className="text-center mb-8 animate-fade-up">
                    <p className="text-gold text-xs font-medium tracking-widest uppercase mb-2">
                        Welcome Back
                    </p>
                    <h1 className="text-3xl font-bold text-charcoal mb-2">
                        تسجيل الدخول
                    </h1>
                    <p className="text-muted text-sm">أهلاً بيك في Mood تاني</p>
                </div>

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
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
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
                        disabled={isLoading}
                        className="w-full bg-charcoal hover:bg-gold text-cream hover:text-charcoal font-semibold h-12 rounded-md transition-colors disabled:opacity-50"
                    >
                        {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
                    </button>
                </form>

                <GoogleLoginButton />

                <p className="text-center text-sm text-muted mt-6">
                    معندكش حساب؟{" "}
                    <Link href="/signup" className="text-gold font-medium hover:underline">
                        سجل دلوقتي
                    </Link>
                </p>
            </div>
        </div>
    );
}