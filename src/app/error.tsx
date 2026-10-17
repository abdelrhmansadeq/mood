"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
                                  error,
                                  reset,
                              }: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Global Error:", error);
    }, [error]);

    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center bg-cream">
            <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
            </div>
            <h1 className="text-3xl font-bold text-charcoal mb-3">حصلت مشكلة غير متوقعة</h1>
            <p className="text-muted mb-8 max-w-md leading-relaxed">
                معلش، حصل خطأ تقني في تحميل الصفحة. ممكن تحاول تحدث الصفحة أو ترجع للصفحة الرئيسية.
            </p>
            <div className="flex gap-4 flex-wrap justify-center">
                <button
                    onClick={() => reset()}
                    className="bg-charcoal text-cream px-8 py-3 rounded-md font-semibold hover:bg-gold hover:text-charcoal transition-colors"
                >
                    حاول تاني
                </button>
                <Link
                    href="/"
                    className="border border-charcoal/20 text-charcoal px-8 py-3 rounded-md font-semibold hover:border-charcoal transition-colors"
                >
                    الرئيسية
                </Link>
            </div>
        </div>
    );
}