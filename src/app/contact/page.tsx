"use client";

import { useState, useEffect } from "react";
import type { ChangeEvent, FormEvent } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth-context";
import { submitContactMessage } from "@/lib/contact-api";

export default function ContactPage() {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: "",
    });
    const [sent, setSent] = useState(false);
    const [requiresVerification, setRequiresVerification] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    // Auto-fill للعملاء المسجلين
    useEffect(() => {
        if (user) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setFormData((prev) => ({
                ...prev,
                name: user.user_metadata?.full_name || prev.name,
                email: user.email || prev.email,
            }));
        }
    }, [user]);

    const handleChange = (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError("");
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);

        const result = await submitContactMessage({
            name: formData.name,
            email: formData.email,
            message: formData.message,
        });

        if (result.error) {
            setError(result.error);
            setIsSubmitting(false);
            return;
        }

        if (result.requiresVerification) {
            setRequiresVerification(true);
        } else {
            setSent(true);
        }

        setFormData({ name: user?.user_metadata?.full_name || "", email: user?.email || "", message: "" });
        setIsSubmitting(false);
    };

    const contactInfo = [
        { label: "التليفون", value: "01014766903" },
        { label: "الإيميل", value: "abdelrhmansadek215@gmail.com" },
        { label: "العنوان", value: "دمياط الجديدة، مصر" },
    ];

    return (
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 animate-fade-in">
            <div className="text-center mb-12 animate-fade-up">
                <p className="text-gold text-xs font-medium tracking-widest uppercase mb-3">
                    Contact
                </p>
                <h1 className="text-4xl md:text-5xl font-bold text-charcoal mb-4">
                    تواصل معنا
                </h1>
                <p className="text-muted max-w-xl mx-auto">
                    عندك سؤال أو اقتراح؟ إحنا هنا نسمعك. ابعتلنا وهنرد عليك في أقرب وقت.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div
                    className="lg:col-span-2 animate-fade-up opacity-0"
                    style={{ animationDelay: "150ms", animationFillMode: "forwards" }}
                >
                    {requiresVerification ? (
                        // شاشة "افحص إيميلك"
                        <div className="bg-white rounded-lg border border-success/30 p-8 text-center">
                            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="32"
                                    height="32"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="#10B981"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                    <polyline points="22,6 12,13 2,6" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-charcoal mb-3">
                                افحص إيميلك 📧
                            </h2>
                            <p className="text-sm text-muted mb-4 leading-relaxed">
                                بعتنالك إيميل فيه لينك تأكيد على{" "}
                                <span className="text-gold font-medium" dir="ltr">
                  {formData.email || "إيميلك"}
                </span>
                            </p>
                            <p className="text-xs text-muted mb-6">
                                اضغط على اللينك عشان نستلم رسالتك. لو مش لاقيه، افحص Spam folder.
                            </p>
                            <button
                                onClick={() => {
                                    setRequiresVerification(false);
                                    setSent(false);
                                }}
                                className="text-gold text-sm font-medium hover:underline"
                            >
                                إرسال رسالة تانية
                            </button>
                        </div>
                    ) : sent ? (
                        // شاشة نجاح (للمسجلين)
                        <div className="bg-white rounded-lg border border-success/30 p-8 text-center">
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
                            <h2 className="text-xl font-bold text-charcoal mb-3">
                                تم استلام رسالتك!
                            </h2>
                            <p className="text-sm text-muted mb-6">
                                شكراً لتواصلك معانا. هرد عليك في أقرب وقت.
                            </p>
                            <button
                                onClick={() => setSent(false)}
                                className="text-gold text-sm font-medium hover:underline"
                            >
                                إرسال رسالة تانية
                            </button>
                        </div>
                    ) : (
                        // الفورم
                        <form
                            onSubmit={handleSubmit}
                            className="bg-white rounded-lg border border-charcoal/10 p-8 space-y-5"
                        >
                            {!user && (
                                <div className="bg-gold/10 border border-gold/30 rounded-md p-3 text-sm text-charcoal">
                                    💡 <strong>ملاحظة:</strong> لو عندك حساب،{" "}
                                    <Link href="/login" className="text-gold font-medium hover:underline">
                                        سجل دخول
                                    </Link>{" "}
                                    عشان نبعت بدون تأكيد إضافي.
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-charcoal mb-2">
                                    الاسم *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-md border border-charcoal/15 bg-white text-sm text-charcoal focus:outline-none focus:border-gold transition-colors"
                                    placeholder="اسمك الكامل"
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-charcoal">
                                        الإيميل *
                                    </label>
                                    {user && (
                                        <span className="text-xs text-success font-medium flex items-center gap-1">
                      ✓ موثّق من حسابك
                    </span>
                                    )}
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={!!user}
                                    className={`w-full px-4 py-3 rounded-md border border-charcoal/15 text-sm text-charcoal focus:outline-none focus:border-gold transition-colors ${
                                        user
                                            ? "bg-charcoal/5 cursor-not-allowed opacity-70"
                                            : "bg-white"
                                    }`}
                                    placeholder="you@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-charcoal mb-2">
                                    رسالتك *
                                </label>
                                <textarea
                                    name="message"
                                    required
                                    rows={5}
                                    value={formData.message}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-md border border-charcoal/15 bg-white text-sm text-charcoal focus:outline-none focus:border-gold transition-colors resize-none"
                                    placeholder="اكتب رسالتك هنا... (10 أحرف على الأقل)"
                                />
                            </div>

                            {/* 🐝 Honeypot - مخفي عن البشر */}
                            <div
                                style={{
                                    position: "absolute",
                                    left: "-9999px",
                                    width: "1px",
                                    height: "1px",
                                    overflow: "hidden",
                                }}
                                aria-hidden="true"
                            >
                                <label htmlFor="website_url">
                                    Website (متسيبش ده فاضي)
                                </label>
                                <input
                                    type="text"
                                    id="website_url"
                                    name="website_url"
                                    tabIndex={-1}
                                    autoComplete="off"
                                />
                            </div>

                            {error && (
                                <div className="bg-error/10 text-error border border-error/30 rounded-md p-3 text-sm animate-fade-down">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-charcoal hover:bg-gold text-cream hover:text-charcoal font-semibold h-12 rounded-md transition-colors disabled:opacity-50"
                            >
                                {isSubmitting ? "جاري الإرسال..." : "إرسال الرسالة"}
                            </button>
                        </form>
                    )}
                </div>

                {/* Contact Info */}
                <div className="space-y-4">
                    {contactInfo.map((info, idx) => (
                        <div
                            key={info.label}
                            className="bg-white rounded-lg border border-charcoal/10 p-5 animate-fade-up opacity-0"
                            style={{
                                animationDelay: `${300 + idx * 100}ms`,
                                animationFillMode: "forwards",
                            }}
                        >
                            <p className="text-xs text-gold font-medium mb-1">
                                {info.label}
                            </p>
                            <p className="text-charcoal font-medium" dir="ltr">
                                {info.value}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}