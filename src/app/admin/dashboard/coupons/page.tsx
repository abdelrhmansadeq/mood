"use client";

import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useAdmin } from "@/components/admin-context";
import { useToast } from "@/components/toast-context";
import { supabase } from "@/lib/supabase";

type Coupon = {
    id: number;
    code: string;
    discount_percentage: number | null;
    discount_fixed: number | null;
    min_order_amount: number;
    max_uses: number | null;
    used_count: number;
    expires_at: string | null;
    is_active: boolean;
    created_at: string;
};

type FormData = {
    code: string;
    discount_type: "percentage" | "fixed";
    discount_value: number;
    min_order_amount: number;
    max_uses: string;
    expires_at: string;
};

export default function AdminCouponsPage() {
    const { isLoggedIn } = useAdmin();
    const { showToast } = useToast();

    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

    const [formData, setFormData] = useState<FormData>({
        code: "",
        discount_type: "percentage",
        discount_value: 0,
        min_order_amount: 0,
        max_uses: "",
        expires_at: "",
    });

    const fetchCoupons = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const res = await fetch("/api/admin/coupons", {
                headers: { Authorization: `Bearer ${session.access_token}` },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setCoupons(data.coupons);
        } catch (err) {
            showToast("فشل تحميل الكوبونات", "error");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isLoggedIn) fetchCoupons();
    }, [isLoggedIn]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (formData.discount_value <= 0) return showToast("قيمة الخصم يجب أن تكون أكبر من صفر", "error");

        setIsSubmitting(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();

            const res = await fetch("/api/admin/coupons", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session?.access_token}`,
                },
                body: JSON.stringify({
                    code: formData.code,
                    discount_type: formData.discount_type,
                    discount_value: formData.discount_value,
                    min_order_amount: formData.min_order_amount,
                    max_uses: formData.max_uses ? Number(formData.max_uses) : null,
                    expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            showToast("تم إضافة الكوبون بنجاح", "success");
            setIsModalOpen(false);
            setFormData({ code: "", discount_type: "percentage", discount_value: 0, min_order_amount: 0, max_uses: "", expires_at: "" });
            fetchCoupons();
        } catch (err: unknown) {
            showToast(err instanceof Error ? err.message : "فشل الإضافة", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleStatus = async (id: number, currentStatus: boolean) => {
        // Optimistic update
        setCoupons((prev) => prev.map((c) => c.id === id ? { ...c, is_active: !currentStatus } : c));

        try {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch(`/api/admin/coupons/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session?.access_token}`,
                },
                body: JSON.stringify({ is_active: !currentStatus }),
            });
            if (!res.ok) throw new Error();
        } catch {
            setCoupons((prev) => prev.map((c) => c.id === id ? { ...c, is_active: currentStatus } : c));
            showToast("فشل تحديث الحالة", "error");
        }
    };

    const handleDelete = async (id: number) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const res = await fetch(`/api/admin/coupons/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${session?.access_token}` },
            });
            if (!res.ok) throw new Error();

            setCoupons((prev) => prev.filter((c) => c.id !== id));
            showToast("تم حذف الكوبون", "success");
        } catch {
            showToast("فشل حذف الكوبون", "error");
        } finally {
            setConfirmDeleteId(null);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12">
            <div className="mb-6 md:mb-8">
                <Link href="/admin/dashboard" className="text-sm text-muted hover:text-gold">
                    ← رجوع للوحة التحكم
                </Link>
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 md:mb-8">
                <div>
                    <p className="text-gold text-xs font-medium tracking-widest uppercase mb-2">Coupons</p>
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-charcoal">إدارة أكواد الخصم</h1>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-charcoal hover:bg-gold text-cream hover:text-charcoal font-medium px-5 py-2.5 rounded-md transition-colors text-sm self-start md:self-auto"
                >
                    + إنشاء كوبون جديد
                </button>
            </div>

            {isLoading ? (
                <div className="text-center py-20 text-muted animate-pulse">جاري تحميل الكوبونات...</div>
            ) : coupons.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-lg border border-charcoal/10">
                    <p className="text-muted">مفيش أكواد خصم لحد الآن.</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg border border-charcoal/10 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-charcoal/5 border-b border-charcoal/10">
                            <tr>
                                <th className="text-right px-4 py-3 font-medium text-charcoal">الكود</th>
                                <th className="text-right px-4 py-3 font-medium text-charcoal">قيمة الخصم</th>
                                <th className="text-right px-4 py-3 font-medium text-charcoal">الاستخدام</th>
                                <th className="text-right px-4 py-3 font-medium text-charcoal">تاريخ الانتهاء</th>
                                <th className="text-right px-4 py-3 font-medium text-charcoal">الحالة</th>
                                <th className="text-left px-4 py-3 font-medium text-charcoal">إجراءات</th>
                            </tr>
                            </thead>
                            <tbody>
                            {coupons.map((c) => (
                                <tr key={c.id} className="border-b border-charcoal/5 last:border-b-0 hover:bg-cream/50">
                                    <td className="px-4 py-4">
                      <span className="bg-gold/10 text-gold-dark font-bold px-3 py-1 rounded-md tracking-wider">
                        {c.code}
                      </span>
                                    </td>
                                    <td className="px-4 py-4 font-medium">
                                        {c.discount_percentage ? `${c.discount_percentage}%` : `${c.discount_fixed} ج.م`}
                                        {c.min_order_amount > 0 && <span className="block text-[10px] text-muted">حد أدنى: {c.min_order_amount}</span>}
                                    </td>
                                    <td className="px-4 py-4">
                                        {c.used_count} / {c.max_uses ?? "∞"}
                                    </td>
                                    <td className="px-4 py-4 text-muted" dir="ltr">
                                        {c.expires_at ? new Date(c.expires_at).toLocaleDateString("ar-EG") : "مفتوح"}
                                    </td>
                                    <td className="px-4 py-4">
                                        <button
                                            onClick={() => handleToggleStatus(c.id, c.is_active)}
                                            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                                                c.is_active ? "bg-success/10 text-success hover:bg-success/20" : "bg-error/10 text-error hover:bg-error/20"
                                            }`}
                                        >
                                            {c.is_active ? "نشط (اضغط للإيقاف)" : "موقوف (اضغط للتفعيل)"}
                                        </button>
                                    </td>
                                    <td className="px-4 py-4 text-left">
                                        <button onClick={() => setConfirmDeleteId(c.id)} className="text-error hover:underline text-xs font-medium">
                                            حذف
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Add Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-charcoal/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-cream rounded-lg shadow-2xl w-full max-w-lg p-6 animate-fade-up">
                        <h2 className="text-xl font-bold text-charcoal mb-6">إنشاء كوبون جديد</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-charcoal mb-2">الكود (بالإنجليزي) *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    className="w-full px-4 py-3 rounded-md border border-charcoal/15 bg-white text-sm focus:outline-none focus:border-gold uppercase"
                                    placeholder="SUMMER20"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-charcoal mb-2">نوع الخصم *</label>
                                    <select
                                        value={formData.discount_type}
                                        onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as "percentage" | "fixed" })}
                                        className="w-full px-4 py-3 rounded-md border border-charcoal/15 bg-white text-sm focus:outline-none focus:border-gold"
                                    >
                                        <option value="percentage">نسبة مئوية (%)</option>
                                        <option value="fixed">مبلغ ثابت (ج.م)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-charcoal mb-2">القيمة *</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={formData.discount_value || ""}
                                        onChange={(e) => setFormData({ ...formData, discount_value: Number(e.target.value) })}
                                        className="w-full px-4 py-3 rounded-md border border-charcoal/15 bg-white text-sm focus:outline-none focus:border-gold"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-charcoal mb-2">حد أدنى للطلب (اختياري)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.min_order_amount || ""}
                                        onChange={(e) => setFormData({ ...formData, min_order_amount: Number(e.target.value) })}
                                        className="w-full px-4 py-3 rounded-md border border-charcoal/15 bg-white text-sm focus:outline-none focus:border-gold"
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-charcoal mb-2">أقصى عدد استخدامات</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.max_uses}
                                        onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                                        className="w-full px-4 py-3 rounded-md border border-charcoal/15 bg-white text-sm focus:outline-none focus:border-gold"
                                        placeholder="مفتوح"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-charcoal mb-2">تاريخ الانتهاء (اختياري)</label>
                                <input
                                    type="datetime-local"
                                    value={formData.expires_at}
                                    onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                                    className="w-full px-4 py-3 rounded-md border border-charcoal/15 bg-white text-sm focus:outline-none focus:border-gold text-charcoal"
                                />
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-charcoal/10 mt-6">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 bg-charcoal hover:bg-gold text-cream hover:text-charcoal font-semibold h-11 rounded-md transition-colors disabled:opacity-50"
                                >
                                    {isSubmitting ? "جاري الإنشاء..." : "إنشاء الكوبون"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 border border-charcoal/15 hover:border-charcoal/30 text-charcoal font-medium rounded-md transition-colors"
                                >
                                    إلغاء
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {confirmDeleteId !== null && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-charcoal/50">
                    <div className="bg-cream rounded-lg shadow-2xl w-full max-w-sm p-6 animate-fade-up">
                        <h3 className="text-lg font-bold text-charcoal mb-3">تأكيد الحذف</h3>
                        <p className="text-sm text-muted mb-6">إنت متأكد إنك عايز تحذف الكوبون ده؟</p>
                        <div className="flex gap-3">
                            <button onClick={() => handleDelete(confirmDeleteId)} className="flex-1 bg-error hover:bg-error/90 text-white font-semibold h-11 rounded-md transition-colors">نعم، احذف</button>
                            <button onClick={() => setConfirmDeleteId(null)} className="flex-1 border border-charcoal/15 hover:border-charcoal/30 text-charcoal font-medium rounded-md transition-colors">إلغاء</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}