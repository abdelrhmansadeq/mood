"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { products as seedProducts, type Product } from "@/data/products";

type ProductsContextType = {
    products: Product[];
    addProduct: (product: Omit<Product, "id">) => void;
    updateProduct: (id: number, updates: Partial<Product>) => void;
    deleteProduct: (id: number) => void;
    resetProducts: () => void;
};

const ProductsContext = createContext<ProductsContextType | null>(null);

const STORAGE_KEY = "mood-products";

export function ProductsProvider({ children }: { children: ReactNode }) {
    const [products, setProducts] = useState<Product[]>(seedProducts);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        let initialProducts = seedProducts;

        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    initialProducts = parsed;
                }
            }
        } catch (e) {
            console.error("Failed to load products", e);
        }

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setProducts(initialProducts);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoaded(true);
    }, []);

    useEffect(() => {
        if (!loaded) return;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
        } catch (e) {
            console.error("Failed to save products", e);
        }
    }, [products, loaded]);

    const addProduct = (product: Omit<Product, "id">) => {
        setProducts((prev) => {
            const newId = prev.length > 0 ? Math.max(...prev.map((p) => p.id)) + 1 : 1;
            return [...prev, { ...product, id: newId }];
        });
    };

    const updateProduct = (id: number, updates: Partial<Product>) => {
        setProducts((prev) =>
            prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
        );
    };

    const deleteProduct = (id: number) => {
        setProducts((prev) => prev.filter((p) => p.id !== id));
    };

    const resetProducts = () => setProducts(seedProducts);

    return (
        <ProductsContext.Provider
            value={{ products, addProduct, updateProduct, deleteProduct, resetProducts }}
        >
            {children}
        </ProductsContext.Provider>
    );
}

export function useProducts() {
    const ctx = useContext(ProductsContext);
    if (!ctx) throw new Error("useProducts must be used within ProductsProvider");
    return ctx;
}