"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { Product } from "@/data/products";
import {
    fetchProducts,
    addProductToDB,
    updateProductInDB,
    deleteProductFromDB,
} from "@/lib/products-api";

type ProductsContextType = {
    products: Product[];
    isLoading: boolean;
    error: string | null;
    addProduct: (product: Omit<Product, "id">) => Promise<void>;
    updateProduct: (id: number, updates: Partial<Product>) => Promise<void>;
    deleteProduct: (id: number) => Promise<void>;
    refreshProducts: () => Promise<void>;
};

const ProductsContext = createContext<ProductsContextType | null>(null);

export function ProductsProvider({ children }: { children: ReactNode }) {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadProducts = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await fetchProducts();
            setProducts(data);
        } catch (e) {
            console.error("Failed to load products:", e);
            setError("حصلت مشكلة في تحميل المنتجات");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // ✅ إضافة هذا السطر لتجاهل تحذير React 19
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void loadProducts();
    }, []);

    const addProduct = async (product: Omit<Product, "id">) => {
        try {
            const newProduct = await addProductToDB(product);
            setProducts((prev) => [...prev, newProduct]);
        } catch (e) {
            console.error("Failed to add product:", e);
            throw e;
        }
    };

    const updateProduct = async (id: number, updates: Partial<Product>) => {
        try {
            const updated = await updateProductInDB(id, updates);
            setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
        } catch (e) {
            console.error("Failed to update product:", e);
            throw e;
        }
    };

    const deleteProduct = async (id: number) => {
        try {
            await deleteProductFromDB(id);
            setProducts((prev) => prev.filter((p) => p.id !== id));
        } catch (e) {
            console.error("Failed to delete product:", e);
            throw e;
        }
    };

    return (
        <ProductsContext.Provider
            value={{
                products,
                isLoading,
                error,
                addProduct,
                updateProduct,
                deleteProduct,
                refreshProducts: loadProducts,
            }}
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