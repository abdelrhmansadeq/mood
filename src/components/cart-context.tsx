"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useProducts } from "./products-context";

export type CartItem = {
    productId: number;
    name: string;
    nameEn: string;
    price: number;
    image: string;
    size: string;
    color: string;
    quantity: number;
};

type CartContextType = {
    items: CartItem[];
    isOpen: boolean;
    addItem: (item: CartItem) => void;
    removeItem: (productId: number, size: string, color: string) => void;
    updateQuantity: (productId: number, size: string, color: string, quantity: number) => void;
    clearCart: () => void;
    totalPrice: number;
    totalItems: number;
    openCart: () => void;
    closeCart: () => void;
};

const CartContext = createContext<CartContextType | null>(null);

const STORAGE_KEY = "mood-cart";

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const { products } = useProducts();

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    // eslint-disable-next-line react-hooks/set-state-in-effect
                    setItems(parsed);
                }
            }
        } catch (e) {
            console.error("Failed to load cart", e);
        }
        setMounted(true);
    }, []);

    // Save to localStorage whenever items change
    useEffect(() => {
        if (!mounted) return;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        } catch (e) {
            console.error("Failed to save cart", e);
        }
    }, [items, mounted]);

    // Clean stale items (products that no longer exist)
    // Sync cart with products:
// - نشيل المنتجات المحذوفة
// - نحدّث السعر والاسم لو اتغيروا
    useEffect(() => {
        if (!mounted || products.length === 0) return;

        const productMap = new Map(products.map((p) => [p.id, p]));
        let hasChanges = false;

        const updated = items
            .filter((item) => productMap.has(item.productId))
            .map((item) => {
                const product = productMap.get(item.productId)!;

                // لو السعر أو الاسم اتغير، نحدّثهم
                if (
                    item.price !== product.price ||
                    item.name !== product.name ||
                    item.nameEn !== product.nameEn
                ) {
                    hasChanges = true;
                    return {
                        ...item,
                        price: product.price,
                        name: product.name,
                        nameEn: product.nameEn,
                    };
                }
                return item;
            });

        if (updated.length !== items.length || hasChanges) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setItems(updated);
        }
    }, [products, mounted, items]);

    const addItem = (newItem: CartItem) => {
        setItems((prev) => {
            const index = prev.findIndex(
                (i) =>
                    i.productId === newItem.productId &&
                    i.size === newItem.size &&
                    i.color === newItem.color
            );
            if (index >= 0) {
                const updated = [...prev];
                updated[index].quantity += newItem.quantity;
                return updated;
            }
            return [...prev, newItem];
        });
    };

    const removeItem = (productId: number, size: string, color: string) => {
        setItems((prev) =>
            prev.filter(
                (i) => !(i.productId === productId && i.size === size && i.color === color)
            )
        );
    };

    const updateQuantity = (
        productId: number,
        size: string,
        color: string,
        quantity: number
    ) => {
        if (quantity < 1) return;
        setItems((prev) =>
            prev.map((i) =>
                i.productId === productId && i.size === size && i.color === color
                    ? { ...i, quantity }
                    : i
            )
        );
    };

    const clearCart = () => setItems([]);

    const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

    const openCart = () => setIsOpen(true);
    const closeCart = () => setIsOpen(false);

    return (
        <CartContext.Provider
            value={{
                items,
                isOpen,
                addItem,
                removeItem,
                updateQuantity,
                clearCart,
                totalPrice,
                totalItems,
                openCart,
                closeCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart must be used within CartProvider");
    return ctx;
}