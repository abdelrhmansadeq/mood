"use client";

import { useToast, type ToastType } from "./toast-context";

const STYLES: Record<ToastType, { bg: string; icon: string }> = {
    success: { bg: "bg-success text-white", icon: "✓" },
    error: { bg: "bg-error text-white", icon: "✕" },
    info: { bg: "bg-charcoal text-cream", icon: "ℹ" },
    warning: { bg: "bg-gold text-charcoal", icon: "⚠" },
};

export default function Toaster() {
    const { toasts, removeToast } = useToast();

    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-20 md:top-24 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-[calc(100vw-2rem)] max-w-sm pointer-events-none">
            {toasts.map((toast) => {
                const style = STYLES[toast.type];
                return (
                    <div
                        key={toast.id}
                        onClick={() => removeToast(toast.id)}
                        className={`${style.bg} rounded-lg shadow-2xl p-3.5 flex items-center gap-3 pointer-events-auto cursor-pointer animate-fade-down`}
                    >
            <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold flex-shrink-0">
              {style.icon}
            </span>
                        <p className="text-sm font-medium flex-1">{toast.message}</p>
                    </div>
                );
            })}
        </div>
    );
}