"use client";

import { useState, useEffect, useMemo } from "react";
import type { FormEvent, ChangeEvent } from "react";
import Link from "next/link";
import Image from "next/image"; // ✅ استخدمنا Image
import { useAuth } from "./auth-context";
import { useToast } from "./toast-context";
import { supabase } from "@/lib/supabase";
import {
    fetchProductReviews, fetchUserReview, checkUserPurchased,
    createReview, updateReview, deleteReview, getAverageRating, type Review,
} from "@/lib/reviews-api";

type Props = { productId: number; };

export default function ProductReviews({ productId }: Props) {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [userReview, setUserReview] = useState<Review | null>(null);
    const [hasPurchased, setHasPurchased] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");

    // ✅ حالات الصورة
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        let isMounted = true;
        const loadData = async () => {
            try {
                const allReviews = await fetchProductReviews(productId);
                if (!isMounted) return;
                setReviews(allReviews);

                if (user) {
                    const [myReview, purchased] = await Promise.all([
                        fetchUserReview(productId, user.id),
                        checkUserPurchased(user.id, productId),
                    ]);
                    if (!isMounted) return;

                    setUserReview(myReview);
                    setHasPurchased(purchased);

                    if (myReview) {
                        setRating(myReview.rating);
                        setComment(myReview.comment || "");
                        setImageUrl(myReview.imageUrl || null);
                    }
                }
            } catch (e) { console.error(e); } finally { if (isMounted) setIsLoading(false); }
        };
        void loadData();
        return () => { isMounted = false; };
    }, [productId, user]);

    const reloadReviews = async () => {
        const allReviews = await fetchProductReviews(productId);
        setReviews(allReviews);
    };

    // ✅ حساب توزيع النجوم
    const ratingDistribution = useMemo(() => {
        const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviews.forEach((r) => { dist[r.rating as keyof typeof dist]++; });
        return dist;
    }, [reviews]);

    const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("لازم تسجل دخول");

            const data = new FormData();
            data.append("file", file);

            const res = await fetch("/api/reviews/upload", {
                method: "POST",
                headers: { Authorization: `Bearer ${session.access_token}` },
                body: data,
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json.error);

            setImageUrl(json.url);
            showToast("تم رفع الصورة بنجاح", "success");
        } catch (err: any) {
            showToast(err.message || "فشل رفع الصورة", "error");
        } finally {
            setIsUploading(false);
            e.target.value = "";
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!user) return;

        setError("");
        setIsSubmitting(true);

        try {
            const userName = user.user_metadata?.full_name || user.email || "عميل Mood";

            if (userReview) {
                const updated = await updateReview(userReview.id, { rating, comment, imageUrl });
                setUserReview(updated);
                setReviews((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
                showToast("تم تحديث التقييم", "success");
            } else {
                const created = await createReview({
                    productId, userId: user.id, userName, rating, comment, imageUrl,
                });
                setUserReview(created);
                setReviews((prev) => [created, ...prev]);
                showToast("تم إضافة التقييم", "success");
            }
            setIsEditing(false);
        } catch (e) {
            console.error(e);
            setError("حصلت مشكلة، حاول تاني");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!userReview) return;
        if (!confirm("إنت متأكد إنك عايز تمسح تقييمك؟")) return;

        try {
            await deleteReview(userReview.id);
            await reloadReviews();
            setUserReview(null);
            setRating(5);
            setComment("");
            setImageUrl(null);
            setIsEditing(false);
            showToast("تم حذف التقييم", "success");
        } catch (e) {
            console.error(e);
            showToast("حصلت مشكلة في الحذف", "error");
        }
    };

    const avgRating = getAverageRating(reviews);

    if (isLoading) return <div className="mt-16 pt-10 border-t border-charcoal/10"><p className="text-muted text-sm">جاري تحميل التقييمات...</p></div>;

    return (
        <div className="mt-16 pt-10 border-t border-charcoal/10">
            {/* Header & Rating Distribution */}
            <div className="flex flex-col md:flex-row md:items-start gap-8 mb-10">
                <div className="md:w-1/3">
                    <p className="text-gold text-xs font-medium tracking-widest uppercase mb-2">Reviews</p>
                    <h2 className="text-2xl font-bold text-charcoal mb-4">التقييمات والمراجعات</h2>

                    {reviews.length > 0 && (
                        <div className="flex items-center gap-4">
                            <div className="text-center">
                                <p className="text-4xl font-bold text-charcoal">{avgRating}</p>
                                <Stars value={avgRating} size="sm" />
                                <p className="text-xs text-muted mt-1">({reviews.length} تقييم)</p>
                            </div>

                            {/* ✅ شريط التوزيع */}
                            <div className="flex-1 space-y-1.5">
                                {[5, 4, 3, 2, 1].map((star) => {
                                    const count = ratingDistribution[star as keyof typeof ratingDistribution];
                                    const percent = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                                    return (
                                        <div key={star} className="flex items-center gap-2 text-xs">
                                            <span className="w-3 text-muted">{star}</span>
                                            <Star filled={true} className="w-3 h-3" />
                                            <div className="flex-1 h-2 bg-charcoal/10 rounded-full overflow-hidden">
                                                <div className="h-full bg-gold rounded-full" style={{ width: `${percent}%` }} />
                                            </div>
                                            <span className="w-6 text-right text-muted">{count}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Add Review Form */}
                <div className="md:w-2/3">
                    {!user ? (
                        <div className="bg-white rounded-lg border border-charcoal/10 p-6 text-center">
                            <p className="text-sm text-muted mb-4">عشان تقدر تقيّم المنتج، لازم تسجل دخول الأول</p>
                            <Link href="/login" className="inline-block bg-charcoal hover:bg-gold text-cream hover:text-charcoal font-semibold px-6 py-2.5 rounded-md transition-colors text-sm">تسجيل الدخول</Link>
                        </div>
                    ) : userReview && !isEditing ? (
                        <div className="bg-white rounded-lg border border-gold/30 p-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-medium text-charcoal">تقييمك:</span>
                                    <Stars value={userReview.rating} size="sm" />
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => setIsEditing(true)} className="text-sm text-charcoal hover:text-gold transition-colors">تعديل</button>
                                    <button onClick={handleDelete} className="text-sm text-error hover:underline">حذف</button>
                                </div>
                            </div>
                            {userReview.comment && <p className="text-sm text-charcoal/80 leading-relaxed mb-3">{userReview.comment}</p>}
                            {userReview.imageUrl && (
                                <div className="relative w-24 h-24 rounded-md overflow-hidden border border-charcoal/10">
                                    <Image src={userReview.imageUrl} alt="Review" fill className="object-cover" />
                                </div>
                            )}
                        </div>
                    ) : !hasPurchased ? (
                        <div className="bg-white rounded-lg border border-charcoal/10 p-6 text-center">
                            <div className="w-12 h-12 rounded-full bg-charcoal/5 flex items-center justify-center mx-auto mb-3">
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6B6B6B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
                            </div>
                            <p className="text-sm font-medium text-charcoal mb-1">لازم تشتري المنتج عشان تقيّمه</p>
                            <p className="text-xs text-muted mb-4">بنقبل التقييمات من العملاء اللي اشتروا المنتج فعلاً</p>
                            <Link href="/products" className="inline-block border border-charcoal/20 hover:border-charcoal text-charcoal font-medium px-5 py-2 rounded-md transition-colors text-sm">تسوق دلوقتي</Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-charcoal/10 p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <h3 className="text-base font-semibold text-charcoal">{userReview ? "عدّل تقييمك" : "أضف تقييمك"}</h3>
                                <span className="inline-flex items-center gap-1 bg-success/10 text-success text-xs font-medium px-2 py-0.5 rounded-full">✓ عميل مشتري</span>
                            </div>

                            <div className="mb-5">
                                <label className="block text-sm font-medium text-charcoal mb-2">التقييم</label>
                                <div className="flex gap-1" dir="ltr">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button key={star} type="button" onClick={() => setRating(star)} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} className="p-1 transition-transform hover:scale-110">
                                            <Star filled={star <= (hoverRating || rating)} size="lg" />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-5">
                                <label className="block text-sm font-medium text-charcoal mb-2">تعليقك (اختياري)</label>
                                <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} placeholder="شاركنا رأيك في المنتج..." className="w-full px-4 py-3 rounded-md border border-charcoal/15 bg-white text-sm text-charcoal focus:outline-none focus:border-gold transition-colors resize-none" />
                            </div>

                            {/* ✅ خانة رفع الصورة */}
                            <div className="mb-5">
                                <label className="block text-sm font-medium text-charcoal mb-2">أضف صورة (اختياري)</label>
                                <input type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploading} className="block w-full text-sm text-charcoal file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-charcoal file:text-cream hover:file:bg-gold hover:file:text-charcoal transition-all cursor-pointer disabled:opacity-50" />
                                {isUploading && <p className="text-xs text-gold mt-2 animate-pulse">جاري الرفع...</p>}
                                {imageUrl && (
                                    <div className="mt-3 relative w-20 h-20 rounded-md overflow-hidden border border-charcoal/10">
                                        <Image src={imageUrl} alt="Preview" fill className="object-cover" />
                                        <button type="button" onClick={() => setImageUrl(null)} className="absolute top-1 right-1 bg-error text-white rounded-full p-1"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                                    </div>
                                )}
                            </div>

                            {error && <div className="bg-error/10 text-error border border-error/30 rounded-md p-3 text-sm mb-4">{error}</div>}

                            <div className="flex gap-3">
                                <button type="submit" disabled={isSubmitting || isUploading} className="bg-charcoal hover:bg-gold text-cream hover:text-charcoal font-semibold px-6 py-2.5 rounded-md transition-colors disabled:opacity-50">
                                    {isSubmitting ? "جاري الحفظ..." : userReview ? "حفظ التعديلات" : "إرسال التقييم"}
                                </button>
                                {userReview && (
                                    <button type="button" onClick={() => { setIsEditing(false); setRating(userReview.rating); setComment(userReview.comment || ""); setImageUrl(userReview.imageUrl || null); setError(""); }} className="px-6 border border-charcoal/15 hover:border-charcoal/30 text-charcoal font-medium rounded-md transition-colors">إلغاء</button>
                                )}
                            </div>
                        </form>
                    )}
                </div>
            </div>

            {/* Reviews List */}
            {reviews.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-charcoal/10">
                    <p className="text-muted text-sm">مفيش تقييمات لحد الآن. كن أول واحد يقيّم المنتج!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {reviews.map((review) => (
                        <div key={review.id} className="bg-white rounded-lg border border-charcoal/10 p-5">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <p className="text-sm font-medium text-charcoal">{review.userName}</p>
                                    <p className="text-xs text-muted">{new Date(review.createdAt).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })}</p>
                                </div>
                                <Stars value={review.rating} size="sm" />
                            </div>
                            {review.comment && <p className="text-sm text-charcoal/80 leading-relaxed mb-3">{review.comment}</p>}
                            {review.imageUrl && (
                                <div className="relative w-full h-40 rounded-md overflow-hidden border border-charcoal/10">
                                    <Image src={review.imageUrl} alt="Review Image" fill className="object-cover" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function Stars({ value, size = "sm" }: { value: number; size?: "sm" | "lg" }) {
    const starSize = size === "lg" ? "w-5 h-5" : "w-4 h-4";
    return (
        <div className="flex gap-0.5" dir="ltr">
            {[1, 2, 3, 4, 5].map((star) => <Star key={star} filled={star <= Math.round(value)} className={starSize} />)}
        </div>
    );
}

function Star({ filled, size = "sm", className }: { filled: boolean; size?: "sm" | "lg"; className?: string; }) {
    const cls = className || (size === "lg" ? "w-6 h-6" : "w-4 h-4");
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={filled ? "#C89B5A" : "none"} stroke={filled ? "#C89B5A" : "#B0B0B0"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={cls}>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
    );
}