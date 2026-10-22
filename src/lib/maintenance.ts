import { get } from "@vercel/edge-config";

export async function isMaintenanceMode(): Promise<boolean> {
    try {
        // لو المتغير مش موجود (زي في اللوكال هوست)، يبقى الدنيا تمام
        if (!process.env.EDGE_CONFIG) return false;

        const isMaintenance = await get("is_maintenance");
        return Boolean(isMaintenance);
    } catch (error) {
        console.error("Failed to check maintenance mode:", error);
        // Fail-Open: لو Edge Config وقع، الموقع يشتغل عادي
        return false;
    }
}