"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAdmin } from "@/components/admin-context";
import { useToast } from "@/components/toast-context";
import { supabase } from "@/lib/supabase";

type Subscriber = {
    id: number;
    email: string;
    created_at: string;
};

export default function AdminSubscribersPage() {
    const { isLoggedIn } = useAdmin();
    const { showToast } = useToast();
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!isLoggedIn) return;

        const fetchSubscribers = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) return;

                const res = await fetch("/api/admin/subscribers", {
                    headers: { Authorization: `Bearer ${session.access_token}` },
                });
                const data = await res.json();

                if (!res.ok) throw new Error(data.error);
                setSubscribers(data.subscribers);
            } catch (err) {
                showToast("فشل تحميل قائمة المشتركين", "error");
            } finally {
                setIsLoading(false);
            }
        };

        void fetchSubscribers();
    }, [isLoggedIn, showToast]);

    const exportToCSV = () => {
        if (subscribers.length === 0) return showToast("مفيش مشتركين للتصدير", "error");

        // تجهيز الداتا
        const headers = ["Email", "Date Subscribed"];
        const rows = subscribers.map(sub => [
            sub.email,
            new Date(sub.created_at).toLocaleDateString("en-GB")
        ]);

        // إضافة \uFEFF عشان الإكسيل يقرأ العربي صح
        let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
        csvContent += headers.join(",") + "\n";
        rows.forEach(row => {
            csvContent += row.join(",") + "\n";
        });

        // تنزيل الملف
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `mood-subscribers-${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showToast("تم تصدير الملف بنجاح", "success");
    };

    return (
        <div className="max-w-5xl mx-auto px-6 lg:px-8 py-12">
            <div className="mb-8">
                <Link href="/admin/dashboard" className="text-sm text-muted hover:text-gold">
                    ← رجوع للوحة التحكم
                </Link>
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div>
                    <p className="text-gold text-xs font-medium tracking-widest uppercase mb-2">
                        Newsletter
                    </p>
                    <h1 className="text-3xl md:text-4xl font-bold text-charcoal">
                        المشتركين في النشرة البريدية
                    </h1>
                    <p className="text-sm text-muted mt-2">
                        إجمالي المشتركين: <span className="font-bold text-charcoal">{subscribers.length}</span>
                    </p>
                </div>

                <button
                    onClick={exportToCSV}
                    disabled={isLoading || subscribers.length === 0}
                    className="bg-charcoal hover:bg-gold text-cream hover:text-charcoal font-medium px-5 py-2.5 rounded-md transition-colors text-sm flex items-center gap-2 disabled:opacity-50"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    تصدير CSV
                </button>
            </div>

            {isLoading ? (
                <div className="text-center py-20 text-muted animate-pulse">جاري تحميل المشتركين...</div>
            ) : subscribers.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-lg border border-charcoal/10">
                    <p className="text-muted">مفيش مشتركين لحد الآن.</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg border border-charcoal/10 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-charcoal/5 border-b border-charcoal/10">
                            <tr>
                                <th className="text-right px-6 py-4 font-medium text-charcoal w-16">#</th>
                                <th className="text-right px-6 py-4 font-medium text-charcoal">الإيميل</th>
                                <th className="text-right px-6 py-4 font-medium text-charcoal">تاريخ الاشتراك</th>
                            </tr>
                            </thead>
                            <tbody>
                            {subscribers.map((sub, idx) => (
                                <tr key={sub.id} className="border-b border-charcoal/5 last:border-b-0 hover:bg-cream/50">
                                    <td className="px-6 py-4 text-muted">{idx + 1}</td>
                                    <td className="px-6 py-4 font-medium text-charcoal" dir="ltr">{sub.email}</td>
                                    <td className="px-6 py-4 text-muted" dir="ltr">
                                        {new Date(sub.created_at).toLocaleDateString("en-GB", {
                                            year: 'numeric', month: 'short', day: 'numeric',
                                            hour: '2-digit', minute: '2-digit'
                                        })}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}