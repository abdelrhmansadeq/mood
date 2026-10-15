"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "./cart-context";
import { useWishlist } from "./wishlist-context";
import { useAuth } from "./auth-context";

export default function MobileNav() {
    const pathname = usePathname();
    const { totalItems: cartCount, openCart } = useCart();
    const { totalItems: wishlistCount } = useWishlist();
    const { user } = useAuth();

    // نخفي الـ Navbar في صفحة الأدمن
    if (pathname.startsWith("/admin")) return null;

    const isActive = (path: string) => {
        if (path === "/") return pathname === "/";
        return pathname.startsWith(path);
    };

    // رابط الحساب
    const accountHref = user ? "/account" : "/login";

    const items = [
        {
            key: "home",
            href: "/",
            label: "الرئيسية",
            active: isActive("/"),
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
            ),
        },
        {
            key: "products",
            href: "/products",
            label: "المنتجات",
            active: isActive("/products"),
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
            ),
        },
        {
            key: "wishlist",
            href: "/wishlist",
            label: "المفضلة",
            active: isActive("/wishlist"),
            badge: wishlistCount,
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
            ),
        },
        {
            key: "cart",
            label: "السلة",
            active: false,
            badge: cartCount,
            onClick: openCart,
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
            ),
        },
        {
            key: "account",
            href: accountHref,
            label: user ? "حسابي" : "دخول",
            active: isActive("/account") || isActive("/login"),
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                </svg>
            ),
        },
    ];

    return (
        <nav
            className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-cream/95 backdrop-blur-md border-t border-charcoal/10"
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
            <div className="flex items-stretch justify-around h-16">
                {items.map((item) => {
                    const content = (
                        <div
                            className={`flex flex-col items-center justify-center gap-0.5 w-full h-full relative transition-colors ${
                                item.active ? "text-gold" : "text-charcoal/70"
                            }`}
                        >
                            <div className="relative">
                                {item.icon}
                                {item.badge !== undefined && item.badge > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 bg-gold text-charcoal text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                                )}
                            </div>
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </div>
                    );

                    if (item.onClick) {
                        return (
                            <button
                                key={item.key}
                                onClick={item.onClick}
                                className="flex-1"
                                aria-label={item.label}
                            >
                                {content}
                            </button>
                        );
                    }

                    return (
                        <Link key={item.key} href={item.href!} className="flex-1">
                            {content}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}