"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAdmin } from "@/components/admin-context";
import { useProducts } from "@/components/products-context";

export default function DashboardPage() {
    const router = useRouter();
    const { isLoggedIn, logout } = useAdmin();
    const { products } = useProducts();

    useEffect(() => {
        if (!isLoggedIn) router.push("/admin");
    }, [isLoggedIn, router]);

    if (!isLoggedIn) return null;

    const menCount = products.filter((p) => p.category === "men").length;
    const womenCount = products.filter((p) => p.category === "women").length;
    const kidsCount = products.filter((p) => p.category === "kids").length;
    const featuredCount = products.filter((p) => p.isFeatured).length;

    const stats = [
        { label: "إجمالي المنتجات", value: products.length, color: "text-charcoal" },
        { label: "رجالي", value: menCount, color: "text-charcoal" },
        { label: "نسائي", value: womenCount, color: "text-charcoal" },
        { label: "أطفال", value: kidsCount, color: "text-charcoal" },
        { label: "منتجات مميزة", value: featuredCount, color: "text-gold" },
    ];

    return (
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
            {/* Header */}
            <div className="flex items-center justify-between mb-10">
                <div>
                    <p className="text-gold text-xs font-medium tracking-widest uppercase mb-2">
                        Dashboard
                    </p>
                    <h1 className="text-3xl md:text-4xl font-bold text-charcoal">
                        لوحة التحكم
                    </h1>
                </div>
                <button
                    onClick={() => {
                        logout();
                        router.push("/admin");
                    }}
                    className="text-sm text-muted hover:text-error transition-colors"
                >
                    تسجيل خروج
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
                {stats.map((s) => (
                    <div
                        key={s.label}
                        className="bg-white rounded-lg border border-charcoal/10 p-5"
                    >
                        <p className="text-xs text-muted mb-2">{s.label}</p>
                        <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                    href="/admin/dashboard/products"
                    className="group bg-white rounded-lg border border-charcoal/10 hover:border-gold p-6 transition-colors"
                >
                    <h3 className="text-lg font-semibold text-charcoal mb-2 group-hover:text-gold transition-colors">
                        إدارة المنتجات
                    </h3>
                    <p className="text-sm text-muted">
                        إضافة وتعديل وحذف المنتجات
                    </p>
                </Link>

                <Link
                    href="/admin/dashboard/orders"
                    className="group bg-white rounded-lg border border-charcoal/10 hover:border-gold p-6 transition-colors"
                >
                    <h3 className="text-lg font-semibold text-charcoal mb-2 group-hover:text-gold transition-colors">
                        الطلبات
                    </h3>
                    <p className="text-sm text-muted">
                        شوف الطلبات الواردة وحدّث حالتها
                    </p>
                </Link>

                <Link
                    href="/products"
                    className="group bg-white rounded-lg border border-charcoal/10 hover:border-gold p-6 transition-colors"
                >
                    <h3 className="text-lg font-semibold text-charcoal mb-2 group-hover:text-gold transition-colors">
                        عرض المتجر
                    </h3>
                    <p className="text-sm text-muted">
                        شوف الموقع من منظور الزائر
                    </p>
                </Link>
            </div>
        </div>
    );
}