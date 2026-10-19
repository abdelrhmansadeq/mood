"use client";

import { useEffect, useState, useId } from "react";
import { supabase } from "@/lib/supabase";

type RealtimeEvent = {
    eventType: "INSERT" | "UPDATE" | "DELETE";
    id: number;
    timestamp: number;
};

export function useRealtimeAllOrders(): RealtimeEvent | null {
    const [lastEvent, setLastEvent] = useState<RealtimeEvent | null>(null);
    // ✅ بنعمل ID فريد لكل قناة عشان نمنع تعارض الـ subscribe
    const uniqueId = useId().replace(/:/g, "");

    useEffect(() => {
        const channelName = `admin-all-orders-${uniqueId}`;
        const channel = supabase.channel(channelName);

        channel
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "orders",
                },
                (payload) => {
                    const eventType = payload.eventType as "INSERT" | "UPDATE" | "DELETE";
                    const row = (payload.new || payload.old) as { id?: number } | null;
                    const id = row?.id;

                    if (!id) return;

                    setLastEvent({
                        eventType,
                        id,
                        timestamp: Date.now(),
                    });
                }
            )
            .subscribe();

        return () => {
            void supabase.removeChannel(channel);
        };
    }, [uniqueId]);

    return lastEvent;
}