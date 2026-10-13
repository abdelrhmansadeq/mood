"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

const ADMIN_EMAIL = "admin@mood.com";
const ADMIN_PASSWORD = "admin123";
const STORAGE_KEY = "mood-admin";

type AdminContextType = {
    isLoggedIn: boolean;
    login: (email: string, password: string) => boolean;
    logout: () => void;
};

const AdminContext = createContext<AdminContextType | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === "true") setIsLoggedIn(true);
    }, []);

    const login = (email: string, password: string) => {
        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
            setIsLoggedIn(true);
            localStorage.setItem(STORAGE_KEY, "true");
            return true;
        }
        return false;
    };

    const logout = () => {
        setIsLoggedIn(false);
        localStorage.removeItem(STORAGE_KEY);
    };

    return (
        <AdminContext.Provider value={{ isLoggedIn, login, logout }}>
            {children}
        </AdminContext.Provider>
    );
}

export function useAdmin() {
    const ctx = useContext(AdminContext);
    if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
    return ctx;
}