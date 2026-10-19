"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/toast-context";

export default function AdminSettingsPage() {
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const [displayName, setDisplayName] = useState("");
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [secretCode, setSecretCode] = useState("");

    const handleUpdateName = async (e: FormEvent) => {
        e.preventDefault();
        if (!displayName) return showToast("أدخل الاسم الجديد", "error");

        setIsLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({ data: { full_name: displayName } });
            if (error) throw error;
            showToast("تم تحديث اسم العرض بنجاح", "success");
            setDisplayName("");
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : "حصلت مشكلة";
            showToast(msg, "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdatePassword = async (e: FormEvent) => {
        e.preventDefault();

        if (newPassword.length < 6) return showToast("الباسورد الجديد لازم يكون 6 أحرف على الأقل", "error");
        if (newPassword !== confirmPassword) return showToast("الباسوردين مش متطابقين", "error");
        if (!oldPassword || !secretCode) return showToast("لازم تدخل الباسورد القديم والرمز السري", "error");

        setIsLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("جلسة غير صالحة");

            const res = await fetch("/api/admin/update-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({ oldPassword, newPassword, secretCode }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            showToast("تم تحديث الباسورد بنجاح", "success");
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setSecretCode("");
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : "حصلت مشكلة";
            showToast(msg, "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-6 py-12">
            <div className="mb-8">
                <Link href="/admin/dashboard" className="text-sm text-muted hover:text-gold">
                    ← رجوع للوحة التحكم
                </Link>
            </div>

            <div className="mb-8">
                <p className="text-gold text-xs font-medium tracking-widest uppercase mb-2">Security Settings</p>
                <h1 className="text-3xl md:text-4xl font-bold text-charcoal">إعدادات الأمان</h1>
            </div>

            <div className="space-y-8">
                <div className="bg-white rounded-lg border border-charcoal/10 p-6 md:p-8">
                    <h2 className="text-xl font-bold text-charcoal mb-4">تغيير اسم العرض (Username)</h2>
                    <form onSubmit={handleUpdateName} className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                        <input type="text" placeholder="الاسم الجديد (مثلاً: Mood Store)" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="flex-1 w-full px-4 py-3 rounded-md border border-charcoal/15 bg-white text-sm focus:outline-none focus:border-gold" />
                        <button type="submit" disabled={isLoading} className="bg-charcoal text-cream px-6 py-3 rounded-md font-semibold disabled:opacity-50 whitespace-nowrap">حفظ الاسم</button>
                    </form>
                </div>

                <div className="bg-white rounded-lg border border-charcoal/10 p-6 md:p-8">
                    <h2 className="text-xl font-bold text-charcoal mb-4">تغيير كلمة المرور</h2>
                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="password" placeholder="الباسورد القديم" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className="w-full px-4 py-3 rounded-md border border-charcoal/15 bg-white text-sm focus:outline-none focus:border-gold" />
                            <input type="password" placeholder="رمز التأكيد السري" value={secretCode} onChange={(e) => setSecretCode(e.target.value)} className="w-full px-4 py-3 rounded-md border border-charcoal/15 bg-white text-sm focus:outline-none focus:border-gold" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="password" placeholder="الباسورد الجديد" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-4 py-3 rounded-md border border-charcoal/15 bg-white text-sm focus:outline-none focus:border-gold" />
                            <input type="password" placeholder="تأكيد الباسورد الجديد" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-4 py-3 rounded-md border border-charcoal/15 bg-white text-sm focus:outline-none focus:border-gold" />
                        </div>
                        <button type="submit" disabled={isLoading} className="w-full md:w-auto bg-charcoal hover:bg-gold text-cream hover:text-charcoal px-8 py-3 rounded-md font-semibold disabled:opacity-50 transition-colors">
                            {isLoading ? "جاري الحفظ..." : "حفظ الباسورد"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}