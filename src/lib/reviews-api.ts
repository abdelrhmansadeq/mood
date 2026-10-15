import { supabase } from "./supabase";

export type Review = {
    id: number;
    productId: number;
    userId: string;
    userName: string;
    rating: number;
    comment: string | null;
    createdAt: string;
};

type SupabaseReview = {
    id: number;
    product_id: number;
    user_id: string;
    user_name: string;
    rating: number;
    comment: string | null;
    created_at: string;
};

function toReview(row: SupabaseReview): Review {
    return {
        id: row.id,
        productId: row.product_id,
        userId: row.user_id,
        userName: row.user_name,
        rating: row.rating,
        comment: row.comment,
        createdAt: row.created_at,
    };
}

export async function fetchProductReviews(productId: number): Promise<Review[]> {
    const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("product_id", productId)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching reviews:", error);
        throw error;
    }

    return (data as SupabaseReview[]).map(toReview);
}

export async function fetchUserReview(
    productId: number,
    userId: string
): Promise<Review | null> {
    const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("product_id", productId)
        .eq("user_id", userId)
        .maybeSingle();

    if (error) {
        console.error("Error fetching user review:", error);
        return null;
    }

    return data ? toReview(data as SupabaseReview) : null;
}

export async function createReview(params: {
    productId: number;
    userId: string;
    userName: string;
    rating: number;
    comment: string;
}): Promise<Review> {
    const { data, error } = await supabase
        .from("reviews")
        .insert({
            product_id: params.productId,
            user_id: params.userId,
            user_name: params.userName,
            rating: params.rating,
            comment: params.comment || null,
        })
        .select()
        .single();

    if (error) {
        console.error("Error creating review:", error);
        throw error;
    }

    return toReview(data as SupabaseReview);
}

export async function updateReview(
    reviewId: number,
    params: { rating: number; comment: string }
): Promise<Review> {
    const { data, error } = await supabase
        .from("reviews")
        .update({
            rating: params.rating,
            comment: params.comment || null,
        })
        .eq("id", reviewId)
        .select()
        .single();

    if (error) {
        console.error("Error updating review:", error);
        throw error;
    }

    return toReview(data as SupabaseReview);
}

export async function deleteReview(reviewId: number): Promise<void> {
    const { error } = await supabase.from("reviews").delete().eq("id", reviewId);

    if (error) {
        console.error("Error deleting review:", error);
        throw error;
    }
}

export function getAverageRating(reviews: Review[]): number {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return Math.round((sum / reviews.length) * 10) / 10;
}