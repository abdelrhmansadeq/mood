"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "@/components/admin-context";

export default function AdminLoginPage() {
    const router = useRouter();
    const { isLoggedIn, login } = useAdmin();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (isLoggedIn) router.push("/admin/dashboard");
    }, [isLoggedIn, router]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const success = login(email, password);
        if (success) {
            router.push("/admin/dashboard");
        } else {
            setError("الإيميل أو الباسورد غلط");
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 py-12">
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
                            placeholder="admin@mood.com"
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
                        className="w-full bg-charcoal hover:bg-gold text-cream hover:text-charcoal font-semibold h-12 rounded-md transition-colors"
                    >
                        تسجيل الدخول
                    </button>

                    <p className="text-xs text-muted text-center pt-2 border-t border-charcoal/10">
                        للتجربة: admin@mood.com / admin123
                    </p>
                </form>
            </div>
        </div>
    );
}