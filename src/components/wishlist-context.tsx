"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useProducts } from "./products-context";
import { useAuth } from "./auth-context";
import { fetchUserWishlist, addToWishlist, removeFromWishlist } from "@/lib/wishlist-api";
import { supabase } from "@/lib/supabase";

type WishlistContextType = {
    items: number[];
    toggleItem: (productId: number) => Promise<void>;
    isInWishlist: (productId: number) => boolean;
    removeItem: (productId: number) => Promise<void>;
    clearWishlist: () => void;
    totalItems: number;
};

const WishlistContext = createContext<WishlistContextType | null>(null);
const STORAGE_KEY = "mood-wishlist";

export function WishlistProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<number[]>([]);
    const [mounted, setMounted] = useState(false);
    const { products } = useProducts();
    const { user } = useAuth();

    // 1. تحميل البيانات الأولية (سواء من الداتابيز أو الـ LocalStorage)
    useEffect(() => {
        const loadWishlist = async () => {
            setMounted(false);

            // لو المستخدم مسجل دخول
            if (user) {
                try {
                    // نجيب مفضلته من الداتابيز
                    const dbItems = await fetchUserWishlist(user.id);

                    // نشوف لو كان فيه حاجات في الـ LocalStorage (عشان ننقلها)
                    const stored = localStorage.getItem(STORAGE_KEY);
                    let localItems: number[] = [];
                    if (stored) {
                        localItems = JSON.parse(stored) || [];
                    }

                    // ندمج الاتنين (بنجيب الحاجات اللي في اللوكال مش في الداتابيز ونضيفها)
                    const itemsToAdd = localItems.filter(id => !dbItems.includes(id));

                    if (itemsToAdd.length > 0) {
                        // نضيفهم للداتابيز
                        await Promise.all(itemsToAdd.map(id => addToWishlist(user.id, id)));
                        // نحدث الـ State بالشكل النهائي
                        setItems(Array.from(new Set([...dbItems, ...localItems])));
                    } else {
                        setItems(dbItems);
                    }

                    // نفضي الـ LocalStorage عشان منستخدمهوش تاني طول ما هو مسجل
                    localStorage.removeItem(STORAGE_KEY);
                } catch (e) {
                    console.error("Error loading user wishlist:", e);
                }
            } else {
                // لو زائر، بنقرأ من الـ LocalStorage زي الأول
                try {
                    const stored = localStorage.getItem(STORAGE_KEY);
                    if (stored) {
                        const parsed = JSON.parse(stored);
                        if (Array.isArray(parsed)) setItems(parsed);
                    }
                } catch (e) {
                    console.error("Failed to load wishlist from storage", e);
                }
            }

            setMounted(true);
        };

        loadWishlist();
    }, [user]);

    // 2. حفظ التغييرات (لو زائر بنحفظ في المتصفح فقط)
    useEffect(() => {
        if (!mounted) return;
        if (!user) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
            } catch (e) {
                console.error("Failed to save wishlist to storage", e);
            }
        }
    }, [items, mounted, user]);

    // 3. تنظيف المنتجات المحذوفة
    useEffect(() => {
        if (!mounted || products.length === 0) return;
        const validIds = new Set(products.map((p) => p.id));
        const filtered = items.filter((id) => validIds.has(id));
        if (filtered.length !== items.length) {
            setItems(filtered);
        }
    }, [products, mounted, items]);

    // 4. دالة الإضافة/الإزالة
    const toggleItem = async (productId: number) => {
        const isCurrentlyIn = items.includes(productId);

        // تحديث الواجهة فوراً (Optimistic UI)
        const newItems = isCurrentlyIn
            ? items.filter(id => id !== productId)
            : [...items, productId];
        setItems(newItems);

        // لو المستخدم مسجل، بنطبق التغيير في الداتابيز
        if (user) {
            if (isCurrentlyIn) {
                await removeFromWishlist(user.id, productId);
            } else {
                await addToWishlist(user.id, productId);
            }
        }
    };

    const removeItem = async (productId: number) => {
        // تحديث الواجهة فوراً
        setItems((prev) => prev.filter((id) => id !== productId));

        // لو مسجل، بنمسح من الداتابيز
        if (user) {
            await removeFromWishlist(user.id, productId);
        }
    };

    const isInWishlist = (productId: number) => items.includes(productId);

    const clearWishlist = () => {
        setItems([]);
        if (user) {
            // لو عايزين نمسح كل حاجة من الداتابيز (اختياري)
            // ممكن نعمل دالة تسحب كل حاجة وتمسحها، بس دلوقتي هنكتفي بمسحها من الواجهة
        } else {
            localStorage.removeItem(STORAGE_KEY);
        }
    };

    return (
        <WishlistContext.Provider
            value={{
                items,
                toggleItem,
                isInWishlist,
                removeItem,
                clearWishlist,
                totalItems: items.length,
            }}
        >
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const ctx = useContext(WishlistContext);
    if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
    return ctx;
}