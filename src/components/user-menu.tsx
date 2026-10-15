"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth-context";

export default function UserMenu() {
    const router = useRouter();
    const { user, isLoading, signOut } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (isLoading) {
        return (
            <div className="w-9 h-9 rounded-full bg-charcoal/5 animate-pulse" />
        );
    }

    // زائر (مش مسجل)
    if (!user) {
        return (
            <Link
                href="/login"
                className="p-2 text-charcoal hover:text-gold transition-colors"
                aria-label="تسجيل الدخول"
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
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                </svg>
            </Link>
        );
    }

    // مستخدم مسجل
    const initials = (user.user_metadata?.full_name || user.email || "U")
        .split(" ")
        .map((w: string) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-9 h-9 rounded-full bg-charcoal text-cream text-xs font-bold hover:bg-gold hover:text-charcoal transition-colors flex items-center justify-center"
                aria-label="حسابي"
            >
                {initials}
            </button>

            {isOpen && (
                <div className="absolute top-full mt-2 left-0 bg-white rounded-lg shadow-xl border border-charcoal/10 w-52 py-2 z-50">
                    <div className="px-4 py-2 border-b border-charcoal/5">
                        <p className="text-sm font-medium text-charcoal truncate">
                            {user.user_metadata?.full_name || "عميل Mood"}
                        </p>
                        <p className="text-xs text-muted truncate" dir="ltr">
                            {user.email}
                        </p>
                    </div>
                    <Link
                        href="/account"
                        onClick={() => setIsOpen(false)}
                        className="block px-4 py-2 text-sm text-charcoal hover:bg-cream transition-colors"
                    >
                        حسابي
                    </Link>
                    <Link
                        href="/account/orders"
                        onClick={() => setIsOpen(false)}
                        className="block px-4 py-2 text-sm text-charcoal hover:bg-cream transition-colors"
                    >
                        طلباتي
                    </Link>
                    <button
                        onClick={async () => {
                            await signOut();
                            setIsOpen(false);
                            router.push("/");
                        }}
                        className="w-full text-right px-4 py-2 text-sm text-error hover:bg-error/5 transition-colors"
                    >
                        تسجيل خروج
                    </button>
                </div>
            )}
        </div>
    );
}