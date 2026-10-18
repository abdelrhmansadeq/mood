"use client";

import Link from "next/link";
import { useState } from "react";
import type { FormEvent } from "react";
import { useToast } from "./toast-context";

export default function Footer() {
    const year = new Date().getFullYear();
    const [email, setEmail] = useState("");
    const [subscribed, setSubscribed] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { showToast } = useToast();

    const handleSubscribe = async (e: FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;

        setIsSubmitting(true);
        try {
            const res = await fetch("/api/newsletter", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "فشل الاشتراك في النشرة");
            }

            showToast("تم الاشتراك في النشرة البريدية بنجاح", "success");
            setSubscribed(true);
            setEmail("");
            setTimeout(() => setSubscribed(false), 5000);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "حصلت مشكلة، حاول تاني";
            showToast(errorMessage, "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const socials = [
        {
            name: "Facebook",
            href: "https://www.facebook.com/share/1CXxukkfa7/",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
                </svg>
            ),
        },
        {
            name: "Instagram",
            href: "https://instagram.com/abdelrahman_sadeq",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
            ),
        },
        {
            name: "TikTok",
            href: "https://tiktok.com/@abdelrhman_sadek",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                </svg>
            ),
        },
    ];

    return (
        <footer className="bg-charcoal text-cream mt-20">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

                    {/* About */}
                    <div className="lg:col-span-1">
                        <h3 className="text-2xl font-bold mb-3">Mood</h3>
                        <p className="text-sm text-cream/70 leading-relaxed mb-4">
                            متجر ملابس عصري يقدم لك أرقى القطع بتصاميم مميزة.
                            الأناقة تبدأ من هنا.
                        </p>
                        {/* Socials */}
                        <div className="flex gap-3">
                            {socials.map((s) => (
                                <a
                                    key={s.name}
                                    href={s.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={s.name}
                                    className="w-9 h-9 rounded-full bg-cream/10 hover:bg-gold text-cream hover:text-charcoal flex items-center justify-center transition-colors"
                                >
                                    {s.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-sm font-semibold mb-4 text-gold uppercase tracking-wider">
                            روابط سريعة
                        </h4>
                        <ul className="space-y-2 text-sm text-cream/70">
                            <li>
                                <Link href="/products" className="hover:text-gold transition-colors">
                                    المنتجات
                                </Link>
                            </li>
                            <li>
                                <Link href="/about" className="hover:text-gold transition-colors">
                                    من نحن
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="hover:text-gold transition-colors">
                                    تواصل معنا
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-sm font-semibold mb-4 text-gold uppercase tracking-wider">
                            تواصل
                        </h4>
                        <ul className="space-y-2 text-sm text-cream/70">
                            <li dir="ltr" className="text-right">abdelrhmansadek215@gmail.com</li>
                            <li dir="ltr" className="text-right">01014766903</li>
                            <li>دمياط الجديدة، مصر</li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h4 className="text-sm font-semibold mb-4 text-gold uppercase tracking-wider">
                            اشترك في النشرة
                        </h4>
                        <p className="text-sm text-cream/70 mb-3 leading-relaxed">
                            كن أول من يعرف عن العروض والمنتجات الجديدة.
                        </p>
                        <form onSubmit={handleSubscribe} className="space-y-2">
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="إيميلك"
                                disabled={isSubmitting}
                                className="w-full px-3 py-2 rounded-md bg-cream/10 border border-cream/20 text-sm text-cream placeholder:text-cream/40 focus:outline-none focus:border-gold transition-colors disabled:opacity-50"
                            />
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-gold hover:bg-gold-dark text-charcoal font-medium text-sm h-10 rounded-md transition-colors disabled:opacity-50 disabled:cursor-wait"
                            >
                                {isSubmitting ? "جاري الاشتراك..." : "اشترك"}
                            </button>
                            {subscribed && (
                                <p className="text-xs text-success animate-fade-in">✓ تم الاشتراك بنجاح</p>
                            )}
                        </form>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-cream/10 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
                    <p className="text-xs text-cream/50">
                        © {year} Mood. جميع الحقوق محفوظة.
                    </p>
                    <div className="flex gap-4 text-xs text-cream/50">
                        <Link href="/privacy" className="hover:text-gold transition-colors">
                            سياسة الخصوصية
                        </Link>
                        <Link href="/terms" className="hover:text-gold transition-colors">
                            الشروط والأحكام
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}