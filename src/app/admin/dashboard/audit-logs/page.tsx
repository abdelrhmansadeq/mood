"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/toast-context";

type Log = {
    id: number;
    admin_email: string;
    action: string;
    entity_type: string;
    entity_id: string | null;
    details: string | null;
    created_at: string;
};

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<Log[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { showToast } = useToast();

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) return;

                const res = await fetch("/api/admin/audit-logs", {
                    headers: { Authorization: `Bearer ${session.access_token}` },
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error);
                setLogs(data.logs);
            } catch (err) {
                showToast("فشل تحميل سجل النشاط", "error");
            } finally {
                setIsLoading(false);
            }
        };
        fetchLogs();
    }, [showToast]);

    return (
        <div className="max-w-5xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-12">
            <div className="mb-6 md:mb-8">
                <Link href="/admin/dashboard" className="text-sm text-muted hover:text-gold flex items-center gap-1 w-fit">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    رجوع للوحة التحكم
                </Link>
            </div>

            <div className="mb-8">
                <p className="text-gold text-[10px] md:text-xs font-bold tracking-widest uppercase mb-1">Security</p>
                <h1 className="text-2xl md:text-3xl font-bold text-charcoal">سجل النشاط (Audit Logs)</h1>
                <p className="text-sm text-muted mt-2">مراقبة كل الحركات الحساسة اللي بتتم في لوحة التحكم.</p>
            </div>

            {isLoading ? (
                <div className="text-center py-20 text-muted animate-pulse">جاري تحميل السجل...</div>
            ) : logs.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-charcoal/10">
                    <p className="text-muted">مفيش أي نشاط مسجل لحد الآن.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-charcoal/10 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-right">
                            <thead className="bg-charcoal/5 border-b border-charcoal/10 text-charcoal">
                            <tr>
                                <th className="px-4 py-3 font-medium">التاريخ</th>
                                <th className="px-4 py-3 font-medium">الأدمن</th>
                                <th className="px-4 py-3 font-medium">الحركة</th>
                                <th className="px-4 py-3 font-medium">التفاصيل</th>
                            </tr>
                            </thead>
                            <tbody>
                            {logs.map((log) => (
                                <tr key={log.id} className="border-b border-charcoal/5 last:border-0 hover:bg-cream/50 transition-colors">
                                    <td className="px-4 py-3 text-xs text-muted whitespace-nowrap" dir="ltr">
                                        {new Date(log.created_at).toLocaleString("ar-EG", { dateStyle: "short", timeStyle: "short" })}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-charcoal font-medium" dir="ltr">{log.admin_email}</td>
                                    <td className="px-4 py-3 text-xs font-bold text-gold whitespace-nowrap">{log.action}</td>
                                    <td className="px-4 py-3 text-xs text-muted">{log.details || "-"}</td>
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