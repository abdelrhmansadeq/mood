"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type RealtimeEvent = {
    eventType: "INSERT" | "UPDATE" | "DELETE";
    id: number;
    timestamp: number;
};

export function useRealtimeAllOrders(): RealtimeEvent | null {
    const [lastEvent, setLastEvent] = useState<RealtimeEvent | null>(null);

    useEffect(() => {
        const channel = supabase
            .channel("admin-all-orders")
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
            supabase.removeChannel(channel);
        };
    }, []);

    return lastEvent;
}