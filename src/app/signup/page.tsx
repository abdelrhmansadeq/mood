"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useAuth } from "@/components/auth-context";
import GoogleLoginButton from "@/components/google-login-button";

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
    const [signedUpEmail, setSignedUpEmail] = useState("");

    useEffect(() => {
        if (user) router.push("/account");
    }, [user, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
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
            setSignedUpEmail(formData.email);
            setIsLoading(false);
        }
    };

    if (signedUpEmail) {
        return (
            <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center px-6 py-12 animate-fade-in">
                <div className="w-full max-w-md text-center">
                    <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6 animate-fade-up">
                        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                            <polyline points="22,6 12,13 2,6" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-charcoal mb-3 animate-fade-up">تم إنشاء حسابك! 🎉</h1>
                    <p className="text-charcoal/70 leading-relaxed mb-2 animate-fade-up">بعتنا لك إيميل تأكيد على:</p>
                    <p className="text-gold font-bold mb-6 animate-fade-up" dir="ltr">{signedUpEmail}</p>
                    <div className="bg-white rounded-lg border border-charcoal/10 p-5 text-right mb-6 animate-fade-up">
                        <p className="text-sm text-charcoal/80 mb-3 font-medium">خطواتك الجاية:</p>
                        <ol className="text-sm text-charcoal/70 space-y-2 pr-4">
                            <li>1. افتح إيميلك</li>
                            <li>2. اضغط على لينك التأكيد</li>
                            <li>3. ارجع هنا وسجل دخولك</li>
                        </ol>
                    </div>
                    <p className="text-xs text-muted mb-6 animate-fade-up">ملاحظة: لو مش لاقي الإيميل، افحص مجلد Spam أو Promotions.</p>
                    <div className="flex flex-col gap-3 animate-fade-up">
                        <Link href="/login" className="w-full bg-charcoal hover:bg-gold text-cream hover:text-charcoal font-semibold h-12 rounded-md transition-colors flex items-center justify-center">عندي حساب - سجل دخول</Link>
                        <Link href="/products" className="w-full border border-charcoal/15 hover:border-charcoal/30 text-charcoal font-medium h-12 rounded-md transition-colors flex items-center justify-center">تسوق دلوقتي</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center px-6 py-12 animate-fade-in">
            <div className="w-full max-w-md">
                <div className="text-center mb-8 animate-fade-up">
                    <p className="text-gold text-xs font-medium tracking-widest uppercase mb-2">Join Us</p>
                    <h1 className="text-3xl font-bold text-charcoal mb-2">إنشاء حساب</h1>
                    <p className="text-muted text-sm">انضم لعيلة Mood</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-charcoal/10 p-6 space-y-4 animate-fade-up">
                    <div>
                        <label className="block text-sm font-medium text-charcoal mb-2">الاسم الكامل *</label>
                        <input type="text" name="fullName" required value={formData.fullName} onChange={handleChange} className="w-full px-4 py-3 rounded-md border border-charcoal/15 bg-white text-sm text-charcoal focus:outline-none focus:border-gold transition-colors" placeholder="محمد أحمد" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-charcoal mb-2">الإيميل *</label>
                        <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full px-4 py-3 rounded-md border border-charcoal/15 bg-white text-sm text-charcoal focus:outline-none focus:border-gold transition-colors" placeholder="you@example.com" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-charcoal mb-2">رقم التليفون *</label>
                        <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 rounded-md border border-charcoal/15 bg-white text-sm text-charcoal focus:outline-none focus:border-gold transition-colors" placeholder="+20 100 000 0000" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-charcoal mb-2">الباسورد *</label>
                        <input type="password" name="password" required value={formData.password} onChange={handleChange} className="w-full px-4 py-3 rounded-md border border-charcoal/15 bg-white text-sm text-charcoal focus:outline-none focus:border-gold transition-colors" placeholder="6 أحرف على الأقل" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-charcoal mb-2">تأكيد الباسورد *</label>
                        <input type="password" name="confirmPassword" required value={formData.confirmPassword} onChange={handleChange} className="w-full px-4 py-3 rounded-md border border-charcoal/15 bg-white text-sm text-charcoal focus:outline-none focus:border-gold transition-colors" placeholder="••••••••" />
                    </div>

                    {error && <div className="bg-error/10 text-error border border-error/30 rounded-md p-3 text-sm">{error}</div>}

                    <button type="submit" disabled={isLoading} className="w-full bg-charcoal hover:bg-gold text-cream hover:text-charcoal font-semibold h-12 rounded-md transition-colors disabled:opacity-50">
                        {isLoading ? "جاري التسجيل..." : "إنشاء الحساب"}
                    </button>
                </form>

                <GoogleLoginButton />

                <p className="text-center text-sm text-muted mt-6">
                    عندك حساب بالفعل؟ <Link href="/login" className="text-gold font-medium hover:underline">سجل دخول</Link>
                </p>
            </div>
        </div>
    );
}