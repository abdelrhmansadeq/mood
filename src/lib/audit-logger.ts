import { supabaseAdmin } from "./supabase-admin";

export async function logAdminAction({
                                         adminId,
                                         adminEmail,
                                         action,
                                         entityType,
                                         entityId,
                                         details,
                                     }: {
    adminId: string;
    adminEmail: string;
    action: string;
    entityType: "order" | "product" | "coupon" | "auth" | "message";
    entityId?: string | number;
    details?: string;
}) {
    try {
        const { error } = await supabaseAdmin.from("audit_logs").insert({
            admin_id: adminId,
            admin_email: adminEmail,
            action,
            entity_type: entityType,
            entity_id: entityId ? String(entityId) : null,
            details,
        });

        if (error) console.error("Failed to log admin action:", error);
    } catch (err) {
        console.error("Error in audit logger:", err);
    }
}