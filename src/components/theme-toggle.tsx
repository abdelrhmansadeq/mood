"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="w-[90px] h-8 bg-charcoal/5 rounded-full animate-pulse" />;
    }

    return (
        <div className="flex items-center bg-charcoal/5 dark:bg-white/10 p-1 rounded-full border border-charcoal/10 dark:border-white/10">
            <button
                onClick={() => setTheme("system")}
                className={`p-1.5 rounded-full transition-colors ${theme === "system" ? "bg-white dark:bg-charcoal shadow-sm text-charcoal dark:text-cream" : "text-charcoal/50 dark:text-cream/50 hover:text-charcoal dark:hover:text-cream"}`}
                title="حسب النظام"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
            </button>
            <button
                onClick={() => setTheme("light")}
                className={`p-1.5 rounded-full transition-colors ${theme === "light" ? "bg-white dark:bg-charcoal shadow-sm text-charcoal dark:text-cream" : "text-charcoal/50 dark:text-cream/50 hover:text-charcoal dark:hover:text-cream"}`}
                title="فاتح"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
            </button>
            <button
                onClick={() => setTheme("dark")}
                className={`p-1.5 rounded-full transition-colors ${theme === "dark" ? "bg-white dark:bg-charcoal shadow-sm text-charcoal dark:text-cream" : "text-charcoal/50 dark:text-cream/50 hover:text-charcoal dark:hover:text-cream"}`}
                title="غامق"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
            </button>
        </div>
    );
}