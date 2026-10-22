import { get } from "@vercel/edge-config";

export async function isMaintenanceMode(): Promise<boolean> {
    try {
        if (!process.env.EDGE_CONFIG) {
            console.warn("⚠️ EDGE_CONFIG is not set. Maintenance mode is disabled.");
            return false;
        }
        const isMaintenance = await get("is_maintenance");
        console.log("🛠️ Maintenance mode from Edge Config:", isMaintenance);
        return Boolean(isMaintenance);
    } catch (error) {
        console.error("❌ Edge Config check failed:", error);
        return false;
    }
}