"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useAuth } from "@/components/auth-context";

export default function SignupPage() {
    const router = useRouter();
    const { user, signUp } = useAuth();
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
    });
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (user) router.push("/account");
    }, [user, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");

        if (formData.password.length < 6) {
            setError("الباسورد لازم 6 أحرف على الأقل");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("الباسوردين مش متطابقين");
            return;
        }

        setIsLoading(true);

        const { error: signUpError } = await signUp(
            formData.email,
            formData.password,
            formData.fullName,
            formData.phone
        );

        if (signUpError) {
            setError(signUpError);
            setIsLoading(false);
        } else {
            router.push("/account");
        }
    };

    return (
        <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center px-6 py-12">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <p className="text-gold text-xs font-medium tracking-widest uppercase mb-2">
                        Join Us
                    </p>
                    <h1 className="text-3xl font-bold text-charcoal mb-2">إنشاء حساب</h1>
                    <p className="text-muted text-sm">انضم لعيلة Mood</p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="bg-white rounded-lg border border-charcoal/10 p-6 space-y-4"
                >
                    <div>
                        <label className="block text-sm font-medium text-charcoal mb-2">
                            الاسم الكامل *
                        </label>
                        <input
                            type="text"
                            name="fullName"
                            required
                            value={formData.fullName}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-md border border-charcoal/15 bg-white text-sm text-charcoal focus:outline-none focus:border-gold transition-colors"
                            placeholder="محمد أحمد"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-charcoal mb-2">
                            الإيميل *
                        </label>
                        <input
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-md border border-charcoal/15 bg-white text-sm text-charcoal focus:outline-none focus:border-gold transition-colors"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-charcoal mb-2">
                            رقم التليفون *
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            required
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-md border border-charcoal/15 bg-white text-sm text-charcoal focus:outline-none focus:border-gold transition-colors"
                            placeholder="+20 100 000 0000"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-charcoal mb-2">
                            الباسورد *
                        </label>
                        <input
                            type="password"
                            name="password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-md border border-charcoal/15 bg-white text-sm text-charcoal focus:outline-none focus:border-gold transition-colors"
                            placeholder="6 أحرف على الأقل"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-charcoal mb-2">
                            تأكيد الباسورد *
                        </label>
                        <input
                            type="password"
                            name="confirmPassword"
                            required
                            value={formData.confirmPassword}
                            onChange={handleChange}
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
                        {isLoading ? "جاري التسجيل..." : "إنشاء الحساب"}
                    </button>
                </form>

                <p className="text-center text-sm text-muted mt-6">
                    عندك حساب بالفعل؟{" "}
                    <Link href="/login" className="text-gold font-medium hover:underline">
                        سجل دخول
                    </Link>
                </p>
            </div>
        </div>
    );
}