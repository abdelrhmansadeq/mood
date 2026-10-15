"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useAdmin } from "@/components/admin-context";

export default function AdminLoginPage() {
    const router = useRouter();
    const { isLoggedIn, isLoading, login } = useAdmin();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isLoading && isLoggedIn) {
            router.push("/admin/dashboard");
        }
    }, [isLoggedIn, isLoading, router]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);

        const result = await login(email, password);

        if (result.error) {
            setError(result.error);
            setIsSubmitting(false);
        } else {
            router.push("/admin/dashboard");
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
                    <p className="text-muted text-sm">
                        لوحة التحكم في متجر Mood
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="bg-white rounded-lg border border-charcoal/10 p-6 space-y-5"
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
                            placeholder="admin@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-charcoal mb-2">
                            الباسورد
                        </label>
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
                        disabled={isSubmitting}
                        className="w-full bg-charcoal hover:bg-gold text-cream hover:text-charcoal font-semibold h-12 rounded-md transition-colors disabled:opacity-50"
                    >
                        {isSubmitting ? "جاري التحقق..." : "تسجيل الدخول"}
                    </button>
                </form>
            </div>
        </div>
    );
}