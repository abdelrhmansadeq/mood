"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Command } from "cmdk";
import { useProducts } from "./products-context";

export default function CommandMenu() {
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const { products } = useProducts();
    const pathname = usePathname();

    // ✅ 1. لازم كل الـ Hooks تتستدعي الأول
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    // ✅ 2. بعد كل الـ Hooks، ينفع نعمل شرط الإخفاء
    if (pathname.startsWith("/admin")) return null;

    const runCommand = (command: () => void) => {
        setOpen(false);
        command();
    };

    const pages = [
        { name: "الرئيسية", path: "/" },
        { name: "كل المنتجات", path: "/products" },
        { name: "من نحن", path: "/about" },
        { name: "تواصل معنا", path: "/contact" },
        { name: "حسابي", path: "/account" },
        { name: "المفضلة", path: "/wishlist" },
    ];

    return (
        <Command.Dialog
            open={open}
            onOpenChange={setOpen}
            label="البحث الشامل"
            className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-charcoal/50 backdrop-blur-sm animate-fade-in"
            onClick={(e) => {
                if (e.target === e.currentTarget) setOpen(false);
            }}
        >
            <div className="w-full max-w-xl bg-cream rounded-xl shadow-2xl overflow-hidden border border-charcoal/10 mx-4 animate-fade-up">
                <Command.Input
                    autoFocus
                    placeholder="ابحث عن منتج، صفحة، أو تصنيف..."
                    className="w-full px-6 py-4 text-charcoal bg-transparent border-b border-charcoal/10 outline-none placeholder:text-muted text-sm"
                />

                <Command.List className="max-h-[300px] overflow-y-auto p-2">
                    <Command.Empty className="py-6 text-center text-sm text-muted">
                        لا توجد نتائج مطابقة لبحثك.
                    </Command.Empty>

                    {/* قسم الصفحات */}
                    <Command.Group heading="صفحات الموقع" className="px-2 py-1 text-xs font-semibold text-gold uppercase tracking-wider mb-2 mt-2">
                        {pages.map((page) => (
                            <Command.Item
                                key={page.path}
                                onSelect={() => runCommand(() => router.push(page.path))}
                                className="flex items-center gap-3 px-4 py-3 text-sm text-charcoal rounded-lg cursor-pointer hover:bg-white aria-selected:bg-white aria-selected:shadow-sm transition-all"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                                {page.name}
                            </Command.Item>
                        ))}
                    </Command.Group>

                    {/* قسم المنتجات */}
                    {products.length > 0 && (
                        <Command.Group heading="المنتجات" className="px-2 py-1 text-xs font-semibold text-gold uppercase tracking-wider mb-2 mt-4">
                            {products.map((product) => (
                                <Command.Item
                                    key={product.id}
                                    value={`${product.name} ${product.nameEn}`}
                                    onSelect={() => runCommand(() => router.push(`/products/${product.id}`))}
                                    className="flex items-center justify-between px-4 py-3 text-sm rounded-lg cursor-pointer hover:bg-white aria-selected:bg-white aria-selected:shadow-sm transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-10 rounded bg-cream overflow-hidden flex-shrink-0">
                                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-charcoal font-medium">{product.name}</span>
                                            <span className="text-xs text-muted">{product.nameEn}</span>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-gold group-hover:block hidden">↵ للانتقال</span>
                                </Command.Item>
                            ))}
                        </Command.Group>
                    )}
                </Command.List>

                <div className="border-t border-charcoal/10 p-3 bg-white/50 text-xs text-muted flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <kbd className="bg-white border border-charcoal/20 px-2 py-0.5 rounded text-[10px] font-sans">↑</kbd>
                        <kbd className="bg-white border border-charcoal/20 px-2 py-0.5 rounded text-[10px] font-sans">↓</kbd>
                        <span>للتنقل</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <kbd className="bg-white border border-charcoal/20 px-2 py-0.5 rounded text-[10px] font-sans">Enter</kbd>
                        <span>لاختيار</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <kbd className="bg-white border border-charcoal/20 px-2 py-0.5 rounded text-[10px] font-sans">Esc</kbd>
                        <span>للإغلاق</span>
                    </div>
                </div>
            </div>
        </Command.Dialog>
    );
}