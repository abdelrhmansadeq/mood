"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRealtimeAllOrders } from "@/hooks/use-realtime-all-orders";

export default function AdminHeader() {
    const [pendingCount, setPendingCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const lastEvent = useRealtimeAllOrders();

    const fetchPendingCount = async () => {
        try {
            // ✅ بنجيب وقت آخر قراءة للإشعارات من المتصفح
            const lastViewed = localStorage.getItem("mood_admin_orders_last_viewed");

            let query = supabase
                .from("orders")
                .select("*", { count: "exact", head: true })
                .eq("status", "pending");

            // ✅ لو فيه وقت سابق، بنجيب الطلبات اللي جت بعده بس
            if (lastViewed) {
                query = query.gt("created_at", lastViewed);
            }

            const { count, error } = await query;

            if (!error && count !== null) {
                setPendingCount(count);
            }
        } catch (err) {
            console.error("Error fetching pending orders:", err);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void fetchPendingCount();
    }, []);

    useEffect(() => {
        if (lastEvent) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            void fetchPendingCount();
        }
    }, [lastEvent]);

    // ✅ لما بندوس على الجرس، بنسجل الوقت الحالي ونصفر العداد
    const handleBellClick = () => {
        const newState = !isOpen;
        setIsOpen(newState);

        if (newState) {
            localStorage.setItem("mood_admin_orders_last_viewed", new Date().toISOString());
            setPendingCount(0);
        }
    };

    return (
        <div className="sticky top-0 z-40 bg-cream/90 backdrop-blur-md border-b border-charcoal/10 mb-8">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">

                <div className="flex items-center gap-4">
                    <Link href="/admin/dashboard" className="text-xl font-bold text-charcoal">
                        Mood Admin
                    </Link>
                </div>

                {/* جرس الإشعارات */}
                <div className="relative">
                    <button
                        onClick={handleBellClick}
                        className="relative p-2 rounded-full hover:bg-charcoal/5 transition-colors focus:outline-none"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-charcoal">
                            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                        </svg>

                        {pendingCount > 0 && (
                            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-error rounded-full animate-pulse">
                {pendingCount}
              </span>
                        )}
                    </button>

                    {isOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                            <div className="absolute left-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-charcoal/10 z-50 overflow-hidden animate-fade-up">
                                <div className="p-4 border-b border-charcoal/5 bg-cream/50">
                                    <h3 className="font-bold text-charcoal text-sm">الإشعارات</h3>
                                </div>
                                <div className="p-4">
                                    {pendingCount > 0 ? (
                                        <Link
                                            href="/admin/dashboard/orders"
                                            onClick={() => setIsOpen(false)}
                                            className="block p-3 rounded-md hover:bg-cream transition-colors border border-transparent hover:border-charcoal/5"
                                        >
                                            <p className="text-sm font-medium text-charcoal">
                                                🔔 عندك <span className="text-error font-bold">{pendingCount}</span> طلبات جديدة قيد الانتظار.
                                            </p>
                                            <p className="text-xs text-gold mt-1">اضغط لمراجعة الطلبات ←</p>
                                        </Link>
                                    ) : (
                                        <p className="text-sm text-muted text-center py-4">مفيش إشعارات جديدة.</p>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>

            </div>
        </div>
    );
}