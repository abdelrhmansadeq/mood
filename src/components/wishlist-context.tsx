"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type WishlistContextType = {
    items: number[];
    toggleItem: (productId: number) => void;
    isInWishlist: (productId: number) => boolean;
    removeItem: (productId: number) => void;
    clearWishlist: () => void;
    totalItems: number;
};

const WishlistContext = createContext<WishlistContextType | null>(null);
const STORAGE_KEY = "mood-wishlist";

export function WishlistProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<number[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) setItems(parsed);
            }
        } catch (e) {
            console.error("Failed to load wishlist", e);
        }
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        } catch (e) {
            console.error("Failed to save wishlist", e);
        }
    }, [items, mounted]);

    const toggleItem = (productId: number) => {
        setItems((prev) =>
            prev.includes(productId)
                ? prev.filter((id) => id !== productId)
                : [...prev, productId]
        );
    };

    const removeItem = (productId: number) => {
        setItems((prev) => prev.filter((id) => id !== productId));
    };

    const isInWishlist = (productId: number) => items.includes(productId);

    const clearWishlist = () => setItems([]);

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