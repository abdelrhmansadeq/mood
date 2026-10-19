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
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

    // ✅ صفحة النجاح (تم تحسينها للموبايل)
    if (signedUpEmail) {
        return (
            <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center px-4 sm:px-6 py-10 md:py-12 animate-fade-in">
                <div className="w-full max-w-md text-center">
                    <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6 animate-fade-up">
                        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                            <polyline points="22,6 12,13 2,6" />
                        </svg>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-charcoal mb-3 animate-fade-up">تم إنشاء حسابك! 🎉</h1>
                    <p className="text-charcoal/70 text-sm md:text-base leading-relaxed mb-2 animate-fade-up">بعتنا لك إيميل تأكيد على:</p>
                    <p className="text-gold font-bold text-lg mb-6 animate-fade-up" dir="ltr">{signedUpEmail}</p>

                    <div className="bg-white rounded-2xl border border-charcoal/10 p-5 text-right mb-6 animate-fade-up shadow-sm">
                        <p className="text-sm text-charcoal/80 mb-3 font-bold">خطواتك الجاية:</p>
                        <ol className="text-sm text-charcoal/70 space-y-3 pr-2">
                            <li className="flex items-center gap-3"><span className="w-6 h-6 rounded-full bg-cream flex items-center justify-center text-xs font-bold text-charcoal">1</span> افتح إيميلك</li>
                            <li className="flex items-center gap-3"><span className="w-6 h-6 rounded-full bg-cream flex items-center justify-center text-xs font-bold text-charcoal">2</span> اضغط على لينك التأكيد</li>
                            <li className="flex items-center gap-3"><span className="w-6 h-6 rounded-full bg-cream flex items-center justify-center text-xs font-bold text-charcoal">3</span> ارجع هنا وسجل دخولك</li>
                        </ol>
                    </div>

                    <p className="text-xs text-muted mb-6 animate-fade-up">ملاحظة: لو مش لاقي الإيميل، افحص مجلد Spam أو Promotions.</p>

                    <div className="flex flex-col gap-3 animate-fade-up">
                        <Link href="/login" className="w-full bg-charcoal hover:bg-gold text-cream hover:text-charcoal font-bold h-14 rounded-xl transition-colors flex items-center justify-center shadow-md">عندي حساب - سجل دخول</Link>
                        <Link href="/products" className="w-full bg-white border border-charcoal/15 hover:border-charcoal/30 text-charcoal font-bold h-14 rounded-xl transition-colors flex items-center justify-center">تسوق دلوقتي</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center px-4 sm:px-6 py-10 md:py-12 animate-fade-in">
            <div className="w-full max-w-md">
                <div className="text-center mb-8 md:mb-10 animate-fade-up">
                    <p className="text-gold text-[10px] md:text-xs font-bold tracking-widest uppercase mb-2">Join Us</p>
                    <h1 className="text-3xl md:text-4xl font-bold text-charcoal mb-2">إنشاء حساب</h1>
                    <p className="text-muted text-sm md:text-base">انضم لعيلة Mood</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-2xl md:rounded-xl border border-charcoal/10 p-5 md:p-8 space-y-4 animate-fade-up shadow-sm md:shadow-none">

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-charcoal mb-2">الاسم الكامل *</label>
                        <div className="relative">
                            <input type="text" name="fullName" required value={formData.fullName} onChange={handleChange} className="w-full px-4 py-4 ps-11 rounded-xl md:rounded-lg border border-charcoal/15 bg-cream md:bg-white text-base md:text-sm text-charcoal focus:outline-none focus:border-gold transition-colors" placeholder="محمد أحمد" />
                            <svg className="absolute top-1/2 -translate-y-1/2 start-3.5 w-5 h-5 text-muted" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-charcoal mb-2">الإيميل *</label>
                        <div className="relative">
                            <input type="email" name="email" required autoComplete="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-4 ps-11 rounded-xl md:rounded-lg border border-charcoal/15 bg-cream md:bg-white text-base md:text-sm text-charcoal focus:outline-none focus:border-gold transition-colors" placeholder="you@example.com" />
                            <svg className="absolute top-1/2 -translate-y-1/2 start-3.5 w-5 h-5 text-muted" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                        </div>
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-medium text-charcoal mb-2">رقم التليفون *</label>
                        <div className="relative">
                            <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className="w-full px-4 py-4 ps-11 rounded-xl md:rounded-lg border border-charcoal/15 bg-cream md:bg-white text-base md:text-sm text-charcoal focus:outline-none focus:border-gold transition-colors" placeholder="01xxxxxxxxx" />
                            <svg className="absolute top-1/2 -translate-y-1/2 start-3.5 w-5 h-5 text-muted" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-charcoal mb-2">الباسورد *</label>
                        <div className="relative">
                            <input type={showPassword ? "text" : "password"} name="password" required value={formData.password} onChange={handleChange} className="w-full px-4 py-4 ps-11 pe-11 rounded-xl md:rounded-lg border border-charcoal/15 bg-cream md:bg-white text-base md:text-sm text-charcoal focus:outline-none focus:border-gold transition-colors" placeholder="6 أحرف على الأقل" />
                            <svg className="absolute top-1/2 -translate-y-1/2 start-3.5 w-5 h-5 text-muted" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute top-1/2 -translate-y-1/2 end-3.5 p-1 text-muted hover:text-charcoal transition-colors">
                                {showPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-medium text-charcoal mb-2">تأكيد الباسورد *</label>
                        <div className="relative">
                            <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" required value={formData.confirmPassword} onChange={handleChange} className="w-full px-4 py-4 ps-11 pe-11 rounded-xl md:rounded-lg border border-charcoal/15 bg-cream md:bg-white text-base md:text-sm text-charcoal focus:outline-none focus:border-gold transition-colors" placeholder="••••••••" />
                            <svg className="absolute top-1/2 -translate-y-1/2 start-3.5 w-5 h-5 text-muted" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute top-1/2 -translate-y-1/2 end-3.5 p-1 text-muted hover:text-charcoal transition-colors">
                                {showConfirmPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {error && <div className="bg-error/10 text-error border border-error/30 rounded-lg p-3 text-sm font-medium animate-fade-in">{error}</div>}

                    <button type="submit" disabled={isLoading} className="w-full bg-charcoal hover:bg-gold text-cream hover:text-charcoal font-bold h-14 rounded-xl md:rounded-lg transition-colors disabled:opacity-50 mt-2 shadow-md md:shadow-none">
                        {isLoading ? "جاري التسجيل..." : "إنشاء الحساب"}
                    </button>
                </form>

                <p className="text-center text-sm text-muted mt-8">
                    عندك حساب بالفعل؟ <Link href="/login" className="text-gold font-bold hover:underline">سجل دخول</Link>
                </p>
            </div>
        </div>
    );
}