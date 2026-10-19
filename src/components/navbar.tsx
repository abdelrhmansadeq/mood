"use client";

import Link from "next/link";
import { useState } from "react";
import CartIcon from "./cart-icon";
import WishlistIcon from "./wishlist-icon";
import UserMenu from "./user-menu";
import ThemeToggle from "./theme-toggle";
import CommandMenu from "./command-menu";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    const links = [
        { href: "/", labelAr: "الرئيسية", labelEn: "Home" },
        { href: "/products", labelAr: "المنتجات", labelEn: "Shop" },
        { href: "/about", labelAr: "من نحن", labelEn: "About" },
        { href: "/contact", labelAr: "تواصل", labelEn: "Contact" },
    ];

    return (
        <>
            <header className="fixed top-0 inset-x-0 z-50">
                {/* ✅ المكون هنا عشان يشتغل في الخلفية */}
                <CommandMenu />

                {/* Top Bar */}
                <div className="bg-charcoal text-cream text-[11px] md:text-xs py-2 text-center tracking-wide">
                    🚚 شحن مجاني للطلبات أكثر من 500 ج.م
                </div>

                {/* Navbar */}
                <nav className="bg-cream/90 backdrop-blur-md border-b border-charcoal/10 transition-colors">
                    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16 md:h-20">

                            {/* Logo */}
                            <Link href="/" className="flex items-center gap-2 z-50">
                <span className="text-2xl md:text-3xl font-bold tracking-tight text-charcoal">
                  Mood
                </span>
                                <span className="hidden sm:inline text-xs text-gold font-medium mt-1">
                  متجر الأناقة
                </span>
                            </Link>

                            {/* Desktop Links */}
                            <div className="hidden md:flex items-center gap-8">
                                {links.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className="text-sm font-medium text-charcoal/80 hover:text-gold transition-colors"
                                    >
                                        {link.labelAr}
                                    </Link>
                                ))}
                            </div>

                            {/* Right Side Icons */}
                            <div className="flex items-center gap-2 md:gap-4 z-50">

                                {/* ✅ زرار البحث للديسكتوب */}
                                <button
                                    onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
                                    className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-charcoal/15 hover:border-gold text-muted hover:text-charcoal transition-colors text-sm bg-white"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                                    <span>بحث...</span>
                                    <kbd className="font-sans text-[10px] bg-charcoal/5 px-1.5 py-0.5 rounded">⌘K</kbd>
                                </button>

                                {/* ✅ أيقونات الديسكتوب */}
                                <div className="hidden md:flex items-center gap-3">
                                    <ThemeToggle />
                                    <UserMenu />
                                    <WishlistIcon />
                                </div>

                                <CartIcon />

                                {/* ✅ زرار القائمة (موبايل فقط) */}
                                <button
                                    className="md:hidden p-2 text-charcoal hover:bg-charcoal/5 rounded-md transition-colors"
                                    onClick={() => setIsOpen(true)}
                                    aria-label="Menu"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                        <line x1="3" y1="6" x2="21" y2="6" />
                                        <line x1="3" y1="12" x2="21" y2="12" />
                                        <line x1="3" y1="18" x2="21" y2="18" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </nav>
            </header>

            {/* ✅ Mobile Full Screen Menu */}
            <div
                className={`fixed inset-0 z-[100] bg-cream flex flex-col md:hidden transition-all duration-300 ease-in-out ${
                    isOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-full pointer-events-none"
                }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-charcoal/10">
                    <Link href="/" onClick={() => setIsOpen(false)} className="text-2xl font-bold text-charcoal">
                        Mood
                    </Link>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 bg-charcoal/5 text-charcoal rounded-full hover:bg-charcoal/10 transition-colors"
                        aria-label="Close menu"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Links */}
                <div className="flex-1 overflow-y-auto py-8 px-6 space-y-2">
                    {links.map((link, idx) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center justify-between py-4 border-b border-charcoal/5 text-xl font-semibold text-charcoal hover:text-gold transition-colors"
                        >
                            <span>{link.labelAr}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-charcoal/30">
                                <path d="m15 18-6-6 6-6"/>
                            </svg>
                        </Link>
                    ))}

                    {/* Quick Links */}
                    <div className="pt-6 pb-2">
                        <p className="text-xs text-muted font-medium mb-4 uppercase tracking-wider">حسابك</p>
                        <div className="flex flex-col gap-4">
                            <Link href="/account" onClick={() => setIsOpen(false)} className="flex items-center gap-3 text-charcoal font-medium">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                حسابي
                            </Link>
                            <Link href="/wishlist" onClick={() => setIsOpen(false)} className="flex items-center gap-3 text-charcoal font-medium">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                                المفضلة
                            </Link>
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
                                }}
                                className="flex items-center gap-3 text-charcoal font-medium text-right"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                                البحث الشامل
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-charcoal/10 flex items-center justify-between bg-white">
                    <span className="text-sm text-muted">© {new Date().getFullYear()} Mood</span>
                    <ThemeToggle />
                </div>
            </div>
        </>
    );
}