"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth-context";

export default function AccountPage() {
    const router = useRouter();
    const { user, isLoading, signOut } = useAuth();

    useEffect(() => {
        if (!isLoading && !user) router.push("/login");
    }, [user, isLoading, router]);

    if (isLoading) {
        return (
            <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center">
                <p className="text-muted">جاري التحميل...</p>
            </div>
        );
    }

    if (!user) return null;

    const fullName = user.user_metadata?.full_name || "عميل Mood";
    const phone = user.user_metadata?.phone || "";

    return (
        <div className="max-w-4xl mx-auto px-6 lg:px-8 py-12">
            <div className="mb-10 animate-fade-up">
                <p className="text-gold text-xs font-medium tracking-widest uppercase mb-2">
                    My Account
                </p>
                <h1 className="text-3xl md:text-4xl font-bold text-charcoal">
                    حسابي
                </h1>
            </div>

            {/* Profile Card */}
            <div
                className="bg-white rounded-lg border border-charcoal/10 p-6 mb-6 animate-fade-up opacity-0"
                style={{ animationDelay: "100ms", animationFillMode: "forwards" }}
            >
                <h2 className="text-lg font-semibold text-charcoal mb-5">
                    بياناتي
                </h2>
                <div className="space-y-4">
                    <div className="flex justify-between py-3 border-b border-charcoal/5">
                        <span className="text-sm text-muted">الاسم</span>
                        <span className="text-sm font-medium text-charcoal">{fullName}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-charcoal/5">
                        <span className="text-sm text-muted">الإيميل</span>
                        <span className="text-sm font-medium text-charcoal" dir="ltr">
              {user.email}
            </span>
                    </div>
                    {phone && (
                        <div className="flex justify-between py-3 border-b border-charcoal/5">
                            <span className="text-sm text-muted">التليفون</span>
                            <span className="text-sm font-medium text-charcoal" dir="ltr">
                {phone}
              </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Start Shopping CTA */}
            <Link
                href="/products"
                className="group block bg-charcoal hover:bg-gold text-cream hover:text-charcoal rounded-lg p-6 mb-6 transition-all hover:shadow-lg animate-fade-up opacity-0"
                style={{ animationDelay: "200ms", animationFillMode: "forwards" }}
            >
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-semibold mb-1">
                            ابدأ التسوق
                        </h3>
                        <p className="text-sm opacity-80">
                            اكتشف تشكيلتنا الكاملة من الملابس العصرية
                        </p>
                    </div>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="flex-shrink-0 group-hover:-translate-x-1 transition-transform"
                    >
                        <path d="M19 12H5" />
                        <path d="m12 19-7-7 7-7" />
                    </svg>
                </div>
            </Link>

            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Link
                    href="/account/orders"
                    className="group bg-white rounded-lg border border-charcoal/10 hover:border-gold p-6 transition-all hover:shadow-lg animate-fade-up opacity-0"
                    style={{ animationDelay: "300ms", animationFillMode: "forwards" }}
                >
                    <h3 className="text-base font-semibold text-charcoal mb-2 group-hover:text-gold transition-colors">
                        طلباتي
                    </h3>
                    <p className="text-sm text-muted">شوف كل طلباتك السابقة</p>
                </Link>

                <Link
                    href="/wishlist"
                    className="group bg-white rounded-lg border border-charcoal/10 hover:border-gold p-6 transition-all hover:shadow-lg animate-fade-up opacity-0"
                    style={{ animationDelay: "400ms", animationFillMode: "forwards" }}
                >
                    <h3 className="text-base font-semibold text-charcoal mb-2 group-hover:text-gold transition-colors">
                        المفضلة
                    </h3>
                    <p className="text-sm text-muted">المنتجات اللي حفظتها</p>
                </Link>
            </div>

            {/* Logout */}
            <button
                onClick={async () => {
                    await signOut();
                    router.push("/");
                }}
                className="w-full md:w-auto px-6 py-3 border border-error/30 text-error hover:bg-error/10 font-medium rounded-md transition-colors animate-fade-up opacity-0"
                style={{ animationDelay: "500ms", animationFillMode: "forwards" }}
            >
                تسجيل خروج
            </button>
        </div>
    );
}