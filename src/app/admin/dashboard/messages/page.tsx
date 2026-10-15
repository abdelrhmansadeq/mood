"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAdmin } from "@/components/admin-context";
import { fetchAllMessages, type ContactMessage } from "@/lib/contact-api";

export default function AdminMessagesPage() {
    const { isLoggedIn } = useAdmin();
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

    useEffect(() => {
        if (!isLoggedIn) return;
        fetchAllMessages()
            .then(setMessages)
            .catch((e) => console.error(e))
            .finally(() => setIsLoading(false));
    }, [isLoggedIn]);

    const filteredMessages = messages.filter((m) => {
        if (filter === "unread") return !m.isRead;
        if (filter === "read") return m.isRead;
        return true;
    });

    const unreadCount = messages.filter((m) => !m.isRead).length;

    return (
        <div className="max-w-5xl mx-auto px-6 lg:px-8 py-12">
            <div className="mb-8">
                <Link href="/admin/dashboard" className="text-sm text-muted hover:text-gold">
                    ← رجوع للوحة التحكم
                </Link>
            </div>

            <div className="flex items-center justify-between mb-8">
                <div>
                    <p className="text-gold text-xs font-medium tracking-widest uppercase mb-2">
                        Messages
                    </p>
                    <h1 className="text-3xl md:text-4xl font-bold text-charcoal">
                        رسائل العملاء
                    </h1>
                </div>
                {unreadCount > 0 && (
                    <div className="bg-error text-white text-xs font-bold rounded-full px-3 py-1.5">
                        {unreadCount} جديدة
                    </div>
                )}
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-charcoal/10">
                <button
                    onClick={() => setFilter("all")}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        filter === "all"
                            ? "bg-charcoal text-cream"
                            : "bg-transparent text-charcoal/70 hover:bg-charcoal/5"
                    }`}
                >
                    الكل ({messages.length})
                </button>
                <button
                    onClick={() => setFilter("unread")}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        filter === "unread"
                            ? "bg-charcoal text-cream"
                            : "bg-transparent text-charcoal/70 hover:bg-charcoal/5"
                    }`}
                >
                    غير مقروءة ({unreadCount})
                </button>
                <button
                    onClick={() => setFilter("read")}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        filter === "read"
                            ? "bg-charcoal text-cream"
                            : "bg-transparent text-charcoal/70 hover:bg-charcoal/5"
                    }`}
                >
                    مقروءة ({messages.length - unreadCount})
                </button>
            </div>

            {isLoading ? (
                <div className="text-center py-20 text-muted">جاري التحميل...</div>
            ) : filteredMessages.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-lg border border-charcoal/10">
                    <p className="text-muted">
                        {filter === "all"
                            ? "مفيش رسائل لحد الآن"
                            : filter === "unread"
                                ? "مفيش رسائل غير مقروءة"
                                : "مفيش رسائل مقروءة"}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredMessages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`bg-white rounded-lg border p-5 ${
                                msg.isRead ? "border-charcoal/10" : "border-gold/40 bg-gold/5"
                            }`}
                        >
                            {/* Header */}
                            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-charcoal/10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-charcoal text-cream flex items-center justify-center font-bold text-sm">
                                        {msg.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-charcoal">
                                            {msg.name}
                                        </p>
                                        <a
                                            href={`mailto:${msg.email}`}
                                            className="text-xs text-gold hover:underline"
                                            dir="ltr"
                                        >
                                            {msg.email}
                                        </a>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {!msg.isRead && (
                                        <span className="bg-error text-white text-xs font-bold rounded-full px-2.5 py-0.5">
                      جديدة
                    </span>
                                    )}
                                    <span className="text-xs text-muted">
                    {new Date(msg.createdAt).toLocaleDateString("ar-EG", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                  </span>
                                </div>
                            </div>

                            {/* Message */}
                            <p className="text-sm text-charcoal/80 leading-relaxed whitespace-pre-wrap mb-4">
                                {msg.message}
                            </p>

                            {/* Actions */}
                            <div className="flex gap-2 pt-4 border-t border-charcoal/10">
                                <a
                                    href={`mailto:${msg.email}?subject=رد على رسالتك - Mood&body=مرحباً ${msg.name}،`}
                                    className="text-xs font-medium bg-charcoal hover:bg-gold text-cream hover:text-charcoal px-4 py-2 rounded-md transition-colors"
                                >
                                    رد عبر الإيميل
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}