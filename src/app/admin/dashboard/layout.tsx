"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "@/components/admin-context";

export default function DashboardLayout({
                                            children,
                                        }: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const { isLoggedIn, isLoading } = useAdmin();

    useEffect(() => {
        if (!isLoading && !isLoggedIn) {
            router.push("/admin");
        }
    }, [isLoggedIn, isLoading, router]);

    if (isLoading) {
        return (
            <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center">
                <p className="text-muted">جاري التحقق من الصلاحيات...</p>
            </div>
        );
    }

    if (!isLoggedIn) return null;

    return <>{children}</>;
}