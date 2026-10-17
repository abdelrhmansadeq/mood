"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth-context";
import { useToast } from "@/components/toast-context";
import {
    fetchUserAddress,
    saveUserAddress,
    type Address,
} from "@/lib/addresses-api";

export default function AccountPage() {
    const router = useRouter();
    const { user, isLoading, signOut } = useAuth();
    const { showToast } = useToast();

    const [address, setAddress] = useState<Address | null>(null);
    const [isLoadingAddress, setIsLoadingAddress] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
        city: "",
        address: "",
    });

    useEffect(() => {
        if (!isLoading && !user) router.push("/login");
    }, [user, isLoading, router]);

    useEffect(() => {
        if (!user) return;

        let isMounted = true;

        const loadAddress = async () => {
            const data = await fetchUserAddress(user.id);
            if (!isMounted) return;

            setAddress(data);
            if (data) {
                setFormData({
                    fullName: data.fullName,
                    phone: data.phone,
                    city: data.city,
                    address: data.address,
                });
            } else {
                setFormData({
                    fullName: user.user_metadata?.full_name || "",
                    phone: user.user_metadata?.phone || "",
                    city: "",
                    address: "",
                });
            }
            setIsLoadingAddress(false);
        };

        void loadAddress();

        return () => {
            isMounted = false;
        };
    }, [user]);

    const handleChange = (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!user) return;

        setIsSubmitting(true);

        const result = await saveUserAddress({
            userId: user.id,
            fullName: formData.fullName,
            phone: formData.phone,
            city: formData.city,
            address: formData.address,
        });

        if (result.error) {
            showToast(result.error, "error");
            setIsSubmitting(false);
            return;
        }

        const updated = await fetchUserAddress(user.id);
        setAddress(updated);
        setIsEditing(false);
        setIsSubmitting(false);
        showToast("تم حفظ العنوان بنجاح", "success");
    };

    const handleCancel = () => {
        setIsEditing(false);
        if (address) {
            setFormData({
                fullName: address.fullName,
                phone: address.phone,
                city: address.city,
                address: address.address,
            });
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center">
                <p className="text-muted">جاري التحميل...</p>
            </div>
        );
    }

    if (!user) return null;

    // بيانات المستخدم
    const fullName = user.user_metadata?.full_name || "عميل Mood";
    const phone = user.user_metadata?.phone || "";
    const avatarUrl = user.user_metadata?.avatar_url; // صورة جوجل
    const isGoogleUser = user.app_metadata?.providers?.includes("google");
    const hasAddress = address !== null;

    // هل محتاج رقم تليفون؟ (لو مسجل بجوجل وملوش تليفون)
    const needsPhone = isGoogleUser && !phone;

    return (
        <div className="max-w-4xl mx-auto px-6 lg:px-8 py-12">
            {/* Header & Welcome */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-10 animate-fade-up">
                {/* Avatar */}
                {avatarUrl ? (
                    <img
                        src={avatarUrl}
                        alt={fullName}
                        className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-white shadow-md object-cover"
                    />
                ) : (
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-charcoal text-cream flex items-center justify-center text-3xl font-bold shadow-md">
                        {fullName.charAt(0).toUpperCase()}
                    </div>
                )}

                {/* Info */}
                <div className="text-center md:text-right flex-1">
                    <h1 className="text-2xl md:text-3xl font-bold text-charcoal mb-2">
                        أهلاً بك، {fullName.split(" ")[0]} 👋
                    </h1>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                        <p className="text-sm text-muted" dir="ltr">
                            {user.email}
                        </p>
                        {isGoogleUser && (
                            <span className="inline-flex items-center gap-1 bg-white border border-charcoal/10 px-2.5 py-1 rounded-full text-xs font-medium text-charcoal">
                <svg width="12" height="12" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                حساب Google
              </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Alert if needs phone */}
            {needsPhone && (
                <div className="bg-gold/10 border border-gold/30 rounded-lg p-4 mb-8 flex items-start gap-3 animate-fade-up">
                    <span className="text-xl">📱</span>
                    <div>
                        <h3 className="text-sm font-bold text-charcoal mb-1">محتاجين رقم تليفونك!</h3>
                        <p className="text-xs text-charcoal/70">
                            قم بإضافة رقم تليفونك في عنوان الشحن بالأسفل، عشان نقدر نتواصل معاك لتأكيد طلباتك.
                        </p>
                    </div>
                </div>
            )}

            {/* Address Card */}
            <div
                className="bg-white rounded-lg border border-charcoal/10 p-6 mb-6 animate-fade-up opacity-0"
                style={{ animationDelay: "100ms", animationFillMode: "forwards" }}
            >
                <div className="flex items-center justify-between mb-5 border-b border-charcoal/5 pb-3">
                    <h2 className="text-lg font-semibold text-charcoal flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        عنوان الشحن
                    </h2>
                    {hasAddress && !isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="text-sm text-gold hover:underline font-medium"
                        >
                            تعديل
                        </button>
                    )}
                </div>

                {isLoadingAddress ? (
                    <p className="text-sm text-muted">جاري التحميل...</p>
                ) : isEditing || !hasAddress ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-charcoal mb-2">
                                    الاسم الكامل *
                                </label>
                                <input
                                    type="text"
                                    name="fullName"
                                    required
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-md border border-charcoal/15 bg-white text-sm text-charcoal focus:outline-none focus:border-gold transition-colors"
                                    placeholder="محمد أحمد"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-charcoal mb-2">
                                    رقم التليفون *
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    required
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-md border border-charcoal/15 bg-white text-sm text-charcoal focus:outline-none focus:border-gold transition-colors"
                                    placeholder="+20 100 000 0000"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-charcoal mb-2">
                                المدينة *
                            </label>
                            <input
                                type="text"
                                name="city"
                                required
                                value={formData.city}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-md border border-charcoal/15 bg-white text-sm text-charcoal focus:outline-none focus:border-gold transition-colors"
                                placeholder="القاهرة"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-charcoal mb-2">
                                العنوان بالتفصيل *
                            </label>
                            <textarea
                                name="address"
                                required
                                rows={3}
                                value={formData.address}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-md border border-charcoal/15 bg-white text-sm text-charcoal focus:outline-none focus:border-gold transition-colors resize-none"
                                placeholder="الشارع، رقم العمارة، الدور، الشقة"
                            />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-charcoal hover:bg-gold text-cream hover:text-charcoal font-semibold px-6 py-2.5 rounded-md transition-colors disabled:opacity-50 text-sm"
                            >
                                {isSubmitting ? "جاري الحفظ..." : "حفظ العنوان"}
                            </button>
                            {hasAddress && (
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="px-6 border border-charcoal/15 hover:border-charcoal/30 text-charcoal font-medium rounded-md transition-colors text-sm"
                                >
                                    إلغاء
                                </button>
                            )}
                        </div>
                    </form>
                ) : (
                    <div className="space-y-3">
                        <div className="flex justify-between py-2 border-b border-charcoal/5">
                            <span className="text-sm text-muted">الاسم</span>
                            <span className="text-sm font-medium text-charcoal">
                {address.fullName}
              </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-charcoal/5">
                            <span className="text-sm text-muted">التليفون</span>
                            <span className="text-sm font-medium text-charcoal" dir="ltr">
                {address.phone}
              </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-charcoal/5">
                            <span className="text-sm text-muted">المدينة</span>
                            <span className="text-sm font-medium text-charcoal">
                {address.city}
              </span>
                        </div>
                        <div className="py-2">
                            <p className="text-sm text-muted mb-1">العنوان</p>
                            <p className="text-sm font-medium text-charcoal">
                                {address.address}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Link
                    href="/account/orders"
                    className="group bg-white rounded-lg border border-charcoal/10 hover:border-gold p-6 transition-all hover:shadow-lg animate-fade-up opacity-0"
                    style={{ animationDelay: "200ms", animationFillMode: "forwards" }}
                >
                    <h3 className="text-base font-semibold text-charcoal mb-2 group-hover:text-gold transition-colors flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <path d="M16 10a4 4 0 0 1-8 0"></path>
                        </svg>
                        طلباتي
                    </h3>
                    <p className="text-sm text-muted">شوف كل طلباتك السابقة</p>
                </Link>

                <Link
                    href="/wishlist"
                    className="group bg-white rounded-lg border border-charcoal/10 hover:border-gold p-6 transition-all hover:shadow-lg animate-fade-up opacity-0"
                    style={{ animationDelay: "300ms", animationFillMode: "forwards" }}
                >
                    <h3 className="text-base font-semibold text-charcoal mb-2 group-hover:text-gold transition-colors flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
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
                style={{ animationDelay: "400ms", animationFillMode: "forwards" }}
            >
                تسجيل خروج
            </button>
        </div>
    );
}