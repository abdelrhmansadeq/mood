"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    const links = [
        { href: "/", labelAr: "الرئيسية", labelEn: "Home" },
        { href: "/products", labelAr: "المنتجات", labelEn: "Shop" },
        { href: "/about", labelAr: "من نحن", labelEn: "About" },
        { href: "/contact", labelAr: "تواصل", labelEn: "Contact" },
    ];

    return (
        <nav className="fixed top-0 inset-x-0 z-50 bg-cream/90 backdrop-blur-md border-b border-charcoal/10">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tight text-charcoal">
              Mood
            </span>
                        <span className="hidden sm:inline text-xs text-gold font-medium">
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
                    <div className="flex items-center gap-4">
                        {/* Cart */}
                        <button
                            className="relative p-2 text-charcoal hover:text-gold transition-colors"
                            aria-label="Cart"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="22"
                                height="22"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <circle cx="9" cy="21" r="1" />
                                <circle cx="20" cy="21" r="1" />
                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                            </svg>
                        </button>

                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden p-2 text-charcoal"
                            onClick={() => setIsOpen(!isOpen)}
                            aria-label="Menu"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                            >
                                {isOpen ? (
                                    <>
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </>
                                ) : (
                                    <>
                                        <line x1="3" y1="6" x2="21" y2="6" />
                                        <line x1="3" y1="12" x2="21" y2="12" />
                                        <line x1="3" y1="18" x2="21" y2="18" />
                                    </>
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isOpen && (
                    <div className="md:hidden py-4 border-t border-charcoal/10">
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="block py-2 text-sm font-medium text-charcoal/80 hover:text-gold"
                                onClick={() => setIsOpen(false)}
                            >
                                {link.labelAr}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </nav>
    );
}