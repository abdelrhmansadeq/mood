"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false);
    const pathname = usePathname();
    const isProductPage = /^\/products\/\d+/.test(pathname);

    useEffect(() => {
        const handleScroll = () => {
            setIsVisible(window.scrollY > 400);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <button
            onClick={scrollToTop}
            aria-label="ارجع لأعلى"
            className={`fixed left-4 md:left-6 z-30 w-10 h-10 md:w-12 md:h-12 bg-charcoal text-cream hover:bg-gold hover:text-charcoal rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all ${
                isProductPage ? "bottom-52" : "bottom-36"
            } md:bottom-20 ${
                isVisible
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-0 pointer-events-none"
            }`}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="m18 15-6-6-6 6" />
            </svg>
        </button>
    );
}