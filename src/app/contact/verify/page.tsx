"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function VerifyContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [state, setState] = useState<"loading" | "success" | "error">(
        "loading"
    );
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        if (!token) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setState("error");
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setErrorMsg("الرابط غير صحيح");
            return;
        }

        let isMounted = true;

        const verify = async () => {
            try {
                const res = await fetch("/api/contact/verify", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token }),
                });

                const data = await res.json();

                if (!isMounted) return;

                if (!res.ok) {
                    setState("error");
                    setErrorMsg(data.error || "حصلت مشكلة");
                } else {
                    setState("success");
                }
            } catch (e) {
                console.error(e);
                if (isMounted) {
                    setState("error");
                    setErrorMsg("حصلت مشكلة في الاتصال");
                }
            }
        };

        void verify();

        return () => {
            isMounted = false;
        };
    }, [token]);

    return (
        <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center px-6 py-12 animate-fade-in">
            <div className="w-full max-w-md text-center">
                {state === "loading" && (
                    <>
                        <div className="w-16 h-16 rounded-full bg-charcoal/5 flex items-center justify-center mx-auto mb-6 animate-pulse">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="32"
                                height="32"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#6B6B6B"
                                strokeWidth="2"
                                strokeLinecap="round"
                            >
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-charcoal mb-3">
                            جاري التحقق...
                        </h1>
                        <p className="text-muted">استنى شوية</p>
                    </>
                )}

                {state === "success" && (
                    <>
                        <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6 animate-fade-up">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="40"
                                height="40"
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
                        <h1 className="text-3xl font-bold text-charcoal mb-3 animate-fade-up">
                            تم تأكيد رسالتك! 🎉
                        </h1>
                        <p className="text-muted mb-8 leading-relaxed animate-fade-up">
                            شكراً لتواصلك معانا. وصلتنا رسالتك وهنرد عليك في أقرب وقت على إيميلك.
                        </p>
                        <div className="flex flex-col gap-3 animate-fade-up">
                            <Link
                                href="/products"
                                className="w-full bg-charcoal hover:bg-gold text-cream hover:text-charcoal font-semibold h-12 rounded-md transition-colors flex items-center justify-center"
                            >
                                تسوق الآن
                            </Link>
                            <Link
                                href="/"
                                className="w-full border border-charcoal/15 hover:border-charcoal/30 text-charcoal font-medium h-12 rounded-md transition-colors flex items-center justify-center"
                            >
                                الصفحة الرئيسية
                            </Link>
                        </div>
                    </>
                )}

                {state === "error" && (
                    <>
                        <div className="w-20 h-20 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-6 animate-fade-up">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="40"
                                height="40"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#EF4444"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-charcoal mb-3 animate-fade-up">
                            حصلت مشكلة
                        </h1>
                        <p className="text-muted mb-8 animate-fade-up">{errorMsg}</p>
                        <Link
                            href="/contact"
                            className="inline-block bg-charcoal hover:bg-gold text-cream hover:text-charcoal font-semibold px-6 py-3 rounded-md transition-colors"
                        >
                            إرسال رسالة تانية
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}

export default function VerifyContactPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center">
                    <p className="text-muted">جاري التحميل...</p>
                </div>
            }
        >
            <VerifyContent />
        </Suspense>
    );
}