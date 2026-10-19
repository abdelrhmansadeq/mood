"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useProducts } from "./products-context";
import { useAuth } from "./auth-context";
import { fetchCartFromDB, syncCartWithDB, clearCartFromDB } from "@/lib/cart-api";

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
    const { user } = useAuth();

    // 1. تحميل السلة (من الداتابيز لو مسجل، أو من المتصفح لو زائر)
    useEffect(() => {
        const loadCart = async () => {
            setMounted(false);

            if (user) {
                // مسجل دخول -> نجيب من الداتابيز
                const dbItems = await fetchCartFromDB(user.id);

                if (dbItems.length > 0) {
                    // لو لقينا سلة في الداتابيز، نستخدمها
                    setItems(dbItems.map(i => ({ ...i, nameEn: "" }))); // nameEn مش محتاجينه هنا
                    localStorage.removeItem(STORAGE_KEY); // نمسح المحلي عشان منتلخبطش
                } else {
                    // لو مفيش في الداتابيز، نشوف لو كان فيه سلة محلية وننقلها للداتابيز
                    const stored = localStorage.getItem(STORAGE_KEY);
                    if (stored) {
                        const localItems = JSON.parse(stored);
                        if (localItems.length > 0) {
                            setItems(localItems);
                            // المزامنة هتحصل في الـ useEffect اللي تحت
                        }
                    }
                }
            } else {
                // زائر -> نجيب من المتصفح
                try {
                    const stored = localStorage.getItem(STORAGE_KEY);
                    if (stored) {
                        const parsed = JSON.parse(stored);
                        if (Array.isArray(parsed)) setItems(parsed);
                    }
                } catch (e) {
                    console.error("Failed to load cart", e);
                }
            }
            setMounted(true);
        };

        void loadCart();
    }, [user]);

    // 2. حفظ ومزامنة السلة كل ما تتغير
    useEffect(() => {
        if (!mounted) return;

        if (user && user.email) {
            // مسجل -> نزامن مع الداتابيز (بنستنى ثانيتين عشان لو بيضيف كذا حاجة ورا بعض)
            const timer = setTimeout(() => {
                const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

                if (items.length > 0) {
                    const dbItems = items.map(i => ({
                        productId: i.productId,
                        name: i.name,
                        price: i.price,
                        image: i.image,
                        size: i.size,
                        color: i.color,
                        quantity: i.quantity
                    }));
                    void syncCartWithDB(user.id, user.email!, dbItems, totalPrice);
                } else {
                    void clearCartFromDB(user.id);
                }
            }, 2000);

            return () => clearTimeout(timer);
        } else {
            // زائر -> نحفظ في المتصفح
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
            } catch (e) {
                console.error("Failed to save cart", e);
            }
        }
    }, [items, mounted, user]);

    // 3. تحديث الأسعار من المنتجات
    useEffect(() => {
        if (!mounted || products.length === 0) return;
        const productMap = new Map(products.map((p) => [p.id, p]));
        let hasChanges = false;

        const updated = items
            .filter((item) => productMap.has(item.productId))
            .map((item) => {
                const product = productMap.get(item.productId)!;
                const effectivePrice = product.salePrice != null && product.salePrice < product.price ? product.salePrice : product.price;

                if (item.price !== effectivePrice || item.name !== product.name || item.nameEn !== product.nameEn) {
                    hasChanges = true;
                    return { ...item, price: effectivePrice, name: product.name, nameEn: product.nameEn };
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
                (i) => i.productId === newItem.productId && i.size === newItem.size && i.color === newItem.color
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
            prev.filter((i) => !(i.productId === productId && i.size === size && i.color === color))
        );
    };

    const updateQuantity = (productId: number, size: string, color: string, quantity: number) => {
        if (quantity < 1) return;
        setItems((prev) =>
            prev.map((i) => (i.productId === productId && i.size === size && i.color === color ? { ...i, quantity } : i))
        );
    };

    // ✅ لما بيشتري أو بيفضي السلة، بنمسحها من الداتابيز فوراً
    const clearCart = () => {
        setItems([]);
        if (user) {
            void clearCartFromDB(user.id);
        } else {
            localStorage.removeItem(STORAGE_KEY);
        }
    };

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