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

    // Load address
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
                // نملأ البيانات الأساسية من الحساب
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

        // نحدّث الحالة
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

    const fullName = user.user_metadata?.full_name || "عميل Mood";
    const hasAddress = address !== null;

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
                </div>
            </div>

            {/* Address Card */}
            <div
                className="bg-white rounded-lg border border-charcoal/10 p-6 mb-6 animate-fade-up opacity-0"
                style={{ animationDelay: "150ms", animationFillMode: "forwards" }}
            >
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-semibold text-charcoal">
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

            {/* Start Shopping CTA */}
            <Link
                href="/products"
                className="group block bg-charcoal hover:bg-gold text-cream hover:text-charcoal rounded-lg p-6 mb-6 transition-all hover:shadow-lg animate-fade-up opacity-0"
                style={{ animationDelay: "250ms", animationFillMode: "forwards" }}
            >
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-semibold mb-1">ابدأ التسوق</h3>
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