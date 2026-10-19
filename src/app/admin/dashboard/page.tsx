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
        void fetchStats();
    }, [isLoggedIn, showToast]);

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-12">

            {/* Header */}
            <div className="flex items-center justify-between mb-8 animate-fade-up">
                <div>
                    <p className="text-gold text-[10px] md:text-xs font-bold tracking-widest uppercase mb-1 md:mb-2">Dashboard</p>
                    <h1 className="text-2xl md:text-4xl font-bold text-charcoal">لوحة التحكم</h1>
                </div>
                <button onClick={async () => { await logout(); router.push("/admin"); }} className="text-xs md:text-sm text-error font-medium border border-error/20 hover:bg-error/10 px-4 py-2 rounded-lg transition-colors">
                    تسجيل خروج
                </button>
            </div>

            {/* Stats Cards (Mobile: 2 Columns) */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 mb-8 md:mb-10">
                {isLoading ? <>{[1, 2, 3].map((i) => <div key={i} className="bg-white rounded-xl border border-charcoal/10 p-4 md:p-6 h-[100px] md:h-[120px] animate-pulse" />)}</> : (
                    <>
                        <div className="bg-white rounded-xl border border-charcoal/10 p-4 md:p-6 animate-fade-up relative overflow-hidden col-span-2 md:col-span-1">
                            <div className="absolute right-0 top-0 w-20 h-20 bg-gold/10 rounded-bl-full" />
                            <p className="text-xs md:text-sm text-muted mb-1 md:mb-2">الإيرادات</p>
                            <p className="text-2xl md:text-3xl font-bold text-gold">{stats?.totalRevenue.toLocaleString()} <span className="text-sm">ج.م</span></p>
                        </div>
                        <div className="bg-white rounded-xl border border-charcoal/10 p-4 md:p-6 animate-fade-up relative overflow-hidden" style={{ animationDelay: "100ms" }}>
                            <div className="absolute right-0 top-0 w-20 h-20 bg-success/10 rounded-bl-full" />
                            <p className="text-xs md:text-sm text-muted mb-1 md:mb-2">إجمالي الطلبات</p>
                            <p className="text-2xl md:text-3xl font-bold text-charcoal">{stats?.totalOrders} <span className="text-sm text-muted">طلب</span></p>
                        </div>
                        <div className="bg-white rounded-xl border border-charcoal/10 p-4 md:p-6 animate-fade-up relative overflow-hidden" style={{ animationDelay: "200ms" }}>
                            <div className="absolute right-0 top-0 w-20 h-20 bg-blue-500/10 rounded-bl-full" />
                            <p className="text-xs md:text-sm text-muted mb-1 md:mb-2">طلبات اليوم</p>
                            <p className="text-2xl md:text-3xl font-bold text-blue-600">{stats?.todayOrders} <span className="text-sm text-muted">طلب</span></p>
                        </div>
                    </>
                )}
            </div>

            {/* Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-8">
                <div className="bg-white rounded-xl border border-charcoal/10 p-4 md:p-6 animate-fade-up" style={{ animationDelay: "300ms" }}>
                    <div className="flex items-center justify-between mb-4 pb-3 md:pb-4 border-b border-charcoal/5">
                        <h2 className="text-base md:text-lg font-bold text-charcoal">الأكثر مبيعاً 🏆</h2>
                    </div>
                    {isLoading ? <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-12 bg-charcoal/5 rounded animate-pulse" />)}</div> : topProducts.length === 0 ? (
                        <p className="text-sm text-muted text-center py-4">مفيش مبيعات لحد الآن.</p>
                    ) : (
                        <div className="space-y-3">
                            {topProducts.map((p, i) => (
                                <div key={p.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-bold text-muted w-4">{i + 1}</span>
                                        <div className="w-10 h-12 rounded-md overflow-hidden bg-cream border border-charcoal/5">
                                            <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                                        </div>
                                        <p className="text-sm font-medium text-charcoal truncate max-w-[120px] md:max-w-[150px]">{p.name}</p>
                                    </div>
                                    <span className="text-xs font-bold text-success bg-success/10 px-2 py-1 rounded-full">{p.sold_count} مبيعة</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-xl border border-charcoal/10 p-4 md:p-6 animate-fade-up" style={{ animationDelay: "400ms" }}>
                    <div className="flex items-center justify-between mb-4 pb-3 md:pb-4 border-b border-charcoal/5">
                        <h2 className="text-base md:text-lg font-bold text-charcoal flex items-center gap-2">مخزون قرب يخلص <span className="text-error animate-pulse">⚠️</span></h2>
                    </div>
                    {isLoading ? <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-12 bg-charcoal/5 rounded animate-pulse" />)}</div> : lowStockProducts.length === 0 ? (
                        <p className="text-sm text-muted text-center py-4">كل المنتجات مخزونها كويس.</p>
                    ) : (
                        <div className="space-y-3">
                            {lowStockProducts.map((p) => (
                                <div key={p.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-12 rounded-md overflow-hidden bg-cream border border-charcoal/5">
                                            <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                                        </div>
                                        <p className="text-sm font-medium text-charcoal truncate max-w-[140px] md:max-w-[180px]">{p.name}</p>
                                    </div>
                                    <span className="text-xs font-bold text-error bg-error/10 px-2 py-1 rounded-full">باقي {p.stock}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Links (Mobile: Cards) */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
                <Link href="/admin/dashboard/products" className="group bg-white rounded-xl border border-charcoal/10 hover:border-gold p-4 md:p-6 transition-all hover:shadow-lg animate-fade-up flex flex-col justify-between" style={{ animationDelay: "500ms" }}>
                    <h3 className="text-sm md:text-base font-bold text-charcoal mb-1 md:mb-2 group-hover:text-gold transition-colors">المنتجات</h3>
                    <p className="text-xs text-muted">إدارة المنتجات</p>
                </Link>
                <Link href="/admin/dashboard/orders" className="group bg-white rounded-xl border border-charcoal/10 hover:border-gold p-4 md:p-6 transition-all hover:shadow-lg animate-fade-up flex flex-col justify-between" style={{ animationDelay: "550ms" }}>
                    <h3 className="text-sm md:text-base font-bold text-charcoal mb-1 md:mb-2 group-hover:text-gold transition-colors">الطلبات</h3>
                    <p className="text-xs text-muted">متابعة الطلبات</p>
                </Link>
                <Link href="/admin/dashboard/coupons" className="group bg-white rounded-xl border border-charcoal/10 hover:border-gold p-4 md:p-6 transition-all hover:shadow-lg animate-fade-up flex flex-col justify-between" style={{ animationDelay: "600ms" }}>
                    <h3 className="text-sm md:text-base font-bold text-charcoal mb-1 md:mb-2 group-hover:text-gold transition-colors">أكواد الخصم</h3>
                    <p className="text-xs text-muted">إدارة الكوبونات</p>
                </Link>
                <Link href="/admin/dashboard/messages" className="group bg-white rounded-xl border border-charcoal/10 hover:border-gold p-4 md:p-6 transition-all hover:shadow-lg animate-fade-up flex flex-col justify-between" style={{ animationDelay: "650ms" }}>
                    <h3 className="text-sm md:text-base font-bold text-charcoal mb-1 md:mb-2 group-hover:text-gold transition-colors">الرسائل</h3>
                    <p className="text-xs text-muted">رسائل العملاء</p>
                </Link>
                <Link href="/admin/dashboard/subscribers" className="group bg-white rounded-xl border border-charcoal/10 hover:border-gold p-4 md:p-6 transition-all hover:shadow-lg animate-fade-up flex flex-col justify-between" style={{ animationDelay: "700ms" }}>
                    <h3 className="text-sm md:text-base font-bold text-charcoal mb-1 md:mb-2 group-hover:text-gold transition-colors">المشتركين</h3>
                    <p className="text-xs text-muted">النشرة البريدية</p>
                </Link>
                <Link href="/admin/dashboard/settings" className="group bg-white rounded-xl border border-charcoal/10 hover:border-gold p-4 md:p-6 transition-all hover:shadow-lg animate-fade-up flex flex-col justify-between" style={{ animationDelay: "750ms" }}>
                    <h3 className="text-sm md:text-base font-bold text-charcoal mb-1 md:mb-2 group-hover:text-gold transition-colors">الإعدادات</h3>
                    <p className="text-xs text-muted">أمان الحساب</p>
                </Link>
            </div>
        </div>
    );
}