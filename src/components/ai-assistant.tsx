"use client";

import { useState, useRef, useEffect } from "react";
import type { FormEvent } from "react";

type Message = {
    role: "user" | "assistant";
    content: string;
};

export default function AIAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            content: "أهلاً! أنا مساعد Mood الذكي. أقدر أساعدك تلاقي المنتج المناسب. اسألني عن أي حاجة 😊",
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput("");
        setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
        setIsLoading(true);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userMessage }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "حصلت مشكلة");
            }

            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: data.reply },
            ]);
        } catch (error) {
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: "آسف، حصلت مشكلة. حاول تاني بعد شوية.",
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(true)}
                aria-label="افتح المساعد الذكي"
                className={`fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-to-br from-gold to-gold-dark hover:scale-110 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all ${
                    isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100"
                }`}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M12 2v4" />
                    <path d="m6.4 10.4-3.2-3.2" />
                    <path d="M20.8 7.2l-3.2 3.2" />
                    <rect x="4" y="10" width="16" height="12" rx="2" />
                    <path d="M8 15h.01" />
                    <path d="M16 15h.01" />
                    <path d="M9 18h6" />
                </svg>
            </button>

            {/* Chat Window */}
            {isOpen && (
                <>
                    {/* Overlay for mobile */}
                    <div
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-charcoal/30 z-[80] md:hidden"
                    />

                    <div className="fixed bottom-6 right-6 z-[90] w-[calc(100vw-3rem)] max-w-md h-[600px] max-h-[calc(100vh-3rem)] bg-cream rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-charcoal/10">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-charcoal to-charcoal/90 text-cream p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center">
                                    <span className="text-charcoal font-bold text-sm">M</span>
                                </div>
                                <div>
                                    <p className="font-bold text-sm">Mood Assistant</p>
                                    <p className="text-xs text-cream/60">متصل الآن</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                aria-label="اقفل"
                                className="p-1.5 text-cream/70 hover:text-cream transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-cream">
                            {messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`flex ${
                                        msg.role === "user" ? "justify-end" : "justify-start"
                                    }`}
                                >
                                    <div
                                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                                            msg.role === "user"
                                                ? "bg-charcoal text-cream rounded-br-sm"
                                                : "bg-white border border-charcoal/10 text-charcoal rounded-bl-sm"
                                        }`}
                                    >
                                        {msg.content}
                                    </div>
                                </div>
                            ))}

                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white border border-charcoal/10 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-gold animate-bounce" style={{ animationDelay: "0ms" }} />
                                        <span className="w-2 h-2 rounded-full bg-gold animate-bounce" style={{ animationDelay: "150ms" }} />
                                        <span className="w-2 h-2 rounded-full bg-gold animate-bounce" style={{ animationDelay: "300ms" }} />
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSubmit} className="p-3 border-t border-charcoal/10 bg-white">
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="اسألني عن أي منتج..."
                                    disabled={isLoading}
                                    className="flex-1 px-4 py-2.5 rounded-full bg-cream border border-charcoal/10 text-sm text-charcoal placeholder:text-muted focus:outline-none focus:border-gold transition-colors disabled:opacity-50"
                                />
                                <button
                                    type="submit"
                                    disabled={isLoading || !input.trim()}
                                    aria-label="إرسال"
                                    className="w-10 h-10 rounded-full bg-charcoal hover:bg-gold text-cream hover:text-charcoal disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors flex-shrink-0"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="m22 2-7 20-4-9-9-4Z" />
                                        <path d="M22 2 11 13" />
                                    </svg>
                                </button>
                            </div>
                        </form>
                    </div>
                </>
            )}
        </>
    );
}