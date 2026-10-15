"use client";

import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { submitContactMessage } from "@/lib/contact-api";

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: "",
    });
    const [sent, setSent] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

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

        setSent(true);
        setFormData({ name: "", email: "", message: "" });
        setIsSubmitting(false);
        setTimeout(() => setSent(false), 5000);
    };

    const contactInfo = [
        { label: "التليفون", value: "01014766903" },
        { label: "الإيميل", value: "abdelrhman@gmail.com" },
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
                {/* Form */}
                <div
                    className="lg:col-span-2 animate-fade-up opacity-0"
                    style={{ animationDelay: "150ms", animationFillMode: "forwards" }}
                >
                    <form
                        onSubmit={handleSubmit}
                        className="bg-white rounded-lg border border-charcoal/10 p-8 space-y-5"
                    >
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

                        {sent && (
                            <div className="bg-success/10 text-success border border-success/30 rounded-md p-3 text-sm animate-fade-down">
                                ✓ تم استلام رسالتك. هنتواصل معاك قريباً.
                            </div>
                        )}

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