"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

// دالة ترجمة رسائل الأخطاء
function translateAuthError(error: string): string {
    const msg = error.toLowerCase();
    if (msg.includes("user already registered") || msg.includes("already in use")) {
        return "هذا الإيميل مسجل بالفعل. يرجى تسجيل الدخول.";
    }
    if (msg.includes("invalid login credentials")) {
        return "الإيميل أو كلمة المرور غير صحيحة.";
    }
    if (msg.includes("password should be at least")) {
        return "كلمة المرور قصيرة جداً (6 أحرف على الأقل).";
    }
    if (msg.includes("email not confirmed")) {
        return "يرجى تأكيد الإيميل أولاً من خلال الرابط المرسل إليك.";
    }
    return "حدث خطأ ما، يرجى المحاولة مرة أخرى.";
}

type AuthContextType = {
    user: User | null;
    session: Session | null;
    isLoading: boolean;
    signUp: (email: string, password: string, fullName: string, phone: string) => Promise<{ error: string | null }>;
    signIn: (email: string, password: string) => Promise<{ error: string | null }>;
    signOut: () => Promise<void>;
    signInWithGoogle: () => Promise<{ error: string | null }>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setIsLoading(false);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signUp = async (
        email: string,
        password: string,
        fullName: string,
        phone: string
    ) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        phone: phone,
                    },
                },
            });

            if (error) return { error: translateAuthError(error.message) };
            if (!data.user) return { error: "فشل إنشاء الحساب" };

            return { error: null };
        } catch (e) {
            console.error("SignUp error:", e);
            return { error: "حصلت مشكلة، حاول تاني" };
        }
    };

    const signIn = async (email: string, password: string) => {
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) return { error: translateAuthError(error.message) };
            return { error: null };
        } catch (e) {
            console.error("SignIn error:", e);
            return { error: "حصلت مشكلة، حاول تاني" };
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    const signInWithGoogle = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: `${window.location.origin}/account`,
                },
            });

            if (error) return { error: error.message };
            return { error: null };
        } catch (e) {
            console.error("Google sign in error:", e);
            return { error: "حصلت مشكلة، حاول تاني" };
        }
    };

    return (
        <AuthContext.Provider value={{ user, session, isLoading, signUp, signIn, signOut, signInWithGoogle }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}