"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "./auth-context";
import { useToast } from "./toast-context";
import {
    fetchProductReviews,
    fetchUserReview,
    createReview,
    updateReview,
    deleteReview,
    getAverageRating,
    type Review,
} from "@/lib/reviews-api";

type Props = {
    productId: number;
};

export default function ProductReviews({ productId }: Props) {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [userReview, setUserReview] = useState<Review | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const loadData = async () => {
        try {
            const allReviews = await fetchProductReviews(productId);
            setReviews(allReviews);

            if (user) {
                const myReview = await fetchUserReview(productId, user.id);
                setUserReview(myReview);
                if (myReview) {
                    setRating(myReview.rating);
                    setComment(myReview.comment || "");
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [productId, user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setError("");
        setIsSubmitting(true);

        try {
            const userName = user.user_metadata?.full_name || user.email || "عميل Mood";

            if (userReview) {
                const updated = await updateReview(userReview.id, { rating, comment });
                setUserReview(updated);
                setReviews((prev) =>
                    prev.map((r) => (r.id === updated.id ? updated : r))
                );
                showToast("تم تحديث التقييم", "success");
            } else {
                const created = await createReview({
                    productId,
                    userId: user.id,
                    userName,
                    rating,
                    comment,
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
            setReviews((prev) => prev.filter((r) => r.id !== userReview.id));
            setUserReview(null);
            setRating(5);
            setComment("");
            setIsEditing(false);
            showToast("تم حذف التقييم", "success");
        } catch (e) {
            console.error(e);
            showToast("حصلت مشكلة في الحذف", "error");
        }
    };

    const avgRating = getAverageRating(reviews);

    if (isLoading) {
        return (
            <div className="mt-16 pt-10 border-t border-charcoal/10">
                <p className="text-muted text-sm">جاري تحميل التقييمات...</p>
            </div>
        );
    }

    return (
        <div className="mt-16 pt-10 border-t border-charcoal/10">
            {/* Header */}
            <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
                <div>
                    <p className="text-gold text-xs font-medium tracking-widest uppercase mb-2">
                        Reviews
                    </p>
                    <h2 className="text-2xl font-bold text-charcoal">
                        التقييمات والمراجعات
                    </h2>
                </div>

                {reviews.length > 0 && (
                    <div className="flex items-center gap-3">
                        <Stars value={avgRating} size="lg" />
                        <div className="text-sm">
                            <span className="font-bold text-charcoal">{avgRating}</span>
                            <span className="text-muted"> من 5</span>
                            <p className="text-xs text-muted">({reviews.length} تقييم)</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Add Review Form */}
            <div className="mb-10">
                {!user ? (
                    <div className="bg-white rounded-lg border border-charcoal/10 p-6 text-center">
                        <p className="text-sm text-muted mb-4">
                            عشان تقدر تقيّم المنتج، لازم تسجل دخول الأول
                        </p>
                        <Link
                            href="/login"
                            className="inline-block bg-charcoal hover:bg-gold text-cream hover:text-charcoal font-semibold px-6 py-2.5 rounded-md transition-colors text-sm"
                        >
                            تسجيل الدخول
                        </Link>
                    </div>
                ) : userReview && !isEditing ? (
                    <div className="bg-white rounded-lg border border-gold/30 p-6">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-charcoal">
                  تقييمك:
                </span>
                                <Stars value={userReview.rating} size="sm" />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="text-sm text-charcoal hover:text-gold transition-colors"
                                >
                                    تعديل
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="text-sm text-error hover:underline"
                                >
                                    حذف
                                </button>
                            </div>
                        </div>
                        {userReview.comment && (
                            <p className="text-sm text-charcoal/80 leading-relaxed">
                                {userReview.comment}
                            </p>
                        )}
                    </div>
                ) : (
                    <form
                        onSubmit={handleSubmit}
                        className="bg-white rounded-lg border border-charcoal/10 p-6"
                    >
                        <h3 className="text-base font-semibold text-charcoal mb-4">
                            {userReview ? "عدّل تقييمك" : "أضف تقييمك"}
                        </h3>

                        <div className="mb-5">
                            <label className="block text-sm font-medium text-charcoal mb-2">
                                التقييم
                            </label>
                            <div className="flex gap-1" dir="ltr">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        className="p-1 transition-transform hover:scale-110"
                                        aria-label={`${star} نجوم`}
                                    >
                                        <Star filled={star <= (hoverRating || rating)} size="lg" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mb-5">
                            <label className="block text-sm font-medium text-charcoal mb-2">
                                تعليقك (اختياري)
                            </label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows={4}
                                placeholder="شاركنا رأيك في المنتج..."
                                className="w-full px-4 py-3 rounded-md border border-charcoal/15 bg-white text-sm text-charcoal focus:outline-none focus:border-gold transition-colors resize-none"
                            />
                        </div>

                        {error && (
                            <div className="bg-error/10 text-error border border-error/30 rounded-md p-3 text-sm mb-4">
                                {error}
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-charcoal hover:bg-gold text-cream hover:text-charcoal font-semibold px-6 py-2.5 rounded-md transition-colors disabled:opacity-50"
                            >
                                {isSubmitting
                                    ? "جاري الحفظ..."
                                    : userReview
                                        ? "حفظ التعديلات"
                                        : "إرسال التقييم"}
                            </button>
                            {userReview && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setRating(userReview.rating);
                                        setComment(userReview.comment || "");
                                        setError("");
                                    }}
                                    className="px-6 border border-charcoal/15 hover:border-charcoal/30 text-charcoal font-medium rounded-md transition-colors"
                                >
                                    إلغاء
                                </button>
                            )}
                        </div>
                    </form>
                )}
            </div>

            {/* Reviews List */}
            {reviews.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-charcoal/10">
                    <p className="text-muted text-sm">
                        مفيش تقييمات لحد الآن. كن أول واحد يقيّم المنتج!
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <div
                            key={review.id}
                            className="bg-white rounded-lg border border-charcoal/10 p-5"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <p className="text-sm font-medium text-charcoal">
                                        {review.userName}
                                    </p>
                                    <p className="text-xs text-muted">
                                        {new Date(review.createdAt).toLocaleDateString("ar-EG", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </p>
                                </div>
                                <Stars value={review.rating} size="sm" />
                            </div>
                            {review.comment && (
                                <p className="text-sm text-charcoal/80 leading-relaxed">
                                    {review.comment}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

/* === Stars Component === */
function Stars({ value, size = "sm" }: { value: number; size?: "sm" | "lg" }) {
    const starSize = size === "lg" ? "w-5 h-5" : "w-4 h-4";
    return (
        <div className="flex gap-0.5" dir="ltr">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    filled={star <= Math.round(value)}
                    className={starSize}
                />
            ))}
        </div>
    );
}

function Star({
                  filled,
                  size = "sm",
                  className,
              }: {
    filled: boolean;
    size?: "sm" | "lg";
    className?: string;
}) {
    const cls = className || (size === "lg" ? "w-6 h-6" : "w-4 h-4");
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={filled ? "#C89B5A" : "none"}
            stroke={filled ? "#C89B5A" : "#B0B0B0"}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cls}
        >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
    );
}