import { maintenanceFlag } from '@/flags';

export async function isMaintenanceMode(): Promise<boolean> {
    try {
        // بنستدعي الـ Flag زي أي دالة async عادية
        const isMaintenance = await maintenanceFlag();
        console.log("🛠️ Maintenance from Vercel Flags:", isMaintenance);
        return Boolean(isMaintenance);
    } catch (error) {
        console.error("❌ Flags SDK check failed:", error);
        return false; // Fail-Open عشان الموقع ميقفش لو حصل خطأ
    }
}