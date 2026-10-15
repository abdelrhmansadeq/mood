"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

type AdminContextType = {
    isLoggedIn: boolean;
    isLoading: boolean;
    adminUser: User | null;
    login: (email: string, password: string) => Promise<{ error: string | null }>;
    logout: () => Promise<void>;
};

const AdminContext = createContext<AdminContextType | null>(null);

const LEGACY_STORAGE_KEY = "mood-admin";

export function AdminProvider({ children }: { children: ReactNode }) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [adminUser, setAdminUser] = useState<User | null>(null);

    const checkAdminStatus = async (userId: string): Promise<boolean> => {
        try {
            const { data, error } = await supabase
                .from("admins")
                .select("user_id")
                .eq("user_id", userId)
                .maybeSingle();

            if (error || !data) return false;
            return true;
        } catch {
            return false;
        }
    };

    useEffect(() => {
        // نشيل الـ localStorage القديم (بيانات الأدمن القديمة)
        localStorage.removeItem(LEGACY_STORAGE_KEY);

        const checkSession = async () => {
            try {
                const {
                    data: { session },
                } = await supabase.auth.getSession();

                if (session?.user) {
                    const isAdmin = await checkAdminStatus(session.user.id);
                    if (isAdmin) {
                        setIsLoggedIn(true);
                        setAdminUser(session.user);
                    } else {
                        setIsLoggedIn(false);
                        setAdminUser(null);
                    }
                }
            } catch (e) {
                console.error("Admin check error:", e);
            } finally {
                setIsLoading(false);
            }
        };

        checkSession();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error || !data.user) {
                return { error: "الإيميل أو الباسورد غلط" };
            }

            const isAdmin = await checkAdminStatus(data.user.id);

            if (!isAdmin) {
                await supabase.auth.signOut();
                return { error: "الحساب ده مش أدمن" };
            }

            setIsLoggedIn(true);
            setAdminUser(data.user);
            return { error: null };
        } catch (e) {
            console.error("Login error:", e);
            return { error: "حصلت مشكلة، حاول تاني" };
        }
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setIsLoggedIn(false);
        setAdminUser(null);
    };

    return (
        <AdminContext.Provider
            value={{ isLoggedIn, isLoading, adminUser, login, logout }}
        >
            {children}
        </AdminContext.Provider>
    );
}

export function useAdmin() {
    const ctx = useContext(AdminContext);
    if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
    return ctx;
}