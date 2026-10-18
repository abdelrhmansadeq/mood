"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAdmin } from "@/components/admin-context";
import { useToast } from "@/components/toast-context";
import { supabase } from "@/lib/supabase";

type Stats = { totalRevenue: number; totalOrders: number; todayOrders: number; };
type TopProduct = { id: number; name: string; image: string; sold_count: number; };
type LowStockProduct = { id: number; name: string; image: string; stock: number; };

export default function DashboardPage() {
    const router = useRouter();
    const { logout, isLoggedIn } = useAdmin();
    const { showToast } = useToast();

    const [stats, setStats] = useState<Stats | null>(null);
    const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
    const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!isLoggedIn) return;

        const fetchStats = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) return;

                const res = await fetch("/api/admin/stats", { headers: { Authorization: `Bearer ${session.access_token}` } });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error);

                setStats(data.stats);
                setTopProducts(data.topProducts);
                setLowStockProducts(data.lowStockProducts);
            } catch (error) {
                showToast("فشل تحميل الإحصائيات", "error");
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, [isLoggedIn, showToast]);

    return (
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
            <div className="flex items-center justify-between mb-10 animate-fade-up">
                <div>
                    <p className="text-gold text-xs font-medium tracking-widest uppercase mb-2">Dashboard</p>
                    <h1 className="text-3xl md:text-4xl font-bold text-charcoal">لوحة التحكم</h1>
                </div>
                <button onClick={async () => { await logout(); router.push("/admin"); }} className="text-sm text-muted hover:text-error transition-colors font-medium border border-charcoal/10 hover:border-error/30 px-4 py-2 rounded-md">
                    تسجيل خروج
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {isLoading ? <>{[1, 2, 3].map((i) => <div key={i} className="bg-white rounded-lg border border-charcoal/10 p-6 h-[120px] animate-pulse" />)}</> : (
                    <>
                        <div className="bg-white rounded-lg border border-charcoal/10 p-6 animate-fade-up relative overflow-hidden">
                            <div className="absolute right-0 top-0 w-24 h-24 bg-gold/10 rounded-bl-full" />
                            <p className="text-sm text-muted mb-2">إجمالي الإيرادات</p>
                            <p className="text-3xl font-bold text-gold">{stats?.totalRevenue.toLocaleString()} <span className="text-lg">ج.م</span></p>
                        </div>
                        <div className="bg-white rounded-lg border border-charcoal/10 p-6 animate-fade-up relative overflow-hidden" style={{ animationDelay: "100ms" }}>
                            <div className="absolute right-0 top-0 w-24 h-24 bg-success/10 rounded-bl-full" />
                            <p className="text-sm text-muted mb-2">إجمالي الطلبات</p>
                            <p className="text-3xl font-bold text-charcoal">{stats?.totalOrders} <span className="text-lg text-muted">طلب</span></p>
                        </div>
                        <div className="bg-white rounded-lg border border-charcoal/10 p-6 animate-fade-up relative overflow-hidden" style={{ animationDelay: "200ms" }}>
                            <div className="absolute right-0 top-0 w-24 h-24 bg-blue-500/10 rounded-bl-full" />
                            <p className="text-sm text-muted mb-2">طلبات اليوم</p>
                            <p className="text-3xl font-bold text-blue-600">{stats?.todayOrders} <span className="text-lg text-muted">طلب</span></p>
                        </div>
                    </>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
                <div className="bg-white rounded-lg border border-charcoal/10 p-6 animate-fade-up" style={{ animationDelay: "300ms" }}>
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-charcoal/5">
                        <h2 className="text-lg font-bold text-charcoal">الأكثر مبيعاً 🏆</h2>
                    </div>
                    {isLoading ? <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-12 bg-charcoal/5 rounded animate-pulse" />)}</div> : topProducts.length === 0 ? (
                        <p className="text-sm text-muted">مفيش منتجات مبيعاتها لحد الآن.</p>
                    ) : (
                        <div className="space-y-3">
                            {topProducts.map((p, i) => (
                                <div key={p.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-bold text-muted w-4">{i + 1}</span>
                                        <div className="w-10 h-10 rounded-md overflow-hidden bg-cream border border-charcoal/5">
                                            <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                                        </div>
                                        <p className="text-sm font-medium text-charcoal truncate max-w-[150px]">{p.name}</p>
                                    </div>
                                    <span className="text-xs font-bold text-success bg-success/10 px-2 py-1 rounded-full">{p.sold_count} مبيعة</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-lg border border-charcoal/10 p-6 animate-fade-up" style={{ animationDelay: "400ms" }}>
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-charcoal/5">
                        <h2 className="text-lg font-bold text-charcoal flex items-center gap-2">مخزون قرب يخلص <span className="text-error animate-pulse">⚠️</span></h2>
                    </div>
                    {isLoading ? <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-12 bg-charcoal/5 rounded animate-pulse" />)}</div> : lowStockProducts.length === 0 ? (
                        <p className="text-sm text-muted">كل المنتجات مخزونها كويس.</p>
                    ) : (
                        <div className="space-y-3">
                            {lowStockProducts.map((p) => (
                                <div key={p.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-md overflow-hidden bg-cream border border-charcoal/5">
                                            <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                                        </div>
                                        <p className="text-sm font-medium text-charcoal truncate max-w-[180px]">{p.name}</p>
                                    </div>
                                    <span className="text-xs font-bold text-error bg-error/10 px-2 py-1 rounded-full">باقي {p.stock} قطع</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Link href="/admin/dashboard/products" className="group bg-white rounded-lg border border-charcoal/10 hover:border-gold p-6 transition-all hover:shadow-lg animate-fade-up" style={{ animationDelay: "500ms" }}>
                    <h3 className="text-lg font-semibold text-charcoal mb-2 group-hover:text-gold transition-colors">إدارة المنتجات</h3>
                    <p className="text-sm text-muted">إضافة وتعديل وحذف المنتجات</p>
                </Link>
                <Link href="/admin/dashboard/orders" className="group bg-white rounded-lg border border-charcoal/10 hover:border-gold p-6 transition-all hover:shadow-lg animate-fade-up" style={{ animationDelay: "550ms" }}>
                    <h3 className="text-lg font-semibold text-charcoal mb-2 group-hover:text-gold transition-colors">الطلبات</h3>
                    <p className="text-sm text-muted">شوف الطلبات الواردة وحدّث حالتها</p>
                </Link>
                <Link href="/admin/dashboard/coupons" className="group bg-white rounded-lg border border-charcoal/10 hover:border-gold p-6 transition-all hover:shadow-lg animate-fade-up" style={{ animationDelay: "575ms" }}>
                    <h3 className="text-lg font-semibold text-charcoal mb-2 group-hover:text-gold transition-colors">أكواد الخصم</h3>
                    <p className="text-sm text-muted">إدارة كوبونات الخصم</p>
                </Link>
                <Link href="/admin/dashboard/messages" className="group bg-white rounded-lg border border-charcoal/10 hover:border-gold p-6 transition-all hover:shadow-lg animate-fade-up" style={{ animationDelay: "600ms" }}>
                    <h3 className="text-lg font-semibold text-charcoal mb-2 group-hover:text-gold transition-colors">الرسائل</h3>
                    <p className="text-sm text-muted">شوف رسائل العملاء</p>
                </Link>
                <Link href="/products" className="group bg-white rounded-lg border border-charcoal/10 hover:border-gold p-6 transition-all hover:shadow-lg animate-fade-up" style={{ animationDelay: "650ms" }}>
                    <h3 className="text-lg font-semibold text-charcoal mb-2 group-hover:text-gold transition-colors">عرض المتجر</h3>
                    <p className="text-sm text-muted">شوف الموقع من منظور الزائر</p>
                </Link>
            </div>
        </div>
    );
}